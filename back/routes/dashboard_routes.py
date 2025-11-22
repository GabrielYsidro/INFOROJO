from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from services.dashboard_service import DashboardService

router = APIRouter(
   prefix="/dashboard",
   tags=["dashboard"]
)

@router.get("/{dias_cant}/")
def obtenerDashboard(dias_cant: int,db: Session = Depends(get_db)):
   return DashboardService(db).getDashboard(dias_serie=dias_cant)