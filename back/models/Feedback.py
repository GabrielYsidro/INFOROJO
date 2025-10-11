from sqlalchemy import Column, Integer, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from config.db import Base

class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = {"schema": "public"}

    id_feedback = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("public.usuario_base.id_usuario"), nullable=True)
    fecha = Column(TIMESTAMP(timezone=True), nullable=True)
    comentario = Column(Text, nullable=True)
    calificacion = Column(Integer, nullable=True)
    
    
    #Definicion de relaciones
    usuario = relationship("UsuarioBase", back_populates="feedbacks")