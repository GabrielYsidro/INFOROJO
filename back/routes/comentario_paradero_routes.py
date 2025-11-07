from fastapi import APIRouter, Depends, HTTPException, Body, Header
from sqlalchemy.orm import Session
from config.db import get_db
from services.comentario_paradero_service import ComentarioParaderoService

router = APIRouter(
   prefix="/comentario_paradero",
   tags=["comentario_paradero"]
)

@router.get("/perfil/{id_paradero}")
def obtener_corredor(id_paradero: int, db: Session = Depends(get_db)):
   corredor = ComentarioParaderoService(db).obtener_paradero_perfil(id_paradero)
   if not corredor:
       raise HTTPException(status_code=404, detail="Corredor no encontrado")
   return corredor

@router.get("/{id_paradero}")
def obtener_comentarios_paradero(id_paradero: int, db: Session = Depends(get_db)):
    comentarios = ComentarioParaderoService(db).obtener_comentarios(id_paradero)
    return comentarios

@router.post("/comentar")
def comentar_paradero(
    authorization: str = Header(..., description="Authorization header. Use 'Bearer <token>'"),
    id_paradero: int = Body(..., embed=True, description="ID del paradero a comentar"),
    comentario: str = Body(..., embed=True, description="Texto del comentario"),
    db: Session = Depends(get_db)
):
    nuevo_comentario = ComentarioParaderoService(db).comentarParadero(authorization, id_paradero, comentario)
    return nuevo_comentario

@router.put("/editar_comentario")
def editar_comentario(
    authorization: str = Header(..., description="Authorization header. Use 'Bearer <token>'"),
    id_comentario: int = Body(..., embed=True, description="ID del comentario a editar"),
    nuevo_texto: str = Body(..., embed=True, description="Nuevo texto del comentario"),
    db: Session = Depends(get_db)):
    comentario_editado = ComentarioParaderoService(db).editar_comentario(authorization, id_comentario, nuevo_texto)
    return comentario_editado

@router.delete("/eliminar_comentario")
def eliminar_comentario(
    authorization: str = Header(..., description="Authorization header. Use 'Bearer <token>'"),
    id_comentario: int = Body(..., embed=True, description="ID del comentario a eliminar"),
    db: Session = Depends(get_db)):
    resultado = ComentarioParaderoService(db).eliminar_comentario(authorization, id_comentario)
    return resultado