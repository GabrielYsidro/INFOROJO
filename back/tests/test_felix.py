# Este archivo contiene el análisis de pruebas y las pruebas unitarias
# para la funcionalidad de alertas masivas del backend.

import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy.exc import SQLAlchemyError

# Importar el servicio que vamos a probar
from services.alerta_masiva_service import AlertaMasivaService

# --- Payload base para las pruebas ---
# Un payload válido y completo que se puede modificar en cada prueba.
BASE_PAYLOAD = {
    "descripcion": "Tráfico denso en la Av. Principal",
    "id_emisor": 1,
    "id_corredor_afectado": 10,
    "es_critica": False,
    "requiere_intervencion": False,
    "id_ruta_afectada": 101,
    "id_paradero_inicial": 201,
    "id_paradero_final": 205,
    "tiempo_retraso_min": 15,
    "send_notification": False  # Por defecto, no se envían notificaciones
}

# --- Fixture para inicializar el servicio con mocks ---
@pytest.fixture
def mocked_alerta_service():
    # Usamos patch para interceptar las dependencias externas a nivel de módulo
    with patch('services.alerta_masiva_service.get_firebase_admin') as mock_get_firebase, \
         patch('services.alerta_masiva_service.Session') as MockSession:

        # Configurar el mock de la sesión de la base de datos
        mock_session_instance = MockSession.return_value.__enter__.return_value
        
        # Simular que la inserción en la BD funciona y devuelve un objeto de reporte
        mock_reporte_creado = MagicMock()
        mock_reporte_creado.id_reporte = 123
        mock_reporte_creado.fecha.isoformat.return_value = "2025-01-01T12:00:00"
        mock_reporte_creado.descripcion = BASE_PAYLOAD["descripcion"]
        mock_reporte_creado.id_emisor = BASE_PAYLOAD["id_emisor"]
        mock_reporte_creado.id_tipo_reporte = 4
        mock_reporte_creado.es_critica = False
        mock_reporte_creado.requiere_intervencion = False
        mock_session_instance.execute.return_value.scalar_one.return_value = mock_reporte_creado
        
        # Crear la instancia del servicio a probar (el engine no se usa directamente aquí)
        service = AlertaMasivaService(engine=MagicMock())
        
        yield service, {
            "get_firebase": mock_get_firebase,
            "session_class": MockSession,
            "session_instance": mock_session_instance
        }

# ==============================================================================
# PRUEBAS UNITARIAS PARA `crear_alerta_masiva`
# ==============================================================================

def test_crear_alerta_solo_guarda_sin_notificacion(mocked_alerta_service):
    """
    Prueba 1: Verifica que la alerta se guarda pero NO se envía notificación
    cuando `send_notification` es falso o no está presente.
    """
    alerta_service, mocks = mocked_alerta_service
    mock_firebase_instance = mocks["get_firebase"].return_value
    
    # Ejecutar la función con el payload base (send_notification=False)
    result = alerta_service.crear_alerta_masiva(BASE_PAYLOAD)
    
    # Afirmaciones
    mocks["session_instance"].execute.assert_called_once()
    mocks["session_instance"].commit.assert_called_once()
    mock_firebase_instance.send_to_topic.assert_not_called() # crucial: no debe llamar a firebase
    assert result["id_reporte"] == 123
    assert result["mensaje"] == "Alerta masiva creada exitosamente"

def test_crear_alerta_y_notifica_correctamente(mocked_alerta_service):
    """
    Prueba 2: Verifica que la alerta se guarda Y se envía una notificación
    cuando `send_notification` es verdadero.
    """
    alerta_service, mocks = mocked_alerta_service
    mock_firebase_instance = mocks["get_firebase"].return_value
    
    # Crear un payload específico para esta prueba
    payload_con_notificacion = {**BASE_PAYLOAD, "send_notification": True}
    
    # Ejecutar la función
    alerta_service.crear_alerta_masiva(payload_con_notificacion)
    
    # Afirmaciones
    mocks["session_instance"].commit.assert_called_once()
    # Verificar que se llamó a `send_to_topic` con los parámetros correctos
    mock_firebase_instance.send_to_topic.assert_called_once_with(
        topic="all_users",
        title="Alerta General",
        body=BASE_PAYLOAD["descripcion"]
    )

def test_crear_alerta_maneja_error_de_notificacion(mocked_alerta_service):
    """
    Prueba 3: Verifica que si la notificación falla, la función no se cae
    y aun así devuelve el reporte creado.
    """
    alerta_service, mocks = mocked_alerta_service
    mock_firebase_instance = mocks["get_firebase"].return_value
    
    # Simular un error en el envío de la notificación
    mock_firebase_instance.send_to_topic.side_effect = Exception("Firebase Error")
    
    payload_con_notificacion = {**BASE_PAYLOAD, "send_notification": True}
    
    # Ejecutar la función (no debe lanzar una excepción)
    result = alerta_service.crear_alerta_masiva(payload_con_notificacion)
    
    # Afirmaciones
    mocks["session_instance"].commit.assert_called_once()
    mock_firebase_instance.send_to_topic.assert_called_once()
    # La función debe completarse y devolver los datos del reporte a pesar del error de notificación
    assert result["id_reporte"] == 123
    assert result["mensaje"] == "Alerta masiva creada exitosamente"

def test_crear_alerta_falla_si_db_falla(mocked_alerta_service):
    """
    Prueba 4: Verifica que si la base de datos falla al guardar, se lanza
    una excepción y no se intenta enviar una notificación.
    """
    alerta_service, mocks = mocked_alerta_service
    mock_firebase_instance = mocks["get_firebase"].return_value
    
    # Simular un error en la base de datos
    mocks["session_instance"].commit.side_effect = SQLAlchemyError("DB connection lost")
    
    # Verificar que la función lanza la excepción de la base de datos
    with pytest.raises(SQLAlchemyError, match="DB connection lost"):
        alerta_service.crear_alerta_masiva(BASE_PAYLOAD)
    
    # Afirmaciones
    mock_firebase_instance.send_to_topic.assert_not_called()

def test_crear_alerta_sin_payload_de_notificacion(mocked_alerta_service):
    """
    Prueba 5: Verifica el comportamiento cuando el flag `send_notification` está ausente.
    """
    alerta_service, mocks = mocked_alerta_service
    mock_firebase_instance = mocks["get_firebase"].return_value
    
    # Usar un payload sin la clave 'send_notification'
    payload_sin_flag = {k: v for k, v in BASE_PAYLOAD.items() if k != "send_notification"}

    # Ejecutar la función
    alerta_service.crear_alerta_masiva(payload_sin_flag)
    
    # Afirmaciones
    mocks["session_instance"].commit.assert_called_once()
    mock_firebase_instance.send_to_topic.assert_not_called()
