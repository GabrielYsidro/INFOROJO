from fastapi import APIRouter, HTTPException, status, Body, Header
from typing import Optional, Dict
from services.alerta_masiva_service import AlertaMasivaService
from services.auth_service import AuthService
import traceback

service = AlertaMasivaService()
auth_service = AuthService()

router = APIRouter(
    prefix="/alertas-masivas",
    tags=["alertas-masivas"]
)

def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Extrae el user_id del token JWT en el header Authorization.
    Retorna None si no encuentra token válido.
    """
    if not authorization:
        return None
    
    if not authorization.lower().startswith("bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        payload = auth_service.verify_access_token(token)
        return payload.get("id")
    except Exception as e:
        print(f"[ERROR] Verificando token: {e}")
        return None

@router.get("/_health/")
def health():
    """Endpoint de salud para verificar que el servicio está funcionando"""
    return {"ok": True}

@router.get("/datos-formulario/")
def obtener_datos_formulario():
    """
    Obtiene todos los datos necesarios para el formulario de alerta masiva:
    - Lista de corredores
    - Lista de rutas
    - Lista de paraderos
    """
    try:
        datos = service.obtener_datos_formulario()
        return {
            "success": True,
            "data": datos
        }
    except Exception as e:
        print(f"[ERROR] /datos-formulario: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener datos del formulario: {str(e)}"
        )

@router.post("/enviar/")
def crear_alerta_masiva(
    payload: Dict = Body(...),
    authorization: Optional[str] = Header(None)
):
    """
    Crea una nueva alerta masiva (reporte tipo "Otro").
    Guarda el reporte en la base de datos con todos los campos necesarios.
    
    Body esperado:
    {
        "descripcion": str (requerido),
        "id_corredor_afectado": int (opcional),
        "es_critica": bool (opcional),
        "requiere_intervencion": bool (opcional),
        "id_ruta_afectada": int (opcional),
        "id_paradero_inicial": int (opcional),
        "id_paradero_final": int (opcional),
        "tiempo_retraso_min": int (opcional)
    }
    
    El id_emisor se obtiene del token JWT en el header Authorization.
    El id_tipo_reporte se asigna automáticamente a 4 (Otro).
    """
    try:
        # Obtener ID del usuario del token JWT
        user_id = get_user_id_from_token(authorization)
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no autenticado. Debe incluir un token válido en el header Authorization."
            )
        
        # Validar campo requerido
        if "descripcion" not in payload or not payload["descripcion"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campo requerido: descripcion"
            )
        
        # Agregar el id_emisor y tipo al payload
        payload["id_emisor"] = user_id
        payload["id_tipo_reporte"] = 4  # Tipo "Otro" para alertas masivas
        
        # Crear el reporte
        resultado = service.crear_alerta_masiva(payload)
        
        return {
            "success": True,
            "data": resultado,
            "message": "Alerta masiva creada exitosamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] /enviar: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear alerta masiva: {str(e)}"
        )
