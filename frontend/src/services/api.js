// src/services/api.js
import axios from "axios";

function normalizeBaseUrl(url) {
  const fallback = "http://localhost:5000";
  const raw = url || fallback;
  try {
    const u = new URL(raw);
    let base = `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}${u.pathname}`;
    // Remove trailing slash
    if (base.endsWith("/")) base = base.slice(0, -1);
    // Remove trailing /api to avoid double /api in requests
    if (base.toLowerCase().endsWith("/api")) base = base.slice(0, -4);
    return base;
  } catch {
    // If it's not a valid URL, return as-is
    return raw.replace(/\/$/, "").replace(/\/api$/i, "");
  }
}

const API = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
});

// 🔹 Attach token for all requests
export const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// 🔹 Clear token (on logout)
export const clearAuthHeader = () => {
  delete API.defaults.headers.common["Authorization"];
};

export default API;
