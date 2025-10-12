import os
from typing import Dict, Optional
from supabase import create_client


class SupabaseRepo:
    def __init__(self, url: str = None, key: str = None):
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_KEY")
        if not self.url or not self.key:
            raise RuntimeError("SUPABASE_URL y SUPABASE_KEY deben estar en el entorno")
        self.client = create_client(self.url, self.key)

    def get_paradero_by_id(self, paradero_id: int) -> Optional[Dict]:
        res = self.client.table("paraderos").select("*").eq("id", paradero_id).limit(1).execute()
        return (res.data or [None])[0]

    def find_report_by_id_reporte(self, id_reporte: str) -> Optional[Dict]:
        res = self.client.table("reportes").select("*").eq("id_reporte", id_reporte).limit(1).execute()
        return (res.data or [None])[0]

    def save_report(self, record: Dict) -> Dict:
        res = self.client.table("reportes").insert(record).select("*").execute()
        if res.error:
            raise Exception(res.error.message)
        return res.data[0]

    def save_notification(self, note: Dict) -> Dict:
        res = self.client.table("notifications").insert(note).select("*").execute()
        if res.error:
            raise Exception(res.error.message)
        return res.data[0]