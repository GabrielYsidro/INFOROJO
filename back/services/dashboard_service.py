from sqlalchemy.orm import Session
from models.Reporte import Reporte
from sqlalchemy import func, cast, Date

TIPO_FALLA = 1
TIPO_RETRASO = 2
TIPO_DESVIO = 3

class DashboardService:
    def __init__(self, db: Session):
       self.db = db
    
    def getDashboard(self):
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

        dashboardData = {
            "numero_fallas": numero_fallas,
            "numero_desvios": numero_desvios,
        }

        return dashboardData