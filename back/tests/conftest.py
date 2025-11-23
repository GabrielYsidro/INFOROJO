"""
conftest.py - Configuración compartida y fixtures para todos los tests
"""
import pytest
import sys
from pathlib import Path
import importlib

# Agregar la carpeta back al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent.parent))

from unittest.mock import Mock, MagicMock
from sqlalchemy.orm import Session
from config.db import Base # Importar Base

@pytest.fixture(autouse=True, scope='session')
def setup_models_for_tests():
    """
    Fixture que se ejecuta una vez por sesión de test.
    Importa todos los modelos y les aplica extend_existing=True
    para evitar errores de redefinición de tabla en el entorno de tests.
    """
    # Limpiar metadata para asegurar un estado limpio antes de cargar los modelos
    Base.metadata.clear()

    model_modules = [
        "TipoUsuario", "Corredor", "UsuarioBase", "Paradero", "Feedback",
        "RutaParadero", "Reporte", "HistorialUso", "TipoReporte", "Ruta",
        "ComentarioUsuarioParadero"
    ]
    
    imported_models = {}
    for module_name in model_modules:
        try:
            module = importlib.import_module(f"models.{module_name}")
            for name in dir(module):
                cls = getattr(module, name)
                if isinstance(cls, type) and issubclass(cls, Base) and hasattr(cls, '__tablename__'):
                    # Asegurarse de que __table_args__ es un diccionario mutable
                    if not hasattr(cls, '__table_args__'):
                        cls.__table_args__ = {}
                    elif not isinstance(cls.__table_args__, dict):
                        # Si es una tupla, convertir a dict y añadir extend_existing
                        cls.__table_args__ = dict(cls.__table_args__)
                    
                    cls.__table_args__["extend_existing"] = True
                    imported_models[name] = cls
        except ImportError as e:
            print(f"Warning: Could not import model module {module_name}: {e}")
    yield imported_models


@pytest.fixture
def usuario_base_model(setup_models_for_tests):
    """Proporciona la clase UsuarioBase ya configurada."""
    return setup_models_for_tests.get("UsuarioBase")


@pytest.fixture
def mock_db():
    """Fixture que proporciona una sesión de BD mockeada"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture
def mock_usuario(usuario_base_model):
    """Fixture que proporciona un usuario mockeado"""
    usuario = usuario_base_model(
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
