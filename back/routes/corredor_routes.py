from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from services.corredor_service import CorredorService
from config.db import get_db


router = APIRouter(
   prefix="/corredor",
   tags=["corredor"]
)


@router.post("/")
def crear_corredor(
   capacidad_max: int= Body(...),
   ubicacion_lat: float= Body(...),
   ubicacion_lng: float= Body(...),
   estado: str= Body(...),
   db: Session = Depends(get_db)
):
   return CorredorService(db).create_corredor(
       capacidad_max=capacidad_max,
       ubicacion_lat=ubicacion_lat,
       ubicacion_lng=ubicacion_lng,
       estado=estado
   )


@router.get("/")
def listar_corredores(db: Session = Depends(get_db)):
   return CorredorService(db).get_corredores()


@router.get("/{id_corredor}")
def obtener_corredor(id_corredor: int, db: Session = Depends(get_db)):
   corredor = CorredorService(db).get_corredor_by_id(id_corredor)
   if not corredor:
       raise HTTPException(status_code=404, detail="Corredor no encontrado")
   return corredor
