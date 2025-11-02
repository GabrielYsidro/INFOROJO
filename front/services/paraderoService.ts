import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";
export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

export interface Paradero {
    id_paradero: number;
    nombre: string;
    coordenada_lat: number;
    coordenada_lng: number;
    colapso_actual: boolean;
}

export const getAllParaderos = async (): Promise<Paradero[]> => {
    console.log(`📡 Solicitando lista de paraderos desde: ${API_URL}/paradero`);

    const res = await fetch(`${API_URL}/paradero`, {
        method: "GET",
    });

    if (!res.ok) {
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

    console.log(`✅ Se obtuvieron ${filteredParaderos.length} paraderos válidos (filtrados de ${data.length})`);
    return filteredParaderos;
}

export default {
    getAllParaderos,
};
