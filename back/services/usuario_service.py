from sqlalchemy.orm import Session
from models.UsuarioBase import UsuarioBase  # tu modelo que mostraste

class UsuarioService:
    def __init__(self, db: Session):
        self.db = db

    def create_usuario(
        self,
        nombre: str,
        dni: str,
        ubicacion_actual_lat: float,
        ubicacion_actual_lng: float,
        correo: str,
        placa_unidad: str,
        cod_empleado: str,
        id_tipo_usuario: int,
        id_corredor_asignado: int | None = None
    ) -> UsuarioBase:
        """
        Crea un nuevo usuario en la base de datos
        """
        nuevo_usuario = UsuarioBase(
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
        self.db.add(nuevo_usuario)
        self.db.commit()
        self.db.refresh(nuevo_usuario)
        return nuevo_usuario

    def get_usuarios(self) -> list[UsuarioBase]:
        """
        Retorna todos los usuarios
        """
        return self.db.query(UsuarioBase).all()
    
    def get_usuario_by_id(self, user_id: int) -> UsuarioBase | None:
        """
        Retorna un usuario por su ID, o None si no existe
        """
        return self.db.query(UsuarioBase).filter(UsuarioBase.id_usuario == user_id).first()
    

    # UBICACION MATIAS prueba
    def get_ubicacion_usuario(self, user_id: int) -> UsuarioBase | None:
        """
        Retorna el usuario con su ubicación actual, o None si no existe
        """
        return self.db.query(UsuarioBase).filter(UsuarioBase.id_usuario == user_id).first()
    
    def actualizar_tiempos_viaje(self, user_id: int, historial_id: int, fecha_subida: str = None, fecha_bajada: str = None):
        """
        Actualiza los tiempos de subida y bajada de un viaje específico
        """
        from models.HistorialUso import HistorialUso
        from datetime import datetime
        
        # Buscar el historial específico del usuario
        historial = self.db.query(HistorialUso).filter(
            HistorialUso.id_historial == historial_id,
            HistorialUso.id_usuario == user_id
        ).first()
        
        if not historial:
            return {"error": "Historial no encontrado"}
        
        # Actualizar las fechas si se proporcionan
        if fecha_subida:
            try:
                historial.fecha_hora_subida = datetime.fromisoformat(fecha_subida.replace('Z', '+00:00'))
            except ValueError:
                return {"error": "Formato de fecha de subida inválido"}
        
        if fecha_bajada:
            try:
                historial.fecha_hora_bajada = datetime.fromisoformat(fecha_bajada.replace('Z', '+00:00'))
            except ValueError:
                return {"error": "Formato de fecha de bajada inválido"}
        
        self.db.commit()
        self.db.refresh(historial)
        
        return {
            "message": "Tiempos actualizados correctamente",
            "historial_id": historial_id,
            "fecha_subida": historial.fecha_hora_subida,
            "fecha_bajada": historial.fecha_hora_bajada
        }
    
    def get_historial_limitado(self, user_id: int, limite: int = 30):
        """
        Obtiene el historial de un usuario limitado a los N registros más recientes
        y elimina automáticamente registros antiguos si superan el límite
        """
        from models.HistorialUso import HistorialUso
        from sqlalchemy import desc
        from sqlalchemy.orm import joinedload
        
        try:
            # Obtener todos los registros del usuario ordenados por fecha (más reciente primero)
            # Usando joinedload para cargar las relaciones de paraderos de manera eficiente
            historial_completo = self.db.query(HistorialUso).options(
                joinedload(HistorialUso.paradero_sube),
                joinedload(HistorialUso.paradero_baja)
            ).filter(
                HistorialUso.id_usuario == user_id
            ).order_by(desc(HistorialUso.fecha_hora_subida)).all()
            
            # Si hay más registros que el límite, eliminar los más antiguos
            if len(historial_completo) > limite:
                # Mantener solo los primeros 'limite' registros (más recientes)
                registros_a_mantener = historial_completo[:limite]
                registros_a_eliminar = historial_completo[limite:]
                
                # Eliminar registros antiguos
                for registro in registros_a_eliminar:
                    self.db.delete(registro)
                
                self.db.commit()
                
                # Retornar solo los registros mantenidos
                return registros_a_mantener
            
            # Si no supera el límite, retornar todos
            return historial_completo
            
        except Exception as e:
            print(f"Error en get_historial_limitado: {str(e)}")
            return []
    
    def actualizar_fcm_token(self, user_id: int, fcm_token: str) -> bool:
        """
        Actualiza el FCM token de un usuario para push notifications
        Retorna True si se actualizó correctamente, False si el usuario no existe
        """
        usuario = self.db.query(UsuarioBase).filter(UsuarioBase.id_usuario == user_id).first()
        if not usuario:
            return False
        
        usuario.fcm_token = fcm_token
        self.db.commit()
        self.db.refresh(usuario)
        print(f"✅ FCM token actualizado para usuario {user_id}: {fcm_token[:20]}...")
        return True
    


    def get_corredor_asignado(self, user_id: int) -> int | None:
        usuario = self.get_usuario_by_id(user_id)
        if not usuario:
            return None
        return usuario.id_corredor_asignado
