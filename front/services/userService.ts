import { API_URL_DEV, API_URL_PROD } from '@env';

const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

const getUsers = async (userId: number) =>{
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.json();
}

export default {
    getUsers,
};