import { Redis } from '@upstash/redis';

export class CacheService {
  private static instance: CacheService;
  private redis: Redis | null = null;
  
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
      } else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // Fallback to Vercel KV
        this.redis = new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        });
      } else {
        console.warn('No Redis configuration found, caching disabled');
      }
    } catch (error) {
      console.error('Redis initialization error:', error);
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.redis) {
        console.warn('Redis not configured, skipping cache get');
        return null;
      }
      return await this.redis.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (!this.redis) {
        console.warn('Redis not configured, skipping cache set');
        return;
      }
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      if (!this.redis) {
        console.warn('Redis not configured, skipping cache delete');
        return;
      }
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  async invalidateUserCache(userId: number): Promise<void> {
    const patterns = [
      `user:${userId}:*`,
      `teams:user:${userId}`,
      `projects:user:${userId}`,
      `tasks:user:${userId}`,
      `notifications:user:${userId}`
    ];
    
    for (const pattern of patterns) {
      await this.delete(pattern);
    }
  }
  
  // Specific cache methods
  async getUserTeams(userId: number) {
    return this.get(`teams:user:${userId}`);
  }
  
  async setUserTeams(userId: number, teams: any[]): Promise<void> {
    await this.set(`teams:user:${userId}`, teams, 300); // 5 minutes
  }
  
  async getUserProjects(userId: number) {
    return this.get(`projects:user:${userId}`);
  }
  
  async setUserProjects(userId: number, projects: any[]): Promise<void> {
    await this.set(`projects:user:${userId}`, projects, 300); // 5 minutes
  }
  
  async getUserNotifications(userId: number) {
    return this.get(`notifications:user:${userId}`);
  }
  
  async setUserNotifications(userId: number, notifications: any[]): Promise<void> {
    await this.set(`notifications:user:${userId}`, notifications, 60); // 1 minute
  }
  
  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    try {
      if (!this.redis) {
        return true; // Allow if Redis not configured
      }
      
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, window);
      }
      
      return current <= limit;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
  }
}

export const cache = CacheService.getInstance();