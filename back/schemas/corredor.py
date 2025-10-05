from typing import Optional
from pydantic import BaseModel, ConfigDict

class CorredorCreate(BaseModel):
    capacidad_max: int
    ubicacion_lat: float
    ubicacion_lng: float
    estado: str

class CorredorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # equivale a orm_mode
    id_corredor: int
    capacidad_max: Optional[int] = None
    ubicacion_lat: Optional[float] = None
    ubicacion_lng: Optional[float] = None
    estado: Optional[str] = None