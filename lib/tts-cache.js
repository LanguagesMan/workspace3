// 🚀 TTS CACHE SYSTEM - In-Memory + File Cache for Performance
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class TTSCache {
    constructor() {
        // In-memory cache for instant access
        this.memoryCache = new Map();

        // Cache configuration
        this.maxMemoryCacheSize = 100; // Store 100 most recent in memory
        this.cacheDir = path.join(__dirname, '..', 'cache', 'tts');
        this.maxFileCacheSize = 1000; // Store 1000 audio files on disk

        // Ensure cache directory exists
        this.initCacheDir();
    }

    async initCacheDir() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            console.log('✅ TTS cache directory initialized:', this.cacheDir);
        } catch (error) {
            console.error('❌ Failed to create cache directory:', error.message);
        }
    }

    // Generate cache key from text and options
    getCacheKey(text, options = {}) {
        const { voice = 'female', language = 'es' } = options;
        const keyString = `${text}-${voice}-${language}`;
        return crypto.createHash('md5').update(keyString).digest('hex');
    }

    // Check if audio exists in cache
    async has(text, options = {}) {
        const cacheKey = this.getCacheKey(text, options);

        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            console.log('🎯 TTS cache HIT (memory):', cacheKey.substring(0, 8));
            return true;
        }

        // Check file cache
        const filePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
        try {
            await fs.access(filePath);
            console.log('🎯 TTS cache HIT (disk):', cacheKey.substring(0, 8));
            return true;
        } catch {
            console.log('❌ TTS cache MISS:', cacheKey.substring(0, 8));
            return false;
        }
    }

    // Get cached audio
    async get(text, options = {}) {
        const cacheKey = this.getCacheKey(text, options);

        // Try memory cache first (fastest)
        if (this.memoryCache.has(cacheKey)) {
            console.log('⚡ Serving from memory cache');
            return this.memoryCache.get(cacheKey);
        }

        // Try file cache
        const filePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
        try {
            const audioBuffer = await fs.readFile(filePath);

            // Store in memory for next time
            this.addToMemoryCache(cacheKey, audioBuffer);

            console.log('💾 Serving from file cache');
            return audioBuffer;
        } catch (error) {
            return null;
        }
    }

    // Store audio in cache
    async set(text, options = {}, audioBuffer) {
        const cacheKey = this.getCacheKey(text, options);

        // Add to memory cache
        this.addToMemoryCache(cacheKey, audioBuffer);

        // Save to file cache
        const filePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
        try {
            await fs.writeFile(filePath, audioBuffer);
            console.log('✅ TTS cached to disk:', cacheKey.substring(0, 8));
        } catch (error) {
            console.error('❌ Failed to save TTS to disk:', error.message);
        }

        // Clean up old files if cache is too large
        await this.cleanupFileCache();
    }

    // Add to memory cache with LRU eviction
    addToMemoryCache(key, value) {
        // Remove oldest if at capacity
        if (this.memoryCache.size >= this.maxMemoryCacheSize) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }

        this.memoryCache.set(key, value);
        console.log(`📊 Memory cache: ${this.memoryCache.size}/${this.maxMemoryCacheSize}`);
    }

    // Clean up file cache (keep most recent)
    async cleanupFileCache() {
        try {
            const files = await fs.readdir(this.cacheDir);

            if (files.length <= this.maxFileCacheSize) {
                return; // No cleanup needed
            }

            // Get file stats
            const fileStats = await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(this.cacheDir, file);
                    const stats = await fs.stat(filePath);
                    return { file, mtime: stats.mtime };
                })
            );

            // Sort by modification time (oldest first)
            fileStats.sort((a, b) => a.mtime - b.mtime);

            // Delete oldest files
            const filesToDelete = fileStats.slice(0, files.length - this.maxFileCacheSize);

            for (const { file } of filesToDelete) {
                await fs.unlink(path.join(this.cacheDir, file));
            }

            console.log(`🧹 Cleaned up ${filesToDelete.length} old TTS cache files`);
        } catch (error) {
            console.error('❌ Cache cleanup error:', error.message);
        }
    }

    // Clear all caches
    async clearAll() {
        // Clear memory cache
        this.memoryCache.clear();

        // Clear file cache
        try {
            const files = await fs.readdir(this.cacheDir);
            await Promise.all(
                files.map(file => fs.unlink(path.join(this.cacheDir, file)))
            );
            console.log('🧹 All TTS caches cleared');
        } catch (error) {
            console.error('❌ Failed to clear file cache:', error.message);
        }
    }

    // Get cache stats
    async getStats() {
        try {
            const files = await fs.readdir(this.cacheDir);
            const totalSize = await files.reduce(async (accPromise, file) => {
                const acc = await accPromise;
                const stats = await fs.stat(path.join(this.cacheDir, file));
                return acc + stats.size;
            }, Promise.resolve(0));

            return {
                memoryEntries: this.memoryCache.size,
                fileEntries: files.length,
                totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
                cacheDir: this.cacheDir
            };
        } catch (error) {
            return {
                memoryEntries: this.memoryCache.size,
                fileEntries: 0,
                totalSizeMB: 0,
                error: error.message
            };
        }
    }
}

module.exports = new TTSCache();
