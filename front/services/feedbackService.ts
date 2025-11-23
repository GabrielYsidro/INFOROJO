import { API_URL } from "./ReporteService";

export async function sendFeedback(body: Record<string, any>, options?: { xUserId?: string; token?: string }) {
  const url = `${API_URL}/feedback/crearFeedback`;
  console.log("🌐 Enviando feedback a:", url);
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

export async function getFeedback(options?: { token?: string }) {
  const url = `${API_URL}/feedback/obtenerFeedback`;
  console.log("🌐 Obteniendo feedback desde:", url);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) throw { status: res.status, body: data };
  return data;
}