import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const defaultPlaces = [
  {
    name: "Bara Imambara",
    category: "Ancient Monuments",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/01/Bara_Imambara_Lucknow.jpg",
    description: "A grand Mughal architectural wonder built in 1784.",
    mapsUrl:
      "https://www.google.com/maps/place/Bara+Imambara/@26.8695,80.9126,17z",
  },
  {
    name: "Rumi Darwaza",
    category: "Ancient Monuments",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/41/Rumi_Darwaza%2C_Lucknow.jpg",
    description: "Iconic 60-foot gateway, symbol of Lucknow.",
    mapsUrl:
      "https://www.google.com/maps/place/Rumi+Darwaza/@26.8702,80.9128,17z",
  },
  {
    name: "Ambedkar Park",
    category: "Parks",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ambedkar_Memorial_Park.jpg",
    description: "Beautiful park with statues and modern architecture.",
    mapsUrl:
      "https://www.google.com/maps/place/Dr.+Bh+Ambedkar+Memorial+Park/@26.8467,80.9762,17z",
  },
  {
    name: "Janeshwar Mishra Park",
    category: "Parks",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/25/Janeshwar_Mishra_Park.jpg",
    description: "One of Asia's largest parks with lakes and jogging tracks.",
    mapsUrl:
      "https://www.google.com/maps/place/Janeshwar+Mishra+Park/@26.8537,81.0034,17z",
  },
  {
    name: "Hazratganj",
    category: "Shopping & Malls",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Hazratganj_Lucknow.jpg",
    description: "Famous shopping and food hub in the heart of the city.",
    mapsUrl:
      "https://www.google.com/maps/place/Hazratganj,+Lucknow/@26.8507,80.9456,15z",
  },
  {
    name: "Tunday Kababi",
    category: "Famous Eateries",
    image:
      "https://b.zmtcdn.com/data/pictures/chains/9/4001299/d38c84e2a472b725f0c60211472edb4f.jpg",
    description: "World-famous kebab shop, a must-visit for food lovers.",
    mapsUrl:
      "https://www.google.com/maps/place/Tunday+Kababi,+Aminabad/@26.8564,80.9189,17z",
  },
];

