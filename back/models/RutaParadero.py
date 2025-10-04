from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from config.db import Base

class RutaParadero(Base):
    __tablename__ = "ruta_paradero"
    __table_args__ = {"schema": "public"}

    id_ruta_paradero = Column(Integer, primary_key=True, autoincrement=True)
    id_ruta = Column(Integer, ForeignKey("public.ruta.id_ruta"), nullable=False)
    id_paradero = Column(Integer, ForeignKey("public.paradero.id_paradero"), nullable=False)
    orden = Column(Integer, nullable=True)

    # Definicion de relaciones
    ruta = relationship("Ruta", back_populates="ruta_paraderos")
    paradero = relationship("Paradero", back_populates="ruta_paraderos")