import React, { useEffect, useState } from "react";
import API from "../services/api";
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
} from "recharts";

export default function Air() {
  const [airData, setAirData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAir();

    // Listen for real-time updates
    socket.on("air:new", (newData) => {
      const normalized = {
        ...newData,
        AQI: Number(newData.AQI),
        createdAt: newData.createdAt || new Date().toISOString(),
        _id: newData._id || Math.random().toString(36).substring(2, 9),
      };
      setAirData((prev) => [normalized, ...prev.slice(0, 49)]); // Keep only last 50 records
      setLastUpdate(new Date());
    });

    return () => socket.off("air:new");
  }, []);

  const fetchAir = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/air");
      setAirData(res.data || []);
    } catch (err) {
      console.error("Error fetching air data:", err);
      // Set sample data if API fails
      setAirData([
        {
          _id: "1",
          city: "Lucknow",
          AQI: 85,
          category: "Moderate",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          city: "Delhi",
          AQI: 120,
          category: "Unhealthy",
          createdAt: new Date(Date.now() - 300000).toISOString(),
        },
        {
          _id: "3",
          city: "Mumbai",
          AQI: 65,
          category: "Good",
          createdAt: new Date(Date.now() - 600000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for Line Chart (time series)
  const chartData = airData
    .slice()
    .reverse() // oldest → newest
    .map((item) => ({
      timestamp: new Date(item.createdAt).toLocaleTimeString(),
      AQI: item.AQI,
      city: item.city,
      category: item.category,
    }));

  // Aggregate by city for Bar Chart
  const cityComparison = Object.values(
    airData.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = { city: item.city, total: 0, count: 0 };
      }
      acc[item.city].total += item.AQI;
      acc[item.city].count += 1;
      return acc;
    }, {})
  ).map((entry) => ({
    city: entry.city,
    avgAQI: Math.round(entry.total / entry.count),
  }));

  // Prepare data for pie chart (AQI categories)
  const categoryData = Object.values(
    airData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { name: item.category, value: 0, color: getCategoryColor(item.category) };
      }
      acc[item.category].value += 1;
      return acc;
    }, {})
  );

  function getCategoryColor(category) {
    switch (category) {
      case "Good": return "#10B981";
      case "Moderate": return "#F59E0B";
      case "Unhealthy": return "#EF4444";
      case "Hazardous": return "#7C2D12";
      default: return "#6B7280";
    }
  }

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { status: "Good", color: "text-green-500", bg: "bg-green-500/20" };
    if (aqi <= 100) return { status: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    if (aqi <= 150) return { status: "Unhealthy", color: "text-orange-500", bg: "bg-orange-500/20" };
    if (aqi <= 200) return { status: "Very Unhealthy", color: "text-red-500", bg: "bg-red-500/20" };
    return { status: "Hazardous", color: "text-red-700", bg: "bg-red-700/20" };
  };

  const currentAQI = airData[0]?.AQI || 0;
  const aqiStatus = getAQIStatus(currentAQI);

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
              Air Quality Monitor
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Real-Time Data
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Live air quality monitoring across Smart City Lucknow
            </p>
          </div>

          {/* Current Status Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🌬️</div>
                <h3 className="text-white/60 text-sm font-medium mb-1">Current AQI</h3>
                <div className={`text-4xl font-bold ${aqiStatus.color}`}>
                  {currentAQI}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${aqiStatus.bg} ${aqiStatus.color} mt-2`}>
                  {aqiStatus.status}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">📍</div>
                <h3 className="text-white/60 text-sm font-medium mb-1">Primary Location</h3>
                <div className="text-2xl font-bold text-white">
                  {airData[0]?.city || "Lucknow"}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  Smart City Center
                </div>
              </div>
              
              <div className="text-center">
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
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white/60 mt-4">Loading air quality data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AQI Trend Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">AQI Trend Over Time</h3>
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
                    dataKey="AQI"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* City Comparison Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">City-Wise Average AQI</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="city" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="avgAQI" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AQI Categories Distribution */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">AQI Categories Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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

            {/* Latest Records */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Latest Records</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {airData.slice(0, 10).map((record) => {
                  const status = getAQIStatus(record.AQI);
                  return (
                    <div key={record._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{record.city}</div>
                          <div className="text-white/60 text-sm">
                            {new Date(record.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${status.color}`}>
                            {record.AQI}
                          </div>
                          <div className={`text-sm font-medium ${status.color}`}>
                            {status.status}
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
