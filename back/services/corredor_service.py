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
        corredor = (
            self.db.query(Corredor)
            .filter(Corredor.id_corredor == id_corredor)
            .first()
        )

        if not corredor:
            return None

        # Mock data
        numero_mock = 11
        nombre_paradero_mock = "Paradero San Luis"

        # Retorna un dict enriquecido
        return {
            "id_corredor": corredor.id_corredor,
            "capacidad_max": corredor.capacidad_max,
            "ubicacion_lat": corredor.ubicacion_lat,
            "ubicacion_lng": corredor.ubicacion_lng,
            "estado": corredor.estado,
            "numero_pasajeros": numero_mock,
            "nombre_paradero": nombre_paradero_mock,
        }


   def actualizar_ubicacion(self, id_corredor: int, ubicacion_lat: float, ubicacion_lng: float, estado: str):
        corredor = self.db.query(Corredor).filter(Corredor.id_corredor == id_corredor).first()
        if corredor:
            corredor.ubicacion_lat = ubicacion_lat
            corredor.ubicacion_lng = ubicacion_lng
            corredor.estado = estado
            self.db.commit()
            self.db.refresh(corredor)
            return corredor
        return None