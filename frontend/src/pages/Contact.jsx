// src/pages/Contact.jsx
import React, { useState } from "react";
import axios from "../api/axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    contact: "",
    email: "",
    houseNo: "",
    street: "",
    cityRegion: "Gomti Nagar",
    problemRelated: "Water",
    otherProblem: "",
    explanation: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [complaintNumber, setComplaintNumber] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = [];

    if (!form.name.trim()) errors.push("Name is required");
    if (!form.age || form.age < 1 || form.age > 120) errors.push("Please enter a valid age (1-120)");
    if (!form.contact.trim() || !/^[0-9]{10}$/.test(form.contact.trim())) {
      errors.push("Please enter a valid 10-digit contact number");
    }
    if (!form.email.trim() || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email.trim())) {
      errors.push("Please enter a valid email address");
    }
    if (!form.houseNo.trim()) errors.push("House number is required");
    if (!form.street.trim()) errors.push("Street is required");
    if (!form.explanation.trim()) errors.push("Problem explanation is required");
    if (form.problemRelated === "Other" && !form.otherProblem.trim()) {
      errors.push("Please specify the problem when selecting 'Other'");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert("Please fix the following errors:\n" + validationErrors.join("\n"));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setComplaintNumber(null);

    // Test backend connectivity first
    try {
      console.log("🔍 Testing backend connectivity...");
      const healthCheck = await axios.get("/");
      console.log("✅ Backend is reachable:", healthCheck.data);
    } catch (healthError) {
      console.error("❌ Backend health check failed:", healthError);
      setSubmitStatus("error");
      setIsSubmitting(false);
      alert("❌ Cannot connect to server. Please make sure the backend server is running on port 5000.");
      return;
    }

    try {
      // Prepare data for submission
      const complaintData = {
        name: form.name.trim(),
        age: parseInt(form.age),
        contact: form.contact.trim(),
        email: form.email.trim(),
        houseNo: form.houseNo.trim(),
        street: form.street.trim(),
        cityRegion: form.cityRegion,
        problemRelated: form.problemRelated,
        explanation: form.explanation.trim(),
      };

      // Add otherProblem only if problemRelated is "Other"
      if (form.problemRelated === "Other") {
        complaintData.otherProblem = form.otherProblem.trim();
      }

      console.log("Submitting complaint:", complaintData);

      // Submit to backend
      const response = await axios.post("/api/complaints", complaintData);

      if (response.data.success) {
        setSubmitStatus("success");
        setComplaintNumber(response.data.complaint.complaintNumber);
        
        // Reset form
        setForm({
          name: "",
          age: "",
          contact: "",
          email: "",
          houseNo: "",
          street: "",
          cityRegion: "Gomti Nagar",
          problemRelated: "Water",
          otherProblem: "",
          explanation: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // More detailed error logging
      if (error.code === 'ECONNREFUSED') {
        console.error("❌ Connection refused - Backend server is not running on port 5000");
      } else if (error.message.includes('Network Error')) {
        console.error("❌ Network Error - Check if backend server is running");
      } else if (error.response) {
        console.error("❌ Server responded with error:", error.response.status, error.response.data);
      } else {
        console.error("❌ Unknown error occurred");
      }
      
      setSubmitStatus("error");
      
      // Show specific error message if available
      if (error.response?.data?.error) {
        alert(`❌ Error: ${error.response.data.error}`);
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        alert("❌ Cannot connect to server. Please make sure the backend server is running on port 5000.");
      } else {
        alert(`❌ Failed to submit complaint: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackComplaint = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsTracking(true);
    setTrackingResult(null);

    try {
      const response = await axios.get(`/api/complaints/track/${trackingNumber.trim()}`);
      setTrackingResult(response.data);
    } catch (error) {
      console.error("Error tracking complaint:", error);
      setTrackingResult({
        success: false,
        error: error.response?.data?.error || "Complaint not found"
      });
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          {/* Complaint Tracking Section */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🔍 Track Your Complaint</h2>
            <form onSubmit={handleTrackComplaint} className="flex gap-4">
              <input
                type="text"
                placeholder="Enter complaint number (e.g., COMP-000001)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isTracking || !trackingNumber.trim()}
                className={`px-6 py-3 rounded-lg transition ${
                  isTracking || !trackingNumber.trim()
                    ? "bg-gray-400 text-black-200 cursor-not-allowed"
                    : "bg-green-600 text-black hover:bg-green-700"
                }`}
              >
                {isTracking ? "Tracking..." : "Track"}
              </button>
            </form>

            {/* Tracking Result */}
            {trackingResult && (
              <div className="mt-4 p-4 rounded-lg">
                {trackingResult.success ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Complaint Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Complaint Number:</strong> {trackingResult.data.complaintNumber}
                      </div>
                      <div>
                        <strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          trackingResult.data.status === 'Resolved' ? 'bg-green-200 text-green-800' :
                          trackingResult.data.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                          trackingResult.data.status === 'Pending' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {trackingResult.data.status}
                        </span>
                      </div>
                      <div>
                        <strong>Problem Type:</strong> {trackingResult.data.problemRelated}
                      </div>
                      <div>
                        <strong>Priority:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          trackingResult.data.priority === 'High' ? 'bg-red-200 text-red-800' :
                          trackingResult.data.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {trackingResult.data.priority}
                        </span>
                      </div>
                      <div>
                        <strong>Location:</strong> {trackingResult.data.cityRegion}
                      </div>
                      <div>
                        <strong>Submitted:</strong> {new Date(trackingResult.data.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {trackingResult.data.resolution && (
                      <div className="mt-3 pt-3 border-t border-green-300">
                        <strong>Resolution:</strong>
                        <p className="mt-1 text-sm">{trackingResult.data.resolution}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4">
                    <h3 className="font-bold">Complaint Not Found</h3>
                    <p className="text-sm mt-1">{trackingResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Complaint Form Section */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">📩 Complaint Form</h1>
          
          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-2">✅</span>
                <div>
                  <h3 className="font-bold">Complaint Submitted Successfully!</h3>
                  <p className="text-sm">
                    Your complaint number is: <strong>{complaintNumber}</strong>
                  </p>
                  <p className="text-sm mt-1">
                    You can track your complaint status using this number.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-2">❌</span>
                <div>
                  <h3 className="font-bold">Submission Failed</h3>
                  <p className="text-sm">
                    Please check your information and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="p-2 border rounded-lg"
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              className="p-2 border rounded-lg"
              required
            />
            <input
              type="text"
              name="contact"
              placeholder="Contact No"
              value={form.contact}
              onChange={handleChange}
              className="p-2 border rounded-lg"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email ID"
              value={form.email}
              onChange={handleChange}
              className="p-2 border rounded-lg"
              required
            />

            <input
              type="text"
              name="houseNo"
              placeholder="House No"
              value={form.houseNo}
              onChange={handleChange}
              className="p-2 border rounded-lg"
              required
            />
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={form.street}
              onChange={handleChange}
              className="p-2 border rounded-lg"
              required
            />

            <select
              name="cityRegion"
              value={form.cityRegion}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            >
              <option value="Gomti Nagar">Gomti Nagar</option>
              <option value="Haazaratganj">Haazaratganj</option>
              <option value="Kaiserbagh">Kaiserbagh</option>
            </select>

            <select
              name="problemRelated"
              value={form.problemRelated}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            >
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Waste">Waste</option>
              <option value="Other">Other</option>
            </select>

            {form.problemRelated === "Other" && (
              <input
                type="text"
                name="otherProblem"
                placeholder="Specify your problem"
                value={form.otherProblem}
                onChange={handleChange}
                className="p-2 border rounded-lg md:col-span-2"
              />
            )}

            <textarea
              name="explanation"
              placeholder="Explain your problem and suggestions if any"
              value={form.explanation}
              onChange={handleChange}
              className="p-2 border rounded-lg md:col-span-2"
              rows="4"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-2 px-4 rounded-lg transition md:col-span-2 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gray-600 text-black hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/90 text-white text-center py-4">
        <p className="text-sm">
          Lucknow Municipal Corporation, Lalbagh, Lucknow, Uttar Pradesh - 226001
        </p>
      </footer>
    </div>
  );
}
