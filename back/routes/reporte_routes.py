from fastapi import APIRouter, HTTPException, status, Body, Depends
import os
from services.reporte_service import ReporteService
from services.supabase_repo import SupabaseRepo

router = APIRouter()
repo = SupabaseRepo(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
service = ReporteService(repo)

# usa tu auth_service existente para extraer user id; aquí intento importarlo
try:
    from services.auth_service import get_current_user_id
except Exception:
    def get_current_user_id():
        # temporal: si no tienes auth listo, devuelve None o 0 (no recomendado en producción)
        raise Exception("Implementa get_current_user_id en services.auth_service")

@router.post("/reports/desvio")
def crear_reporte_desvio(payload: dict = Body(...), current_user_id: int = Depends(get_current_user_id)):
    # validación mínima de campos y tipos
    required = ["id_reporte", "ruta_id", "paradero_afectado_id"]
    for k in required:
        if k not in payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Falta campo requerido: {k}")
    try:
        payload["conductor_id"] = int(current_user_id)
        saved = service.crear_reporte_desvio(payload)
        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        # aquí loguear e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno")