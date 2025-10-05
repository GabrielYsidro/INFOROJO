import os
from datetime import datetime, timedelta
import jwt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.UsuarioBase import UsuarioBase



class AuthService:
    """
    Servicio de autenticación para manejar login y generación de tokens JWT.
    """
    
    def __init__(self):
        self.SECRET_KEY = os.getenv("SECRET_KEY","clave_secreta")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
        
    def authenticate_user(self, db: Session, correo: str, dni: str) -> UsuarioBase:
        """
        Verifica si existe un usuario con el correo y DNI dados.
        Si no existe, lanza una excepción HTTP 401.
        """
        user = db.query(UsuarioBase).filter(
            UsuarioBase.correo == correo,
            UsuarioBase.dni == dni
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )

        return user
    
    def create_access_token(self, data: dict) -> str:
        """
        Genera un token JWT con la información del usuario y una fecha de expiración.
        """
        to_encode = data.copy()
        expire = datetime.now(datetime.timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt

