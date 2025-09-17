import React, { useState, useEffect } from 'react';
import cachedApi from '../services/cachedApi.js';

export default function CacheManager() {
  const [cacheStats, setCacheStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const stats = cachedApi.getCacheStats();
      setCacheStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    cachedApi.clearCache();
    setCacheStats(cachedApi.getCacheStats());
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Cache Manager"
      >
        📦
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Cache Manager</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {cacheStats && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Items:</span>
            <span className="font-mono">{cacheStats.total}</span>
          </div>
          <div className="flex justify-between">
            <span>Active:</span>
            <span className="font-mono text-green-600">{cacheStats.active}</span>
          </div>
          <div className="flex justify-between">
            <span>Expired:</span>
            <span className="font-mono text-red-600">{cacheStats.expired}</span>
          </div>
          <div className="flex justify-between">
            <span>Max Size:</span>
            <span className="font-mono">{cacheStats.maxSize}</span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <button
          onClick={clearCache}
          className="w-full bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
        >
          Clear Cache
        </button>
        <button
          onClick={() => setCacheStats(cachedApi.getCacheStats())}
          className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
}
