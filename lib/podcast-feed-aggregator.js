/**
 * 🎙️ PODCAST FEED AGGREGATOR
 * 
 * Aggregates Spanish podcasts from RSS feeds
 * Downloads episode metadata and audio files
 * Prepares for Whisper transcription
 */

const RSSParser = require('rss-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const parser = new RSSParser();

// Spanish Podcast RSS Feeds
const PODCAST_FEEDS = [
    {
        name: 'News in Slow Spanish',
        url: 'https://www.newsinslowspanish.com/feed/podcast/',
        level: 'B1',
        category: 'news',
        description: 'Current events at a slower pace'
    },
    {
        name: 'Duolingo Spanish Podcast',
        url: 'https://podcast.duolingo.com/spanish/rss.xml',
        level: 'A2',
        category: 'stories',
        description: 'Real stories from Latin America'
    },
    {
        name: 'SpanishPod101',
        url: 'https://feeds.megaphone.fm/ESP8124392662',
        level: 'A2',
        category: 'learning',
        description: 'Learn Spanish with audio lessons'
    },
    {
        name: 'Notes in Spanish',
        url: 'http://notesinspanish.libsyn.com/rss',
        level: 'B1',
        category: 'conversation',
        description: 'Real Spanish conversations'
    },
    {
        name: 'Coffee Break Spanish',
        url: 'https://radiolingua.com/feed/podcast/cbs',
        level: 'A1',
        category: 'learning',
        description: 'Learn Spanish step-by-step'
    }
];

class PodcastFeedAggregator {
    constructor() {
        this.downloadDir = path.join(__dirname, '../cache/podcasts');
        this.ensureDownloadDir();
    }

    /**
     * Ensure download directory exists
     */
    ensureDownloadDir() {
        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir, { recursive: true });
            console.log(`✅ Created podcast directory: ${this.downloadDir}`);
        }
    }

    /**
     * Aggregate podcasts from all feeds
     * @param {number} limit - Max episodes per feed
     * @returns {Array} Aggregated podcast episodes
     */
    async aggregateAllFeeds(limit = 10) {
        console.log('🎙️ Starting podcast aggregation...');
        const allEpisodes = [];

        for (const feed of PODCAST_FEEDS) {
            try {
                console.log(`   Fetching: ${feed.name}...`);
                const episodes = await this.aggregateFeed(feed, limit);
                allEpisodes.push(...episodes);
                console.log(`   ✅ ${episodes.length} episodes from ${feed.name}`);
            } catch (error) {
                console.error(`   ❌ Error fetching ${feed.name}:`, error.message);
            }
        }

        console.log(`\n🎉 Total: ${allEpisodes.length} podcast episodes aggregated`);
        return allEpisodes;
    }

    /**
     * Aggregate podcasts from a single feed
     * @param {Object} feedConfig - Feed configuration
     * @param {number} limit - Max episodes
     * @returns {Array} Episodes
     */
    async aggregateFeed(feedConfig, limit = 10) {
        try {
            const feed = await parser.parseURL(feedConfig.url);
            const episodes = [];

            for (let i = 0; i < Math.min(limit, feed.items.length); i++) {
                const item = feed.items[i];
                
                // Extract audio URL
                const audioUrl = item.enclosure?.url || item.guid;
                if (!audioUrl) continue;

                // Create episode object
                const episode = {
                    title: item.title || 'Untitled',
                    description: this.cleanDescription(item.contentSnippet || item.description || ''),
                    audioUrl: audioUrl,
                    publishedAt: new Date(item.pubDate || Date.now()),
                    duration: this.parseDuration(item.itunes?.duration),
                    source: feedConfig.name,
                    level: feedConfig.level,
                    category: feedConfig.category,
                    guid: item.guid || item.link
                };

                episodes.push(episode);
            }

            return episodes;

        } catch (error) {
            console.error(`Error parsing feed ${feedConfig.name}:`, error.message);
            return [];
        }
    }

    /**
     * Clean HTML from description
     */
    cleanDescription(text) {
        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .trim()
            .substring(0, 500); // Limit length
    }

    /**
     * Parse duration string to seconds
     */
    parseDuration(duration) {
        if (!duration) return null;
        
        // Handle formats like "1:23:45" or "23:45" or "300"
        if (typeof duration === 'number') return duration;
        
        const parts = duration.split(':').map(p => parseInt(p));
        
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
            return parts[0];
        }
        
        return null;
    }

    /**
     * Download audio file for episode
     * @param {string} audioUrl - URL to audio file
     * @param {string} episodeId - Episode ID for filename
     * @returns {string} Local file path
     */
    async downloadAudio(audioUrl, episodeId) {
        try {
            const filename = `${episodeId}.mp3`;
            const filepath = path.join(this.downloadDir, filename);

            // Skip if already downloaded
            if (fs.existsSync(filepath)) {
                console.log(`   ⏭️  Already downloaded: ${filename}`);
                return filepath;
            }

            console.log(`   ⬇️  Downloading: ${filename}...`);

            const response = await axios({
                method: 'get',
                url: audioUrl,
                responseType: 'stream',
                timeout: 60000, // 60 second timeout
                maxRedirects: 5
            });

            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`   ✅ Downloaded: ${filename}`);
                    resolve(filepath);
                });
                writer.on('error', reject);
            });

        } catch (error) {
            console.error(`   ❌ Download failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Save episodes to database
     * @param {Array} episodes - Episodes to save
     * @returns {Array} Saved episodes with IDs
     */
    async saveToDatabase(episodes) {
        console.log('\n💾 Saving episodes to database...');
        const saved = [];

        for (const episode of episodes) {
            try {
                // Check if episode already exists
                const existing = await prisma.podcast.findFirst({
                    where: { guid: episode.guid }
                }).catch(() => null);

                if (existing) {
                    console.log(`   ⏭️  Already exists: ${episode.title.substring(0, 50)}...`);
                    saved.push(existing);
                    continue;
                }

                // Create new podcast episode
                const podcast = await prisma.podcast.create({
                    data: {
                        title: episode.title,
                        description: episode.description,
                        audioUrl: episode.audioUrl,
                        source: episode.source,
                        level: episode.level,
                        category: episode.category,
                        duration: episode.duration,
                        publishedAt: episode.publishedAt,
                        guid: episode.guid,
                        transcribed: false
                    }
                }).catch(err => {
                    // If Podcast model doesn't exist, skip database save
                    console.log(`   ⚠️  Database model not ready, skipping save`);
                    return null;
                });

                if (podcast) {
                    saved.push(podcast);
                    console.log(`   ✅ Saved: ${episode.title.substring(0, 50)}...`);
                }

            } catch (error) {
                console.error(`   ❌ Error saving ${episode.title}:`, error.message);
            }
        }

        console.log(`\n✅ Saved ${saved.length} episodes to database`);
        return saved;
    }

    /**
     * Get podcasts by level
     * @param {string} level - CEFR level (A1-C2)
     * @returns {Array} Podcasts
     */
    async getPodcastsByLevel(level) {
        try {
            const podcasts = await prisma.podcast.findMany({
                where: { level },
                orderBy: { publishedAt: 'desc' },
                take: 20
            });
            return podcasts;
        } catch (error) {
            console.error('Error getting podcasts:', error);
            return [];
        }
    }

    /**
     * Get all podcast clips (after transcription & segmentation)
     * @param {string} level - CEFR level
     * @returns {Array} Podcast clips
     */
    async getPodcastClipsByLevel(level) {
        try {
            const clips = await prisma.podcastClip.findMany({
                where: { level },
                include: { podcast: true },
                orderBy: { createdAt: 'desc' },
                take: 50
            });
            return clips;
        } catch (error) {
            console.error('Error getting podcast clips:', error);
            return [];
        }
    }
}

// Export singleton
const podcastAggregator = new PodcastFeedAggregator();
module.exports = podcastAggregator;

// CLI command
if (require.main === module) {
    (async () => {
        console.log('🎙️ PODCAST AGGREGATOR\n');
        
        try {
            // Aggregate all feeds
            const episodes = await podcastAggregator.aggregateAllFeeds(5);
            
            // Save to database
            await podcastAggregator.saveToDatabase(episodes);
            
            console.log('\n✅ Podcast aggregation complete!');
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Error:', error);
            process.exit(1);
        }
    })();
}

