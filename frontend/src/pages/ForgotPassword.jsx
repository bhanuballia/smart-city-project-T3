import React, { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    try {
      const res = await API.post("/api/auth/forgot-password", { email });
      setStatus({ type: "success", message: res.data?.message || "If this email exists, a reset link was sent." });
    } catch (err) {
      const code = err?.response?.status;
      if (code === 404 || code === 501) {
        setStatus({ type: "error", message: "Password reset not configured. Please contact an administrator." });
      } else {
        setStatus({ type: "error", message: err?.response?.data?.error || "Failed to send reset email." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password</h1>
        {status.message && (
          <p className={`${status.type === "success" ? "text-green-600" : "text-red-600"} text-sm mb-3`}>
            {status.message}
          </p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}




