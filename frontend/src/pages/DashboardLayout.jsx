// DashboardLayout.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navigationItems = [
    { to: "/dashboard", label: "Dashboard", icon: "📊", color: "from-blue-500 to-blue-600" },
    { to: "/dashboard/traffic", label: "Traffic", icon: "🚦", color: "from-green-500 to-green-600" },
    { to: "/dashboard/waste", label: "Waste", icon: "♻️", color: "from-purple-500 to-purple-600" },
    { to: "/dashboard/energy", label: "Energy", icon: "⚡", color: "from-yellow-500 to-yellow-600" },
    { to: "/dashboard/air", label: "Air Quality", icon: "🌬️", color: "from-cyan-500 to-cyan-600" },
    { to: "/dashboard/emergency", label: "Emergency", icon: "🚨", color: "from-red-500 to-red-600" },
    { to: "/dashboard/optimize", label: "Optimize", icon: "🧠", color: "from-emerald-500 to-emerald-600" },
    { to: "/", label: "Home", icon: "🏠", color: "from-gray-500 to-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('/images/gomtifront1.jpg')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Mobile Header */}
      <div className="lg:hidden relative z-20 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <h1 className="text-lg font-bold text-white">Smart City</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="flex h-screen pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside className={`fixed lg:relative z-30 lg:z-10 w-80 lg:w-72 h-full bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Smart City</h1>
                  <p className="text-white/60 text-sm">Lucknow Dashboard</p>
                </div>
              </div>
              
              {/* User Info */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user?.name || user?.email || "User"}
                    </p>
                    <p className="text-white/60 text-sm truncate">
                      {user?.role || "Citizen"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Display */}
              <div className="mt-4 text-center">
                <div className="text-white/80 text-sm">
                  {currentTime.toLocaleDateString()}
                </div>
                <div className="text-white font-mono text-lg">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {({ isActive }) => isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20 space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
                  <div className="text-white font-bold text-sm">99.8%</div>
                  <div className="text-white/60 text-xs">Uptime</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
                  <div className="text-white font-bold text-sm">24/7</div>
                  <div className="text-white/60 text-xs">Monitoring</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 lg:p-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl h-full overflow-hidden">
              <div className="h-full overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
