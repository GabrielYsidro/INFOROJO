from fastapi import FastAPI
from config.db import Base, engine
from routes.ruta_routes import router as ruta_routes
from routes.usuario_routes import router as usuario_routes
import os

app = FastAPI()

# Leer variable desde el .env
CREAR_TABLAS = os.getenv("CREAR_TABLAS", "False").lower() in ("true", "1", "yes")

if CREAR_TABLAS:
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "Hello World probandou"}

app.include_router(ruta_routes)
app.include_router(usuario_routes)