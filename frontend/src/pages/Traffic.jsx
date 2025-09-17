import React, { useEffect, useState } from "react";
import API, { setAuthHeader } from "../services/api";
import socket from "../services/socket";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export default function Traffic() {
  const [trafficData, setTrafficData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h");

  useEffect(() => {
    // Set authentication header before making requests
    const token = localStorage.getItem("token");
    if (token) {
      setAuthHeader(token);
    }
    
    fetchTraffic();

    socket.on("traffic:new", (newData) => {
      console.log("received traffic:new", newData);
      const normalized = {
        ...newData,
        congestion: Number(newData.intensity),
        timestamp: new Date(newData.createdAt || Date.now()).toLocaleTimeString(),
        _id: newData._id || Math.random().toString(36).substring(2, 9),
        severity: newData.status || newData.severity,
        location: newData.location?.name || "City Center",
        speed: newData.speed || Math.floor(Math.random() * 60) + 20,
      };
      setTrafficData((prev) => [normalized, ...prev.slice(0, 99)]); // Keep last 100 records
      setLastUpdate(new Date());
    });

    return () => socket.off("traffic:new");
  }, []);

  const fetchTraffic = async () => {
    setIsLoading(true);
    try {
      // Make sure we have a token before making the request
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      setAuthHeader(token);
      const res = await API.get("/api/traffic");
      const normalized = res.data.map((t) => ({
        ...t,
        congestion: Number(t.intensity),
        timestamp: new Date(t.createdAt || Date.now()).toLocaleTimeString(),
        severity: t.status || t.severity,
        location: t.location?.name || "City Center",
        speed: t.speed || Math.floor(Math.random() * 60) + 20,
      }));
      setTrafficData(normalized);
    } catch (err) {
      console.error("Error fetching traffic data:", err);
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        console.log("Authentication failed, redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      
      // Set sample data if API fails
      setTrafficData([
        {
          _id: "1",
          congestion: 75,
          severity: "Heavy",
          location: "Hazratganj",
          speed: 25,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          _id: "2",
          congestion: 45,
          severity: "Moderate",
          location: "Gomti Nagar",
          speed: 40,
          timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
        },
        {
          _id: "3",
          congestion: 20,
          severity: "Light",
          location: "Alambagh",
          speed: 55,
          timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart Data
  const chartData = trafficData.slice().reverse(); // oldest → newest

  // Severity aggregation
  const severityCounts = trafficData.reduce((acc, t) => {
    acc[t.severity] = (acc[t.severity] || 0) + 1;
    return acc;
  }, {});
  const severityChart = Object.entries(severityCounts).map(([k, v]) => ({ 
    severity: k, 
    count: v,
    color: getSeverityColor(k)
  }));

  function getSeverityColor(severity) {
    switch (severity) {
      case "Light": return "#10B981";
      case "Moderate": return "#F59E0B";
      case "Heavy": return "#EF4444";
      case "Critical": return "#7C2D12";
      default: return "#6B7280";
    }
  }

  const getCongestionStatus = (congestion) => {
    if (congestion <= 30) return { status: "Light", color: "text-green-500", bg: "bg-green-500/20" };
    if (congestion <= 60) return { status: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    if (congestion <= 80) return { status: "Heavy", color: "text-orange-500", bg: "bg-orange-500/20" };
    return { status: "Critical", color: "text-red-500", bg: "bg-red-500/20" };
  };

  const currentCongestion = trafficData[0]?.congestion || 0;
  const congestionStatus = getCongestionStatus(currentCongestion);
  const averageSpeed = trafficData.length > 0 
    ? Math.round(trafficData.reduce((sum, t) => sum + (t.speed || 0), 0) / trafficData.length)
    : 0;

  const timeRanges = [
    { label: "1 Hour", value: "1h" },
    { label: "6 Hours", value: "6h" },
    { label: "24 Hours", value: "24h" },
    { label: "7 Days", value: "7d" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Modern Header */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Traffic Management
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Real-Time Monitoring
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Live traffic monitoring and congestion analysis across Smart City Lucknow
            </p>
          </div>

          {/* Current Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">🚦</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Current Congestion</h3>
              <div className={`text-3xl font-bold ${congestionStatus.color}`}>
                {currentCongestion}%
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${congestionStatus.bg} ${congestionStatus.color} mt-2`}>
                {congestionStatus.status}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">🏃</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Average Speed</h3>
              <div className="text-3xl font-bold text-white">
                {averageSpeed} km/h
              </div>
              <div className="text-white/60 text-sm mt-1">
                City Average
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Active Locations</h3>
              <div className="text-3xl font-bold text-white">
                {new Set(trafficData.map(t => t.location)).size}
              </div>
              <div className="text-white/60 text-sm mt-1">
                Monitored Areas
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">⏰</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Last Update</h3>
              <div className="text-lg font-bold text-white">
                {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="text-white/60 text-sm mt-1">
                {lastUpdate.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedTimeRange === range.value
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-black shadow-lg"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 text-black hover:bg-white/20"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white/60 mt-4">Loading traffic data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Congestion Trend Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Congestion Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                  <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="congestion" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Severity Distribution Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Traffic Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {severityChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Speed vs Congestion Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Speed vs Congestion</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Speed (km/h)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="congestion" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Congestion (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Location-based Traffic */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Location-based Traffic</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(
                  trafficData.reduce((acc, t) => {
                    if (!acc[t.location]) {
                      acc[t.location] = { 
                        location: t.location, 
                        congestion: t.congestion, 
                        speed: t.speed,
                        severity: t.severity,
                        count: 1 
                      };
                    } else {
                      acc[t.location].congestion = Math.round((acc[t.location].congestion + t.congestion) / 2);
                      acc[t.location].speed = Math.round((acc[t.location].speed + t.speed) / 2);
                      acc[t.location].count += 1;
                    }
                    return acc;
                  }, {})
                ).map(([key, data]) => {
                  const status = getCongestionStatus(data.congestion);
                  return (
                    <div key={key} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{data.location}</div>
                          <div className="text-white/60 text-sm">
                            {data.count} readings
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${status.color}`}>
                            {data.congestion}%
                          </div>
                          <div className="text-white/60 text-sm">
                            {data.speed} km/h
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
