from typing import Dict, Optional, Any

from .usuario_service import UsuarioService
from .DiagramaClases.reporte_Interface import ReporteInterface


class Reporte_Retraso(ReporteInterface):
    def __init__(
        self,
        id_reporte: str,
        conductor_id: int,
        ruta_id: int,
        paradero_inicial_id: int,
        paradero_final_id: int,
        tiempo_retraso_min: int,
        descripcion: Optional[str] = None,
    ):
        super().__init__(id_reporte, conductor_id)
        self.ruta_id = int(ruta_id)
        self.paradero_inicial_id = int(paradero_inicial_id)
        self.paradero_final_id = int(paradero_final_id)
        self.tiempo_retraso_min = int(tiempo_retraso_min)
        self.descripcion = (descripcion or "").strip()

    def generar_mensaje(self) -> str:
        desc = f" Descripción: {self.descripcion}" if self.descripcion else ""
        return (
            f"Retraso en la ruta {self.ruta_id} — "
            f"desde paradero {self.paradero_inicial_id} hasta {self.paradero_final_id}. "
            f"Retraso estimado: {self.tiempo_retraso_min} minutos.{desc}"
        )

    def enviar(self, repo) -> Dict[str, Any]:

        corredor_id = UsuarioService.get_corredor_asignado(self.conductor_id)

        if corredor_id is None:
            raise ValueError("El conductor no tiene un corredor asignado en usuario_base")


        record = {
            "id_reporte": self.id_reporte,
            "tipo": "retraso",
            "conductor_id": int(self.conductor_id),
            "id_corredor_afectado": corredor_id,  
            "id_ruta_afectada": self.ruta_id,
            "id_paradero_inicial": self.paradero_inicial_id,
            "id_paradero_final": self.paradero_final_id,
            "tiempo_retraso_min": self.tiempo_retraso_min,
            "descripcion": self.descripcion,
            "mensaje": self.generar_mensaje(),
            "creado_en": self.creado_en.isoformat(),
        }

        saved = repo.save_report(record)

        # (Opcional) crear notificación para regulador o usuario
        notification = {
            "titulo": "Retraso reportado",
            "mensaje": self.generar_mensaje(),
            "reporte_id": saved.get("id_reporte"),
            "leido": False,
            "creado_en": saved.get("fecha") or record["creado_en"],
        }
        # repo.save_notification(notification)  # Descomentar si se gestiona notificaciones

        return saved