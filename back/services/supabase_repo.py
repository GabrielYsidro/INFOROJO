import os
from typing import Dict, Optional, Iterable

from sqlalchemy import MetaData, Table, select, insert
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

# reusar el engine/DB que ya usa el resto del proyecto
from config.db import engine as shared_engine

class SupabaseRepo:
    """
    Repositorio flexible que reutiliza el engine definido en config.db
    y usa reflection para adaptarse a nombres de tablas/columnas distintos.
    """

    def __init__(self, engine: Engine = None):
        self.engine: Engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible. Asegura config.db exporte `engine`.")

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
        raise RuntimeError(f"No se encontró ninguna tabla entre: {list(candidates)}. Error último: {last_err}")

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
        # aceptar paradero/paraderos
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
            print("[DB ERROR] get_paradero_by_id:", e)
            raise

    def find_report_by_id_reporte(self, id_reporte: int) -> Optional[Dict]:
        table = self._reflect_table(("reporte", "reportes", "report"))
        cols = set(table.columns.keys())
        id_col = table.c.get("id_reporte") if "id_reporte" in cols else self._choose_id_column(table, ("id_reporte", "id", "reporte_id"))
        if id_col is None:
            raise RuntimeError(f"No se encontró columna identificadora en la tabla {table.name}. Columnas: {list(cols)}")
        candidates = ("id_reporte", "id", "reporte_id")
        id_col = next((table.c[name] for name in candidates if name in table.c), None)
        if id_col is None:
            raise RuntimeError(f"No se encontró columna identificadora en la tabla {table.name}. Columnas: {list(cols)}")
        try:
            with self.engine.connect() as conn:
                stmt = select(table).where(id_col == id_reporte).limit(1)
                res = conn.execute(stmt)
                row = res.mappings().first()
                return dict(row) if row is not None else None
        except SQLAlchemyError as e:
            print("[DB ERROR] find_report_by_id_reporte:", e)
            raise

    def save_report(self, record: Dict) -> Dict:
        table = self._reflect_table(("reporte", "reportes", "report"))
        cols = set(table.columns.keys())

        # copiar record para no mutar el original
        rec = dict(record)

        # eliminar cualquier campo que corresponda a una columna IDENTITY (GENERATED ALWAYS)
        for k in list(rec.keys()):
            if k in table.c:
                col = table.c[k]
                if getattr(col, "identity", None) is not None:
                    rec.pop(k, None)

        # conservar solo columnas que realmente existen en la tabla
        allowed = {k: v for k, v in rec.items() if k in cols}
        if not allowed:
            raise RuntimeError(f"Ninguna key del record coincide con columnas insertables de {table.name}. Columnas: {sorted(list(cols))}")

        try:
            with self.engine.begin() as conn:
                stmt = insert(table).values(**allowed).returning(*table.c)
                res = conn.execute(stmt)
                row = res.mappings().first()
                if row is None:
                    raise Exception("Fallo al insertar reporte")
                return dict(row)
        except SQLAlchemyError as e:
            print("[DB ERROR] save_report:", e)
            raise

    #def save_notification(self, note: Dict) -> Dict:
        #table = self._reflect_table(("notification", "notifications", "notificaciones"))
        #cols = set(table.columns.keys())
        #allowed = {k: v for k, v in note.items() if k in cols}
        #if not allowed:
        #    raise RuntimeError(f"Ninguna key de la nota coincide con columnas de {table.name}. Columnas disponibles: {list(cols)}")
        #try:
         #   with self.engine.begin() as conn:
         #       stmt = insert(table).values(**allowed).returning(*table.c)
         #       res = conn.execute(stmt)
         #       row = res.mappings().first()
          #      if row is None:
          #          raise Exception("Fallo al insertar notificación")
          #      return dict(row)
        #except SQLAlchemyError as e:
         #   print("[DB ERROR] save_notification:", e)
         #   raise