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
    id_usuario: number;
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

export const postComentario = async (token: string,paradero_id: number, comentario: string): Promise<{paradero:ParaderoInfo, comentarios: Comment[]}> => {
  console.log(`📡 [START] Añadiendo comentario para paradero ID ${paradero_id}`);
  const startTime = Date.now();

  try {
      console.log(`📡 [FETCH] Iniciando fetch...`);
      const res = await fetch(`${API_URL}/comentario_paradero/comentar/`, {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "authorization": `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                      id_paradero: paradero_id,
                      comentario,
                  }),
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

export const editComentario = async (token: string,comentario_id: number, nComentario: string) => {
    console.log(`📡 [START] Editando comentario ID ${comentario_id}`);
    const startTime = Date.now();

    try {
        console.log(`📡 [FETCH] Iniciando fetch...`);
        const res = await fetch(`${API_URL}/comentario_paradero/editar_comentario/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_comentario: comentario_id,
                        nuevo_texto: nComentario,
                    }),
                });
          const data = await res.json();

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

export const deleteComentario = async (token: string, comentario_id: number) => {
    console.log(`📡 [START] Eliminando comentario ID ${comentario_id}`);
    const startTime = Date.now();

    try {
        console.log(`📡 [FETCH] Iniciando fetch...`);
        const res = await fetch(`${API_URL}/comentario_paradero/eliminar_comentario/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_comentario: comentario_id,
                    }),
                });
          const data = await res.json();

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
    postComentario,
    editComentario,
    deleteComentario,
};