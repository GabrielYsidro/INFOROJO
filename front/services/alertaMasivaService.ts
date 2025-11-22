import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL_DEV = "http://10.0.2.2:8000";
const API_URL_PROD = "https://backend-inforojo-ckh4hedjhqdtdfaq.eastus-01.azurewebsites.net";

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;
//export const API_URL =  API_URL_PROD;

interface TipoReporte {
    id_tipo_reporte: number;
    tipo: string;
}

interface Reporte {
    id_reporte: number;
    descripcion: string;
    fecha: string;
    es_critica: boolean;
    requiere_intervencion: boolean;
}

interface AlertaMasivaPayload {
    id_tipo_reporte: number;
    titulo?: string;
    descripcion?: string;
}

/**
 * Obtiene todos los tipos de reporte disponibles
 */
export async function obtenerTiposReporte(): Promise<TipoReporte[]> {
    try {
        const url = `${API_URL}/alertas-masivas/tipos-reporte`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al obtener tipos de reporte: ${response.status}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error en obtenerTiposReporte:', error);
        throw error;
    }
}

/**
 * Obtiene los reportes de un tipo específico
 */
export async function obtenerReportesPorTipo(idTipoReporte: number): Promise<Reporte[]> {
    try {
        const url = `${API_URL}/alertas-masivas/reportes/${idTipoReporte}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al obtener reportes: ${response.status}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error en obtenerReportesPorTipo:', error);
        throw error;
    }
}

/**
 * Envía una alerta masiva a todos los tipos de usuarios
 */
export async function enviarAlertaMasiva(payload: AlertaMasivaPayload): Promise<any> {
    try {
        // Obtener el ID del usuario del AsyncStorage
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

        const url = `${API_URL}/alertas-masivas/enviar`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Agregar el ID del usuario en los headers si está disponible
        if (userId) {
            headers['X-User-Id'] = userId;
        }

        // También incluir en el body como fallback
        const body = {
            ...payload,
            id_emisor: userId ? parseInt(userId) : undefined,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
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
                    : `Error al enviar alerta masiva: ${response.status}`
            );
        }

        return data;
    } catch (error) {
        console.error('Error en enviarAlertaMasiva:', error);
        throw error;
    }
}
