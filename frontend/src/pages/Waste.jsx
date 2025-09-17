import React, { useEffect, useState } from "react";
import API, { setAuthHeader } from "../services/api";
import socket from "../services/socket";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export default function Waste() {
  const [wasteData, setWasteData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState("All");

  useEffect(() => {
    // Set authentication header before making requests
    const token = localStorage.getItem("token");
    if (token) {
      setAuthHeader(token);
    }
    
    fetchWaste();

    socket.on("waste:new", (newData) => {
      console.log("received waste:new", newData);
      const normalized = {
        ...newData,
        level: Number(newData.level),
        timestamp: new Date(newData.createdAt || Date.now()).toLocaleTimeString(),
        _id: newData._id || Math.random().toString(36).substring(2, 9),
        zone: newData.zone || "Zone A",
        status: newData.status || getWasteStatus(newData.level),
        capacity: newData.capacity || 100,
      };
      setWasteData((prev) => [normalized, ...prev.slice(0, 99)]); // Keep last 100 records
      setLastUpdate(new Date());
    });

    socket.on("waste:update", (updated) => {
      console.log("received waste:update", updated);
      const normalized = {
        ...updated,
        level: Number(updated.level),
        timestamp: new Date(updated.createdAt || Date.now()).toLocaleTimeString(),
        status: updated.status || getWasteStatus(updated.level),
      };
      setWasteData((prev) => prev.map((w) => (w._id === normalized._id ? normalized : w)));
      setLastUpdate(new Date());
    });

    return () => {
      socket.off("waste:new");
      socket.off("waste:update");
    };
  }, []);

  const getWasteStatus = (level) => {
    if (level <= 30) return "Normal";
    if (level <= 80) return "Full";
    return "Overflow";
  };

  const fetchWaste = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      setAuthHeader(token);
      const res = await API.get("/api/waste");
      const normalized = res.data.map((w) => ({
        ...w,
        level: Number(w.level),
        timestamp: new Date(w.createdAt || Date.now()).toLocaleTimeString(),
        zone: w.zone || "Zone A",
        status: w.status || getWasteStatus(w.level),
        capacity: w.capacity || 100,
      }));
      setWasteData(normalized);
    } catch (err) {
      console.error("Error fetching waste data:", err);
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        console.log("Authentication failed, redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      
      // Set sample data if API fails
      setWasteData([
        {
          _id: "1",
          level: 85,
          status: "Overflow",
          zone: "Zone A",
          capacity: 100,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          _id: "2",
          level: 45,
          status: "Full",
          zone: "Zone B",
          capacity: 100,
          timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
        },
        {
          _id: "3",
          level: 20,
          status: "Normal",
          zone: "Zone C",
          capacity: 100,
          timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart Data
  const chartData = wasteData.slice().reverse();

  // Zone status aggregation
  const zoneStatus = wasteData.reduce((acc, w) => {
    if (!acc[w.zone]) {
      acc[w.zone] = { zone: w.zone, Normal: 0, Full: 0, Overflow: 0 };
    }
    acc[w.zone][w.status] += 1;
    return acc;
  }, {});
  const zoneChart = Object.values(zoneStatus);

  // Status distribution for pie chart
  const statusData = Object.values(
    wasteData.reduce((acc, w) => {
      if (!acc[w.status]) {
        acc[w.status] = { name: w.status, value: 0, color: getStatusColor(w.status) };
      }
      acc[w.status].value += 1;
      return acc;
    }, {})
  );

  function getStatusColor(status) {
    switch (status) {
      case "Normal": return "#10B981";
      case "Full": return "#F59E0B";
      case "Overflow": return "#EF4444";
      default: return "#6B7280";
    }
  }

  const getWasteLevelStatus = (level) => {
    if (level <= 30) return { status: "Normal", color: "text-green-500", bg: "bg-green-500/20" };
    if (level <= 80) return { status: "Full", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    return { status: "Overflow", color: "text-red-500", bg: "bg-red-500/20" };
  };

  const currentLevel = wasteData[0]?.level || 0;
  const levelStatus = getWasteLevelStatus(currentLevel);
  const averageLevel = wasteData.length > 0 
    ? Math.round(wasteData.reduce((sum, w) => sum + w.level, 0) / wasteData.length)
    : 0;
  const overflowCount = wasteData.filter(w => w.status === "Overflow").length;
  const zones = ["All", ...new Set(wasteData.map(w => w.zone))];

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
              Waste Management
              <span className="block bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
                Smart Monitoring
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real-time waste level monitoring and collection optimization across Smart City Lucknow
            </p>
          </div>

          {/* Current Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">🗑️</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Current Level</h3>
              <div className={`text-3xl font-bold ${levelStatus.color}`}>
                {currentLevel}%
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${levelStatus.bg} ${levelStatus.color} mt-2`}>
                {levelStatus.status}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Average Level</h3>
              <div className="text-3xl font-bold text-white">
                {averageLevel}%
              </div>
              <div className="text-white/60 text-sm mt-1">
                City Average
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Overflow Alerts</h3>
              <div className="text-3xl font-bold text-red-400">
                {overflowCount}
              </div>
              <div className="text-white/60 text-sm mt-1">
                Urgent Collections
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

          {/* Zone Filter */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedZone === zone
                      ? "bg-gradient-to-r from-green-600 to-purple-600 text-black shadow-lg"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 text-black hover:bg-white/20"
                  }`}
                >
                  {zone}
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
            <p className="text-white/60 mt-4">Loading waste data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Waste Level Trend Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Waste Level Trend</h3>
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
                    dataKey="level" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Waste Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
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

            {/* Zone Status Distribution */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Zone Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="zone" stroke="#9CA3AF" />
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
                  <Bar dataKey="Normal" stackId="a" fill="#10B981" />
                  <Bar dataKey="Full" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="Overflow" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Zone Details */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Zone Details</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(
                  wasteData.reduce((acc, w) => {
                    if (!acc[w.zone]) {
                      acc[w.zone] = { 
                        zone: w.zone, 
                        level: w.level, 
                        status: w.status,
                        capacity: w.capacity,
                        count: 1 
                      };
                    } else {
                      acc[w.zone].level = Math.round((acc[w.zone].level + w.level) / 2);
                      acc[w.zone].count += 1;
                    }
                    return acc;
                  }, {})
                ).map(([key, data]) => {
                  const status = getWasteLevelStatus(data.level);
                  return (
                    <div key={key} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{data.zone}</div>
                          <div className="text-white/60 text-sm">
                            {data.count} readings
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${status.color}`}>
                            {data.level}%
                          </div>
                          <div className={`text-sm font-medium ${status.color}`}>
                            {status.status}
                          </div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            data.level <= 30 ? 'bg-green-500' : 
                            data.level <= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${data.level}%` }}
                        ></div>
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
