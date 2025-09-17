// frontend/pages/AdminPanel.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import socket from "../../services/socket";

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Citizen" });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  
  // Complaint notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Complaint response state
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: "In Progress",
    resolution: "",
    expectedResolutionDate: ""
  });
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  
  // Announcement management state
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "General",
    priority: "Medium",
    location: "",
    expiresAt: ""
  });
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" or "announcements"

  // 🔹 ADD THIS LINE TO DEBUG
  console.log("User from AuthContext:", user);

  useEffect(() => {
    // The authorization check should happen before fetching
    if (user?.role === "Admin") {
      fetchUsers();
      fetchNotifications();
      fetchAnnouncements();
      setupSocketListeners();
    }
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    return () => {
      // Cleanup socket listeners
      socket.off("alert:new");
      socket.off("complaint:new");
      socket.off("announcement:new");
      socket.off("announcement:updated");
      socket.off("announcement:deleted");
    };
  }, [user]); // Re-run if the user object changes

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Added /api prefix to the URL
      const res = await API.get("/api/admin/users");
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.users) ? payload.users : [];
      setUsers(list);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Added /api prefix to the URL
      await API.post("/api/admin/users", form);
      setForm({ name: "", email: "", password: "", role: "Citizen" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      // Added /api prefix to the URL
      await API.put(`/api/admin/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // FIX: Changed "Admin" to "admin" in the URL path to match the server route
        await API.delete(`/api/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  // Notification functions
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/api/alerts");
      const complaintAlerts = res.data.filter(alert => alert.type === "Complaint");
      setNotifications(complaintAlerts);
      setUnreadCount(complaintAlerts.length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new complaint alerts
    socket.on("alert:new", (alert) => {
      if (alert.type === "Complaint") {
        setNotifications(prev => [alert, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("📝 New Complaint Submitted", {
            body: alert.message,
            icon: "/favicon.ico",
            tag: "complaint-notification"
          });
          
          notification.onclick = () => {
            window.focus();
            setShowNotifications(true);
          };
        }
      }
    });

    // Listen for new complaints directly
    socket.on("complaint:new", (complaint) => {
      const alert = {
        _id: `complaint-${complaint._id}`,
        type: "Complaint",
        message: `📝 New complaint #${complaint.complaintNumber}: ${complaint.problemRelated} issue in ${complaint.cityRegion}`,
        severity: complaint.priority,
        metadata: {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          problemType: complaint.problemRelated,
          location: complaint.cityRegion
        },
        createdAt: complaint.createdAt
      };
      
      setNotifications(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen for announcement updates
    socket.on("announcement:new", (announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    });

    socket.on("announcement:updated", (announcement) => {
      setAnnouncements(prev => 
        prev.map(ann => ann._id === announcement._id ? announcement : ann)
      );
    });

    socket.on("announcement:deleted", (announcementId) => {
      setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Complaint response functions
  const handleResponseToComplaint = (notification) => {
    setSelectedComplaint(notification);
    setResponseForm({
      status: "In Progress",
      resolution: "",
      expectedResolutionDate: ""
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSubmittingResponse(true);
    try {
      const complaintId = selectedComplaint.metadata?.complaintId;
      if (!complaintId) {
        throw new Error("Complaint ID not found");
      }

      const responseData = {
        status: responseForm.status,
        resolution: responseForm.resolution,
        expectedResolutionDate: responseForm.expectedResolutionDate
      };

      const response = await API.put(`/api/complaints/${complaintId}`, responseData);
      
      if (response.data.success) {
        // Update the notification to show it's been responded to
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === selectedComplaint._id 
              ? { ...notif, responded: true, response: responseForm }
              : notif
          )
        );
        
        // Close modal and reset form
        setShowResponseModal(false);
        setSelectedComplaint(null);
        setResponseForm({
          status: "In Progress",
          resolution: "",
          expectedResolutionDate: ""
        });
        
        alert("✅ Complaint response submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting complaint response:", error);
      alert("❌ Failed to submit response. Please try again.");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setSelectedComplaint(null);
    setResponseForm({
      status: "In Progress",
      resolution: "",
      expectedResolutionDate: ""
    });
  };

  // Announcement functions
  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/api/announcements");
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setAnnouncements([]);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setIsSubmittingAnnouncement(true);
    
    try {
      const response = await API.post("/api/announcements", announcementForm);
      
      if (response.data.success) {
        setAnnouncements(prev => [response.data.data, ...prev]);
        setAnnouncementForm({
          title: "",
          message: "",
          type: "General",
          priority: "Medium",
          location: "",
          expiresAt: ""
        });
        setShowAnnouncementModal(false);
        alert("✅ Announcement created successfully!");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("❌ Failed to create announcement. Please try again.");
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await API.delete(`/api/announcements/${id}`);
        setAnnouncements(prev => prev.filter(announcement => announcement._id !== id));
        alert("✅ Announcement deleted successfully!");
      } catch (err) {
        console.error("Failed to delete announcement:", err);
        alert("❌ Failed to delete announcement. Please try again.");
      }
    }
  };

  const handleToggleAnnouncementStatus = async (id, currentStatus) => {
    try {
      await API.put(`/api/announcements/${id}`, { isActive: !currentStatus });
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement._id === id 
            ? { ...announcement, isActive: !currentStatus }
            : announcement
        )
      );
      alert(`✅ Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error("Failed to update announcement status:", err);
      alert("❌ Failed to update announcement status. Please try again.");
    }
  };

  const openAnnouncementModal = () => {
    setAnnouncementForm({
      title: "",
      message: "",
      type: "General",
      priority: "Medium",
      location: "",
      expiresAt: ""
    });
    setShowAnnouncementModal(true);
  };

  const closeAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setAnnouncementForm({
      title: "",
      message: "",
      type: "General",
      priority: "Medium",
      location: "",
      expiresAt: ""
    });
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Get unique roles
  const roles = ["All", ...new Set(users.map(user => user.role))];

  // FIX: Changed "admin" to "Admin" to match the role from the database
  if (!user || user.role !== "Admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
          <div className="text-6xl mb-6"></div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/80 text-lg">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/60 to-slate-900/80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Modern Header */}
      <div className="relative z-10 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div className="text-center flex-1">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Admin Panel
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {activeTab === "users" ? "User Management" : "City Announcements"}
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                {activeTab === "users" 
                  ? "Manage users, roles, and permissions for Smart City Lucknow"
                  : "Create and manage important city announcements"
                }
              </p>
              
              {/* Tab Navigation */}
              <div className="flex justify-center mt-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === "users"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    👥 Users
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === "announcements"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    📢 Announcements
                  </button>
                </div>
              </div>
            </div>
            
            {/* Notification Bell */}
            <div className="relative notification-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-16 w-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-white/20 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Complaint Notifications</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-black/60 hover:text-black transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-black/60">
                        <div className="text-4xl mb-2">📝</div>
                        <p>No complaint notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 mb-2 rounded-xl border transition-all duration-200 hover:bg-white/5 ${
                            notification.responded
                              ? "border-green-500/30 bg-green-500/10"
                              : notification.severity === "High" || notification.severity === "Critical"
                              ? "border-red-500/30 bg-red-500/10"
                              : notification.severity === "Medium"
                              ? "border-yellow-500/30 bg-yellow-500/10"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-black text-sm font-medium mb-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                {notification.responded && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-200">
                                    ✅ Responded
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  notification.severity === "High" || notification.severity === "Critical"
                                    ? "bg-red-500/20 text-red-200"
                                    : notification.severity === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-200"
                                    : "bg-blue-500/20 text-blue-200"
                                }`}>
                                  {notification.severity}
                                </span>
                                <span>
                                  {new Date(notification.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {notification.metadata && (
                                <div className="mt-2 text-xs text-white/50">
                                  <p>Complaint #{notification.metadata.complaintNumber}</p>
                                  <p>Location: {notification.metadata.location}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResponseToComplaint(notification)}
                                className={`transition-colors text-sm font-medium ${
                                  notification.responded
                                    ? "text-blue-400 hover:text-blue-300"
                                    : "text-green-400 hover:text-green-300"
                                }`}
                                title={notification.responded ? "Update response" : "Respond to complaint"}
                              >
                                {notification.responded ? "✏️ Update" : "📝 Respond"}
                              </button>
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-white/40 hover:text-white transition-colors"
                                title="Mark as read"
                              >
                                ✓
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {/* Conditional Content Based on Active Tab */}
        {activeTab === "users" ? (
          <>
            {/* Create User Form */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New User</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <input
                type="text"
                placeholder="Full Name"
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <select
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="Citizen" className="text-gray-800">Citizen</option>
                <option value="Operator" className="text-gray-800">Operator</option>
                <option value="Admin" className="text-gray-800">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Creating..." : "✨ Create User"}
            </button>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedRole === role
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-black shadow-lg"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 text-black hover:bg-white/20"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="text-white/60 text-sm">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">All Users</h2>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white/60 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-2">No users found</h3>
              <p className="text-white/60">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-6 text-white font-semibold">User</th>
                    <th className="text-left p-6 text-white font-semibold">Email</th>
                    <th className="text-left p-6 text-white font-semibold">Role</th>
                    <th className="text-left p-6 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                    <tr key={u._id} className={`border-b border-white/10 hover:bg-white/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-white font-medium">{u.name}</div>
                            <div className="text-white/60 text-sm">ID: {u._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-white/80">{u.email}</td>
                      <td className="p-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                        >
                          <option value="Citizen" className="text-gray-800">Citizen</option>
                          <option value="Operator" className="text-gray-800">Operator</option>
                          <option value="Admin" className="text-gray-800">Admin</option>
                        </select>
                      </td>
                      <td className="p-6">
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-300"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        ) : (
          <>
            {/* Create Announcement Form */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Announcement</h2>
                <button
                  onClick={openAnnouncementModal}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  📢 Create Announcement
                </button>
              </div>
            </div>

            {/* Announcements List */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white">City Announcements</h2>
                <p className="text-white/60 mt-2">Manage important city messages and notifications</p>
              </div>
              
              {announcements.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No announcements yet</h3>
                  <p className="text-white/60">Create your first city announcement to get started</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className={`p-6 rounded-2xl border transition-all duration-200 ${
                        announcement.isActive
                          ? announcement.priority === "Critical"
                            ? "border-red-500/30 bg-red-500/10"
                            : announcement.priority === "High"
                            ? "border-orange-500/30 bg-orange-500/10"
                            : "border-green-500/30 bg-green-500/10"
                          : "border-gray-500/30 bg-gray-500/10"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              announcement.priority === "Critical"
                                ? "bg-red-500/20 text-red-200"
                                : announcement.priority === "High"
                                ? "bg-orange-500/20 text-orange-200"
                                : announcement.priority === "Medium"
                                ? "bg-yellow-500/20 text-yellow-200"
                                : "bg-blue-500/20 text-blue-200"
                            }`}>
                              {announcement.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              announcement.isActive
                                ? "bg-green-500/20 text-green-200"
                                : "bg-gray-500/20 text-gray-200"
                            }`}>
                              {announcement.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-white/80 mb-3">{announcement.message}</p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>Type: {announcement.type}</span>
                            {announcement.location && <span>Location: {announcement.location}</span>}
                            <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                            {announcement.expiresAt && (
                              <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleToggleAnnouncementStatus(announcement._id, announcement.isActive)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              announcement.isActive
                                ? "bg-orange-500/20 text-orange-200 hover:bg-orange-500/30"
                                : "bg-green-500/20 text-green-200 hover:bg-green-500/30"
                            }`}
                          >
                            {announcement.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement._id)}
                            className="bg-red-500/20 text-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-300"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Complaint Response Modal */}
      {showResponseModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">📝 Respond to Complaint</h2>
              <button
                onClick={closeResponseModal}
                className="text-white/60 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Complaint Details */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Complaint Details</h3>
              <div className="space-y-2 text-sm text-white/80">
                <p><strong>Complaint #:</strong> {selectedComplaint.metadata?.complaintNumber}</p>
                <p><strong>Problem Type:</strong> {selectedComplaint.metadata?.problemType}</p>
                <p><strong>Location:</strong> {selectedComplaint.metadata?.location}</p>
                <p><strong>Priority:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedComplaint.severity === "High" || selectedComplaint.severity === "Critical"
                      ? "bg-red-500/20 text-red-200"
                      : selectedComplaint.severity === "Medium"
                      ? "bg-yellow-500/20 text-yellow-200"
                      : "bg-blue-500/20 text-blue-200"
                  }`}>
                    {selectedComplaint.severity}
                  </span>
                </p>
              </div>
            </div>

            {/* Response Form */}
            <form onSubmit={handleSubmitResponse} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Status</label>
                <select
                  value={responseForm.status}
                  onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  required
                >
                  <option value="In Progress" className="text-gray-800">In Progress</option>
                  <option value="Resolved" className="text-gray-800">Resolved</option>
                  <option value="Closed" className="text-gray-800">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Admin Response Message</label>
                <textarea
                  value={responseForm.resolution}
                  onChange={(e) => setResponseForm({ ...responseForm, resolution: e.target.value })}
                  placeholder="Enter your response message (e.g., 'OK, your problem is noted and it can be solved by [date]')"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Expected Resolution Date</label>
                <input
                  type="date"
                  value={responseForm.expectedResolutionDate}
                  onChange={(e) => setResponseForm({ ...responseForm, expectedResolutionDate: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeResponseModal}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingResponse ? "Submitting..." : "📝 Submit Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Creation Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">📢 Create City Announcement</h2>
              <button
                onClick={closeAnnouncementModal}
                className="text-white/60 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g., Electricity Maintenance Notice"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Message *</label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="e.g., Electricity will be discontinued for 2 hrs in Gomti Nagar from 10 AM to 12 PM"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 h-24 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Type</label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  >
                    <option value="General" className="text-gray-800">General</option>
                    <option value="Emergency" className="text-gray-800">Emergency</option>
                    <option value="Maintenance" className="text-gray-800">Maintenance</option>
                    <option value="Service" className="text-gray-800">Service</option>
                    <option value="Event" className="text-gray-800">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  >
                    <option value="Low" className="text-gray-800">Low</option>
                    <option value="Medium" className="text-gray-800">Medium</option>
                    <option value="High" className="text-gray-800">High</option>
                    <option value="Critical" className="text-gray-800">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={announcementForm.location}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, location: e.target.value })}
                  placeholder="e.g., Gomti Nagar, Hazratganj, etc."
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeAnnouncementModal}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAnnouncement}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAnnouncement ? "Creating..." : "📢 Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
