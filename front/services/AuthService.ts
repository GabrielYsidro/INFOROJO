import Constants from "expo-constants";

// const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
// const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

const API_URL_DEV = "http://10.0.2.2:8000";
const API_URL_PROD= "https://backend-inforojo-ckh4hedjhqdtdfaq.eastus-01.azurewebsites.net"

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

export const login = async (correo: string, dni: string) => {
  console.log('🌐 Intentando login en:', API_URL);
  console.log('📧 Email:', correo);
  console.log('🆔 DNI:', dni);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo: correo,
      dni: dni
     }),
  });

  if (!res.ok) throw new Error('Credenciales inválidas');

  return res.json(); // devuelve { token, user }
};

export default {
  login,
};