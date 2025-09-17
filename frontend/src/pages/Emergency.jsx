import React from "react"; 
import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../services/socket";

export default function Emergency() {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({ type: "", location: "" });

  // 🔹 Ask for Notification Permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 🔹 Fetch + Socket.IO real-time updates
  useEffect(() => {
    fetchIncidents();

    // 🔹 New incident listener + notification trigger
    socket.on("incident:new", (incident) => {
      setIncidents((prev) => [incident, ...prev]);

      // 🔔 Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        const notif = new Notification("🚨 New Incident Reported", {
          body: `${incident.type} at ${incident.location}`,
          icon: "/alert-icon.png", // optional icon in /public
        });

        // 🔹 Make notification clickable → redirect to Emergency page
        notif.onclick = () => {
          window.focus();
          window.location.href = "/dashboard/emergency";
        };
      } else if (Notification.permission === "denied") {
        // fallback alert if blocked
        alert(`🚨 New Incident: ${incident.type} at ${incident.location}`);
      }
    });

    // 🔹 Update incident
    socket.on("incident:update", (incident) => {
      setIncidents((prev) =>
        prev.map((i) => (i._id === incident._id ? incident : i))
      );
    });

    // 🔹 Delete incident
    socket.on("incident:delete", (id) => {
      setIncidents((prev) => prev.filter((i) => i._id !== id));
    });

    return () => {
      socket.off("incident:new");
      socket.off("incident:update");
      socket.off("incident:delete");
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await API.get("/api/incidents");
      setIncidents(res.data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.location) return;
    try {
      await API.post("/api/incidents", form);
      setForm({ type: "", location: "" });
    } catch (error) {
      console.error("Error reporting incident:", error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/api/incidents/${id}`, { status: "Resolved" });
    } catch (error) {
      console.error("Error resolving incident:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/incidents/${id}`);
    } catch (error) {
      console.error("Error deleting incident:", error);
    }
  };

  return (
    
      <div className="p-6">
        <h1 className="text-2xl font-heading text-danger mb-4">
          🚨 Emergency Response (Live)
        </h1>

        {/* Report Incident Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow p-4 rounded-2xl mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="p-2 border rounded-lg"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="">Select Type</option>
              <option value="Fire">🔥 Fire</option>
              <option value="Flood">🌊 Flood</option>
              <option value="Accident">🚗 Accident</option>
              <option value="Other">⚠️ Other</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              className="p-2 border rounded-lg"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-danger text-blue px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Report Incident
          </button>
        </form>

        {/* Incidents List */}
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <div
              key={incident._id}
              className="p-4 bg-white rounded-2xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {incident.type} @ {incident.location}
                </h2>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      incident.status === "Active"
                        ? "text-danger"
                        : "text-accent"
                    }`}
                  >
                    {incident.status}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {incident.status === "Active" && (
                  <button
                    onClick={() => handleResolve(incident._id)}
                    className="px-3 py-1 bg-accent text-blue rounded-lg hover:bg-green-700 transition"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(incident._id)}
                  className="px-3 py-1 bg-gray-500 text-blue rounded-lg hover:bg-gray-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
