/**
 * Servicio para gestionar capas del mapa (activar/desactivar)
 * Se comunica con el backend para mantener estado persistente
 */

import { API_URL } from './mapaService';

export interface EstadoCapas {
  rutas: boolean;
  corredores: boolean;
  paraderos: boolean;
  alertas: boolean;
}

export interface RespuestaActivarDesactivar {
  status: 'success' | 'error';
  capa: string;
  activa: boolean;
  mensaje: string;
}

/**
 * Obtiene el estado actual de todas las capas desde el backend
 */
export async function obtenerEstadoCapas(): Promise<EstadoCapas> {
  try {
    const response = await fetch(`${API_URL}/api/mapa/capas/estado`);
    
    if (!response.ok) {
      console.error('Error al obtener estado de capas:', response.statusText);
      return {
        rutas: true,
        corredores: true,
        paraderos: true,
        alertas: true,
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerEstadoCapas:', error);
    return {
      rutas: true,
      corredores: true,
      paraderos: true,
      alertas: true,
    };
  }
}

/**
 * Activa una capa específica en el backend
 */
export async function activarCapa(capaId: string): Promise<RespuestaActivarDesactivar> {
  try {
    const response = await fetch(`${API_URL}/api/mapa/capas/${capaId}/activar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Error al activar capa ${capaId}:`, response.statusText);
      return {
        status: 'error',
        capa: capaId,
        activa: false,
        mensaje: `Error al activar la capa ${capaId}`,
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en activarCapa(${capaId}):`, error);
    return {
      status: 'error',
      capa: capaId,
      activa: false,
      mensaje: `Error de red al activar la capa ${capaId}`,
    };
  }
}

/**
 * Desactiva una capa específica en el backend
 */
export async function desactivarCapa(capaId: string): Promise<RespuestaActivarDesactivar> {
  try {
    const response = await fetch(`${API_URL}/api/mapa/capas/${capaId}/desactivar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Error al desactivar capa ${capaId}:`, response.statusText);
      return {
        status: 'error',
        capa: capaId,
        activa: true,
        mensaje: `Error al desactivar la capa ${capaId}`,
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en desactivarCapa(${capaId}):`, error);
    return {
      status: 'error',
      capa: capaId,
      activa: true,
      mensaje: `Error de red al desactivar la capa ${capaId}`,
    };
  }
}
