from sqlalchemy.orm import Session
from back.models.Rutafix import Ruta

class RutaService:
    def __init__(self, db: Session):
        self.db = db

    def create_ruta(self, nombre: str) -> Ruta:
        nueva_ruta = Ruta(nombre=nombre)
        self.db.add(nueva_ruta)
        self.db.commit()
        self.db.refresh(nueva_ruta)
        return nueva_ruta

    def get_rutas(self) -> list[Ruta]:
        return self.db.query(Ruta).all()
