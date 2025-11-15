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

@router.get("/_health")
def health():
    """Endpoint de salud para verificar que el servicio está funcionando"""
    return {"ok": True}

@router.get("/tipos-reporte")
def obtener_tipos_reporte():
    """
    Obtiene todos los tipos de reporte disponibles.
    Retorna una lista con id_tipo_reporte y tipo.
    """
    try:
        tipos = service.obtener_tipos_reporte()
        return {
            "success": True,
            "data": tipos
        }
    except Exception as e:
        print(f"[ERROR] /tipos-reporte: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener tipos de reporte: {str(e)}"
        )

@router.get("/reportes/{id_tipo_reporte}")
def obtener_reportes_por_tipo(id_tipo_reporte: int):
    """
    Obtiene todos los reportes de un tipo específico.
    Path parameter: id_tipo_reporte
    """
    try:
        reportes = service.obtener_reportes_por_tipo(id_tipo_reporte)
        return {
            "success": True,
            "data": reportes
        }
    except Exception as e:
        print(f"[ERROR] /reportes/{id_tipo_reporte}: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener reportes: {str(e)}"
        )

@router.post("/enviar")
def enviar_alerta_masiva(
    payload: Dict = Body(...),
    x_user_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Envía una alerta masiva a todos los tipos de usuarios.
    La lista de reportes se obtiene filtrando por tipo de reporte de la tabla existente.
    
    Body esperado:
    {
        "id_tipo_reporte": int (requerido),
        "descripcion": str (opcional),
        "titulo": str (opcional)
    }
    
    El id_emisor se obtiene de los headers X-User-Id o Authorization.
    """
    try:
        # Obtener ID del usuario emisor
        user_id = get_user_id_from_headers(x_user_id, authorization)
        
        # Validar que existe el usuario
        if user_id is None:
            # Intentar obtener del payload como fallback
            user_id = payload.get("id_emisor")
            
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no autenticado. Debe incluir X-User-Id o Authorization en headers, o id_emisor en el body."
            )
        
        # Validar campo requerido
        if "id_tipo_reporte" not in payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campo requerido: id_tipo_reporte"
            )
        
        # Agregar el id_emisor al payload
        payload["id_emisor"] = user_id
        
        # Enviar la alerta masiva (solo confirmación, no guarda en BD)
        resultado = service.enviar_alerta_masiva(payload)
        
        return {
            "success": True,
            "data": resultado,
            "message": "Alerta masiva enviada exitosamente a todos los usuarios (regulador, cliente y conductor)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] /enviar: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al enviar alerta masiva: {str(e)}"
        )
