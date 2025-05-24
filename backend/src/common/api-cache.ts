/**
 * Cache utility for optimizing API requests
 * Implements a simple in-memory cache with TTL (Time To Live)
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTtl: number = 60 * 1000; // 1 minute default TTL

  /**
   * Get data from cache if available and not expired
   * @param key Cache key
   * @returns Cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data as T;
  }

  /**
   * Store data in cache with optional TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Remove item from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Set default TTL for cache entries
   * @param ttl Time to live in milliseconds
   */
  setDefaultTtl(ttl: number): void {
    this.defaultTtl = ttl;
  }
}

// Export singleton instance
export const apiCache = new ApiCache();
