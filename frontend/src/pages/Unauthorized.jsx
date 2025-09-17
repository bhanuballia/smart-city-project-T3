import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md mx-4">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-white/80 text-lg mb-6">
          You don't have permission to access the dashboard. Only Admin and Operator roles are allowed.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
          >
            Go to Home
          </Link>
          <Link
            to="/login"
            className="block w-full bg-blue-500/80 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Login with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}