/**
 * 🗺️ Servicio centralizado para obtener datos de visualización de mapa
 * 
 * Integra rutas, corredores, paraderos y alertas en una sola llamada.
 * Reduce la cantidad de requests al backend consolidando múltiples endpoints.
 */

import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";
export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

/**
 * Tipos de datos retornados por el endpoint de mapa
 */

export interface Coordenada {
  latitud: number;
  longitud: number;
}

export interface Ruta {
  id: number;
  nombre: string;
  tipo: "ruta";
}

export interface Corredor {
  id: number;
  id_corredor?: number; // Alias para compatibilidad
  nombre: string;
  latitud: number;
  longitud: number;
  tipo: "corredor";
  estado: string;
  capacidad_max: number;
  coordenada: Coordenada;
  // Alias para compatibilidad con MapSection.tsx que espera ubicacion_lat/ubicacion_lng
  ubicacion_lat?: number;
  ubicacion_lng?: number;
}

export interface Paradero {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  tipo: "paradero";
  colapso_actual: boolean;
  imagen_url?: string;
  coordenada: Coordenada;
  // Alias para compatibilidad con MapSection.tsx que espera coordenada_lat/coordenada_lng
  coordenada_lat?: number;
  coordenada_lng?: number;
  id_paradero?: number; // Compatibilidad con interfaz antigua
}

export interface Alerta {
  id: number;
  tipo: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  severidad: string;
  coordenada: Coordenada;
}

export interface MapMarkersResponse {
  rutas: Ruta[];
  corredores: Corredor[];
  paraderos: Paradero[];
  alertas: Alerta[];
}

/**
 * 🗺️ Obtiene todos los markers del mapa en una sola llamada
 * 
 * Respuesta incluye:
 * - rutas: Líneas de transporte disponibles
 * - corredores: Buses activos con ubicación
 * - paraderos: Paradas de bus con información de colapso
 * - alertas: Incidentes de tráfico, congestión, etc
 */
export const getMapMarkers = async (): Promise<MapMarkersResponse> => {
  console.log(`📡 [START] Obteniendo markers del mapa desde: ${API_URL}/api/mapa/markers`);
  const startTime = Date.now();

  try {
    console.log(`📡 [FETCH] Iniciando fetch...`);
    
    const res = await fetch(`${API_URL}/api/mapa/markers`, {
      method: "GET",
    });

    const elapsed = Date.now() - startTime;
    console.log(`📡 [RESPONSE] Recibida en ${elapsed}ms, status: ${res.status}`);

    if (!res.ok) {
      console.error(`❌ [ERROR_HTTP] Status ${res.status}`);
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ Error al obtener markers del mapa:", errorData);
      throw new Error(errorData.detail || "No se pudo obtener los markers del mapa");
    }

    const data: MapMarkersResponse = await res.json();
    
    // Agregar alias para compatibilidad con MapSection.tsx
    if (data.corredores) {
      data.corredores = data.corredores.map(corredor => ({
        ...corredor,
        id_corredor: corredor.id,
        ubicacion_lat: corredor.latitud,
        ubicacion_lng: corredor.longitud,
      }));
    }

    if (data.paraderos) {
      data.paraderos = data.paraderos.map(paradero => ({
        ...paradero,
        id_paradero: paradero.id,
        coordenada_lat: paradero.latitud,
        coordenada_lng: paradero.longitud,
      }));
    }

    const totalElapsed = Date.now() - startTime;
    console.log(`✅ [SUCCESS] Markers obtenidos en ${totalElapsed}ms:`, {
      rutas: data.rutas?.length ?? 0,
      corredores: data.corredores?.length ?? 0,
      paraderos: data.paraderos?.length ?? 0,
      alertas: data.alertas?.length ?? 0,
    });

    return data;
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ [CATCH] Error después de ${elapsed}ms:`, {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    throw error;
  }
};

/**
 * 🚌 Obtiene solo los paraderos (paradas de bus)
 * Útil si necesitas actualizar solo paraderos sin afectar otros layers
 */
export const getParaderosOnly = async (): Promise<Paradero[]> => {
  console.log(`📡 Obteniendo paraderos desde: ${API_URL}/api/mapa/paraderos`);
  const startTime = Date.now();

  try {
    const res = await fetch(`${API_URL}/api/mapa/paraderos`, {
      method: "GET",
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al obtener paraderos");
    }

    const data: Paradero[] = await res.json();
    
    // Agregar alias de compatibilidad
    const paraderos = data.map(paradero => ({
      ...paradero,
      id_paradero: paradero.id,
      coordenada_lat: paradero.latitud,
      coordenada_lng: paradero.longitud,
    }));

    console.log(`✅ [SUCCESS] ${paraderos.length} paraderos obtenidos en ${elapsed}ms`);
    return paraderos;
  } catch (error: any) {
    console.error(`❌ Error obteniendo paraderos:`, error.message);
    throw error;
  }
};

/**
 * 🚐 Obtiene solo los corredores (buses activos)
 * Útil para polling frecuente (cada 10 segs) de ubicaciones
 */
export const getCorredoresOnly = async (): Promise<Corredor[]> => {
  console.log(`📡 Obteniendo corredores desde: ${API_URL}/api/mapa/corredores`);
  const startTime = Date.now();

  try {
    const res = await fetch(`${API_URL}/api/mapa/corredores`, {
      method: "GET",
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al obtener corredores");
    }

    const data: Corredor[] = await res.json();
    
    // Agregar alias de compatibilidad
    const corredores = data.map(corredor => ({
      ...corredor,
      id_corredor: corredor.id,
      ubicacion_lat: corredor.latitud,
      ubicacion_lng: corredor.longitud,
    }));

    console.log(`✅ [SUCCESS] ${corredores.length} corredores obtenidos en ${elapsed}ms`);
    return corredores;;
  } catch (error: any) {
    console.error(`❌ Error obteniendo corredores:`, error.message);
    throw error;
  }
};

export default {
  getMapMarkers,
  getParaderosOnly,
  getCorredoresOnly,
};
