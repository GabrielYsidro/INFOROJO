from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from config.db import Base

class UsuarioBase(Base):
    __tablename__ = "usuario_base"
    __table_args__ = {"schema": "public"}

    id_usuario = Column(Integer, primary_key=True, nullable=False)
    nombre = Column(String)
    dni = Column(String)
    ubicacion_actual_lat = Column(Float)
    ubicacion_actual_lng = Column(Float)
    correo = Column(String)
    placa_unidad = Column(String)
    cod_empleado = Column(String)
    fcm_token = Column(String, nullable=True)  # Token FCM para push notifications

    id_tipo_usuario = Column(Integer, ForeignKey("public.tipo_usuario.id_tipo_usuario"))
    id_corredor_asignado = Column(Integer, ForeignKey("public.corredor.id_corredor"))


    # Definicion de relaciones
    tipo_usuario = relationship("TipoUsuario", back_populates="usuarios")
    corredor_asignado = relationship("Corredor", back_populates="usuarios")
    feedbacks = relationship("Feedback", back_populates="usuario")
    reportes_emitidos = relationship("Reporte", back_populates="emisor")
    historial_uso = relationship("HistorialUso", back_populates="usuario")
    comentario_usuario_paraderos = relationship("ComentarioUsuarioParadero", back_populates="usuario")
    
    
