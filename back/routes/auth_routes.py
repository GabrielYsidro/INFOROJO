from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.db import get_db
from services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

auth_service = AuthService()


@router.post("/login")
def login(credentials: dict, db: Session = Depends(get_db)):
    """
    Endpoint de login que valida correo + DNI,
    genera un token JWT y devuelve los datos esenciales del usuario.
    """
    correo = credentials.get("correo")
    dni = credentials.get("dni")

    if not correo or not dni:
        raise HTTPException(status_code=400, detail="Faltan credenciales")

    # 1️⃣ Verificar si el usuario existe
    user = auth_service.authenticate_user(db, correo, dni)

    # 2️⃣ Obtener el tipo de usuario (rol)
    role = None
    if user.tipo_usuario and hasattr(user.tipo_usuario, "tipo"):
        role = user.tipo_usuario.tipo.lower()  # ej: "cliente", "conductor", "regulador"
    else:
        raise HTTPException(status_code=400, detail="El usuario no tiene un rol asignado")

    # 3️⃣ Generar token JWT
    token = auth_service.create_access_token({
        "sub": user.correo,
        "id": user.id_usuario,
        "role": role
    })

    # 4️⃣ Devolver respuesta
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id_usuario": user.id_usuario,
            "nombre": user.nombre,
            "correo": user.correo,
            "rol": role
        }
    }