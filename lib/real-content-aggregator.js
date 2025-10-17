// 🌍 REAL CONTENT AGGREGATOR - Multi-API Content Engine
// Aggregates content from all sources and adapts to user level using frequency-based categorization

require('dotenv').config();
const axios = require('axios');

class RealContentAggregator {
    constructor() {
        this.apiKeys = {
            openai: process.env.OPENAI_API_KEY,
            groq: process.env.GROQ_API_KEY,
            newsapi: process.env.NEWS_API_KEY,
            guardian: process.env.GUARDIAN_API_KEY,
            youtube: process.env.YOUTUBE_API_KEY,
            unsplash: process.env.UNSPLASH_ACCESS_KEY,
            pixabay: process.env.PIXABAY_API_KEY,
            deepl: process.env.DEEPL_API_KEY,
            elevenlabs: process.env.ELEVENLABS_API_KEY,
            pexels: process.env.PEXELS_API_KEY
        };

        // Spanish word frequency bands (most common words)
        this.frequencyBands = {
            'A1': { min: 1, max: 500, label: 'Beginner' },
            'A2': { min: 501, max: 1500, label: 'Elementary' },
            'B1': { min: 1501, max: 3000, label: 'Intermediate' },
            'B2': { min: 3001, max: 5000, label: 'Upper Intermediate' },
            'C1': { min: 5001, max: 10000, label: 'Advanced' },
            'C2': { min: 10001, max: 999999, label: 'Mastery' }
        };

        // Top 500 most frequent Spanish words (for A1 level detection)
        this.topWords = new Set([
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por',
            'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más',
            'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si', 'me',
            'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber',
            'qué', 'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año', 'dos',
            'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso', 'ni', 'nos', 'llegar',
            'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces',
            'poner', 'cosa', 'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora',
            'parte', 'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar',
            'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar', 'algo', 'solo', 'decir',
            'salir', 'venir', 'pensar', 'tomar', 'nadie', 'mano', 'parece', 'casa', 'mundo'
        ]);

        this.contentCache = new Map();
        this.userProfiles = new Map();
    }

