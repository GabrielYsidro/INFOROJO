from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from config.db import get_db
from services.comentario_paradero_service import ComentarioParaderoService

router = APIRouter(
   prefix="/comentario_paradero",
   tags=["comentario_paradero"]
)

@router.get("/{id_paradero}")
def obtener_corredor(id_paradero: int, db: Session = Depends(get_db)):
   corredor = ComentarioParaderoService(db).obtener_paradero_perfil(id_paradero)
   if not corredor:
       raise HTTPException(status_code=404, detail="Corredor no encontrado")
   return corredor
