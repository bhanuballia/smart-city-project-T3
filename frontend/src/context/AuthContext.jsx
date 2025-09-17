// frontend/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
// FIX: Import header functions from the api service
import API, { setAuthHeader, clearAuthHeader } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // FIX: Set auth header on initial load if token exists
      setAuthHeader(storedToken);
    }
  }, []);

  const login = async (email, password) => {
    // FIX: Added /api prefix to the login route
    const res = await API.post("/api/auth/login", { email, password });
    setUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);
    // FIX: Set the auth header for all subsequent API calls
    setAuthHeader(res.data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // FIX: Clear the auth header from the API service
    clearAuthHeader();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
