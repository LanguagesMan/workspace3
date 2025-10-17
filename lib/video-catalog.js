// 📹 VIDEO CATALOG API - Serve all videos from Langfeed
const fs = require('fs');
const path = require('path');

class VideoCatalog {
    constructor() {
        // 🎯 LOAD ALL VIDEOS: Langfeed + public/videos/reels/ (412+ total)
        this.langfeedPath = path.join(__dirname, '..', 'public', 'videos', 'langfeed');
        this.publicReelsPath = path.join(__dirname, '..', 'public', 'videos', 'reels');
        this.publicPath = path.join(__dirname, '..', 'public', 'videos');

        this.videos = [];
        this.loadVideos();
    }

    loadVideos() {
        console.log(`📹 Loading video catalog from MULTIPLE sources...`);

        // Load from Langfeed (if exists) - ONLY ROOT MP4s (skip subdirectories)
        if (fs.existsSync(this.langfeedPath)) {
            const langfeedVideos = this.scanDirectoryFlat(this.langfeedPath, 'langfeed');
            langfeedVideos.forEach(v => v.source = 'langfeed');
            this.videos.push(...langfeedVideos);
            console.log(`✅ Loaded ${langfeedVideos.length} MP4 videos from Langfeed`);
        }

        // Load from public/videos/reels/ (priority - 81+ videos)
        if (fs.existsSync(this.publicReelsPath)) {
            const reelsVideos = this.scanDirectory(this.publicReelsPath, 'reels');
            reelsVideos.forEach(v => v.source = 'reels');
            this.videos.push(...reelsVideos);
            console.log(`✅ Loaded ${reelsVideos.length} videos from public/videos/reels/`);
        }

        console.log(`🎬 TOTAL: ${this.videos.length} videos loaded`);
    }

    scanDirectoryFlat(dir, basePath = '') {
        // FLAT scan - only root level, no subdirectories, only MP4s
        const videos = [];

        try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                if (item.startsWith('.')) continue; // Skip hidden files

                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);

