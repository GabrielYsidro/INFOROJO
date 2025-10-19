import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";
export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

/**
 * Actualiza la ubicación del corredor en el backend.
 * @param corredorId ID del corredor (bus)
 * @param lat Latitud actual
 * @param lng Longitud actual
 * @param estado Estado del corredor (ej. "En ruta")
 */
export const actualizarUbicacionCorredor = async (
  corredorId: number,
  lat: number,
  lng: number,
  estado: string
) => {
  console.log(`📡 Actualizando ubicación corredor ${corredorId}:`, lat, lng);

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
    console.error("❌ Error del servidor:", errorData);
    throw new Error(errorData.detail || "Error al actualizar la ubicación");
  }

  const data = await res.json();
  console.log("✅ Ubicación actualizada correctamente:", data);
  return data;
};

export default {
  actualizarUbicacionCorredor,
};
