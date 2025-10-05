from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.corredor_service import CorredorService
from config.db import get_db
from schemas.corredor import CorredorCreate, CorredorOut

router = APIRouter(
    prefix="/corredor",
    tags=["corredor"]
)

@router.post("/", response_model=CorredorOut)
def crear_corredor(
    payload: CorredorCreate,
    db: Session = Depends(get_db)
):
    return CorredorService(db).create_corredor(
        **payload.model_dump()
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