from sqlalchemy.orm import Session
from models.Paradero import Paradero
from models.ComentarioUsuarioParadero import ComentarioUsuarioParadero
from models.UsuarioBase import UsuarioBase
from services.auth_service import AuthService
from fastapi import HTTPException, status
from datetime import datetime, timezone


class ComentarioParaderoService:
    def __init__(self, db: Session):
        self.db = db
        self.auth = AuthService()
    
    def obtener_comentarios(self, id_paradero:int):
        return self.db.query(ComentarioUsuarioParadero).filter(ComentarioUsuarioParadero.id_paradero==id_paradero).all()
    
    def obtener_paradero_perfil(self, id_paradero:int):
        paradero = self.db.query(Paradero).filter(Paradero.id_paradero==id_paradero).first()
        comentarios = self.obtener_comentarios(id_paradero)
        return {
            "paradero": paradero,
            "comentarios": comentarios
        }

    def comentarParadero(self, token: str, id_paradero: int, comentario: str):
        """Valida el token, crea y persiste un comentario para el paradero.

        token: puede venir con o sin el prefijo 'Bearer '
        Retorna el objeto ComentarioUsuarioParadero creado.
        Lanza HTTPException en caso de token inválido, usuario/paradero no existente o datos faltantes.
        """
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")

        # soportar header "Bearer <token>"
        if token.startswith("Bearer "):
            token = token.split(" ", 1)[1]

        payload = None
        try:
            payload = self.auth.verify_access_token(token)
        except HTTPException:
            # re-lanzar la excepción para que FastAPI la maneje
            raise

        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido: sin id de usuario")

        # verificar existencia de usuario
        user = self.db.query(UsuarioBase).filter(UsuarioBase.id_usuario == user_id).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        # verificar existencia de paradero
        paradero = self.db.query(Paradero).filter(Paradero.id_paradero == id_paradero).first()
        if paradero is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paradero no encontrado")

        if not comentario or not isinstance(comentario, str) or comentario.strip() == "":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comentario vacío o inválido")

        nuevo = ComentarioUsuarioParadero(
            created_at=datetime.now(timezone.utc),
            id_usuario=user_id,
            id_paradero=id_paradero,
            comentario=comentario.strip()
        )

        self.db.add(nuevo)
        try:
            self.db.commit()
            self.db.refresh(nuevo)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al guardar comentario: {e}")

        return nuevo