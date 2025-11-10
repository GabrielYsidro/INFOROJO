from typing import Optional, List, Dict
from sqlalchemy import text
from config.db import engine as db_engine
from datetime import datetime

class FeedbackService:
    def __init__(self, engine=db_engine):
        self.engine = engine

    def save_feedback(self, comentario: str, id_usuario: Optional[int] = None) -> Dict:
        """
        Inserta feedback en la tabla feedback.
        Asume columnas: id_feedback (serial pk), comentario, id_usuario, fecha (timestamp with time zone default now()).
        """
        sql = text(
            "INSERT INTO feedback (comentario, id_usuario, fecha) "
            "VALUES (:comentario, :id_usuario, :fecha) "
            "RETURNING id_feedback, comentario, id_usuario, fecha"
        )
        params = {
            "comentario": comentario,
            "id_usuario": int(id_usuario) if id_usuario is not None else None,
            "fecha": datetime.utcnow()
        }
        with self.engine.connect() as conn:
            res = conn.execute(sql, params)
            conn.commit()
            row = res.fetchone()
            if row:
                return dict(row._mapping)
        raise RuntimeError("No se pudo guardar feedback")

    def list_feedback(self, limit: int = 200) -> List[Dict]:
        sql = text("SELECT id_feedback, comentario, id_usuario, fecha FROM feedback ORDER BY fecha DESC LIMIT :lim")
        with self.engine.connect() as conn:
            res = conn.execute(sql, {"lim": limit})
            rows = [dict(r._mapping) for r in res.fetchall()]
            return rows

# instancia por defecto
feedback_service = FeedbackService()