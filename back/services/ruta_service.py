from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.Ruta import Ruta
from models.SistemaFiltros import SistemaFiltros
from models.FiltroRuta import FiltroRuta
from models.FiltroCercania import FiltroCercania
from typing import Optional

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

    def filtrar_rutas(self, ruta: Optional[str] = None, distrito: Optional[str] = None, distancia: Optional[float] = None) -> list[Ruta]:
        """
        Filtra rutas según los criterios proporcionados usando el patrón Strategy.
        
        Ahora soporta múltiples filtros que se pueden combinar:
        - Filtro por nombre de ruta (búsqueda parcial)
        - Filtro por cercanía usando coordenadas de paraderos
        - Filtro por distrito (pendiente de implementar)
        
        Args:
            ruta: Nombre de ruta a filtrar
            distrito: Distrito a filtrar (no implementado aún)
            distancia: Distancia máxima en km (requiere ubicación del usuario)
            
        Returns:
            Lista de rutas que cumplen con los criterios de filtrado
        """
        # Obtener todas las rutas con sus relaciones
        todas_rutas = self.db.query(Ruta).all()
        
        # Crear sistema de filtros
        sistema_filtros = SistemaFiltros()
        
        # Agregar estrategia de filtro por nombre de ruta
        if ruta and ruta.strip():
            sistema_filtros.agregar_estrategia(FiltroRuta(ruta))
        
        # Agregar estrategia de filtro por cercanía
        if distancia and distancia > 0:
            ubicacion_usuario = self._obtener_ubicacion_usuario()
            if ubicacion_usuario:
                sistema_filtros.agregar_estrategia(FiltroCercania(distancia, ubicacion_usuario))
        
        # TODO: Implementar FiltroDistrito cuando sea necesario
        if distrito and distrito.strip():
            # sistema_filtros.agregar_estrategia(FiltroDistrito(distrito))
            pass
        
        # Aplicar todos los filtros configurados
        return sistema_filtros.aplicar_filtros(todas_rutas)
    
    def _obtener_ubicacion_usuario(self) -> Optional[tuple]:
        """
        Obtiene la ubicación actual del usuario.
        
        TODO: Implementar lógica para obtener ubicación real del usuario
        Por ahora devuelve una ubicación de ejemplo en Lima.
        
        Returns:
            Tuple con (latitud, longitud) o None si no se puede obtener
        """
        # Ubicación de ejemplo en Lima, Perú
        # TODO: Integrar con sistema de geolocalización real
        return (-12.0464, -77.0428)  # Lima, Perú
