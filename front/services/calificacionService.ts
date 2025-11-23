import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from './userService';

interface CalificacionPayload {
    id_historial: number;
    calificacion: number;
    descripcion?: string;
}

interface CalificacionResponse {
    success: boolean;
    data: {
        id_historial: number;
        calificacion: number;
        descripcion: string;
        mensaje: string;
    };
    message: string;
}

/**
 * Envía una calificación para un historial de uso específico
 */
export async function enviarCalificacion(payload: CalificacionPayload): Promise<CalificacionResponse> {
    try {
        console.log('📊 Enviando calificación:', payload);
        console.log('🌐 API URL:', API_URL);
        
        // Obtener el token de autenticación
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        const url = `${API_URL}/calificaciones/actualizar/`;
        console.log('📡 URL completa:', url);
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        console.log('📡 Response status:', response.status);

        const responseText = await response.text();
        console.log('📡 Response text:', responseText);
        
        let data: any;

        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }

        if (!response.ok) {
            throw new Error(
                typeof data === 'object' && data.detail 
                    ? data.detail 
                    : `Error al enviar calificación: ${response.status}`
            );
        }

        return data;
    } catch (error) {
        console.error('Error en enviarCalificacion:', error);
        throw error;
    }
}

/**
 * Obtiene la calificación de un historial específico
 */
export async function obtenerCalificacion(idHistorial: number): Promise<any> {
    try {
        const url = `${API_URL}/calificaciones/obtener/${idHistorial}/`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Historial no encontrado
            }
            throw new Error(`Error al obtener calificación: ${response.status}`);
        }

        const result = await response.json();
        return result.data || null;
    } catch (error) {
        console.error('Error en obtenerCalificacion:', error);
        throw error;
    }
}

/**
 * Obtiene estadísticas de calificaciones para un paradero específico o todos
 */
export async function obtenerEstadisticasCalificaciones(idParadero?: number): Promise<any> {
    try {
        let url = `${API_URL}/calificaciones/estadisticas/`;
        if (idParadero) {
            url += `?id_paradero=${idParadero}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al obtener estadísticas: ${response.status}`);
        }

        const result = await response.json();
        return result.data || {};
    } catch (error) {
        console.error('Error en obtenerEstadisticasCalificaciones:', error);
        throw error;
    }
}