"""
Rutas para visualización de mapa interactivo.
Expone endpoints que retornan datos de markers agrupados por tipo
para consumo desde el frontend (Google Maps, Mapbox, etc).
También gestiona la activación/desactivación de capas.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from services.DiagramaClases.mapa_interactivo_service import MapaInteractivo
from typing import List, Dict, Any

router = APIRouter(prefix="/api/mapa", tags=["Mapa"])

# Instancia global del mapa (mantiene estado de capas entre requests)
_mapa_instance: Dict[int, MapaInteractivo] = {}


def _get_mapa(db: Session) -> MapaInteractivo:
    """Obtiene o crea la instancia única del mapa para esta sesión"""
    db_id = id(db)
    if db_id not in _mapa_instance:
        _mapa_instance[db_id] = MapaInteractivo(db)
    return _mapa_instance[db_id]


@router.get("/markers", response_model=Dict[str, List[Dict[str, Any]]])
def obtener_markers_mapa(db: Session = Depends(get_db)):
    """
    🗺️ Obtiene todos los markers del mapa agrupados por tipo.
    
    Respeta el estado de capas activas/inactivas.
    
    Integra datos de:
    - Rutas de transporte
    - Corredores (buses activos)
    - Paraderos (paradas de bus)
    - Alertas (congestión, servicio, etc)
    
    Returns:
        {
            "rutas": [...],
            "corredores": [...],
            "paraderos": [...],
            "alertas": [...]
        }
    """
    try:
        mapa = _get_mapa(db)
        markers = mapa.obtener_todos_los_markers()
        
        return {
            "rutas": markers.get("rutas", []),
            "corredores": markers.get("corredores", []),
            "paraderos": markers.get("paraderos", []),
            "alertas": markers.get("alertas", [])
        }
    except Exception as e:
        return {
            "error": str(e),
            "rutas": [],
            "corredores": [],
            "paraderos": [],
            "alertas": []
        }


@router.get("/paraderos", response_model=List[Dict[str, Any]])
def obtener_paraderos_mapa(db: Session = Depends(get_db)):
    """Obtiene paraderos activos del mapa"""
    try:
        mapa = _get_mapa(db)
        return mapa.mostrar_paraderos()
    except Exception as e:
        return {"error": str(e), "paraderos": []}


@router.get("/corredores", response_model=List[Dict[str, Any]])
def obtener_corredores_mapa(db: Session = Depends(get_db)):
    """Obtiene corredores activos del mapa"""
    try:
        mapa = _get_mapa(db)
        return mapa.mostrar_corredores()
    except Exception as e:
        return {"error": str(e), "corredores": []}


@router.get("/rutas", response_model=List[Dict[str, Any]])
def obtener_rutas_mapa(db: Session = Depends(get_db)):
    """Obtiene rutas activas del mapa"""
    try:
        mapa = _get_mapa(db)
        return mapa.mostrar_rutas()
    except Exception as e:
        return {"error": str(e), "rutas": []}


@router.get("/capas/estado", response_model=Dict[str, bool])
def obtener_estado_capas(db: Session = Depends(get_db)):
    """
    📊 Obtiene el estado actual de todas las capas (activas/inactivas).
    
    Returns:
        {
            "rutas": bool,
            "corredores": bool,
            "paraderos": bool,
            "alertas": bool
        }
    """
    try:
        mapa = _get_mapa(db)
        return mapa.obtener_capas_activas()
    except Exception as e:
        return {
            "error": str(e),
            "rutas": True,
            "corredores": True,
            "paraderos": True,
            "alertas": True
        }


@router.post("/capas/{capa_id}/activar", response_model=Dict[str, Any])
def activar_capa(capa_id: str, db: Session = Depends(get_db)):
    """
    🔓 Activa una capa específica del mapa.
    
    Args:
        capa_id: Nombre de la capa a activar (rutas, corredores, paraderos, alertas)
    
    Returns:
        {
            "status": "success" | "error",
            "capa": str,
            "activa": bool,
            "mensaje": str
        }
    """
    try:
        capas_validas = ["rutas", "corredores", "paraderos", "alertas"]
        
        if capa_id not in capas_validas:
            return {
                "status": "error",
                "capa": capa_id,
                "activa": False,
                "mensaje": f"Capa inválida. Válidas: {', '.join(capas_validas)}"
            }
        
        mapa = _get_mapa(db)
        mapa.activar_capa(capa_id)
        capas_actuales = mapa.obtener_capas_activas()
        
        return {
            "status": "success",
            "capa": capa_id,
            "activa": capas_actuales[capa_id],
            "mensaje": f"Capa '{capa_id}' activada correctamente"
        }
    except Exception as e:
        return {
            "status": "error",
            "capa": capa_id,
            "activa": False,
            "mensaje": f"Error al activar capa: {str(e)}"
        }


@router.post("/capas/{capa_id}/desactivar", response_model=Dict[str, Any])
def desactivar_capa(capa_id: str, db: Session = Depends(get_db)):
    """
    🔒 Desactiva una capa específica del mapa.
    
    Args:
        capa_id: Nombre de la capa a desactivar (rutas, corredores, paraderos, alertas)
    
    Returns:
        {
            "status": "success" | "error",
            "capa": str,
            "activa": bool,
            "mensaje": str
        }
    """
    try:
        capas_validas = ["rutas", "corredores", "paraderos", "alertas"]
        
        if capa_id not in capas_validas:
            return {
                "status": "error",
                "capa": capa_id,
                "activa": True,
                "mensaje": f"Capa inválida. Válidas: {', '.join(capas_validas)}"
            }
        
        mapa = _get_mapa(db)
        mapa.desactivar_capa(capa_id)
        capas_actuales = mapa.obtener_capas_activas()
        
        return {
            "status": "success",
            "capa": capa_id,
            "activa": capas_actuales[capa_id],
            "mensaje": f"Capa '{capa_id}' desactivada correctamente"
        }
    except Exception as e:
        return {
            "status": "error",
            "capa": capa_id,
            "activa": True,
            "mensaje": f"Error al desactivar capa: {str(e)}"
        }
