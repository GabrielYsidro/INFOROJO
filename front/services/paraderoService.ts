import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;
//export const API_URL =  API_URL_PROD;

export interface Paradero {
    id_paradero: number;
    nombre: string;
    coordenada_lat: number;
    coordenada_lng: number;
    colapso_actual: boolean;
}

export const getAllParaderos = async (): Promise<Paradero[]> => {
    console.log(`📡 [START] Solicitando lista de paraderos desde: ${API_URL}/paradero`);
    const startTime = Date.now();

    try {
        console.log(`📡 [FETCH] Iniciando fetch...`);
        
        const res = await fetch(`${API_URL}/paradero/`, {
            method: "GET",
        });

        const elapsed = Date.now() - startTime;
        console.log(`📡 [RESPONSE] Recibida en ${elapsed}ms, status: ${res.status}`);

        if (!res.ok) {
            console.error(`❌ [ERROR_HTTP] Status ${res.status}`);
            const errorData = await res.json().catch(() => ({}));
            console.error("❌ Error al obtener paraderos:", errorData);
            throw new Error(errorData.detail || "No se pudo obtener la lista de paraderos");
        }

        const data: Paradero[] = await res.json();
        
        const filteredParaderos = data.filter(paradero => 
            paradero.coordenada_lat !== null && 
            paradero.coordenada_lng !== null &&
            typeof paradero.coordenada_lat === 'number' &&
            typeof paradero.coordenada_lng === 'number'
        );

        const totalElapsed = Date.now() - startTime;
        console.log(`✅ [SUCCESS] Se obtuvieron ${filteredParaderos.length} paraderos en ${totalElapsed}ms (filtrados de ${data.length})`);
        return filteredParaderos;
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

export default {
    getAllParaderos,
};
