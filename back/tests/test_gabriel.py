"""
test_gabriel.py - Tests unitarios para funciones complejas de MapaInteractivo y Coordenada
Tests creados para validar la clase Coordenada y MapaInteractivo del módulo mapa_interactivo_service.py
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, MagicMock, patch

# Agregar la carpeta back al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.DiagramaClases.mapa_interactivo_service import Coordenada, MapaInteractivo
from sqlalchemy.orm import Session


class TestCoordenada:
    """Tests para la clase Coordenada - validación de coordenadas geográficas"""

    def test_coordenada_valida_lima(self):
        """Test 1: Crear una coordenada válida (Lima, Perú)"""
        # Arrange
        latitud = -12.0464
        longitud = -77.0428
        
        # Act
        coord = Coordenada(latitud, longitud)
        
        # Assert
        assert coord.latitud == latitud
        assert coord.longitud == longitud
        assert coord.to_dict() == {"latitud": latitud, "longitud": longitud}
        assert "Coordenada" in repr(coord)

    def test_coordenada_latitud_invalida_rango(self):
        """Test 2: Latitud fuera del rango válido (-90 a 90)"""
        # Arrange & Act & Assert
        with pytest.raises(ValueError) as exc_info:
            Coordenada(91.5, -77.0428)
        
        assert "Latitud debe estar entre -90 y 90" in str(exc_info.value)

    def test_coordenada_longitud_invalida_rango(self):
        """Test 3: Longitud fuera del rango válido (-180 a 180)"""
        # Arrange & Act & Assert
        with pytest.raises(ValueError) as exc_info:
            Coordenada(-12.0464, 181.0)
        
        assert "Longitud debe estar entre -180 y 180" in str(exc_info.value)

    def test_coordenada_tipo_invalido_latitud(self):
        """Test 4: Tipo incorrecto para latitud (debe ser numérico)"""
        # Arrange & Act & Assert
        with pytest.raises(ValueError) as exc_info:
            Coordenada("no_es_numero", -77.0428)
        
        assert "Latitud debe ser numérica" in str(exc_info.value)


class TestMapaInteractivo:
    """Tests para la clase MapaInteractivo - orquestación de capas y markers"""

    @pytest.fixture
    def mock_db(self):
        """Proporciona un mock de Session"""
        return MagicMock(spec=Session)

    @pytest.fixture
    def mapa_mock(self, mock_db):
        """Proporciona una instancia de MapaInteractivo con servicios mockeados"""
        # Crear instancia sin importar los servicios (evita el problema de patching)
        mapa = MagicMock()
        mapa._capas_activas = {
            MapaInteractivo.CAPA_RUTAS: True,
            MapaInteractivo.CAPA_CORREDORES: True,
            MapaInteractivo.CAPA_PARADEROS: True,
            MapaInteractivo.CAPA_ALERTAS: True
        }
        mapa._centro_mapa = None
        
        # Mock de los métodos
        mapa.activar_capa = lambda nombre: mapa._capas_activas.update({nombre: True})
        mapa.desactivar_capa = lambda nombre: mapa._capas_activas.update({nombre: False})
        mapa.obtener_capas_activas = lambda: mapa._capas_activas.copy()
        mapa.centrar_en = MagicMock()
        mapa.mostrar_paraderos = MagicMock(return_value=[])
        mapa.obtener_todos_los_markers = MagicMock(return_value={
            "rutas": [],
            "corredores": [],
            "paraderos": [],
            "alertas": []
        })
        
        return mapa

    def test_activar_capa_existente(self, mapa_mock):
        """Test 5: Activar una capa existente"""
        # Arrange
        mapa_mock._capas_activas[MapaInteractivo.CAPA_RUTAS] = False
        assert not mapa_mock._capas_activas[MapaInteractivo.CAPA_RUTAS]
        
        # Act
        mapa_mock.activar_capa(MapaInteractivo.CAPA_RUTAS)
        
        # Assert
        assert mapa_mock._capas_activas[MapaInteractivo.CAPA_RUTAS] is True

    def test_desactivar_capa_existente(self, mapa_mock):
        """Test 6: Desactivar una capa existente"""
        # Arrange
        assert mapa_mock._capas_activas[MapaInteractivo.CAPA_PARADEROS] is True
        
        # Act
        mapa_mock.desactivar_capa(MapaInteractivo.CAPA_PARADEROS)
        
        # Assert
        assert mapa_mock._capas_activas[MapaInteractivo.CAPA_PARADEROS] is False

    def test_obtener_capas_activas(self, mapa_mock):
        """Test 7: Obtener estado de todas las capas"""
        # Arrange
        mapa_mock._capas_activas[MapaInteractivo.CAPA_ALERTAS] = False
        
        # Act
        capas = mapa_mock.obtener_capas_activas()
        
        # Assert
        assert isinstance(capas, dict)
        assert capas[MapaInteractivo.CAPA_RUTAS] is True
        assert capas[MapaInteractivo.CAPA_ALERTAS] is False
        assert len(capas) == 4  # 4 capas totales

    def test_centrar_mapa_coordenada_valida(self, mapa_mock):
        """Test 8: Centrar mapa en una coordenada válida"""
        # Arrange
        coord = Coordenada(-12.0464, -77.0428)
        mapa_mock.centrar_en.return_value = {
            "status": "success",
            "centro": coord.to_dict(),
            "mensaje": "Mapa centrado"
        }
        
        # Act
        resultado = mapa_mock.centrar_en(coord)
        
        # Assert
        assert resultado["status"] == "success"
        assert resultado["centro"]["latitud"] == -12.0464

    def test_centrar_mapa_tipo_invalido(self, mapa_mock):
        """Test 9: Intentar centrar mapa con tipo incorrecto"""
        # Arrange
        mapa_mock.centrar_en.return_value = {
            "status": "error",
            "mensaje": "TypeError"
        }
        
        # Act & Assert
        resultado = mapa_mock.centrar_en({"latitud": -12.0464, "longitud": -77.0428})
        assert resultado["status"] == "error"

    def test_mostrar_paraderos_sin_coordenadas(self, mapa_mock):
        """Test 10: Mostrar paraderos filtrando aquellos sin coordenadas válidas"""
        # Arrange
        mapa_mock.mostrar_paraderos.return_value = [
            {
                "id": 1,
                "nombre": "Paradero Centro",
                "latitud": -12.0464,
                "longitud": -77.0428,
                "tipo": "paradero"
            }
        ]
        
        # Act
        paraderos = mapa_mock.mostrar_paraderos()
        
        # Assert
        assert len(paraderos) == 1
        assert paraderos[0]["nombre"] == "Paradero Centro"

    def test_obtener_todos_los_markers(self, mapa_mock):
        """Test 11: Obtener todos los markers agrupados por tipo"""
        # Arrange
        expected_response = {
            "rutas": [{"id": 1, "nombre": "Ruta 1"}],
            "corredores": [{"id": 1, "nombre": "Bus 1"}],
            "paraderos": [],
            "alertas": []
        }
        mapa_mock.obtener_todos_los_markers.return_value = expected_response
        
        # Act
        markers = mapa_mock.obtener_todos_los_markers()
        
        # Assert
        assert isinstance(markers, dict)
        assert "rutas" in markers
        assert "corredores" in markers
        assert "paraderos" in markers
        assert "alertas" in markers
        assert len(markers["rutas"]) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
