import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./pages/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Waste from "./pages/Waste";
import Traffic from "./pages/Traffic";
import Energy from "./pages/Energy";
import Air from "./pages/Air";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FamousPlaces from "./pages/FamousPlaces";
import Navbar from "./components/Navbar";
import AdminPanel from "./pages/admin/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import Unauthorized from "./pages/Unauthorized";
import Chatbot from "./components/Chatbot"; // Import the Chatbot component
import Optimization from "./pages/Optimization";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          {/* 🌐 Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/famous-places" element={<FamousPlaces />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* 🔐 Protected Dashboard Layout - Admin and Operator only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["Admin", "Operator"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}></Route>
            <Route index element={<Dashboard />} /> {/* default /dashboard */}
            <Route path="waste" element={<Waste />} /> {/* dashboard / waste */}
            <Route path="traffic" element={<Traffic />} />
            <Route path="energy" element={<Energy />} />
            <Route path="air" element={<Air />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="optimize" element={<Optimization />} />
          </Route>
        </Routes>
      </div>
      {/* Add the Chatbot component - it will appear on all pages */}
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