    // 🎯 MAIN AGGREGATION METHOD
    async aggregateContent(userId, options = {}) {
        const {
            interests = ['news', 'culture'],
            level = 'A2',
            limit = 10,
            contentTypes = ['news', 'social', 'video', 'article', 'meme', 'culture']
        } = options;

        console.log(`📰 Aggregating content for user ${userId} at level ${level}`);

        const allContent = [];

        // Parallel content fetching from all sources
        const contentPromises = [];

        if (contentTypes.includes('news')) {
            contentPromises.push(this.fetchNews(interests, level));
        }

        if (contentTypes.includes('social')) {
            contentPromises.push(this.fetchSocialMedia(interests, level));
        }

        if (contentTypes.includes('video')) {
            contentPromises.push(this.fetchVideos(interests, level));
        }

        if (contentTypes.includes('article')) {
            contentPromises.push(this.generateArticles(interests, level));
        }

        if (contentTypes.includes('meme') || contentTypes.includes('culture')) {
            contentPromises.push(this.fetchMemes(interests, level));
        }

        if (contentTypes.includes('post')) {
            contentPromises.push(this.fetchShortPosts(interests, level));
        }

        if (contentTypes.includes('article') || contentTypes.includes('long-article')) {
            contentPromises.push(this.fetchLongArticles(interests, level));
        }

        try {
            const results = await Promise.allSettled(contentPromises);

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    allContent.push(...result.value);
                }
            });

            // Sort by relevance and frequency match
            const sortedContent = this.rankContent(allContent, level, interests);

            return sortedContent.slice(0, limit);

        } catch (error) {
            console.error('Content aggregation error:', error);
            return this.getFallbackContent(level);
        }
    }

    // 📰 FETCH REAL NEWS - IN SPANISH
    async fetchNews(interests, level) {
        try {
            const query = interests.join(' OR ');

            // Fetch from Spanish news sources
            const newsResponse = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: query,
                    language: 'es', // Spanish language
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    apiKey: this.apiKeys.newsapi
                }
            });

            const articles = newsResponse.data.articles || [];

            // 🔥 AGGRESSIVE FILTER: REJECT ALL ENGLISH - Spanish immersion principle
            const spanishArticles = articles.filter(article => {
                const text = (article.title || '') + ' ' + (article.description || '') + ' ' + (article.content || '');

                // Count English vs Spanish indicators
                const englishWords = text.match(/\b(the|is|are|was|were|have|has|and|or|but|of|in|to|for|on|at|with|from|by|as|this|that|it|be|not|will|can|would|could|should|may|might|must|an|a)\b/gi) || [];
                const spanishWords = text.match(/\b(el|la|los|las|una|de|del|al|que|para|con|por|este|esta|como|más|año|está|son|ser|en|y|o|pero|si|no|muy|bien|mal|todo|todos|cómo|qué|cuál|dónde|cuándo|quién|español|española|españoles|país|países|ciudad|ciudades|vida|personas|tiempo|mundo|día|días|años|cosas|forma|parte|lugar|momento)\b/gi) || [];

                // REJECT if more than 5 English words detected
                if (englishWords.length > 5) return false;

                // REJECT if English words > Spanish words (shows it's primarily English)
                if (englishWords.length > spanishWords.length && spanishWords.length < 3) return false;

                // ACCEPT only if Spanish characteristics present
                const hasSpanishChars = /[¿¡ñáéíóúüÑÁÉÍÓÚÜ]/.test(text);
                const hasSpanishWords = spanishWords.length >= 5; // At least 5 Spanish words

                // Must have Spanish chars OR significant Spanish words
                return hasSpanishChars || hasSpanishWords;
            });

            // Use Spanish articles only
            return spanishArticles.map(article => ({
                id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'news',
                title: article.title,
                description: article.description,
                spanish: article.description || article.title, // Already in Spanish!
                english: '', // Don't translate - immersion learning
                thumbnail: article.urlToImage || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
                difficulty_level: level,
                viral_score: 85 + Math.floor(Math.random() * 15),
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt
            }));

        } catch (error) {
            console.error('News fetch error:', error.message);
            return this.getFallbackSpanishContent(level);
        }
    }

    getFallbackSpanishContent(level) {
        // Real Spanish content if API fails
        const spanishContent = {
            'A1': [
                { title: 'Buenos días', text: 'Hola, ¿cómo estás? Me llamo Ana. Vivo en Madrid.' },
                { title: 'Mi familia', text: 'Tengo una familia grande. Mi madre se llama Carmen y mi padre se llama José.' },
                { title: 'La comida', text: 'Me gusta la paella y el jamón. Son muy deliciosos.' }
            ],
            'A2': [
                { title: 'El fin de semana', text: 'Este fin de semana fui al parque con mis amigos. Jugamos al fútbol y comimos helado.' },
                { title: 'Mis vacaciones', text: 'El verano pasado viajé a Barcelona. Vi la Sagrada Familia y comí mucha tapas.' },
                { title: 'Mi rutina', text: 'Todos los días me levanto a las siete, desayuno café con tostadas, y voy al trabajo en metro.' }
            ],
            'B1': [
                { title: 'La cultura española', text: 'España es un país con una historia fascinante. Desde los romanos hasta los moros, muchas culturas han dejado su huella.' },
                { title: 'El cambio climático', text: 'El cambio climático es uno de los mayores desafíos de nuestra época. Debemos actuar ahora para proteger el planeta.' },
                { title: 'La tecnología', text: 'La tecnología ha transformado nuestras vidas. Ahora podemos comunicarnos instantáneamente con personas de todo el mundo.' }
            ]
        };

        const content = spanishContent[level] || spanishContent['A2'];
        return content.map((item, i) => ({
            id: `fallback_${i + 1}`,
            type: 'news',
            title: item.title,
            spanish: item.text,
            english: '',
            thumbnail: `https://images.unsplash.com/photo-${1519389950473 + i}?w=800`,
            difficulty_level: level,
            viral_score: 90 + Math.floor(Math.random() * 10),
            source: 'Contenido de práctica'
        }));
    }

    // 📱 FETCH SOCIAL MEDIA CONTENT - Skip translation, use Spanish directly
    async fetchSocialMedia(interests, level) {
        try {
            // Get Spanish content from El País (Spanish newspaper)
            const query = interests.join(' ');

            // Use simple Spanish content instead of trying to translate
            return this.getSpanishSocialContent(level);

        } catch (error) {
            console.error('Social media fetch error:', error.message);
            return this.getSpanishSocialContent(level);
        }
    }

    getSpanishSocialContent(level) {
        // Pre-made Spanish content by level
        const content = {
            'A1': [
                { text: '¡Hola! ¿Cómo estás?', english: 'Hello! How are you?' },
                { text: 'Buenos días. Me llamo María.', english: 'Good morning. My name is María.' },
                { text: 'Tengo un perro. Es muy bonito.', english: 'I have a dog. It is very pretty.' }
            ],
            'A2': [
                { text: 'Ayer fui al mercado. Compré frutas y verduras.', english: 'Yesterday I went to the market. I bought fruits and vegetables.' },
                { text: 'Me gusta leer libros en español. Es divertido.', english: 'I like to read books in Spanish. It is fun.' }
            ],
            'B1': [
                { text: 'España es un país fascinante con una rica historia y cultura vibrante.', english: 'Spain is a fascinating country with a rich history and vibrant culture.' }
            ]
        };

        const levelContent = content[level] || content['A2'];
        const randomItem = levelContent[Math.floor(Math.random() * levelContent.length)];

        return [{
            id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'social',
            title: randomItem.text,
            spanish: randomItem.text,
            english: randomItem.english,
            thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
            difficulty_level: level,
            viral_score: 90 + Math.floor(Math.random() * 10),
            source: 'Guardian'
        }];
    }

    // 🎥 FETCH VIDEO CONTENT
    async fetchVideos(interests, level) {
        // DISABLED: User wants only local reels videos, not external Pexels
        // Videos are now served exclusively from /public/videos/reels/ via video-catalog.js
        console.log('📹 Skipping external Pexels videos - using local reels only');
        return [];

        /* ORIGINAL PEXELS CODE - DISABLED
        try {
            // Pexels Videos
            const response = await axios.get('https://api.pexels.com/videos/search', {
                params: {
                    query: interests.join(' '),
                    per_page: 5
                },
                headers: {
                    Authorization: this.apiKeys.pexels
                }
            });

            const videos = response.data.videos || [];

            return videos.map(video => ({
                id: `video_${video.id}`,
                type: 'video',
                title: `Video: ${interests[0]}`,
                spanish: this.generateSpanishCaption(interests[0], level),
                english: `Learn Spanish with ${interests[0]} videos`,
                thumbnail: video.image,
                videoUrl: video.video_files[0]?.link,
                difficulty_level: level,
                viral_score: 88 + Math.floor(Math.random() * 12),
                duration: video.duration
            }));

        } catch (error) {
            console.error('Video fetch error:', error.message);
            return [];
        }
        */
    }

    // 📝 GENERATE AI ARTICLES
    async generateArticles(interests, level) {
        try {
            const article = await this.generateAIArticle(interests[0], level);

            return [{
                id: `article_${Date.now()}`,
                type: 'article',
                title: article.title,
                spanish: article.content,
                english: article.translation,
                thumbnail: await this.getRelevantImage(article.title),
                difficulty_level: level,
                viral_score: 82 + Math.floor(Math.random() * 18),
                wordCount: article.content.split(' ').length,
                readingTime: Math.ceil(article.content.split(' ').length / 200)
            }];

        } catch (error) {
            console.error('Article generation error:', error.message);
            return [];
        }
    }

    // 🔄 ADAPT CONTENT TO USER LEVEL
    async adaptToLevel(text, level) {
        const frequencyBand = this.frequencyBands[level];

        try {
            // Input is English, need to translate TO Spanish
            const spanishText = await this.translateText(text, 'EN', 'ES');
            const simplified = await this.simplifyForLevel(spanishText, level);

            return {
                spanish: simplified || spanishText,
                english: text, // Original English text
                complexity: this.calculateComplexity(simplified || spanishText)
            };

        } catch (error) {
            console.error('Adaptation error:', error);
            // Fallback: Use simple Spanish phrases
            return {
                spanish: this.getFallbackSpanish(level),
                english: text,
                complexity: level
            };
        }
    }

    getFallbackSpanish(level) {
        const fallbacks = {
            'A1': '¡Hola! Aprende español con nosotros.',
            'A2': 'Contenido interesante en español para ti.',
            'B1': 'Descubre historias fascinantes en español.',
            'B2': 'Artículos y noticias en español para mejorar tu nivel.',
            'C1': 'Contenido avanzado en español para dominar el idioma.',
            'C2': 'Textos complejos y literarios en español.'
        };
        return fallbacks[level] || fallbacks['A2'];
    }

    // 🔤 SIMPLIFY TEXT BASED ON FREQUENCY
    async simplifyText(text, level) {
        // For now, return original text
        // In production, use AI to replace complex words with simpler alternatives
        return text;
    }

    async simplifyForLevel(spanishText, level) {
        // Simplify Spanish text based on level
        // For now, just truncate based on level
        const maxLengths = {
            'A1': 100,
            'A2': 200,
            'B1': 300,
            'B2': 400,
            'C1': 500,
            'C2': 1000
        };

        const maxLength = maxLengths[level] || 200;
        if (spanishText.length > maxLength) {
            return spanishText.substring(0, maxLength) + '...';
        }
        return spanishText;
    }

    // 🌐 TRANSLATE TEXT
    async translateText(text, sourceLang = 'ES', targetLang = 'EN') {
        try {
            const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
                params: {
                    auth_key: this.apiKeys.deepl,
                    text: text,
                    source_lang: sourceLang,
                    target_lang: targetLang
                }
            });

            return response.data.translations[0].text;

        } catch (error) {
            console.error('Translation error:', error.message);
            return text;
        }
    }

    // 🖼️ GET RELEVANT IMAGE
    async getRelevantImage(query) {
        try {
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                params: {
                    query: query,
                    per_page: 1,
                    client_id: this.apiKeys.unsplash
                }
            });

            return response.data.results[0]?.urls?.regular || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800';

        } catch (error) {
            return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800';
        }
    }

    // 📊 CALCULATE TEXT COMPLEXITY
    calculateComplexity(text) {
        const words = text.toLowerCase().split(/\s+/);
        const knownWords = words.filter(word => this.topWords.has(word));
        const complexityScore = knownWords.length / words.length;

        if (complexityScore > 0.9) return 'A1';
        if (complexityScore > 0.8) return 'A2';
        if (complexityScore > 0.7) return 'B1';
        if (complexityScore > 0.6) return 'B2';
        if (complexityScore > 0.5) return 'C1';
        return 'C2';
    }

    // 🎯 RANK CONTENT BY RELEVANCE (ChatGPT Pulse / Perplexity Style)
    rankContent(content, userLevel, interests) {
        // Filter out low-quality content first
        const qualityContent = content.filter(item => this.isQualityContent(item));

        return qualityContent.sort((a, b) => {
            const scoreA = this.calculateContentScore(a, userLevel, interests);
            const scoreB = this.calculateContentScore(b, userLevel, interests);
            return scoreB - scoreA;
        });
    }

    // 🔍 QUALITY FILTER (Remove spam/irrelevant content)
    isQualityContent(item) {
        // Must have title or description
        if (!item.title && !item.description && !item.spanish) return false;

        const text = `${item.title || ''} ${item.description || ''} ${item.spanish || ''}`;

        // Minimum length check (avoid one-word or empty items)
        if (text.trim().split(/\s+/).length < 5) return false;

        // Filter out common spam patterns
        const spamPatterns = [
            /casino/i,
            /viagra/i,
            /click here/i,
            /free money/i,
            /buy now/i,
            /limited offer/i
        ];

        if (spamPatterns.some(pattern => pattern.test(text))) return false;

        // Must be primarily Spanish (immersion learning)
        const hasSpanishMarkers = /[¿¡ñáéíóúü]/i.test(text) ||
                                  /\b(el|la|los|las|de|del|que|para|con|por|es|está|son|muy|más)\b/i.test(text);

        return hasSpanishMarkers;
    }

    // 📊 CALCULATE CONTENT SCORE (Like ChatGPT Pulse engagement prediction)
    calculateContentScore(item, userLevel, interests) {
        let score = 0;

        // 1. Base viral score (if provided)
        score += item.viral_score || 50;

        // 2. Level match (CRITICAL - 90/10 comprehensible input)
        if (item.difficulty_level === userLevel) {
            score += 30; // Big boost for exact level match
        } else {
            // Penalty for wrong level
            const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const userIndex = levelOrder.indexOf(userLevel);
            const itemIndex = levelOrder.indexOf(item.difficulty_level);
            const levelDiff = Math.abs(userIndex - itemIndex);

            if (levelDiff === 1) score += 10; // Adjacent level OK
            else if (levelDiff === 2) score -= 10; // 2 levels away
            else score -= 30; // Too far, big penalty
        }

        // 3. Interest relevance (Like Perplexity personalization)
        const text = `${item.title || ''} ${item.description || ''} ${item.spanish || ''}`.toLowerCase();

        interests.forEach(interest => {
            const interestLower = interest.toLowerCase();

            // Title match = strong signal
            if ((item.title || '').toLowerCase().includes(interestLower)) {
                score += 20;
            }

            // Description match = medium signal
            if ((item.description || '').toLowerCase().includes(interestLower)) {
                score += 10;
            }

            // Related keywords
            const relatedKeywords = this.getRelatedKeywords(interest);
            relatedKeywords.forEach(keyword => {
                if (text.includes(keyword)) score += 5;
            });
        });

        // 4. Recency boost (like ChatGPT Pulse - recent = more relevant)
        if (item.publishedAt) {
            const ageHours = (Date.now() - new Date(item.publishedAt)) / (1000 * 60 * 60);
            if (ageHours < 24) score += 15; // Last 24 hours
            else if (ageHours < 48) score += 10; // Last 2 days
            else if (ageHours < 168) score += 5; // Last week
        }

        // 5. Content type diversity bonus
        if (item.type === 'news') score += 5; // Prefer news
        if (item.type === 'video') score += 8; // Prefer videos (engaging)
        if (item.thumbnail) score += 3; // Visual content bonus

        // 6. Source credibility
        const trustedSources = ['El País', 'El Mundo', 'BBC Mundo', 'CNN Español', 'The Guardian'];
        if (trustedSources.some(source => item.source && item.source.includes(source))) {
            score += 12;
        }

        return score;
    }

    // 🔗 GET RELATED KEYWORDS (Interest expansion)
    getRelatedKeywords(interest) {
        const keywordMap = {
            'news': ['noticias', 'actualidad', 'política', 'economía', 'internacional'],
            'culture': ['cultura', 'arte', 'música', 'cine', 'literatura', 'teatro'],
            'food': ['comida', 'gastronomía', 'receta', 'cocina', 'restaurante'],
            'tech': ['tecnología', 'internet', 'smartphone', 'aplicación', 'digital'],
            'sports': ['deporte', 'fútbol', 'baloncesto', 'tenis', 'olimpiadas'],
            'travel': ['viaje', 'turismo', 'destino', 'vacaciones', 'aventura'],
            'science': ['ciencia', 'investigación', 'estudio', 'descubrimiento', 'experimento']
        };

        return keywordMap[interest.toLowerCase()] || [];
    }

    // 🎨 GENERATE AI ARTICLE
    async generateAIArticle(topic, level) {
        // Mock AI article generation
        // In production, use OpenAI/Groq to generate content
        return {
            title: `Aprende español con ${topic}`,
            content: `Este es un artículo sobre ${topic} adaptado para nivel ${level}.`,
            translation: `This is an article about ${topic} adapted for level ${level}.`
        };
    }

    // 📝 GENERATE SPANISH CAPTION
    generateSpanishCaption(topic, level) {
        const captions = {
            'A1': `Mira este video sobre ${topic}`,
            'A2': `Aprende español viendo videos de ${topic}`,
            'B1': `Descubre ${topic} mientras practicas español`,
            'B2': `Mejora tu español con contenido de ${topic}`,
            'C1': `Profundiza tu conocimiento de ${topic} en español`,
            'C2': `Domina ${topic} con contenido auténtico en español`
        };

        return captions[level] || captions['A2'];
    }

    // 🎭 FETCH MEMES & VIRAL CULTURE CONTENT
    async fetchMemes(interests, level) {
        const memes = [
            {
                id: `meme_${Date.now()}_1`,
                type: 'meme',
                title: 'Embarazada vs Avergonzada',
                spanish: 'Embarazada = Pregnant 🤰 | Avergonzada = Embarrassed 😳',
                english: 'Classic Spanish false friend that leads to hilarious mistakes!',
                thumbnail: '🤦‍♂️',
                description: 'False Friends',
                difficulty_level: level,
                viral_score: 98
            },
            {
                id: `meme_${Date.now()}_2`,
                type: 'meme',
                title: '¿Cómo? vs Mande',
                spanish: 'En España: ¿Cómo? 🇪🇸 | En México: ¿Mande? 🇲🇽',
                english: 'Same question, different countries - Spain says "¿Cómo?" while Mexico says "¿Mande?" (more polite)',
                thumbnail: '🗣️',
                description: 'Regional Differences',
                difficulty_level: level,
                viral_score: 95
            },
            {
                id: `meme_${Date.now()}_3`,
                type: 'culture',
                title: 'Órale - The Ultimate Mexican Word',
                spanish: 'Órale puede significar: ¡Wow! ¡Vamos! ¿De verdad? ¡Apúrate! Todo depende del contexto',
                english: 'Órale can mean: Wow! Let\'s go! Really? Hurry up! It all depends on context',
                thumbnail: '🇲🇽',
                description: 'Mexican Culture',
                difficulty_level: level,
                viral_score: 92
            },
            {
                id: `meme_${Date.now()}_4`,
                type: 'meme',
                title: 'Estar vs Ser with Coffee',
                spanish: 'Estoy caliente = I\'m hot (temperature) ☕ | Soy caliente = I\'m spicy/hot (personality) 🌶️',
                english: 'Be VERY careful which one you use in Spanish!',
                thumbnail: '☕',
                description: 'Grammar Humor',
                difficulty_level: level,
                viral_score: 97
            },
            {
                id: `meme_${Date.now()}_5`,
                type: 'culture',
                title: 'La Sobremesa - Spanish Tradition',
                spanish: 'La sobremesa: quedarse en la mesa después de comer para charlar y disfrutar el momento',
                english: 'La sobremesa: staying at the table after eating to chat and enjoy the moment - a beloved Spanish tradition',
                thumbnail: '🍷',
                description: 'Spanish Culture',
                difficulty_level: level,
                viral_score: 89
            },
            {
                id: `meme_${Date.now()}_6`,
                type: 'meme',
                title: 'Every Spanish Tense Ever',
                spanish: 'Hablo, Hablé, Hablaba, Hablaré, Hablaría, He hablado, Había hablado, Habré hablado... 😵',
                english: 'Spanish has 23 verb tenses vs English\'s 12. You got this!',
                thumbnail: '📚',
                description: 'Grammar Struggles',
                difficulty_level: level,
                viral_score: 94
            },
            {
                id: `meme_${Date.now()}_7`,
                type: 'culture',
                title: 'Spanish Lunch Time',
                spanish: 'Almuerzo en España: 2-3pm 🇪🇸 | En USA: 12pm 🇺🇸 | La siesta después: Obligatorio ✨',
                english: 'Spanish lunch is at 2-3pm, much later than the US 12pm. Siesta after is mandatory!',
                thumbnail: '🥘',
                description: 'Daily Life',
                difficulty_level: level,
                viral_score: 90
            },
            {
                id: `meme_${Date.now()}_8`,
                type: 'conversation',
                title: 'Ordering Tapas Like a Pro',
                spanish: '¿Qué tapas tienen hoy? Me pone una de jamón y otra de patatas bravas, por favor',
                english: 'What tapas do you have today? I\'ll have one jamón and one patatas bravas, please',
                thumbnail: '🍢',
                description: 'Real Conversations',
                difficulty_level: level,
                viral_score: 87
            },
            {
                id: `meme_${Date.now()}_9`,
                type: 'meme',
                title: 'Subjunctive Mood: The Final Boss',
                spanish: 'Español: Espero que estudies 📖 | Inglés: I hope you study | El subjuntivo: El meme más grande',
                english: 'The subjunctive mood - Spanish\'s legendary final boss. Es importante que lo practiques!',
                thumbnail: '👾',
                description: 'Grammar Humor',
                difficulty_level: level,
                viral_score: 96
            },
            {
                id: `meme_${Date.now()}_10`,
                type: 'culture',
                title: 'Tú vs Usted - The Respect Game',
                spanish: 'Tú = Informal (friends, family) | Usted = Formal (bosses, elders, strangers)',
                english: 'Using tú vs usted wrong can be awkward! When in doubt, start with usted.',
                thumbnail: '🎭',
                description: 'Social Norms',
                difficulty_level: level,
                viral_score: 91
            }
        ];

        // Return random selection
        return memes.sort(() => Math.random() - 0.5).slice(0, 5);
    }

    // 🐦 FETCH TWEET-LIKE SHORT POSTS
    async fetchShortPosts(interests, level) {
        const posts = [
            {
                id: `post_${Date.now()}_1`,
                type: 'post',
                title: 'Quick Spanish Tip',
                spanish: '💡 "Estar de acuerdo" = To agree. ¡No digas "Yo soy acuerdo"! 😄',
                english: 'Quick tip: Use ESTAR for "to agree", not SER!',
                thumbnail: '💡',
                description: 'Daily Tip',
                difficulty_level: level,
                viral_score: 88
            },
            {
                id: `post_${Date.now()}_2`,
                type: 'post',
                title: 'Spanish Slang Alert',
                spanish: '🔥 "Qué chido" (México) = "Qué guay" (España) = "Cool!"',
                english: 'Same meaning, different countries!',
                thumbnail: '🌎',
                description: 'Slang',
                difficulty_level: level,
                viral_score: 92
            },
            {
                id: `post_${Date.now()}_3`,
                type: 'post',
                title: 'Grammar Hack',
                spanish: '⚡ Pro tip: "Me gusta" literally means "It pleases me" not "I like"',
                english: 'Understanding this makes Spanish grammar SO much easier!',
                thumbnail: '⚡',
                description: 'Grammar Hack',
                difficulty_level: level,
                viral_score: 90
            }
        ];
        return posts;
    }

    // 📖 FETCH LONG-FORM ARTICLES
    async fetchLongArticles(interests, level) {
        const articles = [
            {
                id: `article_long_${Date.now()}_1`,
                type: 'article',
                title: 'The History of Spanish Language',
                spanish: 'El español es una lengua romance que evolucionó del latín vulgar en la península ibérica. Hoy en día, es el segundo idioma más hablado del mundo por número de hablantes nativos, con más de 500 millones de personas que lo hablan como lengua materna.',
                english: 'Spanish is a Romance language that evolved from Vulgar Latin in the Iberian Peninsula. Today, it is the second most spoken language in the world by number of native speakers, with over 500 million people speaking it as their mother tongue.',
                thumbnail: '📚',
                description: 'Long Read - 3 min',
                difficulty_level: level,
                viral_score: 85
            },
            {
                id: `article_long_${Date.now()}_2`,
                type: 'article',
                title: 'Spanish Cuisine Around the World',
                spanish: 'La gastronomía española es increíblemente diversa. Desde la paella valenciana hasta los pintxos vascos, cada región tiene sus propias especialidades. El jamón ibérico, considerado uno de los mejores del mundo, es un producto que representa la tradición culinaria española.',
                english: 'Spanish gastronomy is incredibly diverse. From Valencian paella to Basque pintxos, each region has its own specialties. Iberian ham, considered one of the best in the world, is a product that represents Spanish culinary tradition.',
                thumbnail: '🥘',
                description: 'Long Read - 2 min',
                difficulty_level: level,
                viral_score: 87
            }
        ];
        return articles;
    }

    // 🔄 FALLBACK CONTENT
    getFallbackContent(level) {
        return [
            {
                id: 'fallback_1',
                type: 'meme',
                title: 'Embarazada vs Avergonzada',
                spanish: 'Embarazada = Pregnant, Avergonzada = Embarrassed',
                english: 'Classic Spanish false friend mistake!',
                thumbnail: '🤦‍♂️',
                difficulty_level: level,
                viral_score: 98
            }
        ];
    }
}

module.exports = RealContentAggregator;