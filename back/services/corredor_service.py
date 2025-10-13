from sqlalchemy.orm import Session
from models.Corredor import Corredor
from models.Paradero import Paradero
from math import radians, sin, cos, sqrt, atan2

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
    return self.db.query(Corredor).filter(Corredor.estado.isnot(None)).all()



  
   def get_corredor_by_id(self, id_corredor: int):
        corredor = (
            self.db.query(Corredor)
            .filter(Corredor.id_corredor == id_corredor)
            .first()
        )

        if not corredor:
            return None

        # Obtener todos los paraderos
        paraderos = self.db.query(Paradero).all()

        # Si no hay paraderos en BD, devolver mock
        if not paraderos:
            return {
                "id_corredor": corredor.id_corredor,
                "capacidad_max": corredor.capacidad_max,
                "ubicacion_lat": corredor.ubicacion_lat,
                "ubicacion_lng": corredor.ubicacion_lng,
                "estado": corredor.estado,
                "numero_pasajeros": 11,
                "nombre_paradero": "Paradero San Luis",
            }

        # Función Haversine para calcular distancia entre dos coordenadas (km)
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  # Radio de la Tierra en km
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return R * c

        # Buscar el paradero más cercano
        paradero_cercano = min(
            paraderos,
            key=lambda p: haversine(
                corredor.ubicacion_lat,
                corredor.ubicacion_lng,
                p.coordenada_lat,
                p.coordenada_lng,
            )
            if p.coordenada_lat and p.coordenada_lng else float("inf"),
        )

        # Mock de número de pasajeros
        numero_mock = 11

        # Retorna información enriquecida
        return {
            "id_corredor": corredor.id_corredor,
            "capacidad_max": corredor.capacidad_max,
            "ubicacion_lat": corredor.ubicacion_lat,
            "ubicacion_lng": corredor.ubicacion_lng,
            "estado": corredor.estado,
            "numero_pasajeros": numero_mock,
            "nombre_paradero": paradero_cercano.nombre,
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