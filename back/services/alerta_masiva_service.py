from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from config.db import engine as shared_engine
from models.TipoReporte import TipoReporte
from models.Reporte import Reporte
from datetime import datetime

class AlertaMasivaService:
    def __init__(self, engine=None):
        self.engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible en AlertaMasivaService.")

    def obtener_tipos_reporte(self) -> List[Dict]:
        """Obtiene todos los tipos de reporte disponibles"""
        try:
            with Session(self.engine) as session:
                stmt = select(TipoReporte)
                result = session.execute(stmt)
                tipos = result.scalars().all()
                return [
                    {
                        "id_tipo_reporte": tipo.id_tipo_reporte,
                        "tipo": tipo.tipo
                    }
                    for tipo in tipos
                ]
        except Exception as e:
            print(f"[ERROR] AlertaMasivaService.obtener_tipos_reporte: {e}")
            raise

    def obtener_reportes_por_tipo(self, id_tipo_reporte: int) -> List[Dict]:
        """Obtiene todos los reportes de un tipo específico para mostrar en la lista"""
        try:
            with Session(self.engine) as session:
                stmt = select(Reporte).where(
                    Reporte.id_tipo_reporte == id_tipo_reporte
                ).order_by(Reporte.fecha.desc())
                
                result = session.execute(stmt)
                reportes = result.scalars().all()
                
                return [
                    {
                        "id_reporte": reporte.id_reporte,
                        "descripcion": reporte.descripcion,
                        "fecha": reporte.fecha.isoformat() if reporte.fecha else None,
                        "es_critica": reporte.es_critica,
                        "requiere_intervencion": reporte.requiere_intervencion
                    }
                    for reporte in reportes
                ]
        except Exception as e:
            print(f"[ERROR] AlertaMasivaService.obtener_reportes_por_tipo: {e}")
            raise

    def enviar_alerta_masiva(self, payload: Dict) -> Dict:
        """
        Simula el envío de una alerta masiva a todos los usuarios.
        No guarda nada en la base de datos, solo retorna confirmación.
        En una implementación real, aquí se enviarían notificaciones push.
        """
        try:
            id_tipo_reporte = payload["id_tipo_reporte"]
            
            # Obtener información del tipo de reporte
            with Session(self.engine) as session:
                stmt = select(TipoReporte).where(
                    TipoReporte.id_tipo_reporte == id_tipo_reporte
                )
                result = session.execute(stmt)
                tipo_reporte = result.scalar_one_or_none()
                
                if not tipo_reporte:
                    raise ValueError(f"Tipo de reporte {id_tipo_reporte} no encontrado")
                
                # Contar cuántos reportes de este tipo existen
                count_stmt = select(Reporte).where(
                    Reporte.id_tipo_reporte == id_tipo_reporte
                )
                count_result = session.execute(count_stmt)
                reportes_count = len(count_result.scalars().all())
            
            # Aquí es donde se enviarían las notificaciones push reales
            # Por ahora solo retornamos confirmación
            return {
                "success": True,
                "mensaje": "Alerta masiva enviada exitosamente a todos los usuarios",
                "tipo_alerta": tipo_reporte.tipo,
                "id_tipo_reporte": id_tipo_reporte,
                "reportes_asociados": reportes_count,
                "fecha_envio": datetime.utcnow().isoformat(),
                "destinatarios": ["Reguladores", "Clientes", "Conductores"]
            }
        except Exception as e:
            print(f"[ERROR] AlertaMasivaService.enviar_alerta_masiva: {e}")
            raise
