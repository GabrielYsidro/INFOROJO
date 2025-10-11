from sqlalchemy import Column, Integer, Float, Boolean, Text
from sqlalchemy.orm import relationship
from config.db import Base

class Paradero(Base):
    __tablename__ = "paradero"
    __table_args__ = {"schema": "public"}

    id_paradero = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(Text, nullable=True)
    coordenada_lat = Column(Float, nullable=True)
    coordenada_lng = Column(Float, nullable=True)
    colapso_actual = Column(Boolean, default=False)


    # Definicion de relaciones
    ruta_paraderos = relationship("RutaParadero", back_populates="paradero")
    reportes_inicial = relationship("Reporte", back_populates="paradero_inicial", foreign_keys="Reporte.id_paradero_inicial")
    reportes_final = relationship("Reporte", back_populates="paradero_final", foreign_keys="Reporte.id_paradero_final")
    historial_sube = relationship("HistorialUso", back_populates="paradero_sube", foreign_keys="HistorialUso.id_paradero_sube")
    historial_baja = relationship("HistorialUso", back_populates="paradero_baja", foreign_keys="HistorialUso.id_paradero_baja")