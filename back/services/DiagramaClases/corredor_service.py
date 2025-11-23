from sqlalchemy.orm import Session
from models.Corredor import Corredor
from models.Paradero import Paradero
from models.UsuarioBase import UsuarioBase
from sqlalchemy import and_
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
       """Retorna lista serializada de corredores sin cálculos complejos"""
       corredores = self.db.query(Corredor).filter(Corredor.estado.isnot(None)).all()
       return [
           {
               "id_corredor": c.id_corredor,
               "capacidad_max": c.capacidad_max,
               "ubicacion_lat": c.ubicacion_lat,
               "ubicacion_lng": c.ubicacion_lng,
               "estado": c.estado
           }
           for c in corredores
       ]



  
   def get_corredor_by_id(self, id_corredor: int, radio_km: float = 0.5):
        # 1) Obtener corredor
    corredor = (
        self.db.query(Corredor)
        .filter(Corredor.id_corredor == id_corredor)
        .first()
    )
    if not corredor:
        return None

    # 2) Obtener paraderos
    paraderos = self.db.query(Paradero).all()

    # 3) Si no hay paraderos en BD, devolver fallback
    if not paraderos:
        # También calcularemos usuarios cercanos aunque no haya paraderos
        usuarios_tipo1 = (
            self.db.query(UsuarioBase)
            .filter(
                and_(
                    UsuarioBase.id_tipo_usuario == 1,
                    UsuarioBase.ubicacion_actual_lat.isnot(None),
                    UsuarioBase.ubicacion_actual_lng.isnot(None),
                )
            )
            .all()
        )

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  # km
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return R * c

        numero_cercanos = 0
        if corredor.ubicacion_lat is not None and corredor.ubicacion_lng is not None:
            numero_cercanos = sum(
                1
                for u in usuarios_tipo1
                if haversine(
                    corredor.ubicacion_lat,
                    corredor.ubicacion_lng,
                    u.ubicacion_actual_lat,
                    u.ubicacion_actual_lng,
                )
                <= radio_km
            )

        return {
            "id_corredor": corredor.id_corredor,
            "capacidad_max": corredor.capacidad_max,
            "ubicacion_lat": corredor.ubicacion_lat,
            "ubicacion_lng": corredor.ubicacion_lng,
            "estado": corredor.estado,
            "numero_pasajeros": numero_cercanos,  # ahora es el conteo real de cercanos tipo 1
            "nombre_paradero": "Paradero no disponible",
        }

    # 4) Haversine
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371  # km
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c

    # 5) Paradero más cercano
    paradero_cercano = min(
        paraderos,
        key=lambda p: haversine(
            corredor.ubicacion_lat,
            corredor.ubicacion_lng,
            p.coordenada_lat,
            p.coordenada_lng,
        )
        if p.coordenada_lat is not None and p.coordenada_lng is not None
        else float("inf"),
    )

    # 6) Usuarios tipo 1 con coordenadas válidas
    usuarios_tipo1 = (
        self.db.query(UsuarioBase)
        .filter(
            and_(
                UsuarioBase.id_tipo_usuario == 1,
                UsuarioBase.ubicacion_actual_lat.isnot(None),
                UsuarioBase.ubicacion_actual_lng.isnot(None),
            )
        )
        .all()
    )

    # 7) Conteo de usuarios cercanos al corredor dentro del radio_km
    numero_cercanos = 0
    if corredor.ubicacion_lat is not None and corredor.ubicacion_lng is not None:
        numero_cercanos = sum(
            1
            for u in usuarios_tipo1
            if haversine(
                corredor.ubicacion_lat,
                corredor.ubicacion_lng,
                u.ubicacion_actual_lat,
                u.ubicacion_actual_lng,
            )
            <= radio_km
        )

    # 8) Retorno enriquecido
    return {
        "id_corredor": corredor.id_corredor,
        "capacidad_max": corredor.capacidad_max,
        "ubicacion_lat": corredor.ubicacion_lat,
        "ubicacion_lng": corredor.ubicacion_lng,
        "estado": corredor.estado,
        "numero_pasajeros": numero_cercanos,
        "nombre_paradero": getattr(paradero_cercano, "nombre", "Paradero no disponible"),
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

   def calcular_eta(self, id_corredor: int, id_paradero: int, default_speed_kmh: float = 25.0):
            """
            Calcula el ETA (minutos) desde un corredor hasta un paradero.
            Lanza ValueError con mensajes claros si falta información.
            Devuelve dict: { corredor_id, paradero_id, distancia_km, eta_minutos }
            """
            # Validar corredor
            corredor = self.db.query(Corredor).filter(Corredor.id_corredor == id_corredor).first()
            if not corredor:
                raise ValueError("Corredor no encontrado")

            # Validar paradero
            paradero = self.db.query(Paradero).filter(Paradero.id_paradero == id_paradero).first()
            if not paradero:
                raise ValueError("Paradero no encontrado")

            if corredor.ubicacion_lat is None or corredor.ubicacion_lng is None:
                raise ValueError("Corredor sin ubicación registrada")

            if paradero.coordenada_lat is None or paradero.coordenada_lng is None:
                raise ValueError("Paradero sin coordenadas")

            # Haversine
            def haversine(lat1, lon1, lat2, lon2):
                R = 6371  # km
                dlat = radians(lat2 - lat1)
                dlon = radians(lon2 - lon1)
                a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
                c = 2 * atan2(sqrt(a), sqrt(1 - a))
                return R * c

            distancia_km = haversine(
                corredor.ubicacion_lat,
                corredor.ubicacion_lng,
                paradero.coordenada_lat,
                paradero.coordenada_lng,
            )

            speed = getattr(corredor, 'velocidad_kmh', default_speed_kmh) or default_speed_kmh
            minutos = round((distancia_km / speed) * 60) if speed > 0 else None

            if minutos is None:
                raise ValueError("No es posible calcular ETA con los datos disponibles")

            return {
                "corredor_id": corredor.id_corredor,
                "paradero_id": paradero.id_paradero,
                "distancia_km": distancia_km,
                "eta_minutos": max(0, minutos),
            }