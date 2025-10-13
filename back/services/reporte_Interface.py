from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, Dict, Any

class ReporteInterface(ABC):
    
    def __init__(self, id_reporte: str, conductor_id: int, creado_en: Optional[datetime] = None):
        self.id_reporte = id_reporte
        self.conductor_id = conductor_id
        self.creado_en = creado_en or datetime.utcnow()

    @abstractmethod
    def generar_mensaje(self) -> str:
        ...

    @abstractmethod
    def enviar(self, repo) -> Dict[str, Any]:
        ...