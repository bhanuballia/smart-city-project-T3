// frontend/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

// Helper: decode JWT payload safely
const getUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));

    // Check token expiry (exp is in seconds, Date.now() is ms)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem("token"); // clear expired token
      return null;
    }

    return payload; // { id, email, role, exp }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token"); // cleanup invalid token
    return null;
  }
};

/**
 * ProtectedRoute
 * @param {children} JSX.Element – the component to render
 * @param {roles} array – allowed roles (optional)
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const user = getUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (roles.length > 0 && !roles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
