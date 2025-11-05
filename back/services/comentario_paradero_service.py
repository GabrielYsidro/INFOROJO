from sqlalchemy.orm import Session
from models.Paradero import Paradero
from models.ComentarioUsuarioParadero import ComentarioUsuarioParadero

class ComentarioParaderoService:
    def __init__(self, db: Session):
        self.db = db
    
    def obtener_comentarios(self, id_paradero:int):
        return self.db.query(ComentarioUsuarioParadero).filter(ComentarioUsuarioParadero.id_paradero==id_paradero).all()
    
    def obtener_paradero_perfil(self, id_paradero:int):
        paradero = self.db.query(Paradero).filter(Paradero.id_paradero==id_paradero).first()
        comentarios = self.obtener_comentarios(id_paradero)
        return {
            "paradero": paradero,
            "comentarios": comentarios
        }