from typing import List
from models.Ruta import Ruta
from services.EstrategiaFiltroRuta import EstrategiaFiltroRuta

class SistemaFiltros:
    """
    Contexto que maneja múltiples estrategias de filtrado.
    
    Permite combinar diferentes filtros aplicándolos secuencialmente
    a una lista de rutas, siguiendo el patrón Strategy.
    """
    
    def __init__(self):
        """
        Inicializa el sistema de filtros con una lista vacía de estrategias.
        """
        self.estrategias: List[EstrategiaFiltroRuta] = []
    
    def agregar_estrategia(self, estrategia: EstrategiaFiltroRuta):
        """
        Agrega una estrategia de filtrado al sistema.
        
        Args:
            estrategia (EstrategiaFiltroRuta): Estrategia a agregar
        """
        if estrategia is not None:
            self.estrategias.append(estrategia)
    
    def aplicar_filtros(self, rutas: List[Ruta]) -> List[Ruta]:
        """
        Aplica todas las estrategias de filtrado en secuencia.
        
        Cada estrategia filtra el resultado de la estrategia anterior,
        permitiendo combinar múltiples criterios de filtrado.
        
        Args:
            rutas (List[Ruta]): Lista inicial de rutas a filtrar
            
        Returns:
            List[Ruta]: Rutas que cumplen con todos los criterios de filtrado
        """
        if not self.estrategias:
            # Si no hay estrategias, devolver todas las rutas
            return rutas
        
        resultado = rutas
        
        # Aplicar cada estrategia secuencialmente
        for estrategia in self.estrategias:
            resultado = estrategia.filtrar(resultado)
        
        return resultado
    
    def limpiar_estrategias(self):
        """
        Limpia todas las estrategias del sistema.
        """
        self.estrategias.clear()
    
    def obtener_cantidad_estrategias(self) -> int:
        """
        Obtiene la cantidad de estrategias configuradas.
        
        Returns:
            int: Número de estrategias en el sistema
        """
        return len(self.estrategias)
