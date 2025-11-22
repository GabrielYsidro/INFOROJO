from fastapi import APIRouter, HTTPException, status, Body, Header, Request, Depends
from typing import Optional, Dict
from services.feedback_service import feedback_service
from datetime import datetime

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"]
)

def get_user_id_from_headers(x_user_id: Optional[str] = Header(None), authorization: Optional[str] = Header(None)) -> Optional[int]:
    # lee X-User-Id o Authorization: Bearer <id> (modo dev)
    if x_user_id and x_user_id.isdigit():
        return int(x_user_id)
    auth = authorization or ""
    if auth.lower().startswith("bearer "):
        token = auth.split(None, 1)[1].strip()
        if token.isdigit():
            return int(token)
    return None

@router.post("/crearFeedback")
def crear_feedback(payload: Dict = Body(...), user_id: Optional[int] = Depends(get_user_id_from_headers)):
    """
    Guarda feedback enviado por cliente.
    Body: { mensaje: string }
    Header opcional: X-User-Id
    """
    mensaje = payload.get("mensaje") or payload.get("comentario") or payload.get("comentary")
    if not mensaje or not str(mensaje).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="mensaje es requerido")
    try:
        saved = feedback_service.save_feedback(comentario=str(mensaje).strip(), id_usuario=user_id)
        return {"ok": True, "feedback": saved}
    except Exception as e:
        print("[ERROR] crear_feedback:", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al guardar feedback")

@router.get("/obtenerFeedback")
def listar_feedback(limit: Optional[int] = 200):
    """
    Ruta para regulador: devuelve lista de feedback con fecha.
    Respuesta: lista de { id_feedback, comentario, fecha }.
    """
    try:
        rows = feedback_service.list_feedback(limit=int(limit or 200))
        # formatear fecha corta (YYYY-MM-DD) aquí mismo o en frontend
        for r in rows:
            if r.get("fecha") is not None:
                r["fecha_corta"] = r["fecha"].strftime("%Y-%m-%d")
        return {"ok": True, "feedback": rows}
    except Exception as e:
        print("[ERROR] listar_feedback:", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al listar feedback")