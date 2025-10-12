from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, Dict, Any

class Reporte(ABC):
    
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

class ReporteDesvio(Reporte):
    def __init__(
        self,
        id_reporte: str,
        conductor_id: int,
        ruta_id: int,
        paradero_afectado_id: int,
        paradero_alterna_id: Optional[int],
        descripcion: Optional[str],
    ):
        super().__init__(id_reporte, conductor_id)
        self.ruta_id = int(ruta_id)
        self.paradero_afectado_id = int(paradero_afectado_id)
        self.paradero_alterna_id = int(paradero_alterna_id) if paradero_alterna_id is not None else None
        self.descripcion = (descripcion or "").strip()

    def generar_mensaje(self) -> str:
        alt = f"Alternativa: {self.paradero_alterna_id}" if self.paradero_alterna_id else "Sin alternativa"
        desc = f" Descripción: {self.descripcion}" if self.descripcion else ""
        return f"Desvío en ruta {self.ruta_id} — paradero afectado {self.paradero_afectado_id}. {alt}.{desc}"

    def enviar(self, repo) -> Dict[str, Any]:
        # El repo implementa save_report y save_notification
        record = {
            "id_reporte": self.id_reporte,
            "tipo": "desvio",
            "conductor_id": int(self.conductor_id),
            "ruta_id": self.ruta_id,
            "paradero_afectado_id": self.paradero_afectado_id,
            "paradero_alterna_id": self.paradero_alterna_id,
            "descripcion": self.descripcion,
            "mensaje": self.generar_mensaje(),
            "creado_en": self.creado_en.isoformat(),
        }
        saved = repo.save_report(record)
        # crear notificación mínima
        notification = {
            "titulo": "Desvío reportado",
            "mensaje": self.generar_mensaje(),
            "reporte_id": saved.get("id"),
            "leido": False,
            "creado_en": saved.get("creado_en") or record["creado_en"],
        }
        # Si save_notification falla, que el repo lance excepción y lo maneja el service si se desea
        #repo.save_notification(notification)
        return saved