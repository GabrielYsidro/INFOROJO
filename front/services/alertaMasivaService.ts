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
        console.log('🔍 [AlertaMasiva] Cargando datos del formulario...');
        console.log('🌐 [AlertaMasiva] API_URL:', API_URL);
        
        // Obtener corredores, rutas y paraderos de sus endpoints respectivos
        const [corredoresRes, rutasRes, paraderosRes] = await Promise.all([
            fetch(`${API_URL}/corredor/`, { method: 'GET' }),
            fetch(`${API_URL}/ruta/obtenerRutas`, { method: 'GET' }),
            fetch(`${API_URL}/paradero/`, { method: 'GET' })
        ]);

        console.log('📡 [AlertaMasiva] Status codes:', {
            corredores: corredoresRes.status,
            rutas: rutasRes.status,
            paraderos: paraderosRes.status
        });

        if (!corredoresRes.ok || !rutasRes.ok || !paraderosRes.ok) {
            throw new Error('Error al obtener datos del formulario');
        }

        const [corredoresData, rutasData, paraderosData] = await Promise.all([
            corredoresRes.json(),
            rutasRes.json(),
            paraderosRes.json()
        ]);

        console.log('✅ [AlertaMasiva] Datos obtenidos:', {
            corredores: corredoresData.length,
            rutas: rutasData.length,
            paraderos: paraderosData.length
        });

        console.log('📦 [AlertaMasiva] Datos raw:', {
            corredoresData,
            rutasData,
            paraderosData
        });

        return {
            corredores: corredoresData.map((c: any) => ({
                id_corredor: c.id_corredor,
                capacidad_max: c.capacidad_max,
                ubicacion_lat: c.ubicacion_lat,
                ubicacion_lng: c.ubicacion_lng,
                estado: c.estado
            })),
            rutas: rutasData.map((r: any) => ({
                id_ruta: r.id_ruta,
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
        console.log('📝 [AlertaMasiva] Guardando alerta...');
        console.log('📋 [AlertaMasiva] Payload:', payload);
        
        // Obtener el token de autenticación
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        console.log('🔑 [AlertaMasiva] Token obtenido');

        const url = `${API_URL}/alertas-masivas/enviar/`;
        console.log('📡 [AlertaMasiva] URL:', url);
        
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

/**
 * Envía una notificación push masiva a todos los usuarios.
 */
export async function enviarNotificacionAlertaMasiva(descripcion: string): Promise<any> {
    try {
        console.log('🔔 [AlertaMasiva] Enviando notificación...');
        console.log('📋 [AlertaMasiva] Descripción:', descripcion);
        
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        const url = `${API_URL}/alertas-masivas/enviar-notificacion/`;
        console.log('📡 [AlertaMasiva] URL de notificación:', url);
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Endpoint requiere autenticación
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ descripcion: descripcion }),
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
                    : `Error al enviar notificación masiva: ${response.status}`
            );
        }

        return data;
    } catch (error) {
        console.error('Error en enviarNotificacionAlertaMasiva:', error);
        throw error;
    }
}

export default {
    obtenerDatosFormulario,
    crearAlertaMasiva,
    enviarNotificacionAlertaMasiva
};
