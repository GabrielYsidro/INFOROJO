import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== "production";
export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

export interface ParaderoInfo {
    id_paradero: number;
    nombre: string;
    imagen_url: string | null;
}

export interface Comment {
  id_comentario: number;
  nombre_usuario: string;
  created_at: string;
  comentario: string;
};

export const getCommentsByParadero = async (paradero_nombre: string): Promise<{paradero:ParaderoInfo, comentarios: Comment[]}> => {
  console.log(`📡 [START] Solicitando comentarios para paradero ID ${paradero_nombre} desde: ${API_URL}/paradero/${paradero_nombre}/comentarios`);
  const startTime = Date.now();

  try {
      console.log(`📡 [FETCH] Iniciando fetch...`);
      const res = await fetch(`${API_URL}/comentario_paradero/perfil/${paradero_nombre}/`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                  },
              });
        const data: {paradero:ParaderoInfo, comentarios: Comment[]} = await res.json();

        return data;
      
  } catch (error: any) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ [CATCH] Error después de ${elapsed}ms:`, {
          message: error.message,
          name: error.name,
          code: error.code,
      });
      throw error;
  }
}

export default {
    getCommentsByParadero,
};