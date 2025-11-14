from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from config.db import engine as shared_engine
from models.HistorialUso import HistorialUso
from datetime import datetime

class CalificacionService:
    def __init__(self, engine=None):
        self.engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible en CalificacionService.")

    def actualizar_calificacion(self, id_historial: int, calificacion: int, descripcion: str = None) -> Dict:
        """Actualiza la calificación y descripción de un historial de uso"""
        try:
            # Validar que la calificación esté entre 1 y 5
            if calificacion < 1 or calificacion > 5:
                raise ValueError("La calificación debe estar entre 1 y 5")

            with Session(self.engine) as session:
                # Verificar que el historial existe
                stmt_check = select(HistorialUso).where(HistorialUso.id_historial == id_historial)
                historial = session.execute(stmt_check).scalar_one_or_none()
                
                if not historial:
                    raise ValueError(f"No se encontró el historial con ID {id_historial}")

                # Actualizar la calificación
                stmt_update = update(HistorialUso).where(
                    HistorialUso.id_historial == id_historial
                ).values(
                    calificacion=calificacion,
                    descripcion_calificacion=descripcion
                )
                
                session.execute(stmt_update)
                session.commit()
                
                return {
                    "success": True,
                    "mensaje": "Calificación actualizada correctamente",
                    "id_historial": id_historial,
                    "calificacion": calificacion,
                    "descripcion": descripcion
                }
        except Exception as e:
            print(f"[ERROR] CalificacionService.actualizar_calificacion: {e}")
            raise

    def obtener_calificacion(self, id_historial: int) -> Optional[Dict]:
        """Obtiene la calificación de un historial específico"""
        try:
            with Session(self.engine) as session:
                stmt = select(HistorialUso).where(HistorialUso.id_historial == id_historial)
                historial = session.execute(stmt).scalar_one_or_none()
                
                if not historial:
                    return None
                
                return {
                    "id_historial": historial.id_historial,
                    "calificacion": historial.calificacion,
                    "descripcion_calificacion": historial.descripcion_calificacion,
                    "tiene_calificacion": historial.calificacion is not None
                }
        except Exception as e:
            print(f"[ERROR] CalificacionService.obtener_calificacion: {e}")
            raise

    def obtener_estadisticas_calificaciones(self, id_paradero: int = None) -> Dict:
        """Obtiene estadísticas de calificaciones para un paradero específico o todos"""
        try:
            with Session(self.engine) as session:
                # Base query
                query = select(HistorialUso).where(HistorialUso.calificacion.isnot(None))
                
                if id_paradero:
                    query = query.where(
                        (HistorialUso.id_paradero_sube == id_paradero) |
                        (HistorialUso.id_paradero_baja == id_paradero)
                    )
                
                historiales = session.execute(query).scalars().all()
                
                if not historiales:
                    return {
                        "total_calificaciones": 0,
                        "promedio": 0,
                        "distribuccion": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                    }
                
                total = len(historiales)
                suma = sum(h.calificacion for h in historiales)
                promedio = suma / total
                
                distribuccion = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                for historial in historiales:
                    distribuccion[historial.calificacion] += 1
                
                return {
                    "total_calificaciones": total,
                    "promedio": round(promedio, 2),
                    "distribuccion": distribuccion
                }
        except Exception as e:
            print(f"[ERROR] CalificacionService.obtener_estadisticas_calificaciones: {e}")
            raise