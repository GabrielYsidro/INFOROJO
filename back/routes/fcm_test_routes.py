"""
Rutas de prueba para Firebase Cloud Messaging
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.firebase import get_firebase_admin


router = APIRouter(
    prefix="/test-fcm",
    tags=["testing"]
)


class SendNotificationRequest(BaseModel):
    """Request para enviar notificación"""
    title: str
    body: str
    token: str = None
    topic: str = None
    data: dict = None


class SendMulticastRequest(BaseModel):
    """Request para enviar a múltiples dispositivos"""
    title: str
    body: str
    tokens: list
    data: dict = None


@router.post("/send-notification")
def send_notification(request: SendNotificationRequest):
    """
    Endpoint de prueba para enviar una notificación
    
    Ejemplo de uso:
    POST /test-fcm/send-notification
    {
        "title": "Prueba",
        "body": "¡Hola desde el backend!",
        "token": "c_xyz123..."
    }
    """
    try:
        # Validar que tenemos token o topic
        if not request.token and not request.topic:
            raise HTTPException(
                status_code=400,
                detail="Debe proporcionar 'token' o 'topic'"
            )
        
        # Obtener Firebase Admin
        firebase = get_firebase_admin()
        
        # Enviar notificación
        message_id = firebase.send_notification(
            title=request.title,
            body=request.body,
            token=request.token,
            topic=request.topic,
            data=request.data
        )
        
        target = request.token if request.token else f"tema: {request.topic}"
        return {
            "status": "success",
            "message_id": message_id,
            "title": request.title,
            "body": request.body,
            "target": target
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al enviar notificación: {str(e)}"
        )


@router.post("/send-to-topic")
def send_to_topic(request: SendNotificationRequest):
    """
    Endpoint para enviar a un tema específico
    
    Ejemplo de uso:
    POST /test-fcm/send-to-topic
    {
        "title": "Alerta global",
        "body": "Nueva actualización disponible",
        "topic": "com.inforrojogrupo5"
    }
    """
    try:
        if not request.topic:
            raise HTTPException(
                status_code=400,
                detail="'topic' es requerido"
            )
        
        firebase = get_firebase_admin()
        message_id = firebase.send_to_topic(
            title=request.title,
            body=request.body,
            topic=request.topic,
            data=request.data
        )
        
        return {
            "status": "success",
            "message_id": message_id,
            "topic": request.topic,
            "title": request.title
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al enviar a tema: {str(e)}"
        )


@router.post("/send-multicast")
def send_multicast(request: SendMulticastRequest):
    """
    Endpoint para enviar a múltiples dispositivos
    
    Ejemplo de uso:
    POST /test-fcm/send-multicast
    {
        "title": "Aviso importante",
        "body": "Para todos los usuarios",
        "tokens": ["token1", "token2", "token3"]
    }
    """
    try:
        if not request.tokens or len(request.tokens) == 0:
            raise HTTPException(
                status_code=400,
                detail="'tokens' debe tener al menos un token"
            )
        
        firebase = get_firebase_admin()
        stats = firebase.send_multicast(
            title=request.title,
            body=request.body,
            tokens=request.tokens,
            data=request.data
        )
        
        return {
            "status": "success",
            "statistics": stats,
            "title": request.title
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al enviar multicast: {str(e)}"
        )


@router.get("/health")
def health_check():
    """
    Verificar que Firebase está correctamente inicializado
    """
    try:
        firebase = get_firebase_admin()
        app = firebase.get_app()
        
        return {
            "status": "healthy",
            "firebase_app": app.name,
            "message": "✅ Firebase Admin SDK está listo"
        }
    
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "❌ Firebase Admin SDK no está inicializado"
        }
