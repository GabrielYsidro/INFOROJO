# Este archivo contiene el análisis de pruebas y las pruebas unitarias
# para la función crear_reporte_desvio del backend.

import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy.exc import SQLAlchemyError

# Importar el servicio que vamos a probar
from services.DiagramaClases.reporte_service import ReporteService

# --- Payload base para las pruebas de desvío ---
# Un payload válido y completo que se puede modificar en cada prueba.
BASE_DEVIATION_PAYLOAD = {
    "id_reporte": "dev-uuid-123",
    "conductor_id": 1,
    "ruta_id": 101,
    "paradero_afectado_id": 201,
    "paradero_alterna_id": 205,
    "descripcion": "Desvío por obras en Av. Principal",
    "id_tipo_reporte": 3, # Tipo de reporte para desvío
}

# --- Fixture para inicializar el servicio de ReporteService con mocks ---
@pytest.fixture
def mocked_deviation_report_service():
    with patch('services.DiagramaClases.reporte_service.Paradero_Service') as MockParaderoService, \
         patch('services.DiagramaClases.reporte_service.CreadorReportes') as MockCreadorReportes, \
         patch('services.DiagramaClases.reporte_service.SessionLocal') as MockSessionLocal_class, \
         patch('services.DiagramaClases.reporte_service.get_firebase_admin') as mock_get_firebase:

        # Configurar mocks de dependencias
        mock_paradero_service_instance = MockParaderoService.return_value
        mock_creador_reportes_instance = MockCreadorReportes.return_value
        
        # Simular el objeto de reporte que la factory crearía
        mock_reporte_obj = MagicMock()
        mock_reporte_obj.id_reporte = BASE_DEVIATION_PAYLOAD["id_reporte"]
        mock_reporte_obj.conductor_id = BASE_DEVIATION_PAYLOAD["conductor_id"]
        mock_reporte_obj.ruta_id = BASE_DEVIATION_PAYLOAD["ruta_id"]
        mock_reporte_obj.paradero_afectado_id = BASE_DEVIATION_PAYLOAD["paradero_afectado_id"]
        mock_reporte_obj.paradero_alterna_id = BASE_DEVIATION_PAYLOAD["paradero_alterna_id"]
        mock_reporte_obj.descripcion = BASE_DEVIATION_PAYLOAD["descripcion"]
        mock_reporte_obj.generar_mensaje.return_value = "Desvío en ruta 101..." # Mensaje de notificación
        mock_creador_reportes_instance.crear.return_value = mock_reporte_obj
        
        # Mockear la instancia de SessionLocal para la parte de notificaciones
        mock_db_session_instance = MagicMock()
        MockSessionLocal_class.return_value = mock_db_session_instance 
        
        # Mockear la cadena .query().filter().all() para los reguladores
        mock_regulador = MagicMock()
        mock_regulador.fcm_token = "token-regulador-1"
        mock_db_session_instance.query.return_value.filter.return_value.all.return_value = [mock_regulador]
        
        # Crear la instancia del servicio a probar
        service = ReporteService(engine=MagicMock(), paradero_service=mock_paradero_service_instance)
        
        # Mockear métodos internos del propio servicio
        service.find_report_by_id_reporte = MagicMock(return_value=None)
        service.save_report = MagicMock(return_value={"id": 1, **BASE_DEVIATION_PAYLOAD})
        
        yield service, {
            "paradero_service": mock_paradero_service_instance,
            "creador_reportes": mock_creador_reportes_instance,
            "session_local_class": MockSessionLocal_class,
            "db_session_instance": mock_db_session_instance,
            "get_firebase": mock_get_firebase
        }

# ==============================================================================
# PRUEBAS UNITARIAS PARA `crear_reporte_desvio`
# ==============================================================================

def test_crear_reporte_desvio_happy_path(mocked_deviation_report_service):
    """
    Prueba 1: "Camino Feliz" - Reporte de desvío creado y notificación enviada
    correctamente a reguladores.
    """
    service, mocks = mocked_deviation_report_service
    
    # Configurar mocks para este escenario
    mocks["paradero_service"].get_paradero_by_id.return_value = {"id": 201, "nombre": "Paradero A"}
    mock_firebase_instance = mocks["get_firebase"].return_value
    
    # Ejecutar la función
    result = service.crear_reporte_desvio(BASE_DEVIATION_PAYLOAD)
    
    # Afirmaciones
    service.save_report.assert_called_once()
    mock_firebase_instance.send_to_topic.assert_called_once_with(
        topic="reguladores_alerts",
        title="Alerta de Desvío",
        body=service.reporte_factory.crear.return_value.generar_mensaje.return_value
    )
    assert result["id_reporte"] == BASE_DEVIATION_PAYLOAD["id_reporte"]
    # Removido: assert "mensaje" in result, porque la función devuelve el objeto 'saved' de la BD.


