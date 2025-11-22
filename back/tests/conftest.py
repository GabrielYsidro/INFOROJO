"""
conftest.py - Configuración compartida y fixtures para todos los tests
"""
import pytest
import sys
from pathlib import Path

# Agregar la carpeta back al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent.parent))

from unittest.mock import Mock, MagicMock
from sqlalchemy.orm import Session


@pytest.fixture
def mock_db():
    """Fixture que proporciona una sesión de BD mockeada"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture
def mock_usuario():
    """Fixture que proporciona un usuario mockeado"""
    from models.UsuarioBase import UsuarioBase
    
    usuario = UsuarioBase(
        id_usuario=1,
        nombre="Juan Test",
        dni="12345678",
        ubicacion_actual_lat=-12.0460,
        ubicacion_actual_lng=-77.0428,
        correo="juan@test.com",
        placa_unidad="ABC123",
        cod_empleado="EMP001",
        id_tipo_usuario=1,
        fcm_token="test_token_123"
    )
    return usuario


@pytest.fixture
def mock_corredor():
    """Fixture que proporciona un corredor mockeado"""
    corredor = Mock()
    corredor.id_corredor = 1
    corredor.nombre = "Corredor Test"
    corredor.telefono = "555-1234"
    return corredor


@pytest.fixture
def mock_paradero():
    """Fixture que proporciona un paradero mockeado"""
    paradero = Mock()
    paradero.id_paradero = 1
    paradero.nombre = "Paradero Central"
    paradero.latitud = -12.0460
    paradero.longitud = -77.0428
    return paradero


@pytest.fixture
def mock_ruta():
    """Fixture que proporciona una ruta mockeada"""
    ruta = Mock()
    ruta.id_ruta = 1
    ruta.nombre_ruta = "Ruta A"
    ruta.id_corredor = 1
    return ruta


@pytest.fixture(autouse=True)
def reset_mocks(mock_db):
    """Reset de mocks después de cada test"""
    yield
    mock_db.reset_mock()
