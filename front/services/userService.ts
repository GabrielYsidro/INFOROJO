import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;
const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;
//export const API_URL =  API_URL_PROD;

const getUsers = async (userId: number) =>{
    const res = await fetch(`${API_URL}/usuario/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.json();
}


let historialCache: { [key: number]: any } = {};
const getUserHistorial = async (userId: number) => {
    if (historialCache[userId]) {
        return historialCache[userId];
    }
    const res = await fetch(`${API_URL}/usuario/${userId}/historial`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json();
    historialCache[userId] = data;
    return data;
}

export default {
    getUsers,
    getUserHistorial,
};