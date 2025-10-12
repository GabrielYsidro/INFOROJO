from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from services.dashboard_service import DashboardService

router = APIRouter(
   prefix="/dashboard",
   tags=["dashboard"]
)

@router.get("/")
def obtenerDashboard(db: Session = Depends(get_db)):
   return DashboardService(db).getDashboard()