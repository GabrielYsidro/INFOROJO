from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.usuario_service import UsuarioService
from config.db import get_db

router = APIRouter(
    prefix="/usuario",
    tags=["usuario"]
)

@router.post("/")
def crear_usuario(
    nombre: str,
    dni: str,
    ubicacion_actual_lat: float,
    ubicacion_actual_lng: float,
    correo: str,
    placa_unidad: str,
    cod_empleado: str,
    id_tipo_usuario: int,
    id_corredor_asignado: int | None = None,
    db: Session = Depends(get_db)
):
    return UsuarioService(db).create_usuario(
        nombre=nombre,
        dni=dni,
        ubicacion_actual_lat=ubicacion_actual_lat,
        ubicacion_actual_lng=ubicacion_actual_lng,
        correo=correo,
        placa_unidad=placa_unidad,
        cod_empleado=cod_empleado,
        id_tipo_usuario=id_tipo_usuario,
        id_corredor_asignado=id_corredor_asignado
    )

@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    return UsuarioService(db).get_usuarios()