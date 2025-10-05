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
