from sqlalchemy import Column, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from config.db import Base

class HistorialUso(Base):
    __tablename__ = "historial_uso"
    __table_args__ = {"schema": "public"}

    id_historial = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("public.usuario_base.id_usuario"), nullable=True)
    id_corredor = Column(Integer, ForeignKey("public.corredor.id_corredor"), nullable=True)
    fecha_hora = Column(TIMESTAMP(timezone=True), nullable=True)  # Mantenemos por compatibilidad
    fecha_hora_subida = Column(TIMESTAMP(timezone=True), nullable=True)  # Nueva columna
    fecha_hora_bajada = Column(TIMESTAMP(timezone=True), nullable=True)  # Nueva columna
    id_paradero_sube = Column(Integer, ForeignKey("public.paradero.id_paradero"), nullable=True)
    id_paradero_baja = Column(Integer, ForeignKey("public.paradero.id_paradero"), nullable=True)


    # Definicion de relaciones
    usuario = relationship("UsuarioBase", back_populates="historial_uso")
    corredor = relationship("Corredor", back_populates="historiales")
    paradero_sube = relationship("Paradero", back_populates="historial_sube", foreign_keys=[id_paradero_sube])
    paradero_baja = relationship("Paradero", back_populates="historial_baja", foreign_keys=[id_paradero_baja])
