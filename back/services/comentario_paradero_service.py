from sqlalchemy.orm import Session
from models.Paradero import Paradero

class ComentarioParaderoService:
    def __init__(self, db: Session):
        self.db = db
    
    def obtener_paradero_perfil(self, id_paradero:int):
        return self.db.query(Paradero).filter(Paradero.id_paradero==id_paradero).first()