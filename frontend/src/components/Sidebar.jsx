import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Trash2,
  TrafficCone,
  Zap,
  Wind,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false); // ✅ collapse state

  // Decode JWT to get user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload); // contains { id, email, role, name? }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/dashboard/waste", label: "Waste", icon: <Trash2 size={20} /> },
    { path: "/dashboard/traffic", label: "Traffic", icon: <TrafficCone size={20} /> },
    { path: "/dashboard/energy", label: "Energy", icon: <Zap size={20} /> },
    { path: "/dashboard/air", label: "Air", icon: <Wind size={20} /> },
    { path: "/dashboard/emergency", label: "Emergency", icon: <AlertTriangle size={20} /> },
    { path: "/dashboard/optimize", label: "Optimize", icon: <Zap size={20} /> },
  ];

  return (
    <aside
      className={`h-screen bg-white shadow-md flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-800">
            {user?.name ? `Hi, ${user.name}` : "Welcome"}
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-200"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-2 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded-lg text-red-600 hover:bg-red-100"
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
