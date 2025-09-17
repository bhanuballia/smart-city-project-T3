import { io } from "socket.io-client";

// Prefer dedicated socket URL; fall back to API URL; finally localhost
const rawBase = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

// Normalize to server ORIGIN only (strip any path like /api)
let socketBaseURL = rawBase;
try {
  const u = new URL(rawBase);
  socketBaseURL = `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}`;
} catch (_) {
  // leave as-is if URL constructor fails
}

const socket = io(socketBaseURL, {
  // Explicit default Socket.IO path
  path: "/socket.io",
  // Allow fallback to polling if websocket is blocked by proxy/firewall
  transports: ["websocket", "polling"],
  autoConnect: true,
  withCredentials: false,
});

// Basic diagnostics
socket.on("connect", () => {
  console.log("socket connected", socket.id);
});
socket.on("connect_error", (err) => {
  console.error("socket connect_error", err?.message || err);
});

export default socket;
