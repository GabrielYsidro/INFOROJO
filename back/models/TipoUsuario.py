from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from config.db import Base

class TipoUsuario(Base):
    __tablename__ = "tipo_usuario"
    __table_args__ = {"schema": "public"}

    id_tipo_usuario = Column(Integer, primary_key=True, nullable=False)
    tipo = Column(String)  # Usuario, Conductor o Regulador

    # Relación inversa
    usuarios = relationship("UsuarioBase", back_populates="tipo_usuario")
