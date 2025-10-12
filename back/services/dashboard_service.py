from sqlalchemy.orm import Session
from models.Reporte import Reporte

class DashboardService:
    def __init__(self, db: Session):
       self.db = db
    
    def getDashboard(self):
        return self.db.query(Reporte).all()