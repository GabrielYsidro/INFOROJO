"""
Servicio de notificaciones para reportes de falla
Maneja el envío de notificaciones push a usuarios cercanos, seguidores de la unidad y reguladores
"""
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from config.db import SessionLocal
from config.firebase import get_firebase_admin
from firebase_admin import messaging
from models.UsuarioBase import UsuarioBase
from models.Corredor import Corredor
from models.Ruta import Ruta
from models.Paradero import Paradero
import math


class FallaNotificationService:
    """
    Servicio para gestionar notificaciones de reportes de falla
    """
    
    # Radio por defecto en kilómetros para considerar usuarios cercanos
    RADIO_DEFAULT_KM = 0.8  # 800 metros
    
    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()
        self.firebase_admin = get_firebase_admin()
    
    @staticmethod
    def calcular_distancia_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
        
        Args:
            lat1, lon1: Coordenadas del punto 1
            lat2, lon2: Coordenadas del punto 2
            
        Returns:
            Distancia en kilómetros
        """
        R = 6371  # Radio de la Tierra en kilómetros
        
        # Convertir grados a radianes
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Diferencias
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Fórmula de Haversine
        a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def obtener_usuarios_cercanos(
        self, 
        lat_referencia: float, 
        lng_referencia: float, 
        radio_km: float = None,
        excluir_usuario_id: int = None
    ) -> List[UsuarioBase]:
        """
        Obtiene TODOS los usuarios CLIENTES con FCM token (sin filtro de distancia)
        
        Args:
            lat_referencia: Latitud del punto de referencia (no se usa, se mantiene para compatibilidad)
            lng_referencia: Longitud del punto de referencia (no se usa, se mantiene para compatibilidad)
            radio_km: Radio en kilómetros (no se usa, se mantiene para compatibilidad)
            excluir_usuario_id: ID del usuario a excluir (generalmente el emisor)
            
        Returns:
            Lista de TODOS los usuarios clientes con FCM token (excluye al emisor)
        """
        # Obtener TODOS los CLIENTES (id_tipo_usuario = 1) con FCM token
        # Excluimos al usuario emisor del reporte
        condiciones = [
            UsuarioBase.id_tipo_usuario == 1,  # Solo clientes
            UsuarioBase.fcm_token.isnot(None)
        ]
        
        if excluir_usuario_id:
            condiciones.append(UsuarioBase.id_usuario != excluir_usuario_id)
        
        stmt = select(UsuarioBase).where(and_(*condiciones))
        
        usuarios = self.db.execute(stmt).scalars().all()
        
        # Devolver TODOS los usuarios sin filtrar por distancia
        print(f"  👤 Total clientes encontrados: {len(usuarios)}")
        
        return usuarios
    
    def obtener_seguidores_unidad(self, placa_unidad: str) -> List[UsuarioBase]:
        """
        Obtiene usuarios que siguen específicamente una unidad
        
        Args:
            placa_unidad: Placa de la unidad afectada
            
        Returns:
            Lista de usuarios que siguen la unidad
        """
        # TODO: Funcionalidad de seguimiento pendiente
        return []
    
    def obtener_reguladores(self) -> List[UsuarioBase]:
        """
        Obtiene todos los usuarios reguladores (administradores)
        
        Returns:
            Lista de usuarios reguladores con FCM token
        """
        stmt = select(UsuarioBase).where(
            and_(
                UsuarioBase.id_tipo_usuario == 3,
                UsuarioBase.fcm_token.isnot(None)
            )
        )
        
        reguladores = self.db.execute(stmt).scalars().all()
        return reguladores
    
    def enviar_notificaciones_falla(
        self,
        reporte_id: int,
        descripcion: str,
        unidad_afectada: str,
        tipo_falla: str,
        paradero: str,
        id_corredor_afectado: Optional[int],
        id_ruta_afectada: Optional[int],
        lat_referencia: Optional[float] = None,
        lng_referencia: Optional[float] = None,
        requiere_intervencion: bool = False,
        id_emisor: Optional[int] = None
    ) -> Dict:
        """
        Envía notificaciones push a todos los usuarios relevantes sobre la falla
        
        Args:
            reporte_id: ID del reporte creado
            descripcion: Descripción completa del reporte
            unidad_afectada: Placa de la unidad con falla
            tipo_falla: Tipo de falla reportada
            paradero: Nombre del paradero donde ocurrió
            id_corredor_afectado: ID del corredor afectado
            id_ruta_afectada: ID de la ruta afectada
            lat_referencia: Latitud de la ubicación del reporte
            lng_referencia: Longitud de la ubicación del reporte
            requiere_intervencion: Si requiere intervención urgente
            id_emisor: ID del usuario que emitió el reporte (para excluirlo de notificaciones)
            
        Returns:
            Dict con estadísticas de envío
        """
        print(f"\n📢 === ENVIANDO NOTIFICACIONES DE FALLA === ")
        print(f"   Reporte ID: {reporte_id}")
        print(f"   Unidad: {unidad_afectada}")
        print(f"   Tipo: {tipo_falla}")
        print(f"   Paradero: {paradero}")
        
        tokens_a_notificar = set()  # Usar set para evitar duplicados
        destinatarios_info = {
            "usuarios_cercanos": 0,
            "seguidores_unidad": 0,
            "reguladores": 0,
            "total_tokens": 0,
            "notificaciones_exitosas": 0,
            "notificaciones_fallidas": 0
        }
        
        # 1️⃣ Obtener usuarios cercanos (si tenemos ubicación)
        if lat_referencia and lng_referencia:
            print(f"\n🔍 Buscando usuarios CLIENTES cercanos (radio {self.RADIO_DEFAULT_KM*1000}m)...")
            usuarios_cercanos = self.obtener_usuarios_cercanos(
                lat_referencia, 
                lng_referencia,
                excluir_usuario_id=id_emisor
            )
            for usuario in usuarios_cercanos:
                tokens_a_notificar.add(usuario.fcm_token)
            destinatarios_info["usuarios_cercanos"] = len(usuarios_cercanos)
        
        # 2️⃣ Obtener seguidores de la unidad específica
        seguidores = self.obtener_seguidores_unidad(unidad_afectada)
        for seguidor in seguidores:
            tokens_a_notificar.add(seguidor.fcm_token)
        destinatarios_info["seguidores_unidad"] = len(seguidores)
        
        # 3️⃣ SIEMPRE incluir reguladores (administradores)
        reguladores = self.obtener_reguladores()
        for regulador in reguladores:
            tokens_a_notificar.add(regulador.fcm_token)
        destinatarios_info["reguladores"] = len(reguladores)
        
        # Convertir set a lista
        tokens_lista = list(tokens_a_notificar)
        destinatarios_info["total_tokens"] = len(tokens_lista)
        
        if not tokens_lista:
            print("\n   Total de notificaciones enviadas: 0")
            print("=== FIN NOTIFICACIONES ===\n")
            return destinatarios_info
        
        # Construir notificación con la descripción completa
        prioridad = "🚨" if requiere_intervencion else "⚠️"
        titulo = f"{prioridad} Falla Reportada"
        cuerpo = descripcion
        
        notification_data = {
            "tipo": "falla",
            "reporte_id": str(reporte_id),
            "requiere_intervencion": str(requiere_intervencion)
        }
        
        # Enviar notificaciones FCM
        try:
            exitosas = 0
            fallidas = 0
            
            for token in tokens_lista:
                try:
                    message = messaging.Message(
                        notification=messaging.Notification(
                            title=titulo,
                            body=cuerpo
                        ),
                        data=notification_data,
                        token=token,
                        android=messaging.AndroidConfig(
                            priority="high",
                            notification=messaging.AndroidNotification(
                                sound="default",
                                priority="high"
                            )
                        )
                    )
                    
                    messaging.send(message)
                    exitosas += 1
                    
                except Exception:
                    fallidas += 1
            
            destinatarios_info["notificaciones_exitosas"] = exitosas
            destinatarios_info["notificaciones_fallidas"] = fallidas
        
        except Exception as e:
            destinatarios_info["error"] = str(e)
        
        print(f"\n   Total de notificaciones enviadas: {destinatarios_info.get('notificaciones_exitosas', 0)}")
        print("=== FIN NOTIFICACIONES ===\n")
        
        return destinatarios_info
    
    def __del__(self):
        """Cerrar sesión de BD al destruir el objeto"""
        if hasattr(self, 'db') and self.db:
            self.db.close()
