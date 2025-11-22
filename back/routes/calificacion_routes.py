from fastapi import APIRouter, HTTPException, status, Body, Header
from typing import Optional, Dict
from services.calificacion_service import CalificacionService
import traceback

service = CalificacionService()

router = APIRouter(
    prefix="/calificaciones",
    tags=["calificaciones"]
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

@router.post("/actualizar/")
def actualizar_calificacion(
    payload: Dict = Body(...),
    x_user_id: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Actualiza la calificación de un historial de uso.
    
    Body esperado:
    {
        "id_historial": int (requerido),
        "calificacion": int (1-5, requerido),
        "descripcion": str (opcional)
    }
    """
    try:
        # Validar campos requeridos
        if "id_historial" not in payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campo requerido: id_historial"
            )
        
        if "calificacion" not in payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campo requerido: calificacion"
            )
        
        id_historial = int(payload["id_historial"])
        calificacion = int(payload["calificacion"])
        descripcion = payload.get("descripcion", "")
        
        # Validar rango de calificación
        if calificacion < 1 or calificacion > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La calificación debe estar entre 1 y 5"
            )
        
        # Actualizar calificación
        resultado = service.actualizar_calificacion(id_historial, calificacion, descripcion)
        
        return {
            "success": True,
            "data": resultado,
            "message": "Calificación actualizada exitosamente"
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"[ERROR] /actualizar: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar calificación: {str(e)}"
        )

@router.get("/obtener/{id_historial}/")
def obtener_calificacion(id_historial: int):
    """
    Obtiene la calificación de un historial específico.
    """
    try:
        resultado = service.obtener_calificacion(id_historial)
        
        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Historial no encontrado"
            )
        
        return {
            "success": True,
            "data": resultado
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] /obtener/{id_historial}/: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener calificación: {str(e)}"
        )

@router.get("/estadisticas/")
def obtener_estadisticas(id_paradero: Optional[int] = None):
    """
    Obtiene estadísticas de calificaciones.
    Query parameter: id_paradero (opcional)
    """
    try:
        resultado = service.obtener_estadisticas_calificaciones(id_paradero)
        
        return {
            "success": True,
            "data": resultado
        }
        
    except Exception as e:
        print(f"[ERROR] /estadisticas: {e}/")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )