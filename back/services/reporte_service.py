#Code for reporte_service.py

from .supabase_repo import SupabaseRepo
from .reporte_factory import CreadorReportes

class ReporteService:
    def __init__(self, repo: SupabaseRepo = None):
        self.repo = repo or SupabaseRepo()

    def crear_reporte_desvio(self, payload: dict):
        # validación referencial mínima
        if not self.repo.get_paradero_by_id(int(payload["paradero_afectado_id"])):
            raise ValueError("paradero_afectado no existe")
        if payload.get("paradero_alterna_id") and not self.repo.get_paradero_by_id(int(payload["paradero_alterna_id"])):
            raise ValueError("paradero_alterna no existe")
        # idempotencia
        existing = self.repo.find_report_by_id_reporte(str(payload["id_reporte"]))
        if existing:
            raise KeyError("Reporte duplicado")
        # crear reporte de dominio via Factory y persistir
        reporte = CreadorReportes.crear("desvio", payload)
        saved = reporte.enviar(self.repo)
        return saved