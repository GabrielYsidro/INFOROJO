from services.DiagramaClases.reporte_service import ReporteService
from services.DiagramaClases.paradero_service import Paradero_Service
from fastapi import APIRouter, HTTPException, status, Body, Depends, Request, Header
import traceback
from typing import Optional, Dict
from datetime import datetime
import json

paradero_svc=Paradero_Service()
service = ReporteService(paradero_service=paradero_svc)

router = APIRouter(
    prefix="/reports",
    tags=["reportes"]
)


# intentar importar dependencia de auth (si existe)
try:
    from services.auth_service import get_current_user_id  # type: ignore
except Exception:
    def get_current_user_id(request: Request = None) -> int:
        # fallback: en desarrollo obliga a usar endpoint /desvio/test
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                            detail="get_current_user_id no implementado. Usa /reports/desvio/test para pruebas.")


def get_user_id_from_headers(x_user_id: Optional[str] = Header(None), authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Dependencia que devuelve un user id numérico si está en:
    - header X-User-Id
    - header Authorization: Bearer <userId>  (modo dev con id numérico en token)
    Retorna None si no encuentra.
    """
    if x_user_id and x_user_id.isdigit():
        return int(x_user_id)
    auth = authorization or ""
    if auth.lower().startswith("bearer "):
        token = auth.split(None, 1)[1].strip()
        if token.isdigit():
            return int(token)
    return None


@router.get("/_health")
def health():
    return {"ok": True}

@router.post("/desvio")
def crear_reporte_desvio(payload: Dict = Body(...), conductor_header_id: Optional[int] = Depends(get_user_id_from_headers)):
    """
    Endpoint: mapea campos entrantes a los nombres esperados por el servicio
    y valida explícitamente que los campos numéricos no sean None.
    """
    # obtener conductor_id (body tiene prioridad)
    conductor_id = payload.get("conductor_id")
    if conductor_id is None:
        conductor_id = conductor_header_id

    if conductor_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Usuario no autenticado. En desarrollo use header X-User-Id o Authorization: Bearer <userId> o incluya conductor_id en el body.")

    # helper para validar entero requerido
    def parse_required_int(key: str) -> int:
        if key not in payload or payload.get(key) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Falta campo requerido o es null: {key}")
        try:
            return int(payload[key])
        except (ValueError, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Campo {key} debe ser numérico")

    # validar y parsear campos básicos
    ruta_id = parse_required_int("ruta_id")
    paradero_inicial = parse_required_int("paradero_afectado_id")
    tipo = parse_required_int("tipo")

    # paradero_alterna_id es opcional pero si viene no puede ser null y debe ser numérico
    paradero_final = None
    if "paradero_alterna_id" in payload and payload["paradero_alterna_id"] is not None:
        try:
            paradero_final = int(payload["paradero_alterna_id"])
        except (ValueError, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="paradero_alterna_id debe ser numérico")

    # asegurar id_emisor numérico
    try:
        id_emisor = int(conductor_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="conductor_id debe ser numérico")

    # mapear a los campos que necesita el servicio / DB
    mapped_payload = {
        "id_emisor": id_emisor,
        "id_tipo_reporte": tipo,
        "id_ruta_afectada": ruta_id,  # Corregido
        "id_paradero_inicial": paradero_inicial,
        "id_paradero_final": paradero_final,
        "descripcion": payload.get("descripcion"),
        # Claves para la factory y la idempotencia
        "id_reporte": payload.get("id_reporte"),
        "conductor_id": id_emisor,
        "ruta_id": ruta_id,
        "paradero_afectado_id": paradero_inicial,
        "paradero_alterna_id": paradero_final,
    }

    # DEBUG: imprimir payload original y el mapeado
    try:
        print("[DEBUG] /reports/desvio incoming payload:", json.dumps(payload, ensure_ascii=False))
    except Exception:
        print("[DEBUG] /reports/desvio incoming payload (raw):", payload)
    print("[DEBUG] /reports/desvio mapped_payload:", mapped_payload)

    try:
        saved = service.crear_reporte_desvio(mapped_payload)
        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        # modo desarrollo: mostrar error real para depurar
        print("[ERROR] crear_reporte_desvio exception:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.post("/retraso")
def crear_reporte_retraso(payload: Dict = Body(...), conductor_header_id: Optional[int] = Depends(get_user_id_from_headers)):
    """
    Crea un reporte de tipo 'retraso' (alerta por tráfico).
    """
    conductor_id = payload.get("conductor_id") or conductor_header_id
    if conductor_id is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    def parse_required_int(key: str) -> int:
        if key not in payload or payload[key] is None:
            raise HTTPException(status_code=400, detail=f"Falta campo requerido: {key}")
        try:
            return int(payload[key])
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail=f"Campo {key} debe ser numérico")

    ruta_id = parse_required_int("ruta_id")
    paradero_inicial = parse_required_int("paradero_inicial_id")
    paradero_final = parse_required_int("paradero_final_id")
    tiempo_retraso_min = parse_required_int("tiempo_retraso_min")
    tipo = 2  # ⚠️ ID del tipo_reporte "Retraso" en tu tabla tipo_reporte

    mapped_payload = {
        "id_reporte": payload.get("id_reporte", None),   # ← OBLIGATORIO PARA EVITAR EL ERROR
        "id_emisor": int(conductor_id),
        "id_tipo_reporte": tipo,
        "id_ruta_afectada": ruta_id,
        "id_paradero_inicial": paradero_inicial,
        "id_paradero_final": paradero_final,
        "tiempo_retraso_min": tiempo_retraso_min,
        "descripcion": payload.get("descripcion", " "),
        "mensaje": payload.get("mensaje"),
        "conductor_id": int(conductor_id),
        "ruta_id": ruta_id,
        "paradero_inicial_id": paradero_inicial,
        "paradero_final_id": paradero_final,
    }

    print("[DEBUG] /reports/retraso mapped_payload:", mapped_payload)

    try:
        saved = service.crear_reporte_retraso(mapped_payload)
        return {"ok": True, "reporte": saved}
    except Exception as e:
        print("[ERROR] crear_reporte_retraso exception:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/falla")
def crear_reporte_falla(payload: Dict = Body(...), conductor_header_id: Optional[int] = Depends(get_user_id_from_headers)):
    """
    Crea un reporte de tipo 'falla' y envía notificaciones automáticas.
    El formulario envía: paradero (str), tipo_falla (str), requiere_mantenimiento (bool), unidad_afectada (str), motivo (str)
    """
    conductor_id = payload.get("conductor_id") or conductor_header_id
    if conductor_id is None:
        raise HTTPException(status_code=401, detail="Usuario no autenticado")

    tipo = 1  # Tipo de reporte "Falla"
    
    # Construir descripción completa con todos los datos del formulario
    paradero_nombre = payload.get("paradero", "Automático")
    tipo_falla = payload.get("tipo_falla", "No especificado")
    unidad_afectada = payload.get("unidad_afectada", "No especificada")
    motivo = payload.get("motivo", "")
    requiere_intervencion = bool(payload.get("requiere_intervencion") or payload.get("requiere_mantenimiento"))
    
    # Construir descripción estructurada que incluya toda la información
    descripcion_completa = (
        f"Falla en unidad {unidad_afectada} | "
        f"Paradero: {paradero_nombre} | "
        f"Tipo: {tipo_falla} | "
        f"Requiere intervención: {'Sí' if requiere_intervencion else 'No'}"
    )
    if motivo:
        descripcion_completa += f" | Motivo: {motivo}"
    
    mapped_payload = {
        "id_emisor": int(conductor_id),
        "id_tipo_reporte": tipo,
        "descripcion": descripcion_completa,
        "requiere_intervencion": requiere_intervencion,
        # Campos opcionales que pueden ser None
        "id_corredor_afectado": int(payload.get("id_corredor_afectado")) if payload.get("id_corredor_afectado") else None,
        "id_ruta_afectada": None,
        "id_paradero_inicial": None,
        "id_paradero_final": None,
        "tiempo_retraso_min": None,
        "es_critica": requiere_intervencion,  # Si requiere intervención, lo marcamos como crítico
        # Datos para la factory (usados en generar_mensaje)
        "paradero": paradero_nombre,
        "tipo_falla": tipo_falla,
        "unidad_afectada": unidad_afectada,
        "motivo": motivo,
    }

    print("[DEBUG] /reports/falla mapped_payload:", mapped_payload)

    try:
        saved = service.crear_reporte_falla(mapped_payload)
        
        # 🆕 ENVIAR NOTIFICACIONES AUTOMÁTICAS
        try:
            from services.falla_notification_service import FallaNotificationService
            notification_service = FallaNotificationService()
            
            # Obtener ubicación del conductor para calcular usuarios cercanos
            lat_referencia = payload.get("lat") or payload.get("latitud")
            lng_referencia = payload.get("lng") or payload.get("longitud")
            
            # Si no viene en el payload, intentar obtener del usuario
            if not lat_referencia or not lng_referencia:
                from services.usuario_service import UsuarioService
                from config.db import SessionLocal
                db = SessionLocal()
                try:
                    usuario_service = UsuarioService(db)
                    conductor = usuario_service.get_usuario_by_id(int(conductor_id))
                    if conductor:
                        lat_referencia = conductor.ubicacion_actual_lat
                        lng_referencia = conductor.ubicacion_actual_lng
                finally:
                    db.close()
            
            # Enviar notificaciones (sin agregar stats al response)
            notification_service.enviar_notificaciones_falla(
                reporte_id=saved.get("id_reporte"),
                descripcion=descripcion_completa,
                unidad_afectada=unidad_afectada,
                tipo_falla=tipo_falla,
                paradero=paradero_nombre,
                id_corredor_afectado=mapped_payload.get("id_corredor_afectado"),
                id_ruta_afectada=mapped_payload.get("id_ruta_afectada"),
                lat_referencia=lat_referencia,
                lng_referencia=lng_referencia,
                requiere_intervencion=requiere_intervencion,
                id_emisor=int(conductor_id)  # Excluir al conductor de las notificaciones
            )
            
        except Exception as notif_error:
            print(f"⚠️ Error al enviar notificaciones (reporte guardado exitosamente): {notif_error}")
            traceback.print_exc()
            # No fallar el endpoint si las notificaciones fallan
        
        return {"ok": True, "reporte": saved}
    except Exception as e:
        print("[ERROR] crear_reporte_falla exception:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/ultimo/{id_corredor}")
def obtener_ultimo_reporte_por_corredor_id(id_corredor: int):
    """
    Devuelve el último reporte de retraso (id_tipo_reporte = 2)
    filtrado por el id_corredor_afectado.
    """

    try:
        # Servicio devuelve lista o None
        reporte = service.obtener_ultimo_reporte_por_corredor_id(id_corredor)

        if not reporte:
            return {
                "ok": True,
                "mensaje": f"No existen reportes de retraso para el corredor con id {id_corredor}",
                "reporte": None
            }

        return {
            "ok": True,
            "reporte": reporte,
        }

    except Exception as e:
        print("[ERROR] obtener_ultimo_reporte_por_corredor_id:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/falla/{id_reporte}")
def obtener_detalle_reporte_falla(id_reporte: int):
    """
    Obtiene los detalles completos de un reporte de falla por su ID.
    Usado por el frontend para mostrar el modal cuando el usuario toca la notificación.
    
    Retorna:
    - Descripción completa (con unidad, paradero, tipo de falla, motivo)
    - Información del emisor
    - Corredor afectado
    - Ruta sugerida alternativa
    - Fecha del reporte
    """
    from sqlalchemy import select
    from config.db import SessionLocal
    from models.Reporte import Reporte
    from models.UsuarioBase import UsuarioBase
    from models.Corredor import Corredor
    from models.Ruta import Ruta
    
    try:
        db = SessionLocal()
        
        # Obtener el reporte con joins para traer info relacionada
        stmt = select(Reporte).where(Reporte.id_reporte == id_reporte)
        reporte = db.execute(stmt).scalar_one_or_none()
        
        if not reporte:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reporte {id_reporte} no encontrado"
            )
        
        # Verificar que sea un reporte de falla (tipo 1)
        if reporte.id_tipo_reporte != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El reporte {id_reporte} no es de tipo falla"
            )
        
        # Obtener información adicional
        emisor_nombre = None
        if reporte.id_emisor:
            emisor = db.execute(
                select(UsuarioBase).where(UsuarioBase.id_usuario == reporte.id_emisor)
            ).scalar_one_or_none()
            if emisor:
                emisor_nombre = emisor.nombre
        
        # Obtener rutas alternativas si hay corredor afectado
        rutas_alternativas = []
        if reporte.id_corredor_afectado:
            # Buscar 2 rutas diferentes al corredor afectado
            rutas = db.execute(
                select(Ruta).where(Ruta.id_ruta != reporte.id_ruta_afectada).limit(2)
            ).scalars().all()
            
            rutas_alternativas = [
                {
                    "id_ruta": r.id_ruta,
                    "nombre": r.nombre or f"Ruta {r.codigo}",
                    "codigo": r.codigo
                }
                for r in rutas
            ]
        
        db.close()
        
        # Parsear la descripción para extraer info estructurada
        # Formato: "Falla en unidad ADV-294 | Paradero: San Luis_IDA | Tipo: Puertas | Requiere intervención: Sí | Motivo: prueba"
        partes = {}
        if reporte.descripcion:
            for parte in reporte.descripcion.split(" | "):
                if ":" in parte:
                    clave, valor = parte.split(":", 1)
                    partes[clave.strip()] = valor.strip()
        
        # Extraer info específica
        unidad_afectada = partes.get("Falla en unidad", "").replace("Falla en unidad ", "")
        paradero = partes.get("Paradero", "Automático")
        tipo_falla = partes.get("Tipo", "No especificado")
        motivo = partes.get("Motivo", "")
        
        return {
            "ok": True,
            "reporte": {
                "id_reporte": reporte.id_reporte,
                "fecha": reporte.fecha.isoformat() if reporte.fecha else None,
                "descripcion_completa": reporte.descripcion,
                "unidad_afectada": unidad_afectada,
                "paradero": paradero,
                "tipo_falla": tipo_falla,
                "motivo": motivo,
                "requiere_intervencion": reporte.requiere_intervencion,
                "es_critica": reporte.es_critica,
                "emisor": {
                    "id": reporte.id_emisor,
                    "nombre": emisor_nombre
                },
                "corredor_afectado_id": reporte.id_corredor_afectado,
                "rutas_alternativas": rutas_alternativas
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] obtener_detalle_reporte_falla: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

