import React, { useState } from "react";
import API from "../services/api";

export default function Optimization() {
  const [wastePayload, setWastePayload] = useState({
    depot: { lat: 26.8467, lng: 80.9462 },
    stops: [
      { id: "S1", demand: 200, service_minutes: 2, location: { lat: 26.85, lng: 80.95 } },
      { id: "S2", demand: 150, service_minutes: 2, location: { lat: 26.86, lng: 80.94 } },
      { id: "S3", demand: 180, service_minutes: 2, location: { lat: 26.84, lng: 80.96 } },
    ],
    trucks: [
      { id: "T1", capacity: 400, max_minutes: 480 },
      { id: "T2", capacity: 400, max_minutes: 480 },
    ],
  });
  const [wasteResult, setWasteResult] = useState(null);
  const [energyPayload, setEnergyPayload] = useState({
    price_per_slot: [5, 4, 3, 3, 4, 6, 8, 10],
    forecast_load_kw: [20, 22, 25, 27, 28, 35, 40, 42],
    devices: [
      { id: "PumpA", power_kw: 5, deferrable: true, duration_slots: 2 },
      { id: "Chiller", power_kw: 8, deferrable: true, duration_slots: 1 },
    ],
    peak_threshold_kw: 38,
  });
  const [energyResult, setEnergyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runWaste = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/optimize/waste-routing", wastePayload);
      setWasteResult(data);
    } catch (e) {
      alert("Waste optimization failed");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runEnergy = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/optimize/energy-balance", energyPayload);
      setEnergyResult(data);
    } catch (e) {
      alert("Energy optimization failed");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Optimization Playground</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Waste Truck Routing</h2>
          <button className="btn btn-primary" onClick={runWaste} disabled={loading}>
            {loading ? "Running..." : "Run Waste Optimization"}
          </button>
          {wasteResult && (
            <pre className="mt-3 p-2 bg-gray-50 border rounded text-sm overflow-auto">
{JSON.stringify(wasteResult, null, 2)}
            </pre>
          )}
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-medium mb-2">Energy Balance</h2>
          <button className="btn btn-primary" onClick={runEnergy} disabled={loading}>
            {loading ? "Running..." : "Run Energy Optimization"}
          </button>
          {energyResult && (
            <pre className="mt-3 p-2 bg-gray-50 border rounded text-sm overflow-auto">
{JSON.stringify(energyResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}


