from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.Reporte import Reporte
from sqlalchemy import func, cast, Date

TIPO_FALLA = 1
TIPO_RETRASO = 2
TIPO_DESVIO = 3

class DashboardService:
    def __init__(self, db: Session):
       self.db = db
    
    def getDashboard(self, dias_serie: int = 30):
        numero_fallas = (
            self.db.query(func.count(Reporte.id_reporte))
            .filter(Reporte.id_tipo_reporte == TIPO_FALLA)
            .scalar()
            or 0
        )

        numero_desvios = (
            self.db.query(func.count(Reporte.id_reporte))
            .filter(Reporte.id_tipo_reporte == TIPO_DESVIO)
            .scalar()
            or 0
        )

        # Rango de fechas: [hoy-29, hoy]
        hoy = datetime.now().date()
        start_date = hoy - timedelta(days=dias_serie - 1)
        end_date = hoy + timedelta(days=1)  # exclusivo

        # Query: retrasos por día dentro del rango
        rows = (
            self.db.query(
                cast(Reporte.fecha, Date).label("dia"),
                func.count(Reporte.id_reporte).label("total"),
            )
            .filter(
                Reporte.id_tipo_reporte == TIPO_RETRASO,
                Reporte.fecha >= start_date,
                Reporte.fecha < end_date,
            )
            .group_by(cast(Reporte.fecha, Date))
            .all()
        )
        index = {r.dia: int(r.total or 0) for r in rows}

        # Construir listas en ORDEN DESCENDENTE (hoy -> hace 29 días)
        fechas: List[str] = []
        valores: List[int] = []

        for i in range(dias_serie):
            d = hoy - timedelta(days=i)
            valores.append(index.get(d, 0))
            fechas.append(str(d.day))  # "12", "11", "10", ... "12" (mes pasado)

        return {
            "numero_fallas": numero_fallas,
            "numero_desvios": numero_desvios,
            "retrasos_dia_valor": valores,
            "retrasos_dia_fecha": fechas,
        }

        return dashboardData