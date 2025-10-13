import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";
export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

/**
 * 🔹 Obtiene la información de un corredor (bus) por su ID.
 * @param corredor_id ID del corredor
 */
export const getBusInfo = async (corredor_id: number) => {
  console.log(`📡 Obteniendo información del corredor ${corredor_id} desde: ${API_URL}/corredor/${corredor_id}`);

  const res = await fetch(`${API_URL}/corredor/${corredor_id}`, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ Error al obtener información del corredor:", errorData);
    throw new Error(errorData.detail || "No se pudo obtener la información del corredor");
  }

  const data = await res.json();
  console.log("✅ Información obtenida correctamente:", data);
  return data;
};

/**
 * 🔹 Obtiene la lista completa de corredores activos.
 */
export const getAllBuses = async () => {
  console.log(`📡 Solicitando lista de corredores desde: ${API_URL}/corredor`);

  const res = await fetch(`${API_URL}/corredor`, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ Error al obtener corredores:", errorData);
    throw new Error(errorData.detail || "No se pudo obtener la lista de corredores");
  }

  const data = await res.json();

  // Filtra corredores con estado válido
  const corredoresValidos = data.filter(
    (c: any) => c.estado !== null && c.estado !== ""
  );

  console.log(`✅ Se obtuvieron ${corredoresValidos.length} corredores activos`);
  return corredoresValidos;
};

/**
 * 🔹 Actualiza la ubicación y el estado de un corredor.
 * @param corredorId ID del corredor
 * @param lat Latitud
 * @param lng Longitud
 * @param estado Estado actual (ej. "En ruta", "Detenido", etc.)
 */
export const updateBusLocation = async (
  corredorId: number,
  lat: number,
  lng: number,
  estado: string
) => {
  console.log(`📍 Actualizando ubicación de corredor ${corredorId}: (${lat}, ${lng})`);

  const res = await fetch(`${API_URL}/corredor/${corredorId}/ubicacion`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ubicacion_lat: lat,
      ubicacion_lng: lng,
      estado,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ Error al actualizar ubicación:", errorData);
    throw new Error(errorData.detail || "No se pudo actualizar la ubicación del corredor");
  }

  const data = await res.json();
  console.log("✅ Ubicación actualizada correctamente:", data);
  return data;
};

export default {
  getBusInfo,
  getAllBuses,
  updateBusLocation,
};
