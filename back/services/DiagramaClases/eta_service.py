from sqlalchemy.orm import Session
from models.Paradero import Paradero
from models.Corredor import Corredor
from math import radians, sin, cos, sqrt, atan2
from typing import Optional, Dict


class EtaService:
    def __init__(self, db: Session, default_speed_kmh: float = 25.0):
        self.db = db
        self.default_speed_kmh = default_speed_kmh

    def _haversine_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0  # Earth radius in km
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c

    def get_best_eta_for_paradero(self, id_paradero: int) -> Optional[Dict]:
        """
        Calcula el ETA (en minutos) del corredor que vaya a llegar primero al paradero.
        Devuelve diccionario con keys: paradero_id, corredor_id, eta_minutos, distancia_km
        Si no hay corredores con ubicación, devuelve None.
        """
        paradero: Paradero = self.db.query(Paradero).filter(Paradero.id_paradero == id_paradero).first()
        if not paradero:
            return None

        if paradero.coordenada_lat is None or paradero.coordenada_lng is None:
            return None

        # obtener corredores con ubicación
        corredores = (
            self.db.query(Corredor)
            .filter(Corredor.ubicacion_lat.isnot(None), Corredor.ubicacion_lng.isnot(None))
            .all()
        )

        if not corredores:
            return None

        best = None
        for corredor in corredores:
            try:
                dist_km = self._haversine_km(
                    corredor.ubicacion_lat, corredor.ubicacion_lng,
                    paradero.coordenada_lat, paradero.coordenada_lng,
                )
            except Exception:
                continue

            # velocidad (si en el futuro se añade al modelo, se puede leer aquí)
            speed = getattr(corredor, 'velocidad_kmh', self.default_speed_kmh) or self.default_speed_kmh

            # minutos estimados
            minutos = round((dist_km / speed) * 60) if speed > 0 else None

            if minutos is None:
                continue

            entry = {
                'paradero_id': paradero.id_paradero,
                'corredor_id': corredor.id_corredor,
                'eta_minutos': max(0, minutos),
                'distancia_km': dist_km,
            }

            if best is None or entry['eta_minutos'] < best['eta_minutos']:
                best = entry

        return best


__all__ = ["EtaService"]
