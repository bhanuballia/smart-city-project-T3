import cacheService from '../services/cacheService.js';
import Air from '../models/Air.js';
import Traffic from '../models/Traffic.js';
import Waste from '../models/Waste.js';
import Energy from '../models/Energy.js';
import Incident from '../models/Incident.js';

class CacheUtils {
  // Cache keys
  static KEYS = {
    AIR_LATEST: 'air:latest',
    AIR_HISTORY: 'air:history',
    TRAFFIC_LATEST: 'traffic:latest',
    TRAFFIC_HISTORY: 'traffic:history',
    WASTE_LATEST: 'waste:latest',
    WASTE_HISTORY: 'waste:history',
    ENERGY_LATEST: 'energy:latest',
    ENERGY_HISTORY: 'energy:history',
    DASHBOARD_STATS: 'dashboard:stats',
    USER_SESSION: 'user:session'
  };

  // Cache TTL values (in seconds)
  static TTL = {
    LATEST_DATA: 60,      // 1 minute for latest data
    HISTORY_DATA: 300,    // 5 minutes for historical data
    DASHBOARD_STATS: 180, // 3 minutes for dashboard stats
    USER_SESSION: 3600    // 1 hour for user sessions
  };

  // Get latest air quality data
  static async getLatestAirData() {
    const cached = await cacheService.get(this.KEYS.AIR_LATEST);
    if (cached) return cached;

    const data = await Air.findOne().sort({ createdAt: -1 });
    if (data) {
      await cacheService.set(this.KEYS.AIR_LATEST, data, this.TTL.LATEST_DATA);
    }
    return data;
  }

  // Get air quality history
  static async getAirHistory(limit = 100) {
    const key = `${this.KEYS.AIR_HISTORY}:${limit}`;
    const cached = await cacheService.get(key);
    if (cached) return cached;

    const data = await Air.find().sort({ createdAt: -1 }).limit(limit);
    await cacheService.set(key, data, this.TTL.HISTORY_DATA);
    return data;
  }

  // Get latest traffic data
  static async getLatestTrafficData() {
    const cached = await cacheService.get(this.KEYS.TRAFFIC_LATEST);
    if (cached) return cached;

    const data = await Traffic.find().sort({ createdAt: -1 }).limit(50);
    if (data) {
      await cacheService.set(this.KEYS.TRAFFIC_LATEST, data, this.TTL.LATEST_DATA);
    }
    return data;
  }

  // Get traffic history
  static async getTrafficHistory(limit = 100) {
    const key = `${this.KEYS.TRAFFIC_HISTORY}:${limit}`;
    const cached = await cacheService.get(key);
    if (cached) return cached;

    const data = await Traffic.find().sort({ createdAt: -1 }).limit(limit);
    await cacheService.set(key, data, this.TTL.HISTORY_DATA);
    return data;
  }

  // Get latest waste data
  static async getLatestWasteData() {
    const cached = await cacheService.get(this.KEYS.WASTE_LATEST);
    if (cached) return cached;

    const data = await Waste.find().sort({ createdAt: -1 }).limit(20);
    if (data) {
      await cacheService.set(this.KEYS.WASTE_LATEST, data, this.TTL.LATEST_DATA);
    }
    return data;
  }

  // Get waste history
  static async getWasteHistory(limit = 100) {
    const key = `${this.KEYS.WASTE_HISTORY}:${limit}`;
    const cached = await cacheService.get(key);
    if (cached) return cached;

    const data = await Waste.find().sort({ createdAt: -1 }).limit(limit);
    await cacheService.set(key, data, this.TTL.HISTORY_DATA);
    return data;
  }

  // Get latest energy data
  static async getLatestEnergyData() {
    const cached = await cacheService.get(this.KEYS.ENERGY_LATEST);
    if (cached) return cached;

    const data = await Energy.find().sort({ createdAt: -1 }).limit(20);
    if (data) {
      await cacheService.set(this.KEYS.ENERGY_LATEST, data, this.TTL.LATEST_DATA);
    }
    return data;
  }

  // Get energy history
  static async getEnergyHistory(limit = 100) {
    const key = `${this.KEYS.ENERGY_HISTORY}:${limit}`;
    const cached = await cacheService.get(key);
    if (cached) return cached;

    const data = await Energy.find().sort({ createdAt: -1 }).limit(limit);
    await cacheService.set(key, data, this.TTL.HISTORY_DATA);
    return data;
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    const cached = await cacheService.get(this.KEYS.DASHBOARD_STATS);
    if (cached) return cached;

    try {
      const [airCount, trafficCount, wasteCount, energyCount, incidentCount] = await Promise.all([
        Air.countDocuments(),
        Traffic.countDocuments(),
        Waste.countDocuments(),
        Energy.countDocuments(),
        Incident.countDocuments()
      ]);

      const [latestAir, latestTraffic, latestWaste, latestEnergy, latestIncident] = await Promise.all([
        Air.findOne().sort({ createdAt: -1 }),
        Traffic.findOne().sort({ createdAt: -1 }),
        Waste.findOne().sort({ createdAt: -1 }),
        Energy.findOne().sort({ createdAt: -1 }),
        Incident.findOne().sort({ createdAt: -1 })
      ]);

      const stats = {
        counts: {
          air: airCount,
          traffic: trafficCount,
          waste: wasteCount,
          energy: energyCount,
          incidents: incidentCount
        },
        latest: {
          air: latestAir,
          traffic: latestTraffic,
          waste: latestWaste,
          energy: latestEnergy,
          incidents: latestIncident
        },
        timestamp: new Date()
      };

      await cacheService.set(this.KEYS.DASHBOARD_STATS, stats, this.TTL.DASHBOARD_STATS);
      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return null;
    }
  }

  // Invalidate cache when new data is added
  static async invalidateDataCache(dataType) {
    const patterns = {
      air: ['air:latest', 'air:history', 'dashboard:stats'],
      traffic: ['traffic:latest', 'traffic:history', 'dashboard:stats'],
      waste: ['waste:latest', 'waste:history', 'dashboard:stats'],
      energy: ['energy:latest', 'energy:history', 'dashboard:stats']
    };

    const patternsToInvalidate = patterns[dataType] || [];
    for (const pattern of patternsToInvalidate) {
      await cacheService.invalidatePattern(pattern);
    }
  }

  // Cache user session data
  static async cacheUserSession(userId, sessionData) {
    const key = `${this.KEYS.USER_SESSION}:${userId}`;
    await cacheService.set(key, sessionData, this.TTL.USER_SESSION);
  }

  // Get user session data
  static async getUserSession(userId) {
    const key = `${this.KEYS.USER_SESSION}:${userId}`;
    return await cacheService.get(key);
  }

  // Clear user session cache
  static async clearUserSession(userId) {
    const key = `${this.KEYS.USER_SESSION}:${userId}`;
    await cacheService.del(key);
  }
}

export default CacheUtils;
