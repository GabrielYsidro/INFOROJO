import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

export const getDashboard = async (days_amount:number) => {
    const res = await fetch(`${API_URL}/dashboard/${days_amount}/`, {
        method: 'GET',
      });
    
      if (!res.ok) throw new Error('No se pudo obtener el usuario');
    
      return res.json();
}