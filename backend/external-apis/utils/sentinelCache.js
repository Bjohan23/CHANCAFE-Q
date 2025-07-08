const NodeCache = require('node-cache');

class SentinelCache {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: parseInt(process.env.SENTINEL_CACHE_TTL) || 3600,
            checkperiod: 300,
            useClones: false,
            maxKeys: 1000
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.cache.on('set', (key, value) => {
            console.log(`💾 [Sentinel Cache] SET: ${key}`);
        });

        this.cache.on('del', (key, value) => {
            console.log(`🗑️ [Sentinel Cache] DEL: ${key}`);
        });

        this.cache.on('expired', (key, value) => {
            console.log(`⏰ [Sentinel Cache] EXPIRED: ${key}`);
        });

        this.cache.on('flush', () => {
            console.log('🧹 [Sentinel Cache] FLUSH: All cache cleared');
        });
    }

    set(key, value, ttl = null) {
        try {
            const success = this.cache.set(key, value, ttl);
            if (success) {
                const actualTTL = ttl || this.cache.options.stdTTL;
                console.log(`✅ [Sentinel Cache] Cached: ${key} (TTL: ${actualTTL}s)`);
            }
            return success;
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error setting ${key}:`, error.message);
            return false;
        }
    }

    get(key) {
        try {
            const value = this.cache.get(key);
            if (value !== undefined) {
                console.log(`✅ [Sentinel Cache] Hit: ${key}`);
                return value;
            } else {
                console.log(`❌ [Sentinel Cache] Miss: ${key}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error getting ${key}:`, error.message);
            return null;
        }
    }

    has(key) {
        try {
            return this.cache.has(key);
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error checking ${key}:`, error.message);
            return false;
        }
    }

    delete(key) {
        try {
            const deleted = this.cache.del(key);
            if (deleted > 0) {
                console.log(`✅ [Sentinel Cache] Deleted: ${key}`);
            }
            return deleted > 0;
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error deleting ${key}:`, error.message);
            return false;
        }
    }

    clear() {
        try {
            this.cache.flushAll();
            console.log('✅ [Sentinel Cache] All cache cleared');
        } catch (error) {
            console.error('❌ [Sentinel Cache] Error clearing cache:', error.message);
        }
    }

    getStats() {
        try {
            const stats = this.cache.getStats();
            return {
                keys: stats.keys,
                hits: stats.hits,
                misses: stats.misses,
                hitRate: stats.hits / (stats.hits + stats.misses) * 100,
                ksize: stats.ksize,
                vsize: stats.vsize
            };
        } catch (error) {
            console.error('❌ [Sentinel Cache] Error getting stats:', error.message);
            return null;
        }
    }

    getKeys() {
        try {
            return this.cache.keys();
        } catch (error) {
            console.error('❌ [Sentinel Cache] Error getting keys:', error.message);
            return [];
        }
    }

    getTTL(key) {
        try {
            return this.cache.getTtl(key);
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error getting TTL for ${key}:`, error.message);
            return null;
        }
    }

    setTTL(key, ttl) {
        try {
            const success = this.cache.ttl(key, ttl);
            if (success) {
                console.log(`✅ [Sentinel Cache] TTL updated for ${key}: ${ttl}s`);
            }
            return success;
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error setting TTL for ${key}:`, error.message);
            return false;
        }
    }

    mget(keys) {
        try {
            return this.cache.mget(keys);
        } catch (error) {
            console.error('❌ [Sentinel Cache] Error getting multiple keys:', error.message);
            return {};
        }
    }

    mset(keyValuePairs) {
        try {
            const success = this.cache.mset(keyValuePairs);
            if (success) {
                console.log(`✅ [Sentinel Cache] Multiple keys set: ${Object.keys(keyValuePairs).length}`);
            }
            return success;
        } catch (error) {
            console.error('❌ [Sentinel Cache] Error setting multiple keys:', error.message);
            return false;
        }
    }

    clearExpired() {
        try {
            this.cache.flushExpired();
            console.log('✅ [Sentinel Cache] Expired keys cleared');
        } catch (error) {
            console.error('❌ [Sentinel Cache] Error clearing expired keys:', error.message);
        }
    }

    clearByPattern(pattern) {
        try {
            const keys = this.cache.keys();
            const keysToDelete = keys.filter(key => key.includes(pattern));
            
            if (keysToDelete.length > 0) {
                this.cache.del(keysToDelete);
                console.log(`✅ [Sentinel Cache] Deleted ${keysToDelete.length} keys matching pattern: ${pattern}`);
            }
            
            return keysToDelete.length;
        } catch (error) {
            console.error(`❌ [Sentinel Cache] Error clearing by pattern ${pattern}:`, error.message);
            return 0;
        }
    }

    logStats() {
        const stats = this.getStats();
        if (stats) {
            console.log('📊 [Sentinel Cache] Statistics:');
            console.log(`   Keys: ${stats.keys}`);
            console.log(`   Hits: ${stats.hits}`);
            console.log(`   Misses: ${stats.misses}`);
            console.log(`   Hit Rate: ${stats.hitRate.toFixed(2)}%`);
            console.log(`   Key Size: ${stats.ksize} bytes`);
            console.log(`   Value Size: ${stats.vsize} bytes`);
        }
    }

    healthCheck() {
        try {
            const testKey = 'health_check_test';
            const testValue = { timestamp: Date.now(), test: true };
            
            this.set(testKey, testValue, 5);
            const retrieved = this.get(testKey);
            this.delete(testKey);
            
            return retrieved !== null && retrieved.test === true;
        } catch (error) {
            console.error('❌ [Sentinel Cache] Health check failed:', error.message);
            return false;
        }
    }
}

module.exports = new SentinelCache();