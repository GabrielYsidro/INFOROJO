from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.db import get_db
from services.auth_service import AuthService
from services import auth_service
import models
from fastapi import Header

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

    # Verificar usuario
    user = auth_service.authenticate_user(db, correo, dni)

    # Obtener Rol
    role = None
    if user.tipo_usuario and hasattr(user.tipo_usuario, "tipo"):
        role = user.tipo_usuario.tipo.lower()  # ej: "cliente", "conductor", "regulador"
    else:
        raise HTTPException(status_code=400, detail="El usuario no tiene un rol asignado")

    # Generar JWT
    token = auth_service.create_access_token({
        "sub": user.correo,
        "id": user.id_usuario,
        "role": role
    })

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
    
    
from fastapi import Header

@router.get("/me")
def get_current_user(
    authorization: str = Header(...),  # <--- recibe el header Authorization
    db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    token = authorization.split(" ")[1]  # extraemos solo el token
    payload = auth_service.verify_access_token(token)

    user_id = payload.get("id")  # <- asegúrate que tu token tenga "id  en el payload"
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.query(models.UsuarioBase).filter(models.UsuarioBase.id_usuario == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    #Hola
    return {
        "id_usuario": user.id_usuario,
        "nombre": user.nombre,
        "correo": user.correo,
        "rol": payload.get("role")
    }
