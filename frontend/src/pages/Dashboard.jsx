import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { clearAuthHeader } from "../services/api";
import { getUserFromToken } from "../utils/auth";
import cachedApi from "../services/cachedApi.js";
import socket from "../services/socket.js";

const trafficData = [
  { name: "Mon", traffic: 320, incidents: 12 },
  { name: "Tue", traffic: 280, incidents: 8 },
  { name: "Wed", traffic: 310, incidents: 15 },
  { name: "Thur", traffic: 250, incidents: 6 },
  { name: "Fri", traffic: 300, incidents: 18 },
  { name: "Sat", traffic: 150, incidents: 4 },
  { name: "Sun", traffic: 100, incidents: 2 },
];

const airQualityData = [
  { name: "Good", value: 65, color: "#10B981" },
  { name: "Moderate", value: 25, color: "#F59E0B" },
  { name: "Unhealthy", value: 10, color: "#EF4444" },
];

const energyData = [
  { name: "Solar", value: 45, color: "#F59E0B" },
  { name: "Wind", value: 30, color: "#3B82F6" },
  { name: "Grid", value: 25, color: "#6B7280" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();

    // Listen for real-time updates
    socket.on("air:new", () => fetchDashboardData());
    socket.on("traffic:new", () => fetchDashboardData());
    socket.on("waste:new", () => fetchDashboardData());
    socket.on("energy:new", () => fetchDashboardData());

    return () => {
      socket.off("air:new");
      socket.off("traffic:new");
      socket.off("waste:new");
      socket.off("energy:new");
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearAuthHeader();
    navigate("/login", { replace: true });
  };

  const fetchDashboardData = async () => {
    try {
      const stats = await cachedApi.getDashboardStats();
      setDashboardStats(stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use real data instead of static data
  const stats = dashboardStats ? [
    {
      title: "Air Quality",
      value: dashboardStats.latest?.air?.category || "N/A",
      change: `${dashboardStats.latest?.air?.AQI || 0} AQI`,
      icon: "🌬️",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Traffic Flow", 
      value: dashboardStats.latest?.traffic?.status || "N/A",
      change: `${dashboardStats.latest?.traffic?.intensity || 0}%`,
      icon: "🚗",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Energy Usage",
      value: dashboardStats.latest?.energy?.usage != null
        ? `${dashboardStats.latest.energy.usage} kWh`
        : "N/A",
      change: dashboardStats.latest?.energy?.status || "—",
      icon: "⚡",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Incidents",
      value: dashboardStats.counts?.incidents ?? "N/A",
      change: dashboardStats.latest?.incidents?.status || "—",
      icon: "🚨",
      color: "from-red-500 to-red-600"
    }
  ] : [];

  const quickActions = [
    { name: "Traffic Management", icon: "🚦", link: "/dashboard/traffic", color: "from-blue-500 to-blue-600" },
    { name: "Air Quality", icon: " ", link: "/dashboard/air", color: "from-green-500 to-green-600" },
    { name: "Energy Monitor", icon: "⚡", link: "/dashboard/energy", color: "from-yellow-500 to-yellow-600" },
    { name: "Waste Management", icon: "♻️", link: "/dashboard/waste", color: "from-purple-500 to-purple-600" },
    { name: "Emergency", icon: "🚨", link: "/dashboard/emergency", color: "from-red-500 to-red-600" }
  ];

  const handleDownloadReport = (report) => {
    // Create sample report content based on the report type
    let content = '';
    let mimeType = '';
    let fileExtension = '';

    if (report.type === 'PDF') {
      // For PDF, we'll create a simple text file that can be opened as PDF
      content = generatePDFContent(report);
      mimeType = 'text/plain';
      fileExtension = 'txt';
    } else if (report.type === 'Excel') {
      // For Excel, we'll create a CSV file
      content = generateExcelContent(report);
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.filename.replace(/\.(pdf|xlsx)$/, `.${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFContent = (report) => {
    const currentDate = new Date().toLocaleDateString();
    return `
SMART CITY LUCKNOW - ${report.title.toUpperCase()}
Generated on: ${currentDate}
Report Date: ${report.date}

========================================

EXECUTIVE SUMMARY
This report provides comprehensive analysis of ${report.title.toLowerCase()} for Smart City Lucknow.

KEY FINDINGS:
• System performance is within normal parameters
• All metrics show positive trends
• No critical issues identified

DETAILED ANALYSIS:
1. Performance Metrics
   - Average response time: 2.3 seconds
   - System uptime: 99.8%
   - User satisfaction: 4.7/5

2. Recommendations
   - Continue monitoring system performance
   - Implement additional safety measures
   - Regular maintenance scheduled

3. Next Steps
   - Review findings with management team
   - Plan implementation of recommendations
   - Schedule follow-up review

========================================

Report prepared by: Smart City Management System
Contact: admin@smartcitylucknow.gov.in
    `.trim();
  };

  const generateExcelContent = (report) => {
    const currentDate = new Date().toLocaleDateString();
    return `Metric,Value,Unit,Status,Notes
Date,${report.date},,Current,Report generation date
Generated,${currentDate},,Current,System generation time
System Status,Online,,Good,All systems operational
Performance,95.2,%,Good,Above target threshold
Response Time,2.3,seconds,Good,Within acceptable range
Uptime,99.8,%,Excellent,Above SLA requirements
User Satisfaction,4.7,rating,Excellent,Based on user feedback
Incidents,0,count,Good,No critical incidents
Maintenance,Completed,,Good,Regular maintenance done
Recommendations,3,count,Pending,See detailed report`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Modern Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Smart City Dashboard
                </h1>
                <p className="text-white/60">
                  Welcome back, {user?.name || "User"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-medium">
                  {currentTime.toLocaleDateString()}
                </div>
                <div className="text-white/60 text-sm">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
              
              <Link
                to="/"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
              >
                🏠 Home
              </Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-6 py-3 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 items-center">
            {["overview", "analytics", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? "bg-blue/20 backdrop-blur-sm border-b-8 border-red-400 text-red"
                    : "text-blue/60 hover:text-red hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
            <Link
              to="/dashboard/optimize"
              className="ml-auto px-6 py-3 font-medium transition-all duration-300 rounded-xl bg-red-800/10 backdrop-blur-sm border border-red-500/10 text-white hover:bg-white/20"
            >
              ⚙️ Optimize
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.changeType === "positive" 
                        ? "bg-green-500/20 text-green-200" 
                        : "bg-red-500/20 text-red-200"
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-white/60 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`bg-gradient-to-r ${action.color} text-white p-6 rounded-2xl text-left  hover:scale-105 transition-all duration-300 transform shadow-lg hover:shadow-xl`}
                  >
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <div className="text-sm font-medium">{action.name}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traffic Chart */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Traffic Flow & Incidents</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white'
                      }} 
                    />
                    <Line type="monotone" dataKey="traffic" stroke="#3B82F6" strokeWidth={3} />
                    <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Air Quality Chart */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Air Quality Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={airQualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {airQualityData.map((entry, index) => (
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
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Energy Usage Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Energy Sources</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* System Status */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
              <div className="space-y-4">
                {[
                  { name: "Traffic System", status: "Online", color: "green" },
                  { name: "Air Quality Monitor", status: "Online", color: "green" },
                  { name: "Energy Grid", status: "Online", color: "green" },
                  { name: "Emergency Services", status: "Online", color: "green" },
                  { name: "Waste Management", status: "Maintenance", color: "yellow" },
                ].map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="text-white font-medium">{system.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      system.color === "green" 
                        ? "bg-green-500/20 text-green-200" 
                        : "bg-yellow-500/20 text-yellow-200"
                    }`}>
                      {system.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Weekly Traffic Report", date: "2024-01-15", type: "PDF", filename: "weekly-traffic-report.pdf" },
                { title: "Air Quality Analysis", date: "2024-01-14", type: "PDF", filename: "air-quality-analysis.pdf" },
                { title: "Energy Consumption", date: "2024-01-13", type: "Excel", filename: "energy-consumption.xlsx" },
                { title: "Incident Summary", date: "2024-01-12", type: "PDF", filename: "incident-summary.pdf" },
                { title: "Waste Management", date: "2024-01-11", type: "PDF", filename: "waste-management.pdf" },
                { title: "System Performance", date: "2024-01-10", type: "Excel", filename: "system-performance.xlsx" },
              ].map((report, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{report.title}</h4>
                    <span className="text-white/60 text-sm">{report.type}</span>
                  </div>
                  <p className="text-white/60 text-sm mb-3">{report.date}</p>
                  <button 
                    onClick={() => handleDownloadReport(report)}
                    className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-200 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                  >
                    🔗 Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
