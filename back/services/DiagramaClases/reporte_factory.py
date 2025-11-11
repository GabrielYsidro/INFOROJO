from typing import Dict
from ..reporte_Desvio import Reporte_Desvio
from ..reporte_Retraso import Reporte_Retraso
from ..ReporteFalla import Reporte_Falla

class CreadorReportes:
    def crear(self, tipo: str, payload: Dict):
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
        elif tipo == "falla":
            return Reporte_Falla(
                id_reporte=str(payload.get("id_reporte", f"falla-{payload.get('id_emisor')}-{int(__import__('time').time())}")),
                conductor_id=int(payload["id_emisor"]),
                paradero=payload.get("paradero", "Automático"),
                tipo_falla=payload.get("tipo_falla", "No especificado"),
                requiere_intervencion=bool(payload.get("requiere_intervencion", False)),
                unidad_afectada=payload.get("unidad_afectada", "No especificada"),
                motivo=payload.get("motivo", ""),
            )
        raise ValueError(f"Tipo de reporte desconocido: {tipo}")