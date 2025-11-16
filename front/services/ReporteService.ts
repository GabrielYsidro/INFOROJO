import Constants from "expo-constants";

const API_URL_DEV = Constants.expoConfig?.extra?.API_URL_DEV;
const API_URL_PROD = Constants.expoConfig?.extra?.API_URL_PROD;


const isDev = process.env.NODE_ENV !== 'production';

export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

export async function enviarDesvio(body: Record<string, any>, options?: { xUserId?: string; token?: string }) {
  const url = `${API_URL}/reports/desvio`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (options?.xUserId) headers["X-User-Id"] = options.xUserId;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw { status: res.status, body: data };
  return data;
}