import NodeCache from 'node-cache';
import { createClient } from 'redis';

class CacheService {
  constructor() {
    // In-memory cache with 5-minute default TTL
    this.memoryCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false // Better performance
    });

    // Redis client (optional)
    this.redisClient = null;
    this.redisConnected = false;
    
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      // Only initialize Redis if REDIS_URL is provided
      if (process.env.REDIS_URL) {
        this.redisClient = createClient({
          url: process.env.REDIS_URL
        });

        this.redisClient.on('error', (err) => {
          console.log('❌ Redis Client Error:', err);
          this.redisConnected = false;
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis Client Connected');
          this.redisConnected = true;
        });

        await this.redisClient.connect();
      } else {
        console.log('ℹ️ Redis not configured, using in-memory cache only');
      }
    } catch (error) {
      console.log('❌ Redis connection failed, using in-memory cache only:', error.message);
      this.redisConnected = false;
    }
  }

  // Set cache with TTL
  async set(key, value, ttl = 300) {
    try {
      // Set in memory cache
      this.memoryCache.set(key, value, ttl);

      // Set in Redis if available
      if (this.redisConnected && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Get from cache
  async get(key) {
    try {
      // Try memory cache first (faster)
      let value = this.memoryCache.get(key);
      if (value !== undefined) {
        return value;
      }

      // Try Redis if memory cache miss
      if (this.redisConnected && this.redisClient) {
        const redisValue = await this.redisClient.get(key);
        if (redisValue) {
          const parsedValue = JSON.parse(redisValue);
          // Store in memory cache for faster access
          this.memoryCache.set(key, parsedValue);
          return parsedValue;
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete from cache
  async del(key) {
    try {
      this.memoryCache.del(key);
      if (this.redisConnected && this.redisClient) {
        await this.redisClient.del(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Clear all cache
  async clear() {
    try {
      this.memoryCache.flushAll();
      if (this.redisConnected && this.redisClient) {
        await this.redisClient.flushAll();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Get cache statistics
  getStats() {
    const memoryStats = this.memoryCache.getStats();
    return {
      memory: memoryStats,
      redis: this.redisConnected ? 'connected' : 'disconnected'
    };
  }

  // Cache middleware for Express routes
  cacheMiddleware(ttl = 300) {
    return async (req, res, next) => {
      const key = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      try {
        const cachedData = await this.get(key);
        if (cachedData) {
          console.log(`📦 Cache hit for: ${key}`);
          return res.json(cachedData);
        }
        
        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data) => {
          this.set(key, data, ttl);
          console.log(`�� Cached response for: ${key}`);
          return originalJson(data);
        };
        
        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern) {
    try {
      // Clear memory cache keys matching pattern
      const keys = this.memoryCache.keys();
      const matchingKeys = keys.filter(key => key.includes(pattern));
      matchingKeys.forEach(key => this.memoryCache.del(key));

      // Clear Redis keys matching pattern
      if (this.redisConnected && this.redisClient) {
        const redisKeys = await this.redisClient.keys(`*${pattern}*`);
        if (redisKeys.length > 0) {
          await this.redisClient.del(redisKeys);
        }
      }

      console.log(`🗑️ Invalidated cache for pattern: ${pattern}`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
