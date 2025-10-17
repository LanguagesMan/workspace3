// Redis client for caching and feed queue management

import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = createClient({
  url: redisUrl,
})

redis.on('error', (err) => console.error('Redis Client Error', err))

// Connect on module load
if (!redis.isOpen) {
  redis.connect().catch(console.error)
}

// Feed cache helpers
export const feedCache = {
  // Cache user's personalized feed queue
  async setUserFeed(userId: string, contentIds: string[], ttl: number = 3600) {
    const key = `feed:${userId}`
    await redis.set(key, JSON.stringify(contentIds), { EX: ttl })
  },

  async getUserFeed(userId: string): Promise<string[] | null> {
    const key = `feed:${userId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  },

  // Cache SRS review queue
  async setSRSQueue(userId: string, cardIds: string[], ttl: number = 3600) {
    const key = `srs:${userId}`
    await redis.set(key, JSON.stringify(cardIds), { EX: ttl })
  },

  async getSRSQueue(userId: string): Promise<string[] | null> {
    const key = `srs:${userId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  },

  // Cache content metadata for quick access
  async cacheContent(contentId: string, data: unknown, ttl: number = 7200) {
    const key = `content:${contentId}`
    await redis.set(key, JSON.stringify(data), { EX: ttl })
  },

  async getContent<T = unknown>(contentId: string): Promise<T | null> {
    const key = `content:${contentId}`
    const data = await redis.get(key)
    return data ? (JSON.parse(data) as T) : null
  },

  // Invalidate cache
  async invalidateUserFeed(userId: string) {
    await redis.del(`feed:${userId}`)
  },
}

