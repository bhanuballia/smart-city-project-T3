import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Decode JWT to get user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload); // contains { id, email, role, name }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div>
          {/* Greeting */}
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {user?.name
                ? `Welcome, ${user.name}`
                : user?.email
                ? `Welcome, ${user.email}`
                : "Welcome"}
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 p-4">
            <Link to="/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/waste" className="hover:text-blue-600">
              Waste
            </Link>
            <Link to="/traffic" className="hover:text-blue-600">
              Traffic
            </Link>
            <Link to="/energy" className="hover:text-blue-600">
              Energy
            </Link>
            <Link to="/emergency" className="hover:text-blue-600">
              Emergency
            </Link>
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet /> {/* 👈 renders Dashboard, Waste, Traffic, etc */}
      </main>
    </div>
  );
}
