from sqlalchemy import Column, Integer, Boolean, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from config.db import Base

class Reporte(Base):
    __tablename__ = "reporte"
    __table_args__ = {"schema": "public"}

    id_reporte = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(TIMESTAMP(timezone=True), nullable=True)
    descripcion = Column(Text, nullable=True)
    id_emisor = Column(Integer, ForeignKey("public.usuario_base.id_usuario"), nullable=True)
    id_tipo_reporte = Column(Integer, ForeignKey("public.tipo_reporte.id_tipo_reporte"), nullable=True)
    id_corredor_afectado = Column(Integer, ForeignKey("public.corredor.id_corredor"), nullable=True)
    es_critica = Column(Boolean, nullable=True)
    requiere_intervencion = Column(Boolean, nullable=True)
    id_ruta_afectada = Column(Integer, ForeignKey("public.ruta.id_ruta"), nullable=True)
    id_paradero_inicial = Column(Integer, ForeignKey("public.paradero.id_paradero"), nullable=True)
    id_paradero_final = Column(Integer, ForeignKey("public.paradero.id_paradero"), nullable=True)
    tiempo_retraso_min = Column(Integer, nullable=True)

    emisor = relationship("UsuarioBase", back_populates="reportes_emitidos")
    tipo_reporte = relationship("TipoReporte", back_populates="reportes")
    corredor_afectado = relationship("Corredor", back_populates="reportes_afectados")
    ruta_afectada = relationship("Ruta", back_populates="reportes_afectados")
    paradero_inicial = relationship("Paradero", back_populates="reportes_inicial", foreign_keys=[id_paradero_inicial])
    paradero_final = relationship("Paradero", back_populates="reportes_final", foreign_keys=[id_paradero_final])