def test_crear_reporte_desvio_paradero_invalido(mocked_deviation_report_service):
    """
    Prueba 2: Verifica que se lanza un `ValueError` si el paradero afectado no existe.
    """
    service, mocks = mocked_deviation_report_service
    
    # Configurar mocks: el servicio de paradero no encuentra el paradero
    mocks["paradero_service"].get_paradero_by_id.return_value = None
    
    # Verificar que se lanza la excepción esperada
    with pytest.raises(ValueError, match="Paradero afectado no encontrado"):
        service.crear_reporte_desvio(BASE_DEVIATION_PAYLOAD)
    
    # Afirmaciones
    service.save_report.assert_not_called()
    mocks["get_firebase"].return_value.send_to_topic.assert_not_called()


def test_crear_reporte_desvio_reporte_duplicado(mocked_deviation_report_service):
    """
    Prueba 3: Idempotencia - Si el reporte ya existe, devuelve el existente
    sin crear uno nuevo ni enviar notificación.
    """
    service, mocks = mocked_deviation_report_service
    
    # Configurar mocks: paradero es válido, pero el reporte ya existe
    mocks["paradero_service"].get_paradero_by_id.return_value = {"id": 201, "nombre": "Paradero A"}
    service.find_report_by_id_reporte.return_value = {"id": 99, **BASE_DEVIATION_PAYLOAD}
    
    # Ejecutar la función
    result = service.crear_reporte_desvio(BASE_DEVIATION_PAYLOAD)
    
    # Afirmaciones
    service.find_report_by_id_reporte.assert_called_once_with(BASE_DEVIATION_PAYLOAD["id_reporte"])
    service.save_report.assert_not_called() # No debe guardar de nuevo
    mocks["get_firebase"].return_value.send_to_topic.assert_not_called() # No debe enviar notificación
    assert result["id"] == 99 # Debe devolver el reporte existente


def test_crear_reporte_desvio_notificacion_falla_no_crashea_app(mocked_deviation_report_service):
    """
    Prueba 4: Verifica que si el envío de la notificación falla, el reporte
    aún se crea exitosamente.
    """
    service, mocks = mocked_deviation_report_service
    
    # Configurar mocks: todo válido, pero Firebase lanza una excepción al enviar
    mocks["paradero_service"].get_paradero_by_id.return_value = {"id": 201, "nombre": "Paradero A"}
    mocks["get_firebase"].return_value.send_to_topic.side_effect = Exception("Firebase is down")
    
    # Ejecutar la función (no debe lanzar una excepción, solo loguear el error)
    result = service.crear_reporte_desvio(BASE_DEVIATION_PAYLOAD)
    
    # Afirmaciones
    service.save_report.assert_called_once()
    mocks["get_firebase"].return_value.send_to_topic.assert_called_once()
    assert result["id_reporte"] == BASE_DEVIATION_PAYLOAD["id_reporte"] # La función debe completar y devolver el reporte


def test_crear_reporte_desvio_falla_en_db(mocked_deviation_report_service):
    """
    Prueba 5: Verifica que si `save_report` falla, se propaga la excepción
    y no se intenta enviar notificación.
    """
    service, mocks = mocked_deviation_report_service
    
    # Configurar mocks: paradero válido, pero save_report falla
    mocks["paradero_service"].get_paradero_by_id.return_value = {"id": 201, "nombre": "Paradero A"}
    service.save_report.side_effect = SQLAlchemyError("DB write failed")
    
    # Verificar que se lanza la excepción esperada
    with pytest.raises(SQLAlchemyError, match="DB write failed"):
        service.crear_reporte_desvio(BASE_DEVIATION_PAYLOAD)
    
    # Afirmaciones
    service.save_report.assert_called_once()
    mocks["get_firebase"].return_value.send_to_topic.assert_not_called() # No debe enviar notificación
