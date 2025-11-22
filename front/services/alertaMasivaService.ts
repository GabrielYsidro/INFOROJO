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
        // Obtener corredores, rutas y paraderos de sus endpoints respectivos
        const [corredoresRes, rutasRes, paraderosRes] = await Promise.all([
            fetch(`${API_URL}/corredor/`, { method: 'GET' }),
            fetch(`${API_URL}/ruta/obtenerRutas`, { method: 'GET' }),
            fetch(`${API_URL}/paradero/`, { method: 'GET' })
        ]);

        if (!corredoresRes.ok || !rutasRes.ok || !paraderosRes.ok) {
            throw new Error('Error al obtener datos del formulario');
        }

        const [corredoresData, rutasData, paraderosData] = await Promise.all([
            corredoresRes.json(),
            rutasRes.json(),
            paraderosRes.json()
        ]);

        return {
            corredores: corredoresData.map((c: any) => ({
                id_corredor: c.id_corredor,
                nombre: c.nombre
            })),
            rutas: rutasData.map((r: any) => ({
                id_ruta: r.id_ruta,
                codigo: r.codigo,
                nombre: r.nombre
            })),
            paraderos: paraderosData.map((p: any) => ({
                id_paradero: p.id_paradero,
                nombre: p.nombre
            }))
        };
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
        // Obtener el token de autenticación
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        const url = `${API_URL}/alertas-masivas/enviar/`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

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
