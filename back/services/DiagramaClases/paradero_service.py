from typing import Optional, Iterable, Dict
from sqlalchemy import MetaData, Table, select
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from models.Paradero import Paradero
from sqlalchemy.orm import Session

from config.db import engine as shared_engine

class Paradero_Service:
    """
    Servicio con la lógica de acceso a paraderos.
    (Separa la responsabilidad del repo concreto.)
    """

    def __init__(self, engine: Engine = None, db= Session):
        self.engine: Engine = engine or shared_engine
        if self.engine is None:
            raise RuntimeError("No hay engine de DB disponible en ParaderoService.")
        self.db = db

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
    
    def get_paraderos(self) -> list[Dict]:
        """Retorna lista serializada de paraderos sin reflexión ni lógica compleja"""
        paraderos = self.db.query(Paradero).all()
        return [
            {
                "id_paradero": p.id_paradero,
                "nombre": p.nombre,
                "coordenada_lat": p.coordenada_lat,
                "coordenada_lng": p.coordenada_lng,
                "colapso_actual": p.colapso_actual,
                "imagen_url": p.imagen_url
            }
            for p in paraderos
        ]

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

    def get_paraderos_by_ruta(self, id_ruta: int) -> list[Dict]:
        """
        Devuelve todos los paraderos asociados a la ruta `id_ruta` en una sola
        consulta (evita N+1). Usa reflexión para encontrar la tabla puente y la
        tabla de paraderos y devuelve una lista de dicts (mapeo de columnas).
        """
        # Buscar la tabla puente que relacione rutas y paraderos
        ruta_par_table = self._reflect_table(("ruta_paradero", "ruta_paraderos", "public.ruta_paradero"))

        ruta_id_col = self._choose_id_column(ruta_par_table, ("id_ruta", "ruta_id", "id"))
        paradero_id_col = self._choose_id_column(ruta_par_table, ("id_paradero", "paradero_id", "id"))
        if ruta_id_col is None or paradero_id_col is None:
            raise RuntimeError(f"No se pudieron identificar columnas id en la tabla {ruta_par_table.name}")

        # Obtener ids de paradero asociados a la ruta
        stmt_ids = select(ruta_par_table.c[paradero_id_col.name]).where(ruta_par_table.c[ruta_id_col.name] == id_ruta)
        ids = []
        try:
            with self.engine.connect() as conn:
                res = conn.execute(stmt_ids)
                ids = [r[paradero_id_col.name] for r in res.mappings() if r[paradero_id_col.name] is not None]
        except SQLAlchemyError as e:
            print("[DB ERROR] ParaderoService.get_paraderos_by_ruta (ids):", e)
            raise

        if not ids:
            return []

        # Ahora obtener todos los paraderos en una sola consulta
        par_table = self._reflect_table(("paradero", "paraderos", "public.paradero"))
        par_id_col = self._choose_id_column(par_table, ("id_paradero", "id"))
        if par_id_col is None:
            raise RuntimeError(f"No se encontró columna id en la tabla {par_table.name}")

        stmt_pars = select(par_table).where(par_table.c[par_id_col.name].in_(ids))
        try:
            with self.engine.connect() as conn:
                res2 = conn.execute(stmt_pars)
                return [dict(r) for r in res2.mappings()]
        except SQLAlchemyError as e:
            print("[DB ERROR] ParaderoService.get_paraderos_by_ruta (paraderos):", e)
            raise