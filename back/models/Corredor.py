from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from config.db import Base

class Corredor(Base):
    __tablename__ = "corredor"
    __table_args__ = {"schema": "public"}

    id_corredor = Column(Integer, primary_key=True, nullable=False)
    capacidad_max = Column(Integer)
    ubicacion_lat = Column(Float)
    ubicacion_lng = Column(Float)
    estado = Column(String)

    # Definicion de relaciones
    usuarios = relationship("UsuarioBase", back_populates="corredor_asignado")
    reportes_afectados = relationship("Reporte", back_populates="corredor_afectado")
    historiales = relationship("HistorialUso", back_populates="corredor")
