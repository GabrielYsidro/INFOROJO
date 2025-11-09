from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.usuario_service import UsuarioService
from config.db import get_db

router = APIRouter(
    prefix="/usuario",
    tags=["usuario"]
)

@router.post("/")
def crear_usuario(
    nombre: str,
    dni: str,
    ubicacion_actual_lat: float,
    ubicacion_actual_lng: float,
    correo: str,
    placa_unidad: str,
    cod_empleado: str,
    id_tipo_usuario: int,
    id_corredor_asignado: int | None = None,
    db: Session = Depends(get_db)
):
    return UsuarioService(db).create_usuario(
        nombre=nombre,
        dni=dni,
        ubicacion_actual_lat=ubicacion_actual_lat,
        ubicacion_actual_lng=ubicacion_actual_lng,
        correo=correo,
        placa_unidad=placa_unidad,
        cod_empleado=cod_empleado,
        id_tipo_usuario=id_tipo_usuario,
        id_corredor_asignado=id_corredor_asignado
    )

@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):
    return UsuarioService(db).get_usuarios()

@router.get("/{user_id}")
def obtener_usuario_por_id(user_id: int, db: Session = Depends(get_db)):
    usuario = UsuarioService(db).get_usuario_by_id(user_id)
    if usuario is None:
        return {"error": "Usuario no encontrado"}
    return usuario

# Endpoint para obtener historial de viajes de un usuario (máximo 30 viajes más recientes)
@router.get("/{user_id}/historial")
def obtener_historial_usuario(user_id: int, db: Session = Depends(get_db)):
    usuario_service = UsuarioService(db)
    usuario = usuario_service.get_usuario_by_id(user_id)
    if usuario is None:
        return {"error": "Usuario no encontrado"}
    
    # Obtener historial limitado a 30 registros más recientes
    historial_limitado = usuario_service.get_historial_limitado(user_id, limite=30)
    
    # Formatear respuesta para datos relevantes, incluyendo tiempo de recorrido
    historial_formateado = []
    for h in historial_limitado:
        # Calcular tiempo de recorrido si ambas fechas existen
        tiempo_recorrido_minutos = None
        if h.fecha_hora_subida and h.fecha_hora_bajada:
            delta = h.fecha_hora_bajada - h.fecha_hora_subida
            tiempo_recorrido_minutos = int(delta.total_seconds() / 60)
        
        historial_formateado.append({
            "id": h.id_historial,
            "paradero_sube": h.paradero_sube.nombre if h.paradero_sube else None,
            "paradero_baja": h.paradero_baja.nombre if h.paradero_baja else None,
            "fecha": h.fecha_hora,
            "fecha_subida": h.fecha_hora_subida,
            "fecha_bajada": h.fecha_hora_bajada,
            "tiempo_recorrido_minutos": tiempo_recorrido_minutos
        })
    
    return historial_formateado
@router.get("/{user_id}/ubicacion")
def obtener_ubicacion_usuario(user_id: int, db: Session = Depends(get_db)):
    usuario_service = UsuarioService(db)
    usuario = usuario_service.get_ubicacion_usuario(user_id)
    if not usuario or usuario.ubicacion_actual_lat is None or usuario.ubicacion_actual_lng is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o sin ubicación registrada")
    
    return {
        "id_usuario": usuario.id_usuario,
        "latitud": usuario.ubicacion_actual_lat,
        "longitud": usuario.ubicacion_actual_lng
    }

# Endpoint para actualizar tiempos de subida y bajada en el historial
@router.put("/{user_id}/historial/{historial_id}/tiempos")
def actualizar_tiempos_viaje(
    user_id: int, 
    historial_id: int,
    fecha_subida: str = None,
    fecha_bajada: str = None,
    db: Session = Depends(get_db)
):
    """
    Actualiza los tiempos de subida y bajada de un viaje específico
    """
    usuario_service = UsuarioService(db)
    return usuario_service.actualizar_tiempos_viaje(
        user_id, historial_id, fecha_subida, fecha_bajada
    )


