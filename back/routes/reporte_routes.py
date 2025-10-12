from fastapi import APIRouter, HTTPException, status, Body, Depends, Request, UploadFile, File
import traceback
from typing import Optional, List

from services.reporte_service import ReporteService
from services.supabase_repo import SupabaseRepo
from services.reporte_falla import ReporteFallaService

router = APIRouter(
    prefix="/reports",
    tags=["reportes"]
)

# Instanciar repo (usa DB_URL desde entorno/back/.env)
repo = SupabaseRepo()
service = ReporteService(repo)
falla_service = ReporteFallaService(repo)

# intentar importar dependencia de auth (si existe)
try:
    from services.auth_service import get_current_user_id  # type: ignore
except Exception:
    def get_current_user_id(request: Request = None) -> int:
        # fallback: en desarrollo obliga a usar endpoint /desvio/test
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                            detail="get_current_user_id no implementado. Usa /reports/desvio/test para pruebas.")


@router.get("/_health")
def health():
    return {"ok": True}


@router.post("/desvio/test")
def crear_reporte_desvio_test(payload: dict = Body(...)):
    """
    Endpoint de prueba sin auth. Úsalo para verificar conexión DB y flujo básico.
    Acepta conductor_id opcional en payload (solo para pruebas).
    """
    print("[DEBUG] /reports/desvio/test payload:", payload)
    # validación mínima
    required = ["id_reporte", "ruta_id", "paradero_afectado_id"]
    for k in required:
        if k not in payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Falta campo requerido: {k}")

    # asegurar tipos básicos
    try:
        payload["ruta_id"] = int(payload["ruta_id"])
        payload["paradero_afectado_id"] = int(payload["paradero_afectado_id"])
        if "paradero_alterna_id" in payload and payload["paradero_alterna_id"] is not None:
            payload["paradero_alterna_id"] = int(payload["paradero_alterna_id"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipos de campos inválidos")

    # permitir conductor_id para pruebas (si no existe usar 0)
    payload["conductor_id"] = int(payload.get("conductor_id", 0))

    try:
        saved = service.crear_reporte_desvio(payload)
        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        print("[ERROR] crear_reporte_desvio_test:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/desvio")
def crear_reporte_desvio(payload: dict = Body(...), current_user_id: int = Depends(get_current_user_id)):
    """
    Endpoint real: usa dependencia de auth para extraer conductor_id.
    """
    print("[DEBUG] /reports/desvio payload recibida, user:", current_user_id)
    required = ["id_reporte", "ruta_id", "paradero_afectado_id"]
    for k in required:
        if k not in payload:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Falta campo requerido: {k}")

    # parsear tipos mínimos
    try:
        payload["ruta_id"] = int(payload["ruta_id"])
        payload["paradero_afectado_id"] = int(payload["paradero_afectado_id"])
        if "paradero_alterna_id" in payload and payload["paradero_alterna_id"] is not None:
            payload["paradero_alterna_id"] = int(payload["paradero_alterna_id"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipos de campos inválidos")

    payload["conductor_id"] = int(current_user_id)

    try:
        saved = service.crear_reporte_desvio(payload)
        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        print("[ERROR] crear_reporte_desvio:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno")


@router.post("/falla/test")
async def crear_reporte_falla_test(request: Request, files: List[UploadFile] = File(None)):
    """
    Endpoint de pruebas para reportes de falla (sin auth).
    Acepta form-data con campos y archivos (key `files`).
    """
    payload = None
    ct = request.headers.get("content-type", "")
    if "application/json" in ct:
        try:
            payload = await request.json()
        except Exception:
            payload = None
    else:
        form = await request.form()
        # construir payload desde form-data
        payload = {
            "id_reporte": form.get("id_reporte"),
            "tipo_reporte_id": form.get("tipo_reporte_id"),
            "descripcion": form.get("descripcion"),
            "id_paradero_inicial": form.get("id_paradero_inicial"),
            "id_paradero_final": form.get("id_paradero_final"),
            "id_ruta_afectada": form.get("id_ruta_afectada"),
            "requiere_intervencion": form.get("requiere_intervencion"),
        }
        # si files no fue pasado por la firma, extraer UploadFile desde form
        if not files:
            files = [v for v in form.values() if isinstance(v, UploadFile)]
    print("[DEBUG] /reports/falla/test payload:", payload)
    try:
        if not payload:
            raise ValueError("Payload inválido o vacío")

        # normalizar tipos básicos
        if payload.get("tipo_reporte_id") is not None:
            try:
                payload["tipo_reporte_id"] = int(payload.get("tipo_reporte_id"))
            except Exception:
                raise ValueError("tipo_reporte_id debe ser entero")

        if files:
            saved = falla_service.crear_reporte_falla(payload, files=files)
        else:
            saved = falla_service.crear_reporte_falla_test(payload)

        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        print("[ERROR] crear_reporte_falla_test:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/falla")
async def crear_reporte_falla(request: Request, files: List[UploadFile] = File(None), current_user_id: int = Depends(get_current_user_id)):
    """
    Endpoint real para reportes de falla. Usa dependencia de auth para id del emisor.
    Acepta form-data con campos y archivos (key `files`).
    """
    print("[DEBUG] /reports/falla payload recibida, user:", current_user_id)
    payload = None
    ct = request.headers.get("content-type", "")
    if "application/json" in ct:
        try:
            payload = await request.json()
        except Exception:
            payload = None
    else:
        form = await request.form()
        payload = {
            "id_reporte": form.get("id_reporte"),
            "tipo_reporte_id": form.get("tipo_reporte_id"),
            "descripcion": form.get("descripcion"),
            "id_paradero_inicial": form.get("id_paradero_inicial"),
            "id_paradero_final": form.get("id_paradero_final"),
            "id_ruta_afectada": form.get("id_ruta_afectada"),
            "requiere_intervencion": form.get("requiere_intervencion"),
        }
        if not files:
            files = [v for v in form.values() if isinstance(v, UploadFile)]

    # inyectar id_emisor proveniente del token/session
    if payload is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload inválido o vacío")
    payload["id_emisor"] = int(current_user_id)
    try:
        # normalizar tipo
        if payload.get("tipo_reporte_id") is not None:
            try:
                payload["tipo_reporte_id"] = int(payload.get("tipo_reporte_id"))
            except Exception:
                raise ValueError("tipo_reporte_id debe ser entero")

        saved = falla_service.crear_reporte_falla(payload, files=files)
        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        print("[ERROR] crear_reporte_falla:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno")