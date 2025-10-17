/**
 * 🌐 FAST TRANSLATION SERVICE
 * 
 * Production-ready translation with multiple providers
 * Features:
 * - Google Translate (primary - fast & accurate)
 * - DeepL (secondary - high quality)
 * - OpenAI (tertiary - context-aware)
 * - Supabase caching (instant repeated lookups)
 * - Common words dictionary (instant lookups)
 * - Automatic failover between providers
 */

require('dotenv').config();
const { Translate } = require('@google-cloud/translate').v2;
const deepl = require('deepl-node');
const OpenAI = require('openai');
const { supabase, isConfigured } = require('./supabase-client');

class FastTranslationService {
    constructor() {
        // Initialize Google Translate
        this.googleTranslate = new Translate({
            credentials: {
                client_email: 'translation-service@project.iam.gserviceaccount.com',
                private_key: process.env.GOOGLE_PRIVATE_KEY || ''
            },
            projectId: 'langfeed'
        });

        // Initialize DeepL (secondary provider)
        this.deeplTranslator = null;
        if (process.env.DEEPL_API_KEY) {
            this.deeplTranslator = new deepl.Translator(process.env.DEEPL_API_KEY);
        }

        // Initialize OpenAI (optional fallback)
        this.openai = null;
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }

        // Caching
        this.memoryCache = new Map();
        this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

        // Stats
        this.stats = {
            googleCalls: 0,
            deeplCalls: 0,
            openaiCalls: 0,
            cacheHits: 0,
            dictionaryHits: 0
        };

        console.log('🌐 Fast Translation Service initialized');
        console.log('   Providers: Google Translate → DeepL → OpenAI');
    }

    /**
     * Translate text with automatic provider fallback
     */
    async translateText(text, sourceLang = 'es', targetLang = 'en') {
        if (!text || text.trim() === '') {
            return '';
        }

        // Normalize
        text = text.trim();
        if (sourceLang === targetLang) {
            return text;
        }

        // Check common words dictionary first (instant)
        const commonTranslation = this.getCommonTranslation(text, sourceLang, targetLang);
        if (commonTranslation) {
            this.stats.dictionaryHits++;
            return commonTranslation;
        }

        // Check memory cache
        const cacheKey = `${text}|${sourceLang}|${targetLang}`;
        if (this.memoryCache.has(cacheKey)) {
            const cached = this.memoryCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                this.stats.cacheHits++;
                return cached.translation;
            }
        }

        // Check Supabase cache
        const cachedTranslation = await this.getCachedTranslation(text, sourceLang, targetLang);
        if (cachedTranslation) {
            this.memoryCache.set(cacheKey, {
                translation: cachedTranslation,
                timestamp: Date.now()
            });
            this.stats.cacheHits++;
            return cachedTranslation;
        }

        // Try providers in order: Google → DeepL → OpenAI
        let translation = null;
        let provider = null;

        try {
            translation = await this.translateWithGoogle(text, sourceLang, targetLang);
            provider = 'google';
            this.stats.googleCalls++;
        } catch (error) {
            console.log('⚠️  Google Translate failed, trying DeepL...', error.message);
            
            if (this.deeplTranslator) {
                try {
                    translation = await this.translateWithDeepL(text, sourceLang, targetLang);
                    provider = 'deepl';
                    this.stats.deeplCalls++;
                } catch (error2) {
                    console.log('⚠️  DeepL failed, trying OpenAI...', error2.message);
                    
                    if (this.openai) {
                        try {
                            translation = await this.translateWithOpenAI(text, sourceLang, targetLang);
                            provider = 'openai';
                            this.stats.openaiCalls++;
                        } catch (error3) {
                            console.error('❌ All translation providers failed:', error3.message);
                            return text; // Return original text as fallback
                        }
                    } else {
                        console.error('❌ Google and DeepL failed, OpenAI not configured');
                        return text;
                    }
                }
            } else {
                console.log('⚠️  DeepL not configured, trying OpenAI...');
                if (this.openai) {
                    try {
                        translation = await this.translateWithOpenAI(text, sourceLang, targetLang);
                        provider = 'openai';
                        this.stats.openaiCalls++;
                    } catch (error2) {
                        console.error('❌ Google and OpenAI failed, DeepL not configured');
                        return text;
                    }
                } else {
                    console.error('❌ Google failed, no other providers configured');
                    return text;
                }
            }
        }

        // Cache the result
        if (translation) {
            this.memoryCache.set(cacheKey, {
                translation,
                timestamp: Date.now()
            });
            await this.cacheTranslation(text, translation, sourceLang, targetLang);
            console.log(`✅ Translated via ${provider}: "${text.substring(0, 30)}..." → "${translation.substring(0, 30)}..."`);
        }

        return translation || text;
    }

    /**
     * Google Translate (fast & accurate)
     */
    async translateWithGoogle(text, sourceLang, targetLang) {
        const [translation] = await this.googleTranslate.translate(text, {
            from: sourceLang,
            to: targetLang
        });
        return translation;
    }

    /**
     * DeepL (high quality)
     */
    async translateWithDeepL(text, sourceLang, targetLang) {
        // DeepL uses specific language codes
        const langMap = {
            'es': 'ES',
            'en': 'EN-US',
            'fr': 'FR',
            'de': 'DE',
            'it': 'IT',
            'pt': 'PT-BR'
        };

        const result = await this.deeplTranslator.translateText(
            text,
            langMap[sourceLang] || sourceLang.toUpperCase(),
            langMap[targetLang] || targetLang.toUpperCase()
        );

        return result.text;
    }

    /**
     * OpenAI (context-aware, slowest but most intelligent)
     */
    async translateWithOpenAI(text, sourceLang, targetLang) {
        const langNames = {
            'es': 'Spanish',
            'en': 'English',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese'
        };

        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional translator. Translate from ${langNames[sourceLang]} to ${langNames[targetLang]}. Return ONLY the translation, no explanations.`
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        return response.choices[0].message.content.trim();
    }

    /**
     * Translate word (optimized for single words)
     */
    async translateWord(word, sourceLang = 'es', targetLang = 'en') {
        word = word.trim().toLowerCase();
        
        // Check common words first
        const commonTranslation = this.getCommonTranslation(word, sourceLang, targetLang);
        if (commonTranslation) {
            this.stats.dictionaryHits++;
            return commonTranslation;
        }

        // Use regular translation
        return await this.translateText(word, sourceLang, targetLang);
    }

    /**
     * Batch translate (parallel processing)
     */
    async batchTranslate(texts, sourceLang = 'es', targetLang = 'en') {
        console.log(`🔄 Batch translating ${texts.length} texts...`);
        
        const translations = await Promise.all(
            texts.map(text => this.translateText(text, sourceLang, targetLang))
        );

        console.log(`✅ Batch translation complete: ${translations.length} items`);
        return translations;
    }

    /**
     * Get common word translation (instant lookup)
     */
    getCommonTranslation(word, sourceLang, targetLang) {
        if (sourceLang !== 'es' || targetLang !== 'en') {
            return null;
        }

        word = word.toLowerCase();
        const dictionary = this.getCommonWordsDictionary();
        return dictionary[word] || null;
    }

    /**
     * Common Spanish words dictionary (80+ words)
     */
    getCommonWordsDictionary() {
        return {
            // Greetings & polite
            'hola': 'hello', 'adiós': 'goodbye', 'gracias': 'thank you', 'thanks': 'thanks',
            'por favor': 'please', 'perdón': 'sorry', 'disculpa': 'excuse me',
            'buenos días': 'good morning', 'buenas tardes': 'good afternoon',
            'buenas noches': 'good night', 'hasta luego': 'see you later',
            'sí': 'yes', 'no': 'no', 'ok': 'ok', 'bien': 'well',
            
            // Articles
            'el': 'the', 'la': 'the', 'los': 'the', 'las': 'the',
            'un': 'a', 'una': 'a', 'unos': 'some', 'unas': 'some',
            
            // Common verbs
            'es': 'is', 'son': 'are', 'está': 'is', 'están': 'are',
            'ser': 'to be', 'estar': 'to be',
            'tiene': 'has', 'tienen': 'have', 'tener': 'to have',
            'hay': 'there is', 'hacer': 'to do', 'ir': 'to go',
            'ver': 'to see', 'dar': 'to give', 'poder': 'can',
            'decir': 'to say', 'querer': 'to want', 'saber': 'to know',
            'venir': 'to come', 'pasar': 'to happen', 'poner': 'to put',
            
            // Common adjectives
            'muy': 'very', 'más': 'more', 'menos': 'less',
            'grande': 'big', 'pequeño': 'small', 'bueno': 'good',
            'malo': 'bad', 'nuevo': 'new', 'viejo': 'old',
            'largo': 'long', 'corto': 'short', 'alto': 'tall',
            'bajo': 'short', 'rápido': 'fast', 'lento': 'slow',
            
            // Common prepositions
            'en': 'in', 'de': 'of', 'a': 'to', 'con': 'with',
            'por': 'for', 'para': 'for', 'sin': 'without',
            'sobre': 'about', 'entre': 'between', 'desde': 'from',
            'hasta': 'until', 'durante': 'during', 'según': 'according to',
            
            // Common nouns
            'casa': 'house', 'tiempo': 'time', 'día': 'day',
            'año': 'year', 'vez': 'time', 'persona': 'person',
            'mundo': 'world', 'vida': 'life', 'hombre': 'man',
            'mujer': 'woman', 'niño': 'child', 'cosa': 'thing',
            'agua': 'water', 'comida': 'food', 'familia': 'family',
            'amigo': 'friend', 'trabajo': 'work', 'escuela': 'school'
        };
    }

    /**
     * Get cached translation from Supabase
     */
    async getCachedTranslation(sourceText, sourceLang, targetLang) {
        if (!isConfigured()) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('translations')
                .select('target_text')
                .eq('source_text', sourceText)
                .eq('source_lang', sourceLang)
                .eq('target_lang', targetLang)
                .single();

            if (error || !data) {
                return null;
            }

            return data.target_text;
        } catch (error) {
            return null;
        }
    }

    /**
     * Cache translation in Supabase
     */
    async cacheTranslation(sourceText, targetText, sourceLang, targetLang) {
        if (!isConfigured()) {
            return;
        }

        try {
            await supabase
                .from('translations')
                .insert({
                    source_text: sourceText,
                    target_text: targetText,
                    source_lang: sourceLang,
                    target_lang: targetLang,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            // Ignore duplicate errors
            if (!error.message?.includes('duplicate')) {
                console.error('Error caching translation:', error);
            }
        }
    }

    /**
     * Get service statistics
     */
    getStats() {
        return {
            ...this.stats,
            memoryCacheSize: this.memoryCache.size,
            providers: {
                google: this.stats.googleCalls,
                deepl: this.stats.deeplCalls,
                openai: this.stats.openaiCalls
            },
            cacheHitRate: this.stats.cacheHits / (
                this.stats.googleCalls + 
                this.stats.deeplCalls + 
                this.stats.openaiCalls + 
                this.stats.cacheHits + 
                this.stats.dictionaryHits
            ) || 0
        };
    }

    /**
     * Clear memory cache
     */
    clearCache() {
        this.memoryCache.clear();
        console.log('✅ Memory cache cleared');
    }
}

// Create singleton instance
const translationService = new FastTranslationService();

module.exports = translationService;

