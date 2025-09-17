// src/utils/auth.js

// Decode JWT safely
export function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // contains { id, email, name, role }
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
