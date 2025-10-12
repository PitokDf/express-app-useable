import NodeCache from 'node-cache';
import logger from './winston.logger';

class CacheManager {
    private cache: NodeCache;

    constructor() {
        // Cache with 1 hour default TTL
        this.cache = new NodeCache({
            stdTTL: 3600, // 1 hour
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false
        });

        this.cache.on('expired', (key) => {
            logger.debug(`Cache key expired: ${key}`);
        });

        this.cache.on('set', (key) => {
            logger.debug(`Cache key set: ${key}`);
        });
    }

    /**
     * Set cache with key, value and optional TTL
     */
    set<T>(key: string, value: T, ttl?: number): boolean {
        try {
            return this.cache.set(key, value, ttl || 3600);
        } catch (error) {
            logger.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | undefined {
        try {
            return this.cache.get<T>(key);
        } catch (error) {
            logger.error('Cache get error:', error);
            return undefined;
        }
    }

    /**
     * Delete key from cache
     */
    del(key: string): number {
        try {
            return this.cache.del(key);
        } catch (error) {
            logger.error('Cache delete error:', error);
            return 0;
        }
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        try {
            return this.cache.has(key);
        } catch (error) {
            logger.error('Cache has error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * Clear all cache
     */
    flush(): void {
        this.cache.flushAll();
        logger.info('Cache flushed');
    }

    /**
     * Get cache with auto-refresh capability
     */
    async getOrSet<T>(
        key: string,
        fetchFunction: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const cached = this.get<T>(key);

        if (cached !== undefined) {
            return cached;
        }

        try {
            const data = await fetchFunction();
            this.set(key, data, ttl);
            return data;
        } catch (error) {
            logger.error('Cache getOrSet error:', error);
            throw error;
        }
    }

    /**
     * Cache middleware for Express routes
     */
    middleware(ttl: number = 3600) {
        return (req: any, res: any, next: any) => {
            const key = `route_cache:${req.originalUrl}`;
            const cached = this.get(key);

            if (cached) {
                logger.debug(`Cache hit for: ${key}`);
                return res.json(cached);
            }

            // Override res.json to cache the response
            const originalJson = res.json;
            res.json = (body: any) => {
                this.set(key, body, ttl);
                logger.debug(`Cache set for: ${key}`);
                return originalJson.call(res, body);
            };

            next();
        };
    }

    /**
     * Generate cache key from object
     */
    generateKey(prefix: string, params: Record<string, any>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((sorted, key) => {
                sorted[key] = params[key];
                return sorted;
            }, {} as Record<string, any>);

        return `${prefix}:${JSON.stringify(sortedParams)}`;
    }

    /**
     * Get all cache keys
     */
    keys(): string[] {
        return this.cache.keys();
    }

    /**
     * Delete multiple keys that match a pattern
     */
    delPattern(pattern: string): number {
        const keys = this.keys();
        const keysToDelete = keys.filter(key => key.startsWith(pattern));
        let deletedCount = 0;

        keysToDelete.forEach(key => {
            deletedCount += this.del(key);
        });

        if (deletedCount > 0) {
            logger.debug(`Deleted ${deletedCount} cache keys matching pattern: ${pattern}`);
        }

        return deletedCount;
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();
