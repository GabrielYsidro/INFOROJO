import AsyncStorage from "@react-native-async-storage/async-storage";

const backendUrl = "http://10.0.2.2:8000"; // ⚠️ Usa tu IP local o dominio FastAPI

export const getUbicacionService = {
  async getUbicacionUsuario(): Promise<{ latitud: number; longitud: number } | null> {
    try {
      const idStr = await AsyncStorage.getItem("userId");
      if (!idStr) throw new Error("No se encontró el ID de usuario en AsyncStorage");
      const id_usuario = parseInt(idStr, 10);

      const response = await fetch(`${backendUrl}/usuario/${id_usuario}/ubicacion`);

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Error al obtener la ubicación");
      }

      const { latitud, longitud } = data;
      return { latitud, longitud };
    } catch (error) {
      console.error("Error en ubicacionService.getUbicacionUsuario:", error);
      return null;
    }
  },
};
export default getUbicacionService;
