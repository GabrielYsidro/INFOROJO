from typing import Optional, Iterable, Dict
from sqlalchemy import MetaData, Table, select
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from config.db import engine as shared_engine

class Paradero_Service:
    """
    Servicio con la lógica de acceso a paraderos.
    (Separa la responsabilidad del repo concreto.)
    """

    def __init__(self, engine: Engine = None):
        self.engine: Engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible en ParaderoService.")

    def _reflect_table(self, candidates: Iterable[str]) -> Table:
        meta = MetaData()
        last_err = None
        for name in candidates:
            try:
                tbl = Table(name, meta, autoload_with=self.engine)
                return tbl
            except Exception as e:
                last_err = e
                continue
        raise RuntimeError(f"No se encontró tabla paradero entre: {list(candidates)}. Error: {last_err}")

    def _choose_id_column(self, table: Table, candidates=("id_paradero", "id", "paradero_id")):
        cols = set(table.columns.keys())
        for c in candidates:
            if c in cols:
                return table.c[c]
        pkcols = list(table.primary_key.columns)
        if pkcols:
            return pkcols[0]
        return None

    def get_paradero_by_id(self, id_paradero: int) -> Optional[Dict]:
        table = self._reflect_table(("paradero", "paraderos"))
        id_col = self._choose_id_column(table, ("id_paradero", "id", "paradero_id"))
        if id_col is None:
            raise RuntimeError(f"No se encontró columna ID en la tabla {table.name}")
        stmt = select(table).where(id_col == id_paradero).limit(1)
        try:
            with self.engine.connect() as conn:
                res = conn.execute(stmt)
                row = res.mappings().first()
                return dict(row) if row is not None else None
        except SQLAlchemyError as e:
            print("[DB ERROR] ParaderoService.get_paradero_by_id:", e)
            raise