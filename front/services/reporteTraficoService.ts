import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;
//export const API_URL =  API_URL_PROD;

/**
 * Envía un reporte de tráfico (retraso) al backend.
 */
export const enviarReporteTrafico = async (
  conductor_id: number,
  ruta_id: number,
  paradero_inicial_id: number,
  paradero_final_id: number,
  tiempo_retraso_min: number,
  descripcion: string
) => {
  console.log("🚦 Enviando reporte de tráfico a:", `${API_URL}/reports/retraso`);
  console.log("👤 Conductor:", conductor_id);

  const res = await fetch(`${API_URL}/reports/retraso`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": conductor_id.toString(), // para compatibilidad con backend
    },
    body: JSON.stringify({
      conductor_id,
      ruta_id,
      paradero_inicial_id,
      paradero_final_id,
      tiempo_retraso_min,
      descripcion,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ Error en respuesta:", errorData);
    throw new Error(errorData.detail || "No se pudo enviar el reporte de tráfico.");
  }

  const data = await res.json();
  console.log("✅ Reporte de tráfico registrado:", data);
  return data;
};

/**
 * Obtiene todos los reportes de tráfico (opcional para el regulador).
 */
export const listarReportesTrafico = async () => {
  console.log("📡 Obteniendo reportes de tráfico desde:", `${API_URL}/reports/retraso`);

  const res = await fetch(`${API_URL}/reports/retraso`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("No se pudieron obtener los reportes de tráfico.");
  }

  return res.json(); // devuelve lista de reportes
};

/**
 * Obtiene el último reporte de tráfico registrado para un corredor específico.
 * @param corredor Nombre o código del corredor (por ejemplo, "Corredor Rojo").
 */
export const obtenerUltimoReportePorCorredor = async (corredor: number) => {
  console.log("📡 Obteniendo último reporte del corredor:", corredor);

  const url = `${API_URL}/reports/retraso/${encodeURIComponent(
    corredor
  )}`;

  console.log("🔗 URL final:", url);

  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("❌ Error al obtener último reporte:", err);
    throw new Error(err.detail || "No encontrado.");
  }

  return res.json();
};


export default {
  enviarReporteTrafico,
  listarReportesTrafico,
  obtenerUltimoReportePorCorredor
};
