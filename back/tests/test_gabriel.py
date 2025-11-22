"""
Tests Unitarios para shared_location_service.py - Versión Minimalista
Solo 4 tests esenciales para validar_token()
"""

import pytest
from datetime import datetime, timedelta
import sys
import os

# Agregar el directorio back al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.shared_location_service import (
    generar_token_comparticion,
    validar_token,
    _shared_locations
)


@pytest.fixture(autouse=True)
def limpiar_tokens():
    """Limpia los tokens antes y después de cada test"""
    _shared_locations.clear()
    yield
    _shared_locations.clear()


def test_validar_token_valido():
    """✅ TC1: Validar token existente y vigente"""
    token_data = generar_token_comparticion(usuario_id=42)
    token = token_data["token"]
    
    resultado = validar_token(token)
    assert resultado == 42


def test_validar_token_inexistente():
    """❌ TC2: Validar token que NO existe"""
    resultado = validar_token("token_inventado_xyz123")
    assert resultado is None


def test_validar_token_expirado():
    """❌ TC3: Validar token expirado"""
    token_data = generar_token_comparticion(usuario_id=10)
    token = token_data["token"]
    
    _shared_locations[token]["expires_at"] = datetime.utcnow() - timedelta(hours=1)
    
    resultado = validar_token(token)
    assert resultado is None


def test_validar_token_desactivado():
    """❌ TC4: Validar token desactivado"""
    token_data = generar_token_comparticion(usuario_id=20)
    token = token_data["token"]
    
    _shared_locations[token]["is_active"] = False
    
    resultado = validar_token(token)
    assert resultado is None
