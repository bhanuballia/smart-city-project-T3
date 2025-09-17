import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();

    socket.on("alert:new", (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    socket.on("alert:delete", (id) => {
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    });

    return () => {
      socket.off("alert:new");
      socket.off("alert:delete");
    };
  }, []);

  const fetchAlerts = async () => {
    const res = await axios.get("/api/alerts");
    setAlerts(res.data);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🚨 Alerts Center</h2>
      <ul className="space-y-2">
        {alerts.map((alert) => (
          <li
            key={alert._id}
            className={`p-3 rounded shadow ${
              alert.severity === "Critical"
                ? "bg-red-500 text-white"
                : alert.severity === "High"
                ? "bg-orange-400 text-white"
                : "bg-gray-200"
            }`}
          >
            <strong>[{alert.type}]</strong> {alert.message}
            <span className="block text-sm opacity-75">
              {new Date(alert.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Alerts;
