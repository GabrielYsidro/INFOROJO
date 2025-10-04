from sqlalchemy import Column, Integer, String
from config.db import Base

class Ruta(Base):
    __tablename__ = "ruta"

    id_ruta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
