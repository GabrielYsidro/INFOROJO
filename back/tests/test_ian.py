import pytest
from unittest.mock import MagicMock
from datetime import datetime
from services.usuario_service import UsuarioService
from models.HistorialUso import HistorialUso

# --- Fixtures: Configuración para simular la Base de Datos ---

@pytest.fixture
def mock_db():
    """Simula la sesión de base de datos"""
    return MagicMock()

@pytest.fixture
def usuario_service(mock_db):
    """Crea el servicio usando la base de datos simulada"""
    return UsuarioService(mock_db)

@pytest.fixture
def mock_historial():
    """Crea un objeto HistorialUso de prueba"""
    historial = HistorialUso()
    historial.id_historial = 100
    historial.id_usuario = 1
    historial.fecha_hora_subida = None
    historial.fecha_hora_bajada = None
    return historial

# --- Tus Casos de Prueba (Caja Negra) ---

def test_cp01_actualizar_tiempos_exito(usuario_service, mock_db, mock_historial):
    """
    CP-01: Caso Feliz - Actualización correcta de ambas fechas.
    """
    # Configurar el Mock para que encuentre el historial
    mock_db.query.return_value.filter.return_value.first.return_value = mock_historial

    # Ejecutar la función
    resultado = usuario_service.actualizar_tiempos_viaje(
        user_id=1,
        historial_id=100,
        fecha_subida="2025-11-16T08:00:00",
        fecha_bajada="2025-11-16T08:30:00"
    )

    # Validar resultados
    assert resultado["message"] == "Tiempos actualizados correctamente"
    assert mock_historial.fecha_hora_subida == datetime(2025, 11, 16, 8, 0, 0)
    assert mock_historial.fecha_hora_bajada == datetime(2025, 11, 16, 8, 30, 0)
    mock_db.commit.assert_called_once()

def test_cp03_solo_fecha_bajada(usuario_service, mock_db, mock_historial):
    """
    CP-03: Actualización parcial (Solo bajada).
    """
    mock_db.query.return_value.filter.return_value.first.return_value = mock_historial

    # Enviar subida como None
    usuario_service.actualizar_tiempos_viaje(
        user_id=1,
        historial_id=100,
        fecha_subida=None,
        fecha_bajada="2025-11-16T09:00:00"
    )

    assert mock_historial.fecha_hora_subida is None  # No debe cambiar
    assert mock_historial.fecha_hora_bajada == datetime(2025, 11, 16, 9, 0, 0)
    mock_db.commit.assert_called_once()

def test_cp04_historial_no_encontrado(usuario_service, mock_db):
    """
    CP-04: Historial no existe.
    """
    # Configurar Mock para devolver None (no encontró nada)
    mock_db.query.return_value.filter.return_value.first.return_value = None

    resultado = usuario_service.actualizar_tiempos_viaje(1, 9999, "2025-11-16T08:00:00")

    assert resultado["error"] == "Historial no encontrado"
    mock_db.commit.assert_not_called()

def test_cp06_fecha_invalida(usuario_service, mock_db, mock_historial):
    """
    CP-06: Validación de formato de fecha.
    """
    mock_db.query.return_value.filter.return_value.first.return_value = mock_historial

    resultado = usuario_service.actualizar_tiempos_viaje(
        user_id=1, 
        historial_id=100, 
        fecha_subida="FECHA_MALA"
    )

    assert resultado["error"] == "Formato de fecha de subida inválido"
    mock_db.commit.assert_not_called()