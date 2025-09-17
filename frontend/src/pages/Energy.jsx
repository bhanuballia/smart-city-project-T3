import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API, { setAuthHeader } from "../services/api";
import socket from "../services/socket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

export default function Energy() {
  const [energyData, setEnergyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedSector, setSelectedSector] = useState("All");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Set authentication header before making requests
    const token = localStorage.getItem("token");
    if (token) {
      setAuthHeader(token);
    }

    if (user) {
      fetchEnergy();
    }

    socket.on("energy:new", (newData) => {
      console.log("received energy:new", newData);
      const normalized = {
        ...newData,
        usage: Number(newData.usage),
        createdAt: newData.createdAt || new Date().toISOString(),
        _id: newData._id || Math.random().toString(36).substring(2, 9),
        sector: newData.sector || "Residential",
        status: newData.status || getEnergyStatus(newData.usage),
        efficiency: newData.efficiency || Math.floor(Math.random() * 30) + 70,
        cost: newData.cost || (newData.usage * 0.12).toFixed(2),
      };
      setEnergyData((prev) => [normalized, ...prev.slice(0, 99)]); // Keep last 100 records
      setLastUpdate(new Date());
    });

    return () => socket.off("energy:new");
  }, [user]);

  const getEnergyStatus = (usage) => {
    if (usage <= 50) return "Normal";
    if (usage <= 80) return "High Load";
    return "Critical";
  };

  const fetchEnergy = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      setAuthHeader(token);
      const res = await API.get("/api/energy");
      const normalized = res.data.map((item) => ({
        ...item,
        usage: Number(item.usage),
        sector: item.sector || "Residential",
        status: item.status || getEnergyStatus(item.usage),
        efficiency: item.efficiency || Math.floor(Math.random() * 30) + 70,
        cost: item.cost || (item.usage * 0.12).toFixed(2),
      }));
      setEnergyData(normalized);
    } catch (err) {
      console.error("Error fetching energy data:", err);
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        console.log("Authentication failed, redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      
      // Set sample data if API fails
      setEnergyData([
        {
          _id: "1",
          usage: 85,
          status: "Critical",
          sector: "Industrial",
          efficiency: 75,
          cost: "10.20",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          usage: 45,
          status: "Normal",
          sector: "Residential",
          efficiency: 88,
          cost: "5.40",
          createdAt: new Date(Date.now() - 300000).toISOString(),
        },
        {
          _id: "3",
          usage: 65,
          status: "High Load",
          sector: "Commercial",
          efficiency: 82,
          cost: "7.80",
          createdAt: new Date(Date.now() - 600000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format data for Line Chart
  const chartData = energyData
    .slice()
    .reverse() // oldest → newest
    .map((item) => ({
      timestamp: new Date(item.createdAt).toLocaleTimeString(),
      usage: item.usage,
      sector: item.sector,
      status: item.status,
      efficiency: item.efficiency,
    }));

  // Aggregate by sector + status for stacked bar chart
  const sectorComparison = Object.values(
    energyData.reduce((acc, item) => {
      if (!acc[item.sector]) {
        acc[item.sector] = {
          sector: item.sector,
          Normal: 0,
          "High Load": 0,
          Critical: 0,
        };
      }
      acc[item.sector][item.status] += item.usage;
      return acc;
    }, {})
  );

  // Status distribution for pie chart
  const statusData = Object.values(
    energyData.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = { name: item.status, value: 0, color: getStatusColor(item.status) };
      }
      acc[item.status].value += 1;
      return acc;
    }, {})
  );

  function getStatusColor(status) {
    switch (status) {
      case "Normal": return "#10B981";
      case "High Load": return "#F59E0B";
      case "Critical": return "#EF4444";
      default: return "#6B7280";
    }
  }

  const getEnergyLevelStatus = (usage) => {
    if (usage <= 50) return { status: "Normal", color: "text-green-500", bg: "bg-green-500/20" };
    if (usage <= 80) return { status: "High Load", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    return { status: "Critical", color: "text-red-500", bg: "bg-red-500/20" };
  };

  const currentUsage = energyData[0]?.usage || 0;
  const usageStatus = getEnergyLevelStatus(currentUsage);
  const totalUsage = energyData.reduce((sum, item) => sum + item.usage, 0);
  const averageEfficiency = energyData.length > 0 
    ? Math.round(energyData.reduce((sum, item) => sum + item.efficiency, 0) / energyData.length)
    : 0;
  const totalCost = energyData.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
  const sectors = ["All", ...new Set(energyData.map(item => item.sector))];

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
              Energy Management
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Smart Grid Monitoring
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real-time energy consumption monitoring and grid optimization across Smart City Lucknow
            </p>
          </div>

          {/* Current Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Current Usage</h3>
              <div className={`text-3xl font-bold ${usageStatus.color}`}>
                {currentUsage} kWh
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${usageStatus.bg} ${usageStatus.color} mt-2`}>
                {usageStatus.status}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Total Usage</h3>
              <div className="text-3xl font-bold text-white">
                {totalUsage.toFixed(1)} kWh
              </div>
              <div className="text-white/60 text-sm mt-1">
                Today's Total
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">🔋</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Efficiency</h3>
              <div className="text-3xl font-bold text-white">
                {averageEfficiency}%
              </div>
              <div className="text-white/60 text-sm mt-1">
                Grid Efficiency
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Total Cost</h3>
              <div className="text-3xl font-bold text-white">
                ₹{totalCost.toFixed(2)}
              </div>
              <div className="text-white/60 text-sm mt-1">
                Today's Cost
              </div>
            </div>
          </div>

          {/* Sector Filter */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedSector === sector
                      ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-black shadow-lg"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 text-black hover:bg-white/20"
                  }`}
                >
                  {sector}
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
            <p className="text-white/60 mt-4">Loading energy data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Usage Trend Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Energy Usage Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
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
                  <Area 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Energy Status Distribution</h3>
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

            {/* Sector Comparison Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Sector-Based Consumption</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="sector" stroke="#9CA3AF" />
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
                  <Bar dataKey="High Load" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="Critical" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Energy Records */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Energy Records</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {energyData.slice(0, 10).map((item) => {
                  const status = getEnergyLevelStatus(item.usage);
                  return (
                    <div key={item._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{item.sector}</div>
                          <div className="text-white/60 text-sm">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${status.color}`}>
                            {item.usage} kWh
                          </div>
                          <div className="text-white/60 text-sm">
                            ₹{item.cost} • {item.efficiency}% eff.
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
