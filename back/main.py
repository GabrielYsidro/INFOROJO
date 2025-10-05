from fastapi import FastAPI
from config.db import Base, engine
from routes.ruta_routes import router as ruta_routes
from routes.usuario_routes import router as usuario_routes
from routes.auth_routes import router as auth_routes

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "Hello World probandou"}

app.include_router(ruta_routes)
app.include_router(usuario_routes)
app.include_router(auth_routes)