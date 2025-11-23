import pytest
from fastapi.testclient import TestClient

# importar app para probar endpoints reales con TestClient
from main import app


from services.DiagramaClases.eta_service import EtaService


# --- Stubs simples usados en todos los tests ---

class _DQ:
    """Stub minimal para simular query() de SQLAlchemy."""
    def __init__(self, result=None):
        self._result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self._result

    def all(self):
        return self._result if isinstance(self._result, list) else []


class DummyDB:
    """BD ficticia para controlar los resultados de query()."""
    def __init__(self, paradero=None, corredores=None):
        self.paradero = paradero
        self.corredores = corredores or []

    def query(self, model):
        name = getattr(model, '__name__', '')
        if name == "Paradero":
            return _DQ(self.paradero)
        if name == "Corredor":
            return _DQ(self.corredores)
        return _DQ(None)


# ------------------------
#        4 tests
# ------------------------

def test_eta_paradero_inexistente_devuelve_none():
    """TC1: Si el paradero no existe → None."""
    db = DummyDB(paradero=None)
    eta = EtaService(db)
    assert eta.get_best_eta_for_paradero(100) is None


def test_eta_paradero_sin_coordenadas_devuelve_none():
    """TC2: Si el paradero está pero sin coordenadas → None."""
    class P:
        coordenada_lat = None
        coordenada_lng = None

    db = DummyDB(paradero=P())
    eta = EtaService(db)
    assert eta.get_best_eta_for_paradero(1) is None


def test_haversine_distancia_basica():
    """TC3: Verifica distancia conocida entre (0,0) y (0,1)."""
    eta = EtaService(DummyDB())
    distancia = eta._haversine_km(0.0, 0.0, 0.0, 1.0)
    assert pytest.approx(111.19, rel=1e-2) == distancia


def test_eta_single_corredor_ok():
    """TC4: Un corredor → cálculo básico de ETA."""
    class P:
        id_paradero = 10
        coordenada_lat = 0.0
        coordenada_lng = 0.0

    class C:
        id_corredor = 77
        ubicacion_lat = 0.0
        ubicacion_lng = 0.1  # ≈ 11 km
        # velocidad_kmh no definida → usa default

    db = DummyDB(paradero=P(), corredores=[C()])
    eta = EtaService(db, default_speed_kmh=30.0)

    res = eta.get_best_eta_for_paradero(10)

    assert isinstance(res, dict)
    assert res["paradero_id"] == 10
    assert res["corredor_id"] == 77
    assert isinstance(res["eta_minutos"], int)
    assert isinstance(res["distancia_km"], float)
