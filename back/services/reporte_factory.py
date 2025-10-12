from typing import Dict
from .reporte_domain import ReporteDesvio

class CreadorReportes:
    @staticmethod
    def crear(tipo: str, payload: Dict):
        if tipo == "desvio":
            return ReporteDesvio(
                id_reporte=str(payload["id_reporte"]),
                conductor_id=int(payload["conductor_id"]),
                ruta_id=int(payload["ruta_id"]),
                paradero_afectado_id=int(payload["paradero_afectado_id"]),
                paradero_alterna_id=(int(payload["paradero_alterna_id"]) if payload.get("paradero_alterna_id") is not None else None),
                descripcion=payload.get("descripcion", ""),
            )
        raise ValueError(f"Tipo de reporte desconocido: {tipo}")