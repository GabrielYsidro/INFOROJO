# routes/ruta_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.ruta_service import RutaService
from config.db import get_db


router = APIRouter(
    prefix="/ruta",
    tags=["ruta"]
)

@router.post("/")
def crear_ruta(nombre: str, db: Session = Depends(get_db)):
    return RutaService(db).create_ruta(nombre)

@router.get("/")
def listar_rutas(db: Session = Depends(get_db)):
    return RutaService(db).get_rutas()
