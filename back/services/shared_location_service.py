"""
Servicio de compartición de ubicación - Almacenamiento en memoria
Tokens expiran en 3 horas
"""

from datetime import datetime, timedelta
import secrets
from typing import Optional, Dict

# Caché en memoria: {token -> {usuario_id, expires_at}}
_shared_locations = {}


def generar_token_comparticion(usuario_id: int) -> Dict[str, str]:
    """
    Genera un token único para compartir ubicación (expira en 3h)
    
    Returns:
        {
            "token": "abc123xyz...",
            "share_url": "https://app.com/share/abc123xyz...",
            "expires_in_hours": 3
        }
    """
    token = secrets.token_urlsafe(32)
    
    _shared_locations[token] = {
        "usuario_id": usuario_id,
        "expires_at": datetime.utcnow() + timedelta(hours=3),
        "is_active": True
    }
    
    print(f"✅ Token generado para usuario {usuario_id}: {token[:20]}...")
    
    return {
        "token": token,
        "share_url": f"https://tuapp.com/share/{token}",
        "expires_in_hours": 3
    }


def validar_token(token: str) -> Optional[int]:
    """
    Valida un token y retorna el usuario_id si es válido
    Retorna None si expiró o no existe
    """
    if token not in _shared_locations:
        print(f"⚠️ Token no encontrado: {token[:20]}...")
        return None
    
    data = _shared_locations[token]
    
    # Verificar expiración
    if datetime.utcnow() > data["expires_at"]:
        print(f"⏱️ Token expirado: {token[:20]}...")
        del _shared_locations[token]
        return None
    
    # Verificar si está activo
    if not data["is_active"]:
        print(f"🔒 Token desactivado: {token[:20]}...")
        return None
    
    print(f"✅ Token válido: {token[:20]}...")
    return data["usuario_id"]


def revocar_token(token: str) -> bool:
    """
    Revoca un token (lo desactiva)
    """
    if token in _shared_locations:
        _shared_locations[token]["is_active"] = False
        print(f"🔒 Token revocado: {token[:20]}...")
        return True
    
    print(f"⚠️ Token no encontrado para revocar: {token[:20]}...")
    return False


def obtener_token_info(token: str) -> Optional[Dict]:
    """
    Obtiene info del token (usuario_id, tiempo restante)
    """
    if token not in _shared_locations:
        return None
    
    data = _shared_locations[token]
    
    # Verificar expiración
    if datetime.utcnow() > data["expires_at"]:
        del _shared_locations[token]
        return None
    
    tiempo_restante = data["expires_at"] - datetime.utcnow()
    minutos = int(tiempo_restante.total_seconds() / 60)
    
    return {
        "usuario_id": data["usuario_id"],
        "activo": data["is_active"],
        "minutos_restantes": minutos,
        "expira_en": data["expires_at"].isoformat()
    }


def limpiar_expirados():
    """
    Limpia tokens expirados del caché (ejecutar periódicamente)
    """
    ahora = datetime.utcnow()
    tokens_a_eliminar = [
        token for token, data in _shared_locations.items()
        if ahora > data["expires_at"]
    ]
    
    for token in tokens_a_eliminar:
        del _shared_locations[token]
    
    if tokens_a_eliminar:
        print(f"🧹 Limpiados {len(tokens_a_eliminar)} tokens expirados")
    
    return len(tokens_a_eliminar)