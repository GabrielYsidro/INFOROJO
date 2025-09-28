from fastapi import FastAPI
from config.db import Base, engine
from routes.ruta import ruta

app = FastAPI()

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "Hello World probandou"}

app.include_router(ruta)