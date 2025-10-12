# routes/ruta_routes.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from services.ruta_service import RutaService
from config.db import get_db
from typing import Optional


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

@router.get("/filtrar")
def filtrar_rutas(
    ruta: Optional[str] = Query(None, description="Filtrar por nombre de ruta"),
    distrito: Optional[str] = Query(None, description="Filtrar por distrito"),
    distancia: Optional[float] = Query(None, description="Filtrar por distancia máxima en km"),
    db: Session = Depends(get_db)
):
    return RutaService(db).filtrar_rutas(ruta, distrito, distancia)
