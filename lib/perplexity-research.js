/**
 * 🔍 PERPLEXITY RESEARCH SERVICE
 * 
 * AI-powered research for content generation and fact-checking
 * Uses Perplexity API for real-time information gathering
 */

const axios = require('axios');

class PerplexityResearchService {
    constructor() {
        this.apiKey = process.env.PERPLEXITY_API_KEY;
        this.baseURL = 'https://api.perplexity.ai/chat/completions';
        
        if (!this.apiKey) {
            console.warn('⚠️  Perplexity API key not found. Research features will be limited.');
        }
    }

    /**
     * Research Spanish learning topics
     * @param {string} topic - Topic to research
     * @param {string} level - CEFR level (A1, A2, B1, B2, C1, C2)
     * @returns {Object} Research results
     */
    async researchSpanishTopic(topic, level = 'B1') {
        try {
            if (!this.apiKey) {
                return this.getFallbackResearch(topic, level);
            }

            const prompt = `Research Spanish language learning content about "${topic}" for ${level} level learners. 
            
            Focus on:
            - Key vocabulary words (5-10 words)
            - Common phrases and expressions
            - Cultural context and usage
            - Grammar points relevant to ${level} level
            - Real-world examples
            
            Provide practical, actionable information that a ${level} learner can understand and use.`;

            const response = await axios.post(this.baseURL, {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Spanish language teacher. Provide accurate, helpful information for language learners.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const research = response.data.choices[0].message.content;

            return {
                success: true,
                topic,
                level,
                research,
                vocabulary: this.extractVocabulary(research),
                phrases: this.extractPhrases(research),
                grammar: this.extractGrammar(research),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Perplexity research error:', error);
            return this.getFallbackResearch(topic, level);
        }
    }

    /**
     * Research current events in Spanish
     * @param {string} country - Spanish-speaking country
     * @param {string} level - CEFR level
     * @returns {Object} News research
     */
    async researchSpanishNews(country = 'Spain', level = 'B1') {
        try {
            if (!this.apiKey) {
                return this.getFallbackNews(country, level);
            }

            const prompt = `Find recent news from ${country} that would be appropriate for ${level} level Spanish learners.
            
            Include:
            - Simple news summary
            - Key vocabulary with English translations
            - Cultural context
            - Discussion questions for learners`;

            const response = await axios.post(this.baseURL, {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Spanish news teacher. Present current events in simple, clear Spanish appropriate for language learners.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.2
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const news = response.data.choices[0].message.content;

            return {
                success: true,
                country,
                level,
                news,
                vocabulary: this.extractVocabulary(news),
                discussionQuestions: this.extractDiscussionQuestions(news),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Perplexity news research error:', error);
            return this.getFallbackNews(country, level);
        }
    }

    /**
     * Research cultural topics
     * @param {string} topic - Cultural topic
     * @param {string} country - Spanish-speaking country
     * @returns {Object} Cultural research
     */
    async researchSpanishCulture(topic, country = 'Spain') {
        try {
            if (!this.apiKey) {
                return this.getFallbackCulture(topic, country);
            }

            const prompt = `Research ${topic} in ${country}. 
            
            Include:
            - Cultural significance
            - Traditions and customs
            - Key vocabulary
            - How to participate or observe
            - Regional variations`;

            const response = await axios.post(this.baseURL, {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a cultural expert on Spanish-speaking countries. Provide accurate, engaging cultural information.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.4
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const culture = response.data.choices[0].message.content;

            return {
                success: true,
                topic,
                country,
                culture,
                vocabulary: this.extractVocabulary(culture),
                traditions: this.extractTraditions(culture),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Perplexity culture research error:', error);
            return this.getFallbackCulture(topic, country);
        }
    }

    /**
     * Research grammar explanations
     * @param {string} grammarPoint - Grammar topic
     * @param {string} level - CEFR level
     * @returns {Object} Grammar research
     */
    async researchSpanishGrammar(grammarPoint, level = 'B1') {
        try {
            if (!this.apiKey) {
                return this.getFallbackGrammar(grammarPoint, level);
            }

            const prompt = `Explain ${grammarPoint} in Spanish for ${level} level learners.
            
            Include:
            - Clear explanation with examples
            - Common mistakes to avoid
            - Practice exercises
            - When to use this grammar point`;

            const response = await axios.post(this.baseURL, {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Spanish grammar expert. Explain grammar clearly with practical examples.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const grammar = response.data.choices[0].message.content;

            return {
                success: true,
                grammarPoint,
                level,
                grammar,
                examples: this.extractExamples(grammar),
                commonMistakes: this.extractMistakes(grammar),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Perplexity grammar research error:', error);
            return this.getFallbackGrammar(grammarPoint, level);
        }
    }

    // =========================
    // HELPER METHODS
    // =========================

    /**
     * Extract vocabulary from research text
     */
    extractVocabulary(text) {
        // Simple extraction - look for words in quotes or after "vocabulario"
        const vocabMatches = text.match(/vocabulario[:\s]*([^.]*)/gi);
        if (vocabMatches) {
            return vocabMatches.map(match => 
                match.replace(/vocabulario[:\s]*/gi, '').trim()
            ).filter(v => v.length > 0);
        }
        return [];
    }

    /**
     * Extract phrases from research text
     */
    extractPhrases(text) {
        // Look for phrases in quotes
        const phraseMatches = text.match(/"([^"]+)"/g);
        if (phraseMatches) {
            return phraseMatches.map(phrase => phrase.replace(/"/g, ''));
        }
        return [];
    }

    /**
     * Extract grammar points
     */
    extractGrammar(text) {
        const grammarMatches = text.match(/gramática[:\s]*([^.]*)/gi);
        if (grammarMatches) {
            return grammarMatches.map(match => 
                match.replace(/gramática[:\s]*/gi, '').trim()
            ).filter(g => g.length > 0);
        }
        return [];
    }

    /**
     * Extract discussion questions
     */
    extractDiscussionQuestions(text) {
        const questionMatches = text.match(/\?[^?]*\?/g);
        if (questionMatches) {
            return questionMatches.map(q => q.trim());
        }
        return [];
    }

    /**
     * Extract traditions
     */
    extractTraditions(text) {
        const traditionMatches = text.match(/tradición[:\s]*([^.]*)/gi);
        if (traditionMatches) {
            return traditionMatches.map(match => 
                match.replace(/tradición[:\s]*/gi, '').trim()
            ).filter(t => t.length > 0);
        }
        return [];
    }

    /**
     * Extract examples
     */
    extractExamples(text) {
        const exampleMatches = text.match(/ejemplo[:\s]*([^.]*)/gi);
        if (exampleMatches) {
            return exampleMatches.map(match => 
                match.replace(/ejemplo[:\s]*/gi, '').trim()
            ).filter(e => e.length > 0);
        }
        return [];
    }

    /**
     * Extract common mistakes
     */
    extractMistakes(text) {
        const mistakeMatches = text.match(/error[:\s]*([^.]*)/gi);
        if (mistakeMatches) {
            return mistakeMatches.map(match => 
                match.replace(/error[:\s]*/gi, '').trim()
            ).filter(m => m.length > 0);
        }
        return [];
    }

    // =========================
    // FALLBACK METHODS
    // =========================

    getFallbackResearch(topic, level) {
        return {
            success: false,
            topic,
            level,
            research: `Research about ${topic} for ${level} level learners. (Perplexity API not available)`,
            vocabulary: [],
            phrases: [],
            grammar: [],
            fallback: true,
            timestamp: new Date().toISOString()
        };
    }

    getFallbackNews(country, level) {
        return {
            success: false,
            country,
            level,
            news: `News from ${country} for ${level} level learners. (Perplexity API not available)`,
            vocabulary: [],
            discussionQuestions: [],
            fallback: true,
            timestamp: new Date().toISOString()
        };
    }

    getFallbackCulture(topic, country) {
        return {
            success: false,
            topic,
            country,
            culture: `Cultural information about ${topic} in ${country}. (Perplexity API not available)`,
            vocabulary: [],
            traditions: [],
            fallback: true,
            timestamp: new Date().toISOString()
        };
    }

    getFallbackGrammar(grammarPoint, level) {
        return {
            success: false,
            grammarPoint,
            level,
            grammar: `Grammar explanation for ${grammarPoint} at ${level} level. (Perplexity API not available)`,
            examples: [],
            commonMistakes: [],
            fallback: true,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new PerplexityResearchService();

