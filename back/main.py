from fastapi import FastAPI
from config.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from routes.ruta_routes import router as ruta_routes
from routes.usuario_routes import router as usuario_routes
from routes.auth_routes import router as auth_routes
from routes.corredor_routes import router as corredor_routes
from routes.reporte_routes import router as reporte_routes
from routes.dashboard_routes import router as dashboard_routes
from routes.alerta_masiva_routes import router as alerta_masiva_routes
from routes.calificacion_routes import router as calificacion_routes
from routes.paradero_routes import router as paradero_routes
from routes.comentario_paradero_routes import router as comentario_paradero_routes
from routes.feedback_routes import router as feedback_routes
from routes.fcm_test_routes import router as fcm_test_routes
from routes.shared_location_routes import router as shared_location_routes

app = FastAPI(
    title="API de Inforrojo", 
    description="Servicios de Login, Usuarios y Rutas"
)

Base.metadata.create_all(bind=engine)

origins = [
    "*", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    # Permitimos todos los métodos, asegurando que OPTIONS y POST pasen.
    allow_methods=["*", "POST", "GET", "OPTIONS"], 
    allow_headers=["*"], 
)

@app.get("/")
def root():
    return {"msg": "Hello World probando"}

app.include_router(ruta_routes)
app.include_router(usuario_routes)
app.include_router(auth_routes)
app.include_router(corredor_routes)
app.include_router(reporte_routes)
app.include_router(dashboard_routes)
app.include_router(alerta_masiva_routes)
app.include_router(calificacion_routes)
app.include_router(paradero_routes)
app.include_router(comentario_paradero_routes)
app.include_router(feedback_routes)
app.include_router(fcm_test_routes)
app.include_router(shared_location_routes)