export default function FamousPlaces() {
  const { user } = useContext(AuthContext);
  const [bgImage, setBgImage] = useState("");
  const [customPlaces, setCustomPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Form states
  const [newPlace, setNewPlace] = useState({
    name: "",
    category: "",
    image: "",
    description: "",
    mapsUrl: "",
  });

  // Check if user is admin
  const isAdmin = user && user.role === "Admin";

  // Load background and custom places when user is logged in
  useEffect(() => {
    if (user) {
      const savedBg = localStorage.getItem("famousPlacesBg");
      if (savedBg) setBgImage(savedBg);

      const savedPlaces = localStorage.getItem("customPlaces");
      if (savedPlaces) {
        try {
          setCustomPlaces(JSON.parse(savedPlaces));
        } catch (error) {
          console.error("Error parsing custom places:", error);
          setCustomPlaces([]);
        }
      }
    }
  }, [user]);

  // Save custom places to localStorage when user is logged in
  useEffect(() => {
    if (user && customPlaces.length >= 0) {
      localStorage.setItem("customPlaces", JSON.stringify(customPlaces));
    }
  }, [customPlaces, user]);

  // Handle background upload
  const handleBgUpload = (e) => {
    if (!user) {
      alert("Please login to change the background.");
      return;
    }
    
    // Check if user is admin
    if (!isAdmin) {
      alert("Only administrators can upload background images.");
      return;
    }
    
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file.");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setBgImage(base64String);
        localStorage.setItem("famousPlacesBg", base64String);
      };
      reader.onerror = () => {
        alert("Error reading the image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset background
  const handleResetBg = () => {
    if (!isAdmin) {
      alert("Only administrators can reset the background.");
      return;
    }
    setBgImage("");
    localStorage.removeItem("famousPlacesBg");
  };

  // Handle new place form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlace({ ...newPlace, [name]: value });
  };

  // Handle image upload for new place
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file.");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlace({ ...newPlace, image: reader.result });
      };
      reader.onerror = () => {
        alert("Error reading the image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new place
  const handleAddPlace = (e) => {
    e.preventDefault();
    
    // Check if user is admin
    if (!isAdmin) {
      alert("Only administrators can add new places.");
      return;
    }
    
    if (!newPlace.name || !newPlace.category || !newPlace.image || !newPlace.description || !newPlace.mapsUrl) {
      alert("Please fill in all fields");
      return;
    }
    setCustomPlaces([...customPlaces, newPlace]);
    setNewPlace({ name: "", category: "", image: "", description: "", mapsUrl: "" });
  };

  // Delete custom place
  const handleDeletePlace = (index) => {
    if (!isAdmin) {
      alert("Only administrators can delete places.");
      return;
    }
    const updatedPlaces = [...customPlaces];
    updatedPlaces.splice(index, 1);
    setCustomPlaces(updatedPlaces);
  };

  // Combine default and custom places
  const allPlaces = [...defaultPlaces, ...customPlaces];

  // Get unique categories
  const categories = ["All", ...new Set(allPlaces.map(place => place.category))];

  // Filter places by selected category
  const filteredPlaces = selectedCategory === "All" 
    ? allPlaces 
    : allPlaces.filter(place => place.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : "none",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-voilet-900/60 to-slate-900/80"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Modern Header */}
      <div className="relative z-10 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Famous Places in
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Lucknow
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover the rich heritage and modern attractions of the City of Nawabs
            </p>
          </div>

          {/* Modern Navigation */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-black shadow-lg"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 text-black hover:bg-white/20"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {isAdmin ? (
                    <>
                      <label className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300">
                        📷 Upload Background
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgUpload}
                          className="hidden"
                        />
                      </label>

                      {bgImage && (
                        <>
                          <img
                            src={bgImage}
                            alt="Background Preview"
                            className="w-16 h-16 object-cover rounded-xl border-2 border-white/20"
                          />
                          <button
                            onClick={handleResetBg}
                            className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300"
                          >
                            Reset
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-white/60 text-sm italic">
                        Admin access required for customization
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-white/60 text-sm italic">
                    Login to access admin features
                  </span>
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Login
                  </Link>
                </div>
              )}

              <Link
                to="/"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Place Form - Only for Admins */}
      {user && isAdmin && (
        <div className="relative z-10 mb-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Add a New Place (Admin Only)</h2>
              <form onSubmit={handleAddPlace} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Place Name"
                    value={newPlace.name}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={newPlace.category}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    required
                  />
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                      required
                    />
                    {newPlace.image && (
                      <div className="mt-3">
                        <img
                          src={newPlace.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-white/20"
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    name="mapsUrl"
                    placeholder="Google Maps URL"
                    value={newPlace.mapsUrl}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    required
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={newPlace.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ✨ Add New Place (Admin)
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Places Grid */}
      <div className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPlaces.map((place, i) => {
              const isCustom = customPlaces.includes(place);
              const customIndex = customPlaces.indexOf(place);

              return (
                <div
                  key={i}
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                >
                  <a
                    href={place.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300/1e293b/ffffff?text=Image+Not+Available";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {place.category}
                        </span>
                      </div>
                      {isCustom && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                            Custom
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                        {place.name}
                      </h3>
                      <p className="text-white/70 leading-relaxed">{place.description}</p>
                      
                      <div className="mt-4 flex items-center text-blue-300 text-sm font-medium">
                        <span className="mr-2">📍</span>
                        View on Maps
                        <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  </a>

                  {/* Delete button for custom places - Only for Admins */}
                  {isCustom && isAdmin && (
                    <button
                      onClick={() => handleDeletePlace(customIndex)}
                      className="absolute top-2 right-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 text-sm px-3 py-1 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-2xl font-bold text-white mb-2">No places found</h3>
              <p className="text-white/60">Try selecting a different category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}