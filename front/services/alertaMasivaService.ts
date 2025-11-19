import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from './userService';

interface DatosFormulario {
    corredores: Array<{ id_corredor: number; nombre: string }>;
    rutas: Array<{ id_ruta: number; codigo: string; nombre: string }>;
    paraderos: Array<{ id_paradero: number; nombre: string }>;
}

interface AlertaMasivaPayload {
    descripcion: string;
    id_corredor_afectado?: number;
    es_critica?: boolean;
    requiere_intervencion?: boolean;
    id_ruta_afectada?: number;
    id_paradero_inicial?: number;
    id_paradero_final?: number;
    tiempo_retraso_min?: number;
}

/**
 * Obtiene los datos necesarios para el formulario (corredores, rutas, paraderos)
 */
export async function obtenerDatosFormulario(): Promise<DatosFormulario> {
    try {
        const url = `${API_URL}/alertas-masivas/datos-formulario`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al obtener datos del formulario: ${response.status}`);
        }

        const result = await response.json();
        return result.data || { corredores: [], rutas: [], paraderos: [] };
    } catch (error) {
        console.error('Error en obtenerDatosFormulario:', error);
        throw error;
    }
}

/**
 * Crea una nueva alerta masiva (reporte tipo "Otro")
 */
export async function crearAlertaMasiva(payload: AlertaMasivaPayload): Promise<any> {
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
                    : `Error al crear alerta masiva: ${response.status}`
            );
        }

        return data;
    } catch (error) {
        console.error('Error en crearAlertaMasiva:', error);
        throw error;
    }
}

export default {
    obtenerDatosFormulario,
    crearAlertaMasiva
};
