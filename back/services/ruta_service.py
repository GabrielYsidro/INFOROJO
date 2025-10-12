from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from models.Ruta import Ruta
from services.SistemaFiltros import SistemaFiltros
from services.FiltroRuta import FiltroRuta
from services.FiltroCercania import FiltroCercania
from services.paradero_service import Paradero_Service
from config.db import engine as shared_engine
from typing import Optional, List, Dict


class RutaService:
    def __init__(self, db: Session):
        self.db = db

    def create_ruta(self, nombre: str) -> Ruta:
        nueva_ruta = Ruta(nombre=nombre)
        self.db.add(nueva_ruta)
        self.db.commit()
        self.db.refresh(nueva_ruta)
        return nueva_ruta

    def get_rutas(self) -> List[Dict]:
        rutas = self.db.query(Ruta).all()
        return [{'id_ruta': r.id_ruta, 'nombre': r.nombre} for r in rutas]

    def filtrar_rutas(self, ruta: Optional[str] = None, ruta_id: Optional[int] = None, distrito: Optional[str] = None, distancia: Optional[float] = None) -> List[Dict]:
        """
        Filtra rutas usando el patrón Strategy y adjunta paraderos.

        Comportamiento:
        - Si se pasa `ruta_id` (int) -> devuelve directamente la lista de paraderos
          asociados a esa ruta (lista de dicts).
        - En caso contrario, aplica los filtros sobre rutas y devuelve una lista
          de dicts {id_ruta, nombre, paraderos: [...]}
        """
        paradero_svc = Paradero_Service(shared_engine)

        # Si se pidió por id explícito, devolver sólo los paraderos
        if ruta_id is not None:
            return paradero_svc.get_paraderos_by_ruta(ruta_id)

        # Obtener todas las rutas con paraderos cargados para evitar lazy loads
        todas_rutas = self.db.query(Ruta).options(joinedload(Ruta.paraderos)).all()

        sistema_filtros = SistemaFiltros()
        if ruta and ruta.strip():
            sistema_filtros.agregar_estrategia(FiltroRuta(ruta))

        if distancia and distancia > 0:
            ubicacion_usuario = self._obtener_ubicacion_usuario()
            if ubicacion_usuario:
                sistema_filtros.agregar_estrategia(FiltroCercania(distancia, ubicacion_usuario))

        # TODO: filtro por distrito si se implementa
        rutas_filtradas = sistema_filtros.aplicar_filtros(todas_rutas)

        resultado: List[Dict] = []
        for ruta_obj in rutas_filtradas:
            # Intentar obtener paraderos vía servicio (más consistente)
            try:
                paraderos = paradero_svc.get_paraderos_by_ruta(getattr(ruta_obj, 'id_ruta', None))
            except Exception:
                # Fallback: serializar desde la relación cargada
                paraderos = []
                if hasattr(ruta_obj, 'paraderos') and ruta_obj.paraderos:
                    for p in ruta_obj.paraderos:
                        paraderos.append({
                            'id_paradero': getattr(p, 'id_paradero', None),
                            'nombre': getattr(p, 'nombre', None),
                            'coordenada_lat': getattr(p, 'coordenada_lat', None),
                            'coordenada_lng': getattr(p, 'coordenada_lng', None),
                            'colapso_actual': getattr(p, 'colapso_actual', None),
                        })

            resultado.append({
                'id_ruta': getattr(ruta_obj, 'id_ruta', None),
                'nombre': getattr(ruta_obj, 'nombre', None),
                'paraderos': paraderos
            })

        # Log de depuración: mostrar el payload que se devolverá
        try:
            print('[DEBUG] Rutas filtradas payload:', resultado)
        except Exception:
            pass

        return resultado

    def _obtener_ubicacion_usuario(self) -> Optional[tuple]:
        """Ubicación de ejemplo (placeholder)."""
        return (-12.0464, -77.0428)