                // ONLY files (skip directories), ONLY MP4s
                if (stats.isFile() && item.match(/\.mp4$/i)) {
                    const videoName = path.parse(item).name;
                    const srtPath = path.join(dir, videoName + '.srt');
                    const relativePath = path.join(basePath, item);

                    const hasSrt = fs.existsSync(srtPath);

                    let viralTitle = this.formatTitle(videoName);
                    if (hasSrt) {
                        try {
                            const srtContent = fs.readFileSync(srtPath, 'utf-8');
                            const spanishMatch = srtContent.match(/[áéíóúñü¿¡][\w\s]*/i);
                            if (spanishMatch) {
                                viralTitle = this.generateViralTitle(srtContent);
                            }
                        } catch (err) {
                            console.error(`Error reading SRT for viral title: ${err.message}`);
                        }
                    }

                    const video = {
                        id: this.generateId(relativePath),
                        name: this.formatTitle(videoName),
                        title: viralTitle,
                        path: '/videos/' + encodeURIComponent(relativePath.replace(/\\/g, '/')),
                        filename: item,
                        folder: basePath || 'videos',
                        hasSubtitles: hasSrt,
                        subtitlesPath: hasSrt
                            ? '/videos/' + encodeURIComponent(path.join(basePath, videoName + '.srt').replace(/\\/g, '/'))
                            : null,
                        duration: null,
                        thumbnail: null,
                        source: 'langfeed'
                    };

                    videos.push(video);
                }
            }
        } catch (error) {
            console.error(`Error scanning ${dir}:`, error.message);
        }

        return videos;
    }

    scanDirectory(dir, basePath = '') {
        const videos = [];

        try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                if (item.startsWith('.')) continue; // Skip hidden files

                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);

                if (stats.isDirectory()) {
                    // Recursively scan subdirectories
                    videos.push(...this.scanDirectory(fullPath, path.join(basePath, item)));
                } else if (item.match(/\.(mp4|webm|mov)$/i)) {
                    // Found a video file (MP4, WebM, or MOV)
                    const videoName = path.parse(item).name;
                    const srtPath = path.join(dir, videoName + '.srt');
                    const relativePath = path.join(basePath, item);

                    // Check if there's an SRT file
                    const hasSrt = fs.existsSync(srtPath);

                    // Generate viral title from subtitle content if available
                    let viralTitle = this.formatTitle(videoName);
                    if (hasSrt) {
                        try {
                            const srtContent = fs.readFileSync(srtPath, 'utf-8');
                            // Extract first Spanish subtitle text for title generation
                            const spanishMatch = srtContent.match(/[áéíóúñü¿¡][\w\s]*/i);
                            if (spanishMatch) {
                                viralTitle = this.generateViralTitle(srtContent);
                            }
                        } catch (err) {
                            console.error(`Error reading SRT for viral title: ${err.message}`);
                        }
                    }

                    const video = {
                        id: this.generateId(relativePath),
                        name: this.formatTitle(videoName),
                        title: viralTitle, // Use viral title instead of filename
                        path: '/videos/' + encodeURIComponent(relativePath.replace(/\\/g, '/')), // Proper URL encoding
                        filename: item,
                        folder: basePath || 'videos',
                        hasSubtitles: hasSrt,
                        subtitlesPath: hasSrt
                            ? '/videos/' + encodeURIComponent(path.join(basePath, videoName + '.srt').replace(/\\/g, '/'))
                            : null,
                        duration: null,
                        thumbnail: null,
                        source: this.isLangfeed ? 'langfeed' : 'public'
                    };

                    videos.push(video);
                }
            }
        } catch (error) {
            console.error(`Error scanning ${dir}:`, error.message);
        }

        return videos;
    }

    generateId(path) {
        return path.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    formatTitle(filename) {
        // Clean up filename to make a nice title
        return filename
            .replace(/_202\d+_\w+$/i, '') // Remove timestamp suffixes
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .substring(0, 50);
    }

    generateViralTitle(subtitleText) {
        // AI-powered viral title generation based on actual content
        // Research shows 90% of users decide based on title
        if (!subtitleText) return 'Spanish Learning Video';

        const text = subtitleText.toLowerCase();

        // Detect emotional triggers for viral titles
        if (text.includes('calor') || text.includes('frío')) {
            return '🔥 When Spanish Weather Gets CRAZY!';
        }
        if (text.includes('vida') || text.includes('no me gusta')) {
            return '😱 Real Spanish: When Life Gets Tough';
        }
        if (text.includes('comida') || text.includes('comer')) {
            return '🍕 Spanish Food Talk You NEED to Know!';
        }
        if (text.includes('dinero') || text.includes('money')) {
            return '💰 Money Talk in Spanish - Essential!';
        }
        if (text.includes('amor') || text.includes('love')) {
            return '💕 Spanish Love Language - Must Learn!';
        }
        if (text.includes('trabajo') || text.includes('work')) {
            return '💼 Work Spanish: What They Really Say';
        }
        if (text.includes('jesus') || text.includes('dios')) {
            return '🙏 Spanish Expressions Explained!';
        }

        // Default viral title format (TikTok/Instagram style)
        // Extract only Spanish text (skip timestamps and English)
        const lines = subtitleText.split('\n');
        const spanishLine = lines.find(line => {
            const hasSpanishChars = /[áéíóúñü¿¡]/i.test(line);
            const hasSpanishWords = /\b(por|qué|que|está|muy|sí|no|el|la|es|yo|tú)\b/i.test(line);
            const isNotTimestamp = !/-->|\d{2}:\d{2}:\d{2}/.test(line);
            return (hasSpanishChars || hasSpanishWords) && isNotTimestamp;
        });

        if (spanishLine) {
            const firstWords = spanishLine.trim().split(' ').slice(0, 3).join(' ');
            return `✨ Learn: "${firstWords}..." in Spanish!`;
        }

        return '🎬 Spanish Learning Video';
    }

    getAllVideos() {
        // Prioritize langfeed videos (user transcribed all with proper SRTs)
        return this.videos.sort((a, b) => {
            // Sort order: langfeed FIRST (has transcripts), then reels as fallback
            if (a.source === 'langfeed' && b.source !== 'langfeed') return -1;
            if (b.source === 'langfeed' && a.source !== 'langfeed') return 1;
            return 0;
        });
    }

    getVideosByFolder(folder) {
        return this.videos.filter(v => v.folder === folder);
    }

    getVideosWithSubtitles() {
        return this.videos.filter(v => v.hasSubtitles);
    }

    getRandomVideos(count = 10) {
        const shuffled = [...this.videos].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

module.exports = new VideoCatalog();
