/**
 * 🚀 CACHE SYSTEM
 * 
 * In-memory caching with Redis-style interface
 * Fallback to memory cache if Redis unavailable
 */

class CacheSystem {
    constructor() {
        this.cache = new Map();
        this.expirations = new Map();
        
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
        
        console.log('📦 Cache system initialized (in-memory)');
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (default: 3600)
     */
    async set(key, value, ttl = 3600) {
        try {
            const data = {
                value,
                cachedAt: Date.now()
            };

            this.cache.set(key, data);
            
            if (ttl > 0) {
                this.expirations.set(key, Date.now() + (ttl * 1000));
            }

            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or null
     */
    async get(key) {
        try {
            // Check if expired
            if (this.isExpired(key)) {
                this.delete(key);
                return null;
            }

            const data = this.cache.get(key);
            return data ? data.value : null;

        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    async delete(key) {
        this.cache.delete(key);
        this.expirations.delete(key);
        return true;
    }

    /**
     * Delete all keys matching pattern
     * @param {string} pattern - Pattern to match (supports * wildcard)
     */
    async deletePattern(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let deleted = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                await this.delete(key);
                deleted++;
            }
        }

        console.log(`🗑️  Deleted ${deleted} cached keys matching ${pattern}`);
        return deleted;
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} Whether key exists
     */
    async exists(key) {
        if (this.isExpired(key)) {
            this.delete(key);
            return false;
        }
        return this.cache.has(key);
    }

    /**
     * Get multiple keys at once
     * @param {string[]} keys - Array of keys
     * @returns {Object} Object with key-value pairs
     */
    async mget(keys) {
        const result = {};
        
        for (const key of keys) {
            result[key] = await this.get(key);
        }

        return result;
    }

    /**
     * Set multiple key-value pairs at once
     * @param {Object} keyValues - Object with key-value pairs
     * @param {number} ttl - Time to live in seconds
     */
    async mset(keyValues, ttl = 3600) {
        for (const [key, value] of Object.entries(keyValues)) {
            await this.set(key, value, ttl);
        }
        return true;
    }

    /**
     * Increment a number value
     * @param {string} key - Cache key
     * @param {number} amount - Amount to increment (default: 1)
     */
    async incr(key, amount = 1) {
        const value = await this.get(key) || 0;
        const newValue = (typeof value === 'number' ? value : 0) + amount;
        await this.set(key, newValue);
        return newValue;
    }

    /**
     * Get cache stats
     * @returns {Object} Cache statistics
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        let active = 0;
        let totalSize = 0;

        for (const [key, data] of this.cache.entries()) {
            if (this.isExpired(key)) {
                expired++;
            } else {
                active++;
                totalSize += JSON.stringify(data.value).length;
            }
        }

        return {
            total: this.cache.size,
            active,
            expired,
            sizeKB: (totalSize / 1024).toFixed(2),
            hitRate: this.hitRate || 0
        };
    }

    /**
     * Clear all cache
     */
    async clear() {
        this.cache.clear();
        this.expirations.clear();
        console.log('🗑️  Cache cleared');
        return true;
    }

    /**
     * Wrap a function with caching
     * @param {string} key - Cache key
     * @param {Function} fn - Function to cache
     * @param {number} ttl - Time to live in seconds
     */
    async wrap(key, fn, ttl = 3600) {
        const cached = await this.get(key);
        
        if (cached !== null) {
            return cached;
        }

        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }

    // =========================
    // HELPER METHODS
    // =========================

    /**
     * Check if a key is expired
     */
    isExpired(key) {
        const expiration = this.expirations.get(key);
        if (!expiration) return false;
        return Date.now() > expiration;
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, expiration] of this.expirations.entries()) {
            if (now > expiration) {
                this.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
        }
    }
}

// Export singleton
const cacheSystem = new CacheSystem();

// Helper functions for common cache patterns
const cacheHelpers = {
    /**
     * Cache user data
     */
    cacheUser: async (userId, userData, ttl = 1800) => {
        return cacheSystem.set(`user:${userId}`, userData, ttl);
    },

    /**
     * Get cached user
     */
    getUser: async (userId) => {
        return cacheSystem.get(`user:${userId}`);
    },

    /**
     * Cache API response
     */
    cacheAPI: async (endpoint, params, data, ttl = 300) => {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        return cacheSystem.set(key, data, ttl);
    },

    /**
     * Get cached API response
     */
    getAPI: async (endpoint, params) => {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        return cacheSystem.get(key);
    },

    /**
     * Cache content
     */
    cacheContent: async (contentType, contentId, data, ttl = 3600) => {
        return cacheSystem.set(`content:${contentType}:${contentId}`, data, ttl);
    },

    /**
     * Get cached content
     */
    getContent: async (contentType, contentId) => {
        return cacheSystem.get(`content:${contentType}:${contentId}`);
    },

    /**
     * Invalidate user cache
     */
    invalidateUser: async (userId) => {
        return cacheSystem.deletePattern(`user:${userId}*`);
    },

    /**
     * Invalidate content cache
     */
    invalidateContent: async (contentType, contentId) => {
        return cacheSystem.delete(`content:${contentType}:${contentId}`);
    }
};

module.exports = {
    cache: cacheSystem,
    ...cacheHelpers
};

