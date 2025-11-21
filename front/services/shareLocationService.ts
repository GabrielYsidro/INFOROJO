/**
 * Servicio para compartir ubicación por link temporal
 */

import { API_URL } from './getUbicacion';

export interface RespuestaCompartirUbicacion {
  token: string;
  share_url: string;
  expires_in_hours: number;
}

/**
 * Genera un link temporal para compartir la ubicación del usuario
 */
export async function generarLinkComparticion(usuarioId: number): Promise<RespuestaCompartirUbicacion> {
  try {
    const response = await fetch(`${API_URL}/api/usuario/${usuarioId}/location/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error al generar link de compartición:', response.statusText);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: RespuestaCompartirUbicacion = await response.json();
    console.log('✅ Link de compartición generado:', data);
    return data;
  } catch (error) {
    console.error('Error en generarLinkComparticion:', error);
    throw error;
  }
}

/**
 * Revoca un link de compartición
 */
export async function revocarLinkComparticion(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/location/${token}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error al revocar link:', response.statusText);
      return false;
    }

    console.log('✅ Link revocado correctamente');
    return true;
  } catch (error) {
    console.error('Error en revocarLinkComparticion:', error);
    return false;
  }
}
