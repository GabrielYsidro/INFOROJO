from typing import Dict, Optional
from datetime import datetime
import os
import uuid
from pathlib import Path


class ReporteFallaService:
	"""
	Servicio responsable de orquestar la creación de reportes de fallas.
	Sigue el patrón del servicio de desvío: valida referencias mínimas,
	previene duplicados y delega la persistencia al repo.
	"""

	def __init__(self, repo=None):
		# repo debe exponer: get_paradero_by_id (opcional), find_report_by_id_reporte, save_report
		self.repo = repo

	def crear_reporte_falla(self, payload: Dict, files: Optional[list] = None) -> Dict:
		"""
		payload esperado (ejemplos de keys aceptadas):
		- id_reporte (str|int)  <-- identificador del front para idempotencia
		- id_emisor (int)       <-- quien reporta (se inyecta en endpoint real)
		- tipo_reporte_id (int) <-- referencia al tipo de falla
		- descripcion (str)
		- lat, lon (float) opcionales
		- id_ruta_afectada (int) opcional
		- id_paradero_inicial (int) opcional
		- id_paradero_final (int) opcional
		- requiere_intervencion (bool) opcional
		"""
		if not self.repo:
			raise RuntimeError("ReporteFallaService requiere un repo en el constructor")

		# tipo_reporte_id es opcional; si viene, lo convertimos, si no lo dejamos None
		# normalize keys
		id_reporte = payload.get("id_reporte")
		if not id_reporte:
			# generar id_reporte único si el front no lo proporciona
			id_reporte = uuid.uuid4().hex
		id_reporte = str(id_reporte)
		# detectar key de tipo si existe
		if "tipo_reporte_id" in payload:
			tipo_key = "tipo_reporte_id"
		elif "id_tipo_reporte" in payload:
			tipo_key = "id_tipo_reporte"
		else:
			tipo_key = None
		if tipo_key is not None:
			try:
				tipo_reporte = int(payload.get(tipo_key))
			except Exception:
				raise ValueError("tipo_reporte_id debe ser entero")
		else:
			tipo_reporte = None

		# idempotencia: si ya existe un reporte con ese id_reporte -> conflicto
		existing = self.repo.find_report_by_id_reporte(id_reporte)
		if existing:
			raise KeyError("Reporte duplicado")

		# Validaciones referenciales mínimas: si vienen paraderos, comprobar existencia
		if payload.get("id_paradero_inicial") is not None:
			try:
				p_init = int(payload.get("id_paradero_inicial"))
			except Exception:
				raise ValueError("id_paradero_inicial debe ser entero")
			if not self.repo.get_paradero_by_id(p_init):
				raise ValueError("paradero_inicial no existe")

		if payload.get("id_paradero_final") is not None:
			try:
				p_final = int(payload.get("id_paradero_final"))
			except Exception:
				raise ValueError("id_paradero_final debe ser entero")
			if not self.repo.get_paradero_by_id(p_final):
				raise ValueError("paradero_final no existe")

		# construir record acorde a la tabla 'reporte' (ver models/Reporte.py)
		now = datetime.utcnow().isoformat()
		record = {
			"id_reporte": id_reporte,
			"descripcion": payload.get("descripcion"),
			"id_emisor": int(payload.get("id_emisor", 0)) if payload.get("id_emisor") is not None else None,
			"id_tipo_reporte": tipo_reporte,
			"id_ruta_afectada": int(payload.get("id_ruta_afectada")) if payload.get("id_ruta_afectada") is not None else None,
			"id_paradero_inicial": int(payload.get("id_paradero_inicial")) if payload.get("id_paradero_inicial") is not None else None,
			"id_paradero_final": int(payload.get("id_paradero_final")) if payload.get("id_paradero_final") is not None else None,
			"requiere_intervencion": bool(payload.get("requiere_intervencion", False)),
			"es_critica": bool(payload.get("es_critica", False)) if payload.get("es_critica") is not None else None,
			"tiempo_retraso_min": int(payload.get("tiempo_retraso_min")) if payload.get("tiempo_retraso_min") is not None else None,
			"fecha": now,
		}

		# eliminar keys None para que el repo solo inserte columnas válidas
		record = {k: v for k, v in record.items() if v is not None}

		saved = self.repo.save_report(record)

		# Si vienen archivos, intentar subirlos y registrar URLs
		if files:
			reporte_db_id = saved.get("id_reporte") or saved.get("id") or saved.get("id_reporte")
			reporte_ident = reporte_db_id or id_reporte
			uploads_root = Path(os.getenv("UPLOADS_DIR", "uploads"))
			dest_root = uploads_root / "reportes" / str(reporte_ident)
			dest_root.mkdir(parents=True, exist_ok=True)
			for f in files:
				try:
					filename = getattr(f, "filename", None) or getattr(f, "name", None) or f"file-{uuid.uuid4().hex}.bin"
					data = None
					try:
						data = f.file.read()
					except Exception:
						try:
							data = f.read()
						except Exception:
							data = None

					if data is None:
						continue

					file_path = dest_root / filename
					with open(file_path, "wb") as fh:
						fh.write(data)
					# no hacemos inserción en tabla de fotos aquí; si quieres que se persista,
					# agrega un método en el repo y lo llamamos aquí.
				except Exception as e:
					print("[WARN] fallo al procesar archivo:", e)

		return saved

	# helper usado por endpoint de pruebas (no depende de auth)
	def crear_reporte_falla_test(self, payload: Dict) -> Dict:
		# en test permitimos que id_emisor venga en el payload o default 0
		return self.crear_reporte_falla(payload, files=payload.get("files"))
