from sqlalchemy import Column, Integer, Text
from sqlalchemy.orm import relationship
from config.db import Base 

class TipoReporte(Base):
    __tablename__ = "tipo_reporte"
    __table_args__ = {"schema": "public"}

    id_tipo_reporte = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(Text, nullable=True)

    #Definicion de relaciones
    reportes = relationship("Reporte", back_populates="tipo_reporte")