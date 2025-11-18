"""
Firebase Admin SDK - Singleton
Inicialización centralizada de Firebase Admin SDK para enviar push notifications
"""
import os
import firebase_admin
from firebase_admin import credentials, messaging
from typing import Optional


class FirebaseAdmin:
    """Singleton para gestionar la conexión con Firebase Admin SDK"""
    
    _instance: Optional['FirebaseAdmin'] = None
    _app = None
    
    def __new__(cls):
        """Implementar patrón Singleton"""
        if cls._instance is None:
            cls._instance = super(FirebaseAdmin, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Inicializar Firebase Admin SDK si no está inicializado"""
        if self._initialized:
            return
        
        try:
            # Construir credenciales desde variables de entorno
            cred_dict = {
                "type": os.getenv("FIREBASE_TYPE", "service_account"),
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL", ""),
                "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN", "googleapis.com")
            }
            
            # Validar que tenemos credenciales
            if not cred_dict["project_id"]:
                raise ValueError("❌ FIREBASE_PROJECT_ID no está configurado en .env")
            if not cred_dict["private_key"]:
                raise ValueError("❌ FIREBASE_PRIVATE_KEY no está configurado en .env")
            
            # Inicializar Firebase
            cred = credentials.Certificate(cred_dict)
            self._app = firebase_admin.initialize_app(cred)
            self._initialized = True
            print("✅ Firebase Admin SDK inicializado correctamente")
            
        except Exception as e:
            self._initialized = False
            print(f"❌ Error al inicializar Firebase: {str(e)}")
            raise
    
    def send_notification(
        self,
        title: str,
        body: str,
        token: Optional[str] = None,
        topic: Optional[str] = None,
        data: Optional[dict] = None,
        android_priority: str = "high"
    ) -> str:
        """
        Enviar una notificación push
        
        Args:
            title: Título de la notificación
            body: Cuerpo del mensaje
            token: Token FCM del dispositivo (si es NULL, usar topic)
            topic: Tema de FCM (si es NULL, usar token)
            data: Datos adicionales (dict)
            android_priority: Prioridad en Android (high/normal)
        
        Returns:
            ID del mensaje enviado
        
        Raises:
            ValueError: Si ni token ni topic se proporcionan
            Exception: Si hay error al enviar
        """
        if not token and not topic:
            raise ValueError("❌ Debe proporcionar 'token' o 'topic'")
        
        try:
            # Construir notificación
            notification = messaging.Notification(
                title=title,
                body=body,
            )
            
            # Opciones específicas de Android
            android_config = None
            if android_priority == "high":
                android_config = messaging.AndroidConfig(
                    priority="high",
                    notification=messaging.AndroidNotification(
                        sound="default",
                        click_action="FLUTTER_NOTIFICATION_CLICK"
                    )
                )
            
            # Construir mensaje según target
            if token:
                message = messaging.Message(
                    notification=notification,
                    data=data or {},
                    token=token,
                    android=android_config
                )
                target_type = f"token ({token[:20]}...)"
            else:
                message = messaging.Message(
                    notification=notification,
                    data=data or {},
                    topic=topic,
                    android=android_config
                )
                target_type = f"tema ({topic})"
            
            # Enviar
            response = messaging.send(message)
            print(f"✅ Notificación enviada exitosamente a {target_type}")
            print(f"   ID del mensaje: {response}")
            return response
            
        except Exception as e:
            print(f"❌ Error al enviar notificación: {str(e)}")
            raise
    
    def send_multicast(
        self,
        title: str,
        body: str,
        tokens: list,
        data: Optional[dict] = None
    ) -> dict:
        """
        Enviar notificación a múltiples dispositivos
        
        Args:
            title: Título de la notificación
            body: Cuerpo del mensaje
            tokens: Lista de tokens FCM
            data: Datos adicionales (dict)
        
        Returns:
            Dict con estadísticas de envío
        """
        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                tokens=tokens
            )
            
            response = messaging.send_multicast(message)
            
            stats = {
                "successful": response.successful,
                "failed": response.failed,
                "total": len(tokens),
                "failure_responses": [str(err) for err in response.errors]
            }
            
            print(f"✅ Notificación multicast enviada: {stats['successful']}/{stats['total']} exitosas")
            if response.errors:
                print(f"⚠️ Errores: {stats['failure_responses']}")
            
            return stats
            
        except Exception as e:
            print(f"❌ Error al enviar notificación multicast: {str(e)}")
            raise
    
    def send_to_topic(
        self,
        title: str,
        body: str,
        topic: str,
        data: Optional[dict] = None
    ) -> str:
        """
        Enviar notificación a un tema (todos los suscritos)
        
        Args:
            title: Título de la notificación
            body: Cuerpo del mensaje
            topic: Nombre del tema FCM
            data: Datos adicionales (dict)
        
        Returns:
            ID del mensaje enviado
        """
        return self.send_notification(
            title=title,
            body=body,
            topic=topic,
            data=data
        )
    
    def get_app(self):
        """Obtener instancia de la app Firebase"""
        if not self._initialized:
            raise RuntimeError("Firebase no está inicializado")
        return self._app


# Singleton global
firebase_admin_instance = FirebaseAdmin()


def get_firebase_admin() -> FirebaseAdmin:
    """
    Obtener instancia del Firebase Admin Singleton
    Uso: from config.firebase import get_firebase_admin
    """
    return firebase_admin_instance
