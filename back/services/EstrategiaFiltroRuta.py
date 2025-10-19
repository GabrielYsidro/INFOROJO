from abc import ABC, abstractmethod
from typing import List
from models.Ruta import Ruta

class EstrategiaFiltroRuta(ABC):
    """
    Interface abstracta para definir estrategias de filtrado de rutas.
    
    Permite implementar diferentes tipos de filtros (por nombre, cercanía, distrito, etc.)
    siguiendo el patrón Strategy, donde cada filtro es una estrategia independiente
    que puede combinarse con otras estrategias.
    """
    
    @abstractmethod
    def filtrar(self, rutas: List[Ruta]) -> List[Ruta]:
        """
        Filtra una lista de rutas según los criterios específicos de esta estrategia.
        
        Args:
            rutas (List[Ruta]): Lista de rutas a filtrar
            
        Returns:
            List[Ruta]: Lista de rutas que cumplen con los criterios del filtro
        """
        pass
