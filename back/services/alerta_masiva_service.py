from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from config.db import engine as shared_engine
from models.TipoReporte import TipoReporte
from models.Reporte import Reporte
from models.Corredor import Corredor
from models.Ruta import Ruta
from models.Paradero import Paradero
from datetime import datetime, timezone
from firebase_admin import messaging
from models.UsuarioBase import UsuarioBase
from config.firebase import get_firebase_admin

class AlertaMasivaService:
    def __init__(self, engine=None):
        self.engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible en AlertaMasivaService.")

    def obtener_datos_formulario(self) -> Dict:
        """
        Obtiene todos los datos necesarios para poblar los dropdowns del formulario:
        - Corredores
        - Rutas
        - Paraderos
        """
        try:
            with Session(self.engine) as session:
                # Obtener corredores
                stmt_corredores = select(Corredor)
                corredores = session.execute(stmt_corredores).scalars().all()
                
                # Obtener rutas
                stmt_rutas = select(Ruta)
                rutas = session.execute(stmt_rutas).scalars().all()
                
                # Obtener paraderos
                stmt_paraderos = select(Paradero)
                paraderos = session.execute(stmt_paraderos).scalars().all()
                
                return {
                    "corredores": [
                        {
                            "id_corredor": c.id_corredor,
                            "nombre": c.nombre
                        }
                        for c in corredores
                    ],
                    "rutas": [
                        {
                            "id_ruta": r.id_ruta,
                            "codigo": r.codigo,
                            "nombre": r.nombre
                        }
                        for r in rutas
                    ],
                    "paraderos": [
                        {
                            "id_paradero": p.id_paradero,
                            "nombre": p.nombre
                        }
                        for p in paraderos
                    ]
                }
        except Exception as e:
            print(f"[ERROR] AlertaMasivaService.obtener_datos_formulario: {e}")
            raise

    def crear_alerta_masiva(self, payload: Dict) -> Dict:
        """
        Crea un nuevo reporte tipo "Otro" (id_tipo_reporte = 4) para alertas masivas.
        Guarda todos los campos del reporte en la base de datos.
        Si se especifica, envía una notificación masiva.
        """
        try:
            with Session(self.engine) as session:
                # Preparar los datos del reporte
                datos_reporte = {
                    "fecha": datetime.now(timezone.utc),
                    "descripcion": payload.get("descripcion"),
                    "id_emisor": payload.get("id_emisor"),
                    "id_tipo_reporte": 4,  # Tipo "Otro" para alertas masivas
                    "id_corredor_afectado": payload.get("id_corredor_afectado"),
                    "es_critica": payload.get("es_critica", False),
                    "requiere_intervencion": payload.get("requiere_intervencion", False),
                    "id_ruta_afectada": payload.get("id_ruta_afectada"),
                    "id_paradero_inicial": payload.get("id_paradero_inicial"),
                    "id_paradero_final": payload.get("id_paradero_final"),
                    "tiempo_retraso_min": payload.get("tiempo_retraso_min")
                }
                
                # Insertar el nuevo reporte
                stmt = insert(Reporte).values(**datos_reporte).returning(Reporte)
                result = session.execute(stmt)
                nuevo_reporte = result.scalar_one()
                
                session.commit()

                # Si se solicita, enviar notificación
                if payload.get("send_notification"):
                    fcm_tokens = session.execute(
                        select(UsuarioBase.fcm_token).where(UsuarioBase.fcm_token.isnot(None))
                    ).scalars().all()
                    
                    if fcm_tokens:
                        try:
                            firebase_admin = get_firebase_admin()
                            messages = [
                                messaging.Message(
                                    notification=messaging.Notification(
                                        title="Alerta Masiva",
                                        body=payload.get("descripcion")
                                    ),
                                    token=token,
                                )
                                for token in list(set(fcm_tokens))
                            ]
                            
                            response = firebase_admin.send_all(messages)
                            print(f"Notificaciones enviadas: {response.success_count}")
                            if response.failure_count > 0:
                                print(f"Notificaciones fallidas: {response.failure_count}")

                        except Exception as e:
                            print(f"[ERROR] Al enviar notificación de alerta masiva: {e}")
                
                return {
                    "id_reporte": nuevo_reporte.id_reporte,
                    "fecha": nuevo_reporte.fecha.isoformat(),
                    "descripcion": nuevo_reporte.descripcion,
                    "id_emisor": nuevo_reporte.id_emisor,
                    "id_tipo_reporte": nuevo_reporte.id_tipo_reporte,
                    "es_critica": nuevo_reporte.es_critica,
                    "requiere_intervencion": nuevo_reporte.requiere_intervencion,
                    "mensaje": "Alerta masiva creada exitosamente"
                }
        except Exception as e:
            print(f"[ERROR] AlertaMasivaService.crear_alerta_masiva: {e}")
            raise
