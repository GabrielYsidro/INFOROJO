import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL_DEV = "http://10.0.2.2:8000";
const API_URL_PROD = "https://backend-inforojo-ckh4hedjhqdtdfaq.eastus-01.azurewebsites.net";

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;
//export const API_URL =  API_URL_PROD;

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
        // Obtener el ID del usuario del AsyncStorage para autenticación
        const userDataStr = await AsyncStorage.getItem('user');
        let userId: string | null = null;

        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                userId = userData.id_usuario?.toString();
            } catch (e) {
                console.error('Error al parsear datos de usuario:', e);
            }
        }

        const url = `${API_URL}/calificaciones/actualizar`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Agregar el ID del usuario en los headers si está disponible
        if (userId) {
            headers['X-User-Id'] = userId;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
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
        const url = `${API_URL}/calificaciones/obtener/${idHistorial}`;
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
        let url = `${API_URL}/calificaciones/estadisticas`;
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