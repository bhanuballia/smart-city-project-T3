import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await API.get("/api/announcements/active");
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Get user location
  const handleFind = (place) => {
    setSelectedPlace(place);
    setMessage("Fetching your location...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ latitude, longitude });

          // Redirect to Google Maps search with user location
          const mapsUrl = `https://www.google.com/maps/search/${place}/@${latitude},${longitude},14z`;
          window.open(mapsUrl, "_blank");

          setMessage(`Showing nearby ${place} on Google Maps`);
        },
        () => {
          setMessage("Unable to fetch your location.");
        }
      );
    } else {
      setMessage("Geolocation not supported in your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/vidhan2.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Modern Navbar */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <h2 className="text-xl font-bold text-white">Smart City Lucknow</h2>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/login" className="text-white/80 hover:text-white transition-colors duration-200">
              Login
            </Link>
            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors duration-200">
              Dashboard
            </Link>
            <Link to="/famous-places" className="text-white/80 hover:text-white transition-colors duration-200">
              Famous Places
            </Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>

          {/* Modern Dropdown */}
          <div className="relative">
            <select
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              onChange={(e) => handleFind(e.target.value)}
              value={selectedPlace}
            >
              <option value="" className="text-gray-800">Find Services</option>
              <option value="Railway Station" className="text-gray-800">Railway Station</option>
              <option value="Bus Station" className="text-gray-800">Bus Station</option>
              <option value="Hospital" className="text-gray-800">Hospital</option>
              <option value="Metro Station" className="text-gray-800">Metro Station</option>
              <option value="Airport" className="text-gray-800">Airport</option>
              <option value="Police Station" className="text-gray-800">Police Station</option>
              <option value="Fire Station" className="text-gray-800">Fire Station</option>
              <option value="District Court" className="text-gray-800">District Court</option>
              <option value="Lucknow High Court" className="text-gray-800">Lucknow High Court</option>
              <option value="Lucknow University" className="text-gray-800">Lucknow University</option>
              <option value="Parking" className="text-gray-800">Parking</option>
              <option value="Post Office" className="text-gray-800">Post Office</option>
              <option value="Bank" className="text-gray-800">Bank</option>
              <option value="ATM" className="text-gray-800">ATM</option>
              <option value="Public Restroom" className="text-gray-800">Public Restroom</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Smart City Lucknow
                </span>
                <span className="block text-lg md:text-xl text-orange-500/80 mt-2">
                  "मुस्कुराइए, आप लखनऊ में हैं"
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Building a sustainable, safe, and technologically advanced city for everyone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              
              <Link 
                to="/famous-places" 
                className="bg-green-500/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Discover Places
              </Link>
            </div>

            {/* Status Message */}
            {message && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-200">
                {message}
              </div>
            )}
          </div>

          {/* City Announcements */}
          {!loadingAnnouncements && announcements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">📢 Important City Announcements</h2>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                      announcement.priority === "Critical"
                        ? "bg-red-500/20 border-red-500/30 shadow-red-500/20"
                        : announcement.priority === "High"
                        ? "bg-orange-500/20 border-orange-500/30 shadow-orange-500/20"
                        : announcement.priority === "Medium"
                        ? "bg-yellow-500/20 border-yellow-500/30 shadow-yellow-500/20"
                        : "bg-blue-500/20 border-blue-500/30 shadow-blue-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          announcement.priority === "Critical"
                            ? "bg-red-500/30"
                            : announcement.priority === "High"
                            ? "bg-orange-500/30"
                            : announcement.priority === "Medium"
                            ? "bg-yellow-500/30"
                            : "bg-blue-500/30"
                        }`}>
                          {announcement.type === "Emergency" ? "🚨" :
                           announcement.type === "Maintenance" ? "🔧" :
                           announcement.type === "Service" ? "⚙️" :
                           announcement.type === "Event" ? "🎉" : "📢"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            announcement.priority === "Critical"
                              ? "bg-red-500/30 text-red-100"
                              : announcement.priority === "High"
                              ? "bg-orange-500/30 text-orange-100"
                              : announcement.priority === "Medium"
                              ? "bg-yellow-500/30 text-yellow-100"
                              : "bg-blue-500/30 text-blue-100"
                          }`}>
                            {announcement.priority}
                          </span>
                          <span className="text-white/70 text-sm">
                            {announcement.type}
                          </span>
                        </div>
                        <p className="text-white/90 mb-3 leading-relaxed">{announcement.message}</p>
                        <div className="flex items-center gap-4 text-sm text-white/70">
                          {announcement.location && (
                            <span className="flex items-center gap-1">
                              📍 {announcement.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            📅 {new Date(announcement.createdAt).toLocaleDateString()}
                          </span>
                          {announcement.expiresAt && (
                            <span className="flex items-center gap-1">
                              ⏰ Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for announcements */}
          {!loadingAnnouncements && announcements.length === 0 && (
            <div className="mt-8">
              <div className="bg-white/10 border border-white/20 text-white/80 rounded-2xl p-6 text-center">
                No active city announcements right now. Please check back later.
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏙️</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Smart Infrastructure</h3>
              <p className="text-white/60 text-sm">Advanced urban planning and sustainable development</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Safety & Security</h3>
              <p className="text-white/60 text-sm">24/7 monitoring and emergency response systems</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Eco-Friendly</h3>
              <p className="text-white/60 text-sm">Green initiatives and environmental sustainability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="relative z-10 bg-white/5 backdrop-blur-xl border-t border-white/10 text-white/60 text-center py-6">
        <div className="max-w-7xl mx-auto px-6">
          © {new Date().getFullYear()} Smart City Lucknow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
