import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

# ----------------------------
# IMPORTACIÓN CORRECTA
# ----------------------------
# Tu main.py está en: back/main.py
# Tu app = FastAPI() está definida ahí
from main import app

client = TestClient(app)


# ============================================================
#   🔵 1. PRUEBAS UNITARIAS DEL MÉTODO parse_required_int
# ============================================================

def parse_required_int(payload, key: str) -> int:
    """
    Versión idéntica al método dentro del endpoint crear_reporte_retraso.
    """
    if key not in payload or payload[key] is None:
        raise HTTPException(status_code=400, detail=f"Falta campo requerido: {key}")

    try:
        return int(payload[key])
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail=f"Campo {key} debe ser numérico")


def test_parse_required_int_valido():
    """Debe convertir correctamente un valor válido a entero."""
    payload = {"tiempo_retraso_min": "10"}
    assert parse_required_int(payload, "tiempo_retraso_min") == 10


def test_parse_required_int_falta_campo():
    """Debe fallar si el campo no existe."""
    payload = {}
    with pytest.raises(HTTPException) as exc:
        parse_required_int(payload, "ruta_id")
    assert exc.value.status_code == 400
    assert "Falta campo requerido" in exc.value.detail


def test_parse_required_int_es_none():
    """Debe fallar si el campo es None."""
    payload = {"paradero_inicial_id": None}
    with pytest.raises(HTTPException) as exc:
        parse_required_int(payload, "paradero_inicial_id")
    assert exc.value.status_code == 400
    assert "Falta campo requerido" in exc.value.detail


def test_parse_required_int_no_numerico():
    """Debe fallar si el valor no es numérico."""
    payload = {"paradero_inicial_id": "no-num"}
    with pytest.raises(HTTPException) as exc:
        parse_required_int(payload, "paradero_inicial_id")
    assert exc.value.status_code == 400
    assert "debe ser numérico" in exc.value.detail


# ============================================================
#   🔵 2. PRUEBAS AL ENDPOINT REAL /reports/retraso
# ============================================================

def test_reporte_retraso_exitoso():
    """Caso exitoso basado en tu formulario."""
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
    assert data["ok"] is True
    assert data["reporte"]["id_emisor"] == 2
    assert data["reporte"]["id_tipo_reporte"] == 2
    assert data["reporte"]["id_ruta_afectada"] == 1
    assert data["reporte"]["tiempo_retraso_min"] == 5


def test_reporte_retraso_falta_ruta_id():
    """Debe fallar si falta ruta_id."""
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
    """Debe fallar si falta tiempo_retraso_min."""
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
    """Debe fallar si un campo obligatorio no es numérico."""
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
