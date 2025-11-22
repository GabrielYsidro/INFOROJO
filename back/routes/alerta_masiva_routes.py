from fastapi import APIRouter, HTTPException, status, Body, Header
from typing import Optional, Dict
from services.alerta_masiva_service import AlertaMasivaService
import traceback

service = AlertaMasivaService()

router = APIRouter(
    prefix="/alertas-masivas",
    tags=["alertas-masivas"]
)

def get_user_id_from_headers(x_user_id: Optional[str] = Header(None), authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Dependencia que devuelve un user id numérico si está en:
    - header X-User-Id
    - header Authorization: Bearer <userId>
    Retorna None si no encuentra.
    """
    if x_user_id and x_user_id.isdigit():
        return int(x_user_id)
    auth = authorization or ""
    if auth.lower().startswith("bearer "):
        token = auth.split(None, 1)[1].strip()
        if token.isdigit():
            return int(token)
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
    x_user_id: Optional[str] = Header(None),
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
    
    El id_emisor se obtiene de los headers X-User-Id o Authorization.
    El id_tipo_reporte se asigna automáticamente a 4 (Otro).
    """
    try:
        # Obtener ID del usuario emisor
        user_id = get_user_id_from_headers(x_user_id, authorization)
        
        if user_id is None:
            # Intentar obtener del payload como fallback
            user_id = payload.get("id_emisor")
            
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no autenticado. Debe incluir X-User-Id o Authorization en headers."
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
