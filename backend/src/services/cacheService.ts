import { createClient, RedisClientType } from 'redis';
import Product, { IProduct } from '../models/Product';

class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      password: process.env.REDIS_PASSWORD
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.client.on('error', (err: Error) => {
      console.error('❌ Redis error:', err);
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  // Cache products with TTL
  async cacheProducts(key: string, products: any[], ttl: number = 3600): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(products));
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  // Get cached products
  async getCachedProducts(key: string): Promise<any[] | null> {
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Cache user session
  async cacheUserSession(userId: string, userData: any, ttl: number = 1800): Promise<void> {
    try {
      await this.client.setex(`session:${userId}`, ttl, JSON.stringify(userData));
    } catch (error) {
      console.error('Session cache error:', error);
    }
  }

  // Get cached user session
  async getCachedUserSession(userId: string): Promise<any | null> {
    try {
      const cached = await this.client.get(`session:${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }

  // Invalidate cache by pattern
  async invalidateCache(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Cache API response
  async cacheApiResponse(key: string, data: any, ttl: number = 300): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('API cache error:', error);
    }
  }

  // Get cached API response
  async getCachedApiResponse(key: string): Promise<any | null> {
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('API cache get error:', error);
      return null;
    }
  }

  // Check Redis connection
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  // Close connection
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

export const cacheService = new CacheService();
