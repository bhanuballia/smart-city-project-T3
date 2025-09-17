import axios from "axios";

const API = axios.create({
  // FIX: Remove /api from the baseURL to prevent duplication
  baseURL: "http://localhost:5000",
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