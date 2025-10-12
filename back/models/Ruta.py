from sqlalchemy import Column, Integer, String
from config.db import Base
from sqlalchemy.orm import relationship


class Ruta(Base):
    __tablename__ = "ruta"
    __table_args__ = {"schema": "public"}
    

    id_ruta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    paraderos = relationship(
        "Paradero", 
        secondary="public.ruta_paradero",
        back_populates="rutas"
    )
    
    # Definicion de relaciones  
    ruta_paraderos = relationship("RutaParadero", back_populates="ruta")
    reportes_afectados = relationship("Reporte", back_populates="ruta_afectada")
