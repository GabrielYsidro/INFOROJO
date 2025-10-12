import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;

//const API_URL_DEV = "http://10.0.2.2:8000";
//const API_URL_PROD= "https://backend-inforojo-ckh4hedjhqdtdfaq.eastus-01.azurewebsites.net"

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

const getUsers = async (userId: number) =>{
    const res = await fetch(`${API_URL}/usuario/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.json();
}

const getUserHistorial = async (userId: number) => {
    const res = await fetch(`${API_URL}/usuario/${userId}/historial`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.json();
}

export default {
    getUsers,
    getUserHistorial,
};