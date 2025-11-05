from .EstrategiaFiltroRuta import EstrategiaFiltroRuta
from models.Ruta import Ruta
from typing import List, Tuple
import math

class FiltroCercania(EstrategiaFiltroRuta):
    """
    Estrategia para filtrar rutas por cercanía a una ubicación específica.
    
    Calcula la distancia entre la ubicación del usuario y los paraderos de cada ruta,
    devolviendo solo las rutas que tengan al menos un paradero dentro del radio especificado.
    """
    
    def __init__(self, distancia_maxima: float, ubicacion_usuario: Tuple[float, float]):
        """
        Inicializa el filtro de cercanía.
        
        Args:
            distancia_maxima (float): Distancia máxima en kilómetros
            ubicacion_usuario (Tuple[float, float]): (latitud, longitud) del usuario
        """
        self.distancia_maxima = distancia_maxima
        self.ubicacion_usuario = ubicacion_usuario
    
    def filtrar(self, rutas: List[Ruta]) -> List[Ruta]:
        """
        Filtra las rutas que tengan al menos un paradero dentro del radio especificado.
        
        Args:
            rutas (List[Ruta]): Lista de rutas a filtrar
            
        Returns:
            List[Ruta]: Rutas que tienen paraderos cercanos a la ubicación del usuario
        """
        if not self.ubicacion_usuario or self.distancia_maxima <= 0:
            return rutas
        
        rutas_cercanas = []
        
        for ruta in rutas:
            # Verificar si algún paradero de la ruta está cerca
            if self._ruta_tiene_paraderos_cercanos(ruta):
                rutas_cercanas.append(ruta)
        
        return rutas_cercanas
    
    def _ruta_tiene_paraderos_cercanos(self, ruta: Ruta) -> bool:
        """
        Verifica si una ruta tiene paraderos dentro del radio de cercanía.
        
        Args:
            ruta (Ruta): Ruta a verificar
            
        Returns:
            bool: True si tiene paraderos cercanos, False en caso contrario
        """
        for paradero in ruta.paraderos:
            if self._paradero_esta_cerca(paradero):
                return True
        return False
    
    def _paradero_esta_cerca(self, paradero) -> bool:
        """
        Verifica si un paradero está dentro del radio de cercanía.
        
        Args:
            paradero: Objeto Paradero con coordenadas
            
        Returns:
            bool: True si está cerca, False en caso contrario
        """
        if not paradero.coordenada_lat or not paradero.coordenada_lng:
            return False
        
        distancia = self._calcular_distancia(
            self.ubicacion_usuario,
            (paradero.coordenada_lat, paradero.coordenada_lng)
        )
        
        return distancia <= self.distancia_maxima
    
    def _calcular_distancia(self, punto1: Tuple[float, float], punto2: Tuple[float, float]) -> float:
        """
        Calcula la distancia entre dos puntos usando la fórmula de Haversine.
        
        Args:
            punto1 (Tuple[float, float]): (lat, lng) del primer punto
            punto2 (Tuple[float, float]): (lat, lng) del segundo punto
            
        Returns:
            float: Distancia en kilómetros
        """
        lat1, lng1 = punto1
        lat2, lng2 = punto2
        
        # Radio de la Tierra en kilómetros
        R = 6371.0
        
        # Convertir a radianes
        lat1_rad = math.radians(lat1)
        lng1_rad = math.radians(lng1)
        lat2_rad = math.radians(lat2)
        lng2_rad = math.radians(lng2)
        
        # Diferencia de coordenadas
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        
        # Fórmula de Haversine
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
