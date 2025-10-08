from sqlalchemy.orm import Session
from models.Corredor import Corredor


class CorredorService:
   def __init__(self, db: Session):
       self.db = db


   def create_corredor(self, capacidad_max: int, ubicacion_lat: float, ubicacion_lng: float, estado: str):
       corredor = Corredor(
           capacidad_max=capacidad_max,
           ubicacion_lat=ubicacion_lat,
           ubicacion_lng=ubicacion_lng,
           estado=estado
       )
       self.db.add(corredor)
       self.db.commit()
       self.db.refresh(corredor)
       return corredor


   def get_corredores(self):
       return self.db.query(Corredor).all()


   def get_corredor_by_id(self, id_corredor: int):
       return self.db.query(Corredor).filter(Corredor.id_corredor == id_corredor).first()
