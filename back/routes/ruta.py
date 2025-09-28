from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import SessionLocal
from models.ruta import Ruta

ruta = APIRouter()

# dependencia para obtener sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@ruta.post("/ruta/")
def create_ruta(nombre: str, db: Session = Depends(get_db)):
    nueva_ruta = Ruta(nombre=nombre)
    db.add(nueva_ruta)
    db.commit()
    db.refresh(nueva_ruta)
    return nueva_ruta

@ruta.get("/ruta/")
def get_rutas(db: Session = Depends(get_db)):
    return db.query(Ruta).all()
