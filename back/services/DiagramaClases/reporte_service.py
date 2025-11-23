import os
from typing import Dict, Optional, Iterable
from sqlalchemy import MetaData, Table, insert, select
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

from config.db import engine as shared_engine
from .paradero_service import Paradero_Service
from .reporte_factory import CreadorReportes
from services.usuario_service import UsuarioService
from config.firebase import get_firebase_admin, FirebaseAdmin
from config.db import SessionLocal
from models.UsuarioBase import UsuarioBase

class ReporteService:
    def __init__(self, engine: Engine = None, paradero_service: Paradero_Service = None):
        self.engine: Engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible en ReporteService.")
        self.paradero_service = paradero_service or Paradero_Service(self.engine)
        # instancia factory si la usas (ajusta según tu implementación)
        self.reporte_factory = CreadorReportes()

    def _reflect_table(self, candidates: Iterable[str]) -> Table:
        meta = MetaData()
        last_err = None
        for name in candidates:
            try:
                tbl = Table(name, meta, autoload_with=self.engine)
                return tbl
            except Exception as e:
                last_err = e
                continue
        raise RuntimeError(f"No se encontró ninguna tabla entre: {list(candidates)}. Error último: {last_err}")

    def _is_identity_col(self, col) -> bool:
        return getattr(col, "identity", None) is not None

    def find_report_by_id_reporte(self, id_reporte: str) -> Optional[Dict]:
        table = self._reflect_table(("reporte", "reportes", "report"))
        candidates = ("id_reporte_cliente","id_reporte_externo","external_id","uuid","uuid_cliente","id_reporte","reporte_id","id")
        id_col = next((table.c[name] for name in candidates if name in table.c and not self._is_identity_col(table.c[name])), None)
        if id_col is None:
            # no hay columna usable para idempotencia; devolvemos None
            return None
        try:
            with self.engine.connect() as conn:
                stmt = select(table).where(id_col == id_reporte).limit(1)
                res = conn.execute(stmt)
                row = res.mappings().first()
                return dict(row) if row is not None else None
        except SQLAlchemyError as e:
            print("[DB ERROR] ReporteService.find_report_by_id_reporte:", e)
            raise

    def save_report(self, record: Dict) -> Dict:
        table = self._reflect_table(("reporte", "reportes", "report"))
        cols = set(table.columns.keys())
        rec = dict(record)

        # si id_reporte es identity, mover valor enviado a columna cliente si existe
        if "id_reporte" in rec and "id_reporte" in cols and self._is_identity_col(table.c["id_reporte"]):
            client_cols = ("id_reporte_cliente","id_reporte_externo","external_id","uuid","uuid_cliente")
            for cc in client_cols:
                if cc in cols:
                    rec[cc] = rec.pop("id_reporte")
                    break
            else:
                rec.pop("id_reporte", None)

        # eliminar columnas identity del insert
        allowed = {}
        for k,v in rec.items():
            if k in cols:
                col = table.c[k]
                if self._is_identity_col(col):
                    continue
                allowed[k] = v

        if "fecha" in cols and "fecha" not in allowed:
            allowed["fecha"] = datetime.utcnow()

        if not allowed:
            raise RuntimeError(f"Ninguna key del record coincide con columnas insertables de {table.name}. Columnas: {sorted(list(cols))}")

        try:
            with self.engine.begin() as conn:
                stmt = insert(table).values(**allowed).returning(*table.c)
                res = conn.execute(stmt)
                row = res.mappings().first()
                if row is None: # Corrected from === None
                    raise Exception("Fallo al insertar reporte")
                return dict(row)
        except SQLAlchemyError as e:
            print("[DB ERROR] ReporteService.save_report:", e)
            raise

    def crear_reporte_desvio(self, payload: Dict) -> Dict:
        """
        Orquesta la creación del reporte de desvío:
        - valida existencia de paradero
        - evita duplicados usando columna cliente si existe
        - usa factory para transformar payload
        - persiste y devuelve fila insertada
        """
        # 1. Usar la factory para crear un objeto de reporte estandarizado
        reporte_obj = self.reporte_factory.crear("desvio", payload)

        # 2. Construir un diccionario limpio para la base de datos
        record = {
            "id_reporte": reporte_obj.id_reporte,
            "id_emisor": reporte_obj.conductor_id,
            "id_tipo_reporte": payload.get("id_tipo_reporte"), # El tipo viene en el payload original
            "id_ruta_afectada": reporte_obj.ruta_id,
            "id_paradero_inicial": reporte_obj.paradero_afectado_id,
            "id_paradero_final": reporte_obj.paradero_alterna_id,
            "descripcion": reporte_obj.descripcion,
            "mensaje": reporte_obj.generar_mensaje(),
        }

        # 3. Validar paradero
        if not self.paradero_service.get_paradero_by_id(record["id_paradero_inicial"]):
            raise ValueError(f"Paradero afectado no encontrado: {record['id_paradero_inicial']}")

        # 4. Idempotencia (evitar duplicados)
        id_cliente = str(record.get("id_reporte"))
        if id_cliente:
            existing = self.find_report_by_id_reporte(id_cliente)
            if existing:
                return existing # Devuelve el reporte existente si se reenvía

        # 5. Persistir en la base de datos
        saved = self.save_report(record)
        
        # 6. Enviar notificación a reguladores
        try:
            firebase_admin_instance = get_firebase_admin()
            # Enviar notificación a un tema específico para reguladores
            firebase_admin_instance.send_to_topic(
                topic="reguladores_alerts", # Nuevo tema para reguladores
                title="Alerta de Desvío",
                body=reporte_obj.generar_mensaje()
            )
            print("✅ Notificación de desvío enviada al tema 'reguladores_alerts'")
        except Exception as e:
            print(f"❌ Error al enviar notificación de desvío a reguladores: {e}")
        finally:
            pass # No hay db.close() porque no se abre una nueva sesión en este bloque

        return saved
    
    def crear_reporte_retraso(self, payload: Dict) -> Dict:
        """
        Crea un reporte de tipo 'retraso' y asigna id_corredor_afectado de usuario_base automáticamente.
        """

        # 1️⃣ Extraer conductor
        conductor_id = payload.get("id_emisor") or payload.get("conductor_id")
        if conductor_id is None:
            raise ValueError("No se recibió conductor (id_emisor) en el payload")

        # 2️⃣ Obtener corredor asignado desde usuario_base
        # Crear usuario service con sesión activa
        from config.db import SessionLocal
        db = SessionLocal()
        usuario_service = UsuarioService(db)

        usuario = usuario_service.get_usuario_by_id(int(conductor_id))
        if not usuario:
            db.close()
            raise ValueError(f"El usuario {conductor_id} no existe")

        id_corredor_asignado = usuario.id_corredor_asignado
        db.close()

        if id_corredor_asignado is None:
            raise ValueError("El conductor no tiene un corredor asignado en usuario_base")

        # 3️⃣ Crear el record según si existe factory
        if self.reporte_factory:
            reporte_obj = self.reporte_factory.crear("retraso", payload)
            record = getattr(reporte_obj, "to_dict", None)
            record = record() if callable(record) else None
            if record is None: # Corrected from === None
                record = {
                    "id_reporte": reporte_obj.id_reporte,
                    "id_tipo_reporte": payload.get("id_tipo_reporte"),
                    "id_emisor": conductor_id,
                    "id_ruta_afectada": reporte_obj.ruta_id,
                    "id_paradero_inicial": reporte_obj.paradero_inicial_id,
                    "id_paradero_final": reporte_obj.paradero_final_id,
                    "tiempo_retraso_min": reporte_obj.tiempo_retraso_min,
                    "descripcion": reporte_obj.descripcion,
                    "mensaje": reporte_obj.generar_mensaje(),
                }
        else:
            record = dict(payload)
            record.setdefault(
                "mensaje",
                f"Retraso en ruta {payload.get('ruta_id')} de paradero {payload.get('paradero_inicial_id')} "
                f"a {payload.get('paradero_final_id')} ({payload.get('tiempo_retraso_min')} min)",
            )

        saved = self.save_report(record)
        return saved
    
    def obtener_ultimo_reporte_por_corredor_id(self, id_corredor: int):
        """
        Retorna el último reporte con id_tipo_reporte = 2 (Retraso)
        filtrado por id_corredor_afectado
        """

        table = self._reflect_table(("reporte", "reportes", "report"))
        cols = table.c

        if "id_corredor_afectado" not in cols or "id_tipo_reporte" not in cols or "fecha" not in cols:
            raise ValueError("Las columnas necesarias no existen en la tabla reporte")

        stmt = (
            select(table)
            .where(
                cols.id_corredor_afectado == id_corredor,
                cols.id_tipo_reporte == 2
            )
            .order_by(cols.fecha.desc())
            .limit(1)
        )

        try:
            with self.engine.connect() as conn:
                result = conn.execute(stmt).mappings().first()
                return dict(result) if result else None
        except Exception as e:
            print("[DB ERROR] obtener_ultimo_reporte_por_corredor_id:", e)
            raise
    
    def crear_reporte_falla(self, payload: Dict) -> Dict:
        """
        Crea un reporte de tipo 'falla' y asigna id_corredor_afectado automáticamente.
        """
        # 1️⃣ Extraer conductor
        conductor_id = payload.get("id_emisor") or payload.get("conductor_id")
        if conductor_id is None: # Corrected from === None
            raise ValueError("No se recibió conductor (id_emisor) en el payload")

        # 2️⃣ Obtener corredor asignado desde usuario_base
        from config.db import SessionLocal
        db = SessionLocal()
        usuario_service = UsuarioService(db)

        usuario = usuario_service.get_usuario_by_id(int(conductor_id))
        if not usuario:
            db.close()
            raise ValueError(f"El usuario {conductor_id} no existe")

        id_corredor_asignado = usuario.id_corredor_asignado
        db.close()

        if id_corredor_asignado is None: # Corrected from === None
            raise ValueError("El conductor no tiene un corredor asignado en usuario_base")

        # 3️⃣ Crear el record según si existe factory
        if self.reporte_factory:
            reporte_obj = self.reporte_factory.crear("falla", payload)
            record = getattr(reporte_obj, "to_dict", lambda: None)()
            if record is None: # Corrected from === None
                # fallback: generar directamente desde objeto
                record = {
                    "id_reporte": reporte_obj.id_reporte,
                    "id_tipo_reporte": payload.get("id_tipo_reporte", 1),  # tipo 1 = falla
                    "id_emisor": int(reporte_obj.conductor_id),
                    "descripcion": payload.get("descripcion"),
                    "requiere_intervencion": payload.get("requiere_intervencion", False),
                    "es_critica": payload.get("es_critica", False),
                    "mensaje": reporte_obj.generar_mensaje(),
                    # Campos NULL para fallas (no aplican)
                    "id_ruta_afectada": None,
                    "id_paradero_inicial": None,
                    "id_paradero_final": None,
                    "id_corredor_afectado": id_corredor_asignado,
                    "tiempo_retraso_min": None,
                }
        else:
            # Si no hay factory, usar directamente el payload
            record = dict(payload)
            record.setdefault("id_tipo_reporte", 1)
            record.setdefault(
                "mensaje",
                f"Falla reportada: {payload.get('tipo_falla', 'No especificado')}"
            )
        
        # 4️⃣ Insertar corredor asignado automáticamente
        record["id_corredor_afectado"] = id_corredor_asignado

        # 5️⃣ Guardar
        saved = self.save_report(record)
        return saved
