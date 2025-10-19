from .EstrategiaFiltroRuta import EstrategiaFiltroRuta
from models.Ruta import Ruta
from typing import List

class FiltroRuta(EstrategiaFiltroRuta):
    """
    Estrategia para filtrar rutas por nombre.
    
    Implementa búsqueda parcial case-insensitive del nombre de la ruta.
    """
    
    def __init__(self, nombre_ruta: str):
        """
        Inicializa el filtro con el nombre de ruta a buscar.
        
        Args:
            nombre_ruta (str): Nombre de la ruta a filtrar (búsqueda parcial)
        """
        self.nombre_ruta = nombre_ruta
    
    def filtrar(self, rutas: List[Ruta]) -> List[Ruta]:
        """
        Filtra las rutas que contengan el nombre especificado.
        
        Args:
            rutas (List[Ruta]): Lista de rutas a filtrar
            
        Returns:
            List[Ruta]: Rutas que contienen el nombre especificado
        """
        if not self.nombre_ruta or not self.nombre_ruta.strip():
            # Si no hay criterio de búsqueda, devolver todas las rutas
            return rutas
        
        # Búsqueda parcial case-insensitive
        nombre_buscar = self.nombre_ruta.strip().lower()
        
        return [
            ruta for ruta in rutas 
            if nombre_buscar in ruta.nombre.lower()
        ]
