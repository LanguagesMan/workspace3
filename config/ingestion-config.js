/**
 * 📋 CONTENT INGESTION CONFIGURATION
 * 
 * Centralized configuration for all ingestion pipelines
 */

module.exports = {
    // Video ingestion settings
    videos: {
        enabled: true,
        videosPerChannel: 10,
        channels: [
            { id: 'UCidV7Vl1t2reW8C25L3M_-A', name: 'Español con Juan', level: 'B1' },
            { id: 'UCNXjk2tMoMhXWPJ8_AqjFBQ', name: 'Spanish Dict', level: 'A2' },
            { id: 'UCaUwqYvwdUEuKlP27zU4D1w', name: 'Butterfly Spanish', level: 'A2' },
            { id: 'UC3AEFwCBHNk0DRXQPYmY9nw', name: 'Why Not Spanish', level: 'B1' },
            { id: 'UCdPzTCv5DHKGw_F_oi3HUvA', name: 'Easy Spanish', level: 'A1' },
            { id: 'UCf8jsIaPjC08rK7b4FbdLqg', name: 'Dreaming Spanish', level: 'B1' },
            { id: 'UCmRtXPnznj9eeqj4d7CqkNQ', name: 'SpanishPod101', level: 'A2' }
        ]
    },

    // Article ingestion settings
    articles: {
        enabled: true,
        articlesPerFeed: 10,
        generateVariants: true, // Generate simplified/advanced versions
        feeds: [
            {
                name: 'BBC Mundo',
                url: 'https://www.bbc.com/mundo/topics/cj48lp6k8d2t/rss.xml',
                level: 'B2',
                topics: ['news', 'world']
            },
            {
                name: 'El País',
                url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
                level: 'C1',
                topics: ['news', 'spain']
            },
            {
                name: 'DW Español',
                url: 'https://rss.dw.com/xml/rss-sp-all',
                level: 'B2',
                topics: ['news', 'world']
            },
            {
                name: 'BBC Mundo - América Latina',
                url: 'https://www.bbc.com/mundo/topics/cyzxw19r18qt/rss.xml',
                level: 'B2',
                topics: ['news', 'latinamerica']
            },
            {
                name: 'CNN en Español',
                url: 'http://rss.cnn.com/rss/cnn_spanish.rss',
                level: 'B2',
                topics: ['news', 'world']
            },
            {
                name: 'National Geographic en Español',
                url: 'https://www.nationalgeographic.es/feed',
                level: 'C1',
                topics: ['science', 'nature', 'culture']
            }
        ]
    },

    // Podcast ingestion settings
    podcasts: {
        enabled: true,
        episodesPerFeed: 3,
        transcribeAudio: true,
        clipDuration: {
            min: 30, // seconds
            max: 90,
            target: 60
        },
        feeds: [
            {
                name: 'Notes in Spanish',
                url: 'https://www.notesinspanish.com/feed/podcast/',
                level: 'B1',
                category: 'learning'
            },
            {
                name: 'Coffee Break Spanish',
                url: 'https://feeds.megaphone.fm/coffeebreakspanish',
                level: 'A2',
                category: 'learning'
            },
            {
                name: 'News in Slow Spanish',
                url: 'https://feeds.feedburner.com/NewsinslowspanishLatino',
                level: 'B2',
                category: 'news'
            },
            {
                name: 'Duolingo Spanish Podcast',
                url: 'https://feeds.megaphone.fm/duolingospanishpodcast',
                level: 'B1',
                category: 'stories'
            },
            {
                name: 'SpanishPod101',
                url: 'https://www.spanishpod101.com/learningcenter/feed/rss',
                level: 'A2',
                category: 'learning'
            }
        ]
    },

    // Enrichment settings
    enrichment: {
        enabled: true,
        vocabularyLimit: 25, // words per content item
        keyPhrasesLimit: 10,
        questionsCount: 5,
        identifyGrammar: true
    },

    // Scheduling settings (for cron jobs)
    schedule: {
        enabled: false, // Enable after setup
        cronExpression: '0 2 * * *', // Run at 2 AM daily
        timezone: 'America/New_York'
    },

    // Rate limiting
    rateLimits: {
        youtubeApiDelay: 1000, // ms between requests
        firecrawlDelay: 3000,
        whisperDelay: 2000,
        openaiDelay: 1000
    },

    // Storage settings
    storage: {
        podcastCacheDir: './cache/podcasts',
        maxPodcastSize: 200 * 1024 * 1024, // 200 MB
        cleanupOldFiles: true,
        cleanupAfterDays: 30
    },

    // Notification settings
    notifications: {
        sendSummary: false, // Enable after email service setup
        emailRecipients: ['admin@example.com'],
        notifyOnErrors: true,
        errorThreshold: 3 // Number of failures before notification
    }
};


