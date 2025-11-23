import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

export interface FiltrosData {
  ruta: string;
  distrito: string;
  distancia: string;
}

export interface Paradero {
  id_paradero: number;
  nombre?: string;
  coordenada_lat?: number;
  coordenada_lng?: number;
  colapso_actual?: boolean;
}

export interface RutaFiltrada {
  id_ruta: number;
  nombre: string;
  // lista opcional de paraderos asociada a la ruta (puede venir vacía o ausente)
  paraderos?: Paradero[];
}

// Nuevo: obtener paraderos directamente por id de ruta usando parámetro ruta_id
export const getParaderosPorRutaId = async (rutaId: number): Promise<Paradero[]> => {
  if (!rutaId || rutaId <= 0) return [];
  const params = new URLSearchParams();
  params.append('ruta_id', rutaId.toString());
  const url = `${API_URL}/ruta/filtrar?${params.toString()}`;
  const token = await AsyncStorage.getItem('token');
  console.log('[RutaId] Fetching paraderos de ruta', rutaId, 'URL:', url);
  try {
    const response = await fetch(url, { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    if (!response.ok) {
      const body = await response.text();
      console.error('[RutaId] Error HTTP', response.status, body);
      throw new Error(`HTTP_${response.status}`);
    }
    const data = await response.json();
    console.log('[RutaId] Paraderos recibidos (raw length):', Array.isArray(data) ? data.length : 'no-array');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[RutaId] Excepción obteniendo paraderos:', error);
    return [];
  }
};

export const aplicarFiltros = async (filtros: FiltrosData): Promise<RutaFiltrada[]> => {
  try {
    const params = new URLSearchParams();
    
    // Solo agregar parámetros que tengan valor
    if (filtros.ruta.trim()) {
      params.append('ruta', filtros.ruta.trim());
    }
    if (filtros.distrito.trim()) {
      params.append('distrito', filtros.distrito.trim());
    }
    if (filtros.distancia.trim()) {
      const distancia = parseFloat(filtros.distancia);
      if (!isNaN(distancia)) {
        params.append('distancia', distancia.toString());
      }
    }

  const url = `${API_URL}/ruta/filtrar?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
    throw error;
  }
};

export const obtenerRutasDisponibles = async (): Promise<RutaFiltrada[]> => {
  try {
    const response = await fetch(`${API_URL}/ruta/obtenerRutas`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    throw error;
  }
};
