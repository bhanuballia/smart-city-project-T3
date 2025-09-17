import axios from 'axios';
import frontendCache from './cacheService.js';

class CachedApiService {
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000,
    });

    // Add request interceptor for auth
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Generic cached GET request
  async getCached(url, ttl = 5 * 60 * 1000) {
    const cacheKey = `api:${url}`;
    
    // Try cache first
    const cached = frontendCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for: ${url}`);
      return cached;
    }

    // Fetch from API
    try {
      const response = await this.api.get(url);
      const data = response.data;
      
      // Cache the response
      frontendCache.set(cacheKey, data, ttl);
      console.log(`�� Cached response for: ${url}`);
      
      return data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Air quality data
  async getAirData() {
    return this.getCached('/air', 2 * 60 * 1000); // 2 minutes
  }

  async getLatestAirData() {
    return this.getCached('/air/latest', 1 * 60 * 1000); // 1 minute
  }

  async getAirHistory(limit = 100) {
    return this.getCached(`/air/history?limit=${limit}`, 5 * 60 * 1000); // 5 minutes
  }

  // Traffic data
  async getTrafficData() {
    return this.getCached('/traffic', 2 * 60 * 1000); // 2 minutes
  }

  // Waste data
  async getWasteData() {
    return this.getCached('/waste', 2 * 60 * 1000); // 2 minutes
  }

  // Energy data
  async getEnergyData() {
    return this.getCached('/energy', 2 * 60 * 1000); // 2 minutes
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.getCached('/dashboard/stats', 3 * 60 * 1000); // 3 minutes
  }

  // Non-cached requests (for real-time data)
  async get(url) {
    return this.api.get(url);
  }

  async post(url, data) {
    return this.api.post(url, data);
  }

  async put(url, data) {
    return this.api.put(url, data);
  }

  async delete(url) {
    return this.api.delete(url);
  }

  // Clear cache
  clearCache() {
    frontendCache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return frontendCache.getStats();
  }
}

// Create singleton instance
const cachedApi = new CachedApiService();

export default cachedApi;
