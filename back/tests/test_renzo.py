import pytest
from fastapi.testclient import TestClient

# importar app para probar endpoints reales con TestClient
from main import app

from services.DiagramaClases.reporte_service import ReporteService
from services.DiagramaClases.eta_service import EtaService


# Cliente de pruebas para llamar a los endpoints de la app
client = TestClient(app)


def test_crear_reporte_falla_sin_conductor_raises():
	"""Test: crear_reporte_falla debe lanzar ValueError cuando falta conductor.

	Verifica que la función valide la presencia de `id_emisor` o `conductor_id` y
	produzca un error legible si no existe.
	"""
	svc = ReporteService(engine=object())
	with pytest.raises(ValueError) as exc:
		svc.crear_reporte_falla({})
	assert "No se recibió conductor" in str(exc.value)


class _DQ:
	"""Stub minimal para simular el resultado de una consulta SQLAlchemy.

	Implementa `filter(...).first()` y `filter(...).all()` necesarios por los
	tests del servicio `EtaService` sin depender de la base de datos real.
	"""
	def __init__(self, result=None):
		self._result = result

	def filter(self, *args, **kwargs):
		return self

	def first(self):
		return self._result

	def all(self):
		# si el resultado es una lista la devolvemos tal cual
		return self._result if isinstance(self._result, list) else []


class DummyDB:
	"""Stub ligero de DB usado por `EtaService` en los tests.

	Método `query(model)` devuelve `_DQ` con datos predefinidos para Paradero
	o Corredor, permitiendo comprobar la lógica de cálculo de ETA sin BD.
	"""
	def __init__(self, paradero=None, corredores=None):
		self._paradero = paradero
		self._corredores = corredores or []

	def query(self, model):
		name = getattr(model, '__name__', str(model))
		if name == 'Paradero':
			return _DQ(self._paradero)
		if name == 'Corredor':
			return _DQ(self._corredores)
		return _DQ(None)


def test_eta_paradero_no_existe_devuelve_none():
	"""Si el paradero no existe, `get_best_eta_for_paradero` devuelve None."""
	db = DummyDB(paradero=None, corredores=[])
	eta = EtaService(db)
	assert eta.get_best_eta_for_paradero(9999) is None


def test_eta_paradero_sin_coordenadas_devuelve_none():
	"""Si el paradero existe pero no tiene coordenadas, devuelve None."""
	class P:
		id_paradero = 1
		coordenada_lat = None
		coordenada_lng = None

	db = DummyDB(paradero=P(), corredores=[])
	eta = EtaService(db)
	assert eta.get_best_eta_for_paradero(1) is None


def test__haversine_km_distance_approx():
	"""Verifica la función interna _haversine_km con una distancia conocida.

	Aproximamos la distancia entre (0,0) y (0,1) grados de longitud (~111.19 km).
	"""
	db = DummyDB()
	eta = EtaService(db)
	d = eta._haversine_km(0.0, 0.0, 0.0, 1.0)
	assert pytest.approx(111.19, rel=1e-2) == d


def test_get_best_eta_for_paradero_single_corredor_returns_entry():
	"""Caso básico: hay un solo corredor y se devuelve el ETA calculado.

	Comprueba que la salida contiene `paradero_id`, `corredor_id`, `eta_minutos`
	y `distancia_km` con tipos esperados.
	"""
	class P:
		id_paradero = 7
		coordenada_lat = 0.0
		coordenada_lng = 0.0

	class C:
		id_corredor = 42
		ubicacion_lat = 0.0
		ubicacion_lng = 0.1
		# velocidad_kmh no definida -> usar default 25.0

	db = DummyDB(paradero=P(), corredores=[C()])
	eta = EtaService(db, default_speed_kmh=25.0)

	res = eta.get_best_eta_for_paradero(7)
	assert isinstance(res, dict)
	assert res["paradero_id"] == 7
	assert res["corredor_id"] == 42
	assert "eta_minutos" in res and isinstance(res["eta_minutos"], int)
	assert "distancia_km" in res and isinstance(res["distancia_km"], float)


# ============================================================
#   🔵 PRUEBAS AL ENDPOINT REAL /reports/retraso
# ============================================================


def test_reporte_retraso_exitoso():
	"""Test de integración: POST /reports/retraso con payload correcto.

	Verifica que el endpoint responda 200 y el reporte creado tenga campos
	esperados (id_emisor, id_tipo_reporte, id_ruta_afectada, tiempo_retraso_min).
	"""
	payload = {
		"conductor_id": 2,
		"ruta_id": 1,
		"paradero_inicial_id": 2,
		"paradero_final_id": 3,
		"tiempo_retraso_min": 5,
		"descripcion": "Tráfico en Javier Prado. Motivo: Policia"
	}

	response = client.post("/reports/retraso", json=payload)
	assert response.status_code == 200
    
	data = response.json()
	assert data.get("ok") is True
	assert data["reporte"]["id_emisor"] == 2
	assert data["reporte"]["id_tipo_reporte"] == 2
	assert data["reporte"]["id_ruta_afectada"] == 1
	assert data["reporte"]["tiempo_retraso_min"] == 5


def test_reporte_retraso_falta_ruta_id():
	"""POST /reports/retraso debe devolver 400 cuando falta `ruta_id`."""
	payload = {
		"conductor_id": 2,
		"paradero_inicial_id": 2,
		"paradero_final_id": 3,
		"tiempo_retraso_min": 10,
		"descripcion": "Prueba"
	}

	r = client.post("/reports/retraso", json=payload)
	assert r.status_code == 400
	assert "ruta_id" in r.json()["detail"]


def test_reporte_retraso_falta_tiempo():
	"""POST /reports/retraso debe devolver 400 cuando falta `tiempo_retraso_min`."""
	payload = {
		"conductor_id": 2,
		"ruta_id": 1,
		"paradero_inicial_id": 2,
		"paradero_final_id": 3,
		"descripcion": "Prueba"
	}

	r = client.post("/reports/retraso", json=payload)
	assert r.status_code == 400
	assert "tiempo_retraso_min" in r.json()["detail"]


def test_reporte_retraso_no_numerico():
	"""POST /reports/retraso debe devolver 400 si un campo obligatorio no es numérico."""
	payload = {
		"conductor_id": 2,
		"ruta_id": "hola",
		"paradero_inicial_id": 2,
		"paradero_final_id": 3,
		"tiempo_retraso_min": 5,
		"descripcion": "Prueba"
	}

	r = client.post("/reports/retraso", json=payload)
	assert r.status_code == 400
	assert "numérico" in r.json()["detail"]
