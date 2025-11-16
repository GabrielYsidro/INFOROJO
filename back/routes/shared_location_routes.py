"""
Rutas para compartición de ubicación en tiempo real
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from config.db import get_db
from services.shared_location_service import (
    generar_token_comparticion,
    validar_token,
    revocar_token,
    obtener_token_info
)
from services.DiagramaClases.mapa_interactivo_service import Coordenada
import time
import os

router = APIRouter(prefix="/api", tags=["Shared Location"])

# Obtener URL base desde variable de entorno
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


@router.post("/usuario/{usuario_id}/location/share")
def generar_link_comparticion(usuario_id: int, db: Session = Depends(get_db)):
    """
    🔗 Genera un link temporal para compartir ubicación (válido por 3 horas)
    
    Args:
        usuario_id: ID del usuario que quiere compartir su ubicación
    
    Returns:
        {
            "token": "abc123...",
            "share_url": "https://app.com/share/abc123...",
            "expires_in_hours": 3
        }
    """
    try:
        resultado = generar_token_comparticion(usuario_id)
        # Agregar URL base personalizada
        resultado["share_url"] = f"{BASE_URL}/api/share/{resultado['token']}"
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar link: {str(e)}")


@router.get("/api/share/{token}", response_class=HTMLResponse)
def obtener_pagina_comparticion(token: str, db: Session = Depends(get_db)):
    """
    🗺️ Página web interactiva para ver la ubicación compartida en tiempo real
    
    Args:
        token: Token de compartición
    
    Returns:
        HTML con mapa interactivo
    """
    # Validar token
    usuario_id = validar_token(token)
    
    if usuario_id is None:
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Link Expirado</title>
            <style>
                body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
                .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h1 { color: #c62828; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>❌ Link Expirado o Inválido</h1>
                <p>El link de compartición ya no es válido. Solicita uno nuevo.</p>
            </div>
        </body>
        </html>
        """
    
    # Generar HTML con mapa
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ubicación en Vivo</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
            #map {{ width: 100%; height: 100vh; }}
            .info-panel {{
                position: absolute;
                top: 20px;
                left: 20px;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                z-index: 10;
                min-width: 280px;
            }}
            .info-panel h2 {{
                margin: 0 0 10px 0;
                color: #333;
                font-size: 18px;
            }}
            .info-item {{
                margin: 8px 0;
                font-size: 14px;
                color: #666;
            }}
            .status {{
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 10px;
            }}
            .status.online {{
                background: #4caf50;
                color: white;
            }}
            .status.offline {{
                background: #f44336;
                color: white;
            }}
            .button-group {{
                margin-top: 15px;
                display: flex;
                gap: 10px;
            }}
            button {{
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: 0.3s;
            }}
            .btn-refresh {{
                background: #2196F3;
                color: white;
            }}
            .btn-refresh:hover {{ background: #1976D2; }}
            .btn-stop {{
                background: #c62828;
                color: white;
            }}
            .btn-stop:hover {{ background: #b71c1c; }}
            .loading {{
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #2196F3;
                animation: pulse 1.5s infinite;
            }}
            @keyframes pulse {{
                0%, 100% {{ opacity: 1; }}
                50% {{ opacity: 0.5; }}
            }}
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div class="info-panel">
            <h2>📍 Ubicación en Vivo</h2>
            <div class="info-item">
                <strong>Usuario:</strong> <span id="usuario-nombre">Cargando...</span>
            </div>
            <div class="info-item">
                <strong>Latitud:</strong> <span id="ubicacion-lat">--</span>
            </div>
            <div class="info-item">
                <strong>Longitud:</strong> <span id="ubicacion-lng">--</span>
            </div>
            <div class="info-item">
                <strong>Actualizado:</strong> <span id="tiempo-actualizado">--</span>
            </div>
            <div id="status" class="status offline">
                ⏳ Cargando...
            </div>
            <div class="button-group">
                <button class="btn-refresh" onclick="actualizarUbicacion()">
                    🔄 Actualizar
                </button>
                <button class="btn-stop" onclick="dejarDeSeguir()">
                    ⏹️ Cerrar
                </button>
            </div>
        </div>

        <script>
            const TOKEN = '{token}';
            let marker = null;
            let map = null;
            let autoRefresh = null;
            
            // Inicializar mapa
            function inicializarMapa() {{
                map = L.map('map').setView([-12.0464, -77.0428], 15);
                L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                    attribution: '© OpenStreetMap',
                    maxZoom: 19
                }}).addTo(map);
            }}
            
            // Actualizar ubicación
            async function actualizarUbicacion() {{
                try {{
                    const response = await fetch(`/api/location/${{TOKEN}}`);
                    
                    if (!response.ok) {{
                        mostrarError('Link expirado o inválido');
                        return;
                    }}
                    
                    const data = await response.json();
                    
                    if (!data.activo) {{
                        document.getElementById('status').className = 'status offline';
                        document.getElementById('status').textContent = '❌ Usuario no está compartiendo';
                        return;
                    }}
                    
                    // Actualizar info
                    document.getElementById('ubicacion-lat').textContent = data.latitud.toFixed(4);
                    document.getElementById('ubicacion-lng').textContent = data.longitud.toFixed(4);
                    document.getElementById('tiempo-actualizado').textContent = data.tiempo_actualizado;
                    document.getElementById('usuario-nombre').textContent = data.usuario_nombre || 'Usuario ' + data.usuario_id;
                    
                    // Actualizar mapa
                    const latlng = [data.latitud, data.longitud];
                    
                    if (marker) {{
                        marker.setLatLng(latlng);
                    }} else {{
                        marker = L.marker(latlng, {{
                            icon: L.icon({{
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            }})
                        }}).addTo(map);
                        marker.bindPopup(`<b>${{data.usuario_nombre}}</b>`).openPopup();
                    }}
                    
                    map.setView(latlng, 15);
                    
                    document.getElementById('status').className = 'status online';
                    document.getElementById('status').textContent = '✅ En línea';
                    
                }} catch (error) {{
                    console.error('Error:', error);
                    mostrarError('Error al obtener ubicación');
                }}
            }}
            
            function mostrarError(mensaje) {{
                document.getElementById('status').className = 'status offline';
                document.getElementById('status').textContent = '❌ ' + mensaje;
            }}
            
            function dejarDeSeguir() {{
                if (confirm('¿Dejar de ver esta ubicación?')) {{
                    clearInterval(autoRefresh);
                    document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial;"><div style="text-align: center;"><h1>✅ Cerrado</h1><p>Ya no recibirás actualizaciones de ubicación</p></div></div>';
                }}
            }}
            
            // Iniciar
            window.addEventListener('load', () => {{
                inicializarMapa();
                actualizarUbicacion();
                autoRefresh = setInterval(actualizarUbicacion, 5000); // Actualizar cada 5 segundos
            }});
        </script>
    </body>
    </html>
    """
    
    return html_content


@router.get("/location/{token}")
def obtener_ubicacion_compartida(token: str, db: Session = Depends(get_db)):
    """
    📍 Obtiene la ubicación actual del usuario que comparte (JSON)
    
    Args:
        token: Token de compartición
    
    Returns:
        {
            "usuario_id": 1,
            "usuario_nombre": "Gabriel",
            "latitud": -12.0464,
            "longitud": -77.0428,
            "tiempo_actualizado": "Hace 2 segundos",
            "activo": true
        }
    """
    # Validar token
    usuario_id = validar_token(token)
    
    if usuario_id is None:
        raise HTTPException(status_code=404, detail="Token inválido o expirado")
    
    try:
        # Importar modelo
        from models.UsuarioBase import UsuarioBase
        
        # Obtener usuario con su ubicación actual
        usuario = db.query(UsuarioBase).filter(UsuarioBase.id_usuario == usuario_id).first()
        
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Validar que tenga ubicación
        if usuario.ubicacion_actual_lat is None or usuario.ubicacion_actual_lng is None:
            return {
                "usuario_id": usuario_id,
                "usuario_nombre": usuario.nombre,
                "activo": False,
                "mensaje": "Usuario sin ubicación registrada"
            }
        
        return {
            "usuario_id": usuario_id,
            "usuario_nombre": usuario.nombre,
            "latitud": float(usuario.ubicacion_actual_lat),
            "longitud": float(usuario.ubicacion_actual_lng),
            "tiempo_actualizado": "Ubicación actual",
            "activo": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en obtener_ubicacion_compartida: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener ubicación: {str(e)}")


@router.delete("/location/{token}")
def revocar_comparticion(token: str):
    """
    🔒 Revoca un link de compartición (lo desactiva)
    
    Args:
        token: Token a revocar
    
    Returns:
        {
            "status": "success",
            "mensaje": "Compartición revocada"
        }
    """
    if revocar_token(token):
        return {
            "status": "success",
            "mensaje": "Compartición revocada correctamente"
        }
    else:
        raise HTTPException(status_code=404, detail="Token no encontrado")
