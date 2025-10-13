from typing import Dict
from .reporte_Desvio import Reporte_Desvio
from .reporte_Retraso import Reporte_Retraso

class CreadorReportes:
    @staticmethod
    def crear(tipo: str, payload: Dict):
        if tipo == "desvio":
            return Reporte_Desvio(
                id_reporte=str(payload["id_reporte"]),
                conductor_id=int(payload["conductor_id"]),
                ruta_id=int(payload["ruta_id"]),
                paradero_afectado_id=int(payload["paradero_afectado_id"]),
                paradero_alterna_id=(int(payload["paradero_alterna_id"]) if payload.get("paradero_alterna_id") is not None else None),
                descripcion=payload.get("descripcion", ""),
            )
        elif tipo == "retraso":  # 👈 nuevo caso
            return Reporte_Retraso(
                id_reporte=str(payload["id_reporte"]),
                conductor_id=int(payload["conductor_id"]),
                ruta_id=int(payload["ruta_id"]),
                paradero_inicial_id=int(payload["paradero_inicial_id"]),
                paradero_final_id=int(payload["paradero_final_id"]),
                tiempo_retraso_min=int(payload["tiempo_retraso_min"]),
                descripcion=payload.get("descripcion", ""),
            )
        raise ValueError(f"Tipo de reporte desconocido: {tipo}")