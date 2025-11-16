from typing import Dict, Any, Optional
from .DiagramaClases.reporte_Interface import ReporteInterface

class Reporte_Falla(ReporteInterface):
    def __init__(
        self,
        id_reporte: str,
        conductor_id: int,
        paradero: str,
        tipo_falla: str,
        requiere_intervencion: bool,
        unidad_afectada: str,
        motivo: str = ""
    ):
        super().__init__(id_reporte, conductor_id)
        self.paradero = paradero
        self.tipo_falla = tipo_falla
        self.requiere_intervencion = requiere_intervencion
        self.unidad_afectada = unidad_afectada
        self.motivo = motivo

    def generar_mensaje(self) -> str:
        intervencion = "requiere intervención urgente" if self.requiere_intervencion else "no requiere intervención urgente"
        motivo_txt = f" Motivo: {self.motivo}" if self.motivo else ""
        return (
            f"Falla en unidad {self.unidad_afectada} en el paradero {self.paradero} — "
            f"Tipo: {self.tipo_falla} ({intervencion}).{motivo_txt}"
        )

    def enviar(self, repo) -> Dict[str, Any]:
        # Construir descripción completa para almacenar toda la info
        descripcion_completa = (
            f"Falla en unidad {self.unidad_afectada} | "
            f"Paradero: {self.paradero} | "
            f"Tipo: {self.tipo_falla} | "
            f"Requiere intervención: {'Sí' if self.requiere_intervencion else 'No'}"
        )
        if self.motivo:
            descripcion_completa += f" | Motivo: {self.motivo}"
        
        record = {
            "id_reporte": self.id_reporte,
            "id_emisor": int(self.conductor_id),
            "id_tipo_reporte": 1,  # tipo falla
            "descripcion": descripcion_completa,
            "requiere_intervencion": self.requiere_intervencion,
            "es_critica": self.requiere_intervencion,  # Si requiere intervención, lo marcamos como crítico
            "mensaje": self.generar_mensaje(),
            # Los demás campos quedarán NULL en la BD (no aplican para fallas)
            "id_ruta_afectada": None,
            "id_paradero_inicial": None,
            "id_paradero_final": None,
            "id_corredor_afectado": None,
            "tiempo_retraso_min": None,
            "creado_en": self.creado_en.isoformat(),
        }
        return repo.save_report(record)
