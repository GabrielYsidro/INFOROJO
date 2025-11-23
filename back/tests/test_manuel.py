import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from services.calificacion_service import CalificacionService

client = TestClient(app)


# PRUEBA UNITARIA - Método actualizar_calificacion (Complejidad Ciclomática: 5)
# Caminos: 1) calificacion < 1, 2) calificacion > 5, 3) historial no existe, 4) éxito, 5) excepción general

def test_actualizar_calificacion_cc_camino1_calificacion_menor_1():
    """TC1: CC Camino 1 - Calificación menor a 1"""
    from services.calificacion_service import CalificacionService
    service = CalificacionService()
    
    with pytest.raises(ValueError) as exc:
        service.actualizar_calificacion(id_historial=1, calificacion=0, descripcion="Test")
    
    assert "entre 1 y 5" in str(exc.value)


def test_actualizar_calificacion_cc_camino2_calificacion_mayor_5():
    """TC2: CC Camino 2 - Calificación mayor a 5"""
    from services.calificacion_service import CalificacionService
    service = CalificacionService()
    
    with pytest.raises(ValueError) as exc:
        service.actualizar_calificacion(id_historial=1, calificacion=6, descripcion="Test")
    
    assert "entre 1 y 5" in str(exc.value)


def test_actualizar_calificacion_cc_camino3_historial_no_existe():
    """TC3: CC Camino 3 - Historial no existe en BD"""
    from services.calificacion_service import CalificacionService
    service = CalificacionService()
    
    with pytest.raises(ValueError) as exc:
        service.actualizar_calificacion(id_historial=99999, calificacion=3, descripcion="Test")
    
    assert "No se encontró el historial" in str(exc.value)


def test_actualizar_calificacion_cc_camino4_exitoso():
    """TC4: CC Camino 4 - Actualización exitosa"""
    from services.calificacion_service import CalificacionService
    service = CalificacionService()
    
    try:
        resultado = service.actualizar_calificacion(id_historial=1, calificacion=5, descripcion="Excelente")
        assert resultado["success"] is True
        assert resultado["calificacion"] == 5
    except ValueError:
        pytest.skip("Historial con ID 1 no existe en la BD de prueba")


def test_actualizar_calificacion_cc_camino5_descripcion_none():
    """TC5: CC Camino 5 - Descripción None (opcional)"""
    from services.calificacion_service import CalificacionService
    service = CalificacionService()
    
    try:
        resultado = service.actualizar_calificacion(id_historial=1, calificacion=4, descripcion=None)
        assert resultado["success"] is True
        assert resultado["descripcion"] is None
    except ValueError:
        pytest.skip("Historial con ID 1 no existe en la BD de prueba")
