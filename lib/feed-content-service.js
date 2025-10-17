const fs = require('fs');
const path = require('path');
const videoCatalog = require('./video-catalog');
const { parseSRT } = require('./srt-parser');

class FeedContentService {
    constructor() {
        this.catalogLookup = this.buildCatalogLookup();
        this.cachedVideosJson = null;
        this.cachedArticlesJson = null;
    }

    buildCatalogLookup() {
        const lookup = new Map();
        try {
            const catalogEntries = videoCatalog.getAllVideos();
            catalogEntries.forEach(entry => {
                const candidates = new Set();
                if (entry.id) candidates.add(entry.id.toLowerCase());
                if (entry.filename) candidates.add(entry.filename.toLowerCase());
                if (entry.path) candidates.add(decodeURIComponent(entry.path).toLowerCase());
                candidates.forEach(key => lookup.set(key, entry));
            });
        } catch (error) {
            console.warn('⚠️ feed-content-service: unable to build catalog lookup', error.message);
        }
        return lookup;
    }

    loadJsonFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (error) {
            console.warn(`⚠️ feed-content-service: failed to read ${filePath}`, error.message);
        }
        return null;
    }

    getVideosJson() {
        if (!this.cachedVideosJson) {
            const videosJsonPath = path.join(__dirname, '..', 'public', 'api', 'videos.json');
            this.cachedVideosJson = this.loadJsonFile(videosJsonPath);
        }
        return this.cachedVideosJson;
    }

    getArticlesJson() {
        if (!this.cachedArticlesJson) {
            const articlesPath = path.join(__dirname, '..', 'public', 'api', 'articles.json');
            this.cachedArticlesJson = this.loadJsonFile(articlesPath);
            if (!this.cachedArticlesJson) {
                const backup = path.join(__dirname, '..', 'cache', 'articles.json');
                this.cachedArticlesJson = this.loadJsonFile(backup);
            }
        }
        return this.cachedArticlesJson;
    }

    resolveVideoUrl(entry) {
        if (!entry) return null;
        if (entry.videoUrl) return entry.videoUrl;
        if (entry.url) {
            try {
                const parsed = new URL(entry.url, 'http://localhost');
                return parsed.pathname + parsed.search + parsed.hash;
            } catch (_) {
                return entry.url;
            }
        }
        if (entry.path) {
            return entry.path.startsWith('/') ? entry.path : `/${entry.path}`;
        }
        if (entry.filename) {
            return `/videos/${entry.filename}`;
        }
        return null;
    }

    loadTranscriptionFromSRT(videoPath) {
        try {
            if (!videoPath) return [];
            const cleanPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;
            const base = path.basename(cleanPath, path.extname(cleanPath));

            // Try to load BOTH .es.srt (Spanish) and .en.srt (English) files
            // These are created by the batch transcription service
            const spanishCandidates = [
                path.join(__dirname, '..', 'public', 'videos', 'langfeed', `${base}.es.srt`),
                path.join(__dirname, '..', 'public', 'videos', 'reels', `${base}.es.srt`),
                path.join(__dirname, '..', 'public', 'videos', 'langfeed', `${base}.srt`),
                path.join(__dirname, '..', 'public', 'videos', 'reels', `${base}.srt`)
            ];

            const englishCandidates = [
                path.join(__dirname, '..', 'public', 'videos', 'langfeed', `${base}.en.srt`),
                path.join(__dirname, '..', 'public', 'videos', 'reels', `${base}.en.srt`)
            ];

            // Load Spanish transcription
            let spanishContent = null;
            for (const candidate of spanishCandidates) {
                if (fs.existsSync(candidate)) {
                    spanishContent = fs.readFileSync(candidate, 'utf-8');
                    break;
                }
            }

            if (!spanishContent) return [];

            const spanishLines = parseSRT(spanishContent);
            if (!spanishLines || !spanishLines.length) return [];

            // Load English translation (if exists)
            let englishContent = null;
            for (const candidate of englishCandidates) {
                if (fs.existsSync(candidate)) {
                    englishContent = fs.readFileSync(candidate, 'utf-8');
                    break;
                }
            }

            let englishLines = [];
            if (englishContent) {
                englishLines = parseSRT(englishContent);
            }

            // Merge Spanish + English by matching timestamps
            return spanishLines.map((spanishLine, index) => {
                // Find matching English line by timestamp or index
                const englishLine = englishLines.find(en =>
                    Math.abs(en.startTime - spanishLine.startTime) < 0.5
                ) || englishLines[index];

                return {
                    startTime: spanishLine.startTime,
                    endTime: spanishLine.endTime,
                    spanish: spanishLine.spanish,
                    english: englishLine?.spanish || this.simpleTranslate(spanishLine.spanish) || spanishLine.spanish
                };
            });
        } catch (error) {
            console.warn('⚠️ feed-content-service: failed reading SRT', error.message);
        }
        return [];
    }

    simpleTranslate(spanish) {
        // Basic word-by-word translation for common Spanish words
        if (!spanish) return '';

        const wordMap = {
            'hola': 'hello', 'adiós': 'goodbye', 'gracias': 'thank you',
            'por favor': 'please', 'sí': 'yes', 'no': 'no',
            'buenos días': 'good morning', 'buenas tardes': 'good afternoon',
            'buenas noches': 'good night', 'cómo': 'how', 'qué': 'what',
            'cuándo': 'when', 'dónde': 'where', 'por qué': 'why',
            'yo': 'I', 'tú': 'you', 'él': 'he', 'ella': 'she',
            'nosotros': 'we', 'ellos': 'they', 'tengo': 'I have',
            'soy': 'I am', 'estoy': 'I am', 'voy': "I'm going",
            'quiero': 'I want', 'me gusta': 'I like', 'necesito': 'I need'
        };

        let translated = spanish.toLowerCase();
        for (const [es, en] of Object.entries(wordMap)) {
            translated = translated.replace(new RegExp(es, 'gi'), en);
        }
        return translated.charAt(0).toUpperCase() + translated.slice(1);
    }

    normalizeVideoEntry(entry, index = 0) {
        if (!entry) return null;

        const videoUrl = this.resolveVideoUrl(entry);
        if (!videoUrl) {
            console.warn('⚠️ feed-content-service: skipping video without URL', entry.id || entry.filename);
            return null;
        }

        const catalogKey = entry.id?.toLowerCase() ||
            entry.filename?.toLowerCase() ||
            videoUrl.toLowerCase();

        const catalogEntry = this.catalogLookup.get(catalogKey) ||
            this.catalogLookup.get(decodeURIComponent(videoUrl).toLowerCase()) ||
            null;

        const id = entry.id || catalogEntry?.id || `video-${index}`;
        const title = entry.title || catalogEntry?.title || catalogEntry?.name || 'Spanish Video';
        const level = entry.level || catalogEntry?.level || 'A1';
        const tags = [];
        if (entry.theme) tags.push(entry.theme);
        if (entry.tags && Array.isArray(entry.tags)) tags.push(...entry.tags);

        const subtitlesPath = catalogEntry?.subtitlesPath
            ? decodeURIComponent(catalogEntry.subtitlesPath)
            : entry.subtitlesPath
                ? decodeURIComponent(entry.subtitlesPath)
                : null;

        let transcription = [];
        if (entry.transcription?.lines && entry.transcription.lines.length) {
            transcription = entry.transcription.lines;
        } else if (subtitlesPath) {
            transcription = this.loadTranscriptionFromSRT(subtitlesPath);
        } else if (entry.spanish) {
            transcription = [{
                startTime: 0,
                endTime: 5,
                spanish: entry.spanish,
                english: entry.english || null
            }];
        }

        const difficulty = typeof entry.difficulty === 'object'
            ? entry.difficulty
            : { score: entry.difficulty || null };

        return {
            id,
            title,
            description: entry.description || entry.spanish || null,
            level,
            cefrLevel: level,
            difficulty,
            duration: entry.duration || catalogEntry?.duration || null,
            videoUrl,
            thumbnail: entry.thumbnail || catalogEntry?.thumbnail || null,
            tags,
            words: (entry.words || []).map(w => w.toLowerCase()),
            transcription: { lines: transcription },
            source: catalogEntry?.source || entry.source || 'video'
        };
    }

    async getVideos(options = {}) {
        const { limit, level, includeTranscript = true } = options;
        const videosJson = this.getVideosJson();

        let videoEntries = [];
        if (videosJson && Array.isArray(videosJson.videos)) {
            videoEntries = videosJson.videos;
        } else if (Array.isArray(videosJson)) {
            videoEntries = videosJson;
        } else {
            console.warn('⚠️ feed-content-service: videos.json not available, using catalog fallback');
            videoEntries = videoCatalog.getAllVideos().map(item => ({
                id: item.id,
                title: item.title,
                path: decodeURIComponent(item.path),
                level: item.level || 'A1',
                duration: item.duration,
                thumbnail: item.thumbnail,
                subtitlesPath: item.subtitlesPath ? decodeURIComponent(item.subtitlesPath) : null,
                source: item.source
            }));
        }

        let normalized = videoEntries
            .map((entry, idx) => this.normalizeVideoEntry(entry, idx))
            .filter(Boolean);

        if (!includeTranscript) {
            normalized = normalized.map(video => ({
                ...video,
                transcription: []
            }));
        }

        if (level) {
            normalized = normalized.filter(video => (video.level || '').startsWith(level));
        }

        if (limit) {
            normalized = normalized.slice(0, Number(limit));
        }

        return normalized;
    }

    async getArticles(options = {}) {
        const { limit, level } = options;
        const articlesJson = this.getArticlesJson();
        const articles = [];

        if (articlesJson) {
            const sourceArticles = Array.isArray(articlesJson.articles)
                ? articlesJson.articles
                : Array.isArray(articlesJson)
                    ? articlesJson
                    : [];

            sourceArticles.forEach((article, index) => {
                if (!article || !article.content) return;
                articles.push({
                    id: article.id || `article-${index}`,
                    title: article.title || 'Artículo en español',
                    summary: article.summary || article.snippet || null,
                    content: article.content,
                    level: article.level || 'B1',
                    topics: article.topics || [],
                    tags: article.tags || [],
                    readingTimeMinutes: article.readingTime || null,
                    source: article.source || 'article',
                    imageUrl: article.image || article.imageUrl || null
                });
            });
        }

        let filtered = articles;
        if (level) {
            filtered = filtered.filter(article => (article.level || '').startsWith(level));
        }
        if (limit) {
            filtered = filtered.slice(0, Number(limit));
        }

        return filtered;
    }
}

module.exports = new FeedContentService();
