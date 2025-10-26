from typing import Dict, Any
from .reporte_Interface import ReporteInterface

class Reporte_Falla(ReporteInterface):
    def __init__(
        self,
        id_emisor: int,
        id_corredor_afectado: int,
        es_critica: bool,
        motivo: str = ""
    ):
        super().__init__(id_emisor)
        self.id_corredor_afectado = id_corredor_afectado
        self.es_critica = es_critica
        self.motivo = motivo

    def generar_mensaje(self) -> str:
        criticidad = "CRÍTICA" if self.es_critica else "NO crítica"
        desc = f" - {self.motivo}" if self.motivo else ""
        return f"Reporte de falla {criticidad}{desc}"

    def enviar(self, repo) -> Dict[str, Any]:
        record = {
            "id_emisor": self.id_emisor,
            "id_tipo_reporte": 3,
            "id_corredor_afectado": self.id_corredor_afectado,
            "es_critica": self.es_critica,
            "descripcion": self.motivo,
            "mensaje": self.generar_mensaje()
        }
        return repo.save_report(record)
