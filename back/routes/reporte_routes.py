from services.reporte_service import ReporteService
from services.paradero_service import Paradero_Service
from fastapi import APIRouter, HTTPException, status, Body, Depends, Request, Header
import traceback
from typing import Optional, Dict
from datetime import datetime
import json

paradero_svc=Paradero_Service()
service = ReporteService(paradero_service=paradero_svc)

router = APIRouter(
    prefix="/reports",
    tags=["reportes"]
)


# intentar importar dependencia de auth (si existe)
try:
    from services.auth_service import get_current_user_id  # type: ignore
except Exception:
    def get_current_user_id(request: Request = None) -> int:
        # fallback: en desarrollo obliga a usar endpoint /desvio/test
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                            detail="get_current_user_id no implementado. Usa /reports/desvio/test para pruebas.")


def get_user_id_from_headers(x_user_id: Optional[str] = Header(None), authorization: Optional[str] = Header(None)) -> Optional[int]:
    """
    Dependencia que devuelve un user id numérico si está en:
    - header X-User-Id
    - header Authorization: Bearer <userId>  (modo dev con id numérico en token)
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
    return {"ok": True}

@router.post("/desvio")
def crear_reporte_desvio(payload: Dict = Body(...), conductor_header_id: Optional[int] = Depends(get_user_id_from_headers)):
    """
    Endpoint: mapea campos entrantes a los nombres esperados por el servicio
    y valida explícitamente que los campos numéricos no sean None.
    """
    # obtener conductor_id (body tiene prioridad)
    conductor_id = payload.get("conductor_id")
    if conductor_id is None:
        conductor_id = conductor_header_id

    if conductor_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Usuario no autenticado. En desarrollo use header X-User-Id o Authorization: Bearer <userId> o incluya conductor_id en el body.")

    # helper para validar entero requerido
    def parse_required_int(key: str) -> int:
        if key not in payload or payload.get(key) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Falta campo requerido o es null: {key}")
        try:
            return int(payload[key])
        except (ValueError, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Campo {key} debe ser numérico")

    # validar y parsear campos básicos
    ruta_id = parse_required_int("ruta_id")
    paradero_inicial = parse_required_int("paradero_afectado_id")
    tipo = parse_required_int("tipo")

    # paradero_alterna_id es opcional pero si viene no puede ser null y debe ser numérico
    paradero_final = None
    if "paradero_alterna_id" in payload and payload["paradero_alterna_id"] is not None:
        try:
            paradero_final = int(payload["paradero_alterna_id"])
        except (ValueError, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="paradero_alterna_id debe ser numérico")

    # asegurar id_emisor numérico
    try:
        id_emisor = int(conductor_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="conductor_id debe ser numérico")

    # mapear a los campos que necesita el servicio / DB
    mapped_payload = {
        "id_emisor": id_emisor,                       # id_conductor
        "id_tipo_reporte": tipo,                      # tipo
        "id_corredor_afectado": ruta_id,              # ruta_id
        "id_paradero_inicial": paradero_inicial,      # paradero_afectado_id
        "id_paradero_final": paradero_final,          # paradero_alterna_id (opcional)
        "descripcion": payload.get("descripcion"),
        "mensaje": payload.get("mensaje"),
        # claves antiguas que espera reporte_service (compatibilidad)
        "conductor_id": id_emisor,
        "tipo": tipo,
        "ruta_id": ruta_id,
        "paradero_afectado_id": paradero_inicial,
        "paradero_alterna_id": paradero_final,
    }

    # DEBUG: imprimir payload original y el mapeado
    try:
        print("[DEBUG] /reports/desvio incoming payload:", json.dumps(payload, ensure_ascii=False))
    except Exception:
        print("[DEBUG] /reports/desvio incoming payload (raw):", payload)
    print("[DEBUG] /reports/desvio mapped_payload:", mapped_payload)

    try:
        saved = service.crear_reporte_desvio(mapped_payload)
        return {"ok": True, "reporte": saved}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except KeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reporte duplicado")
    except Exception as e:
        # modo desarrollo: mostrar error real para depurar
        print("[ERROR] crear_reporte_desvio exception:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))