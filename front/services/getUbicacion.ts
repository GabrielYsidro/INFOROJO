import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;
//export const API_URL =  API_URL_PROD;

export const getUbicacionService = {
  async getUbicacionUsuario(): Promise<{ latitud: number; longitud: number } | null> {
    try {
      const idStr = await AsyncStorage.getItem("userId");
      if (!idStr) throw new Error("No se encontró el ID de usuario en AsyncStorage");
      const id_usuario = parseInt(idStr, 10);

      const response = await fetch(`${API_URL}/usuario/${id_usuario}/ubicacion`);

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
