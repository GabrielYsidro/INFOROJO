from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from config.db import Base

class ComentarioUsuarioParadero(Base):
    __tablename__ = "comentario_usuario_paradero"
    __table_args__ = {"schema": "public"}

    id_comentario = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False)
    id_usuario = Column(Integer, ForeignKey("public.usuario_base.id_usuario"), nullable=False)
    id_paradero = Column(Integer, ForeignKey("public.paradero.id_paradero"), nullable=False)
    comentario = Column(Text, nullable=False)

    usuario = relationship("UsuarioBase", back_populates="comentario_usuario_paraderos")
    paradero = relationship("Paradero", back_populates="comentario_usuario_paraderos")