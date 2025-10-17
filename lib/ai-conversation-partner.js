/**
 * 🧠 AI CONVERSATION PARTNER - Voice-Enabled Language Learning Chatbot
 * 
 * GENIUS FEATURE: Talk with an AI that uses YOUR vocabulary and level
 * 
 * Key Features:
 * - Voice input (Whisper API)
 * - Voice output (OpenAI TTS)
 * - Comprehensible input (95% known, 5% new)
 * - Adapts to user's CEFR level
 * - Uses user's learned vocabulary
 * - Real-time feedback on pronunciation and grammar
 * - Context-aware conversations
 * 
 * Inspired by: Duolingo Max, Babbel Live, Mondly
 */

const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class AIConversationPartner {
    constructor() {
        this.conversationHistory = new Map(); // userId -> messages[]
    }

    /**
     * Load user's vocabulary and level for comprehensible input
     * @param {string} userId - User ID
     * @returns {Object} User profile with vocabulary
     */
    async loadUserProfile(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    words: {
                        where: { saved: true },
                        orderBy: { savedAt: 'desc' }
                    },
                    interests: true
                }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Extract known words
            const knownWords = user.words.map(w => w.word);
            const level = user.currentLevel || 'A2';

            // Get user's interests
            const interests = user.interests.map(i => i.interest);

            return {
                userId: user.id,
                level,
                knownWords,
                interests,
                vocabularySize: knownWords.length
            };
        } catch (error) {
            console.error('Error loading user profile:', error);
            throw error;
        }
    }

    /**
     * Generate AI response using GPT-4 with comprehensible input constraints
     * @param {string} userId - User ID
     * @param {string} userMessage - User's message
     * @param {string} topic - Conversation topic (optional)
     * @returns {Object} AI response with analysis
     */
    async generateResponse(userId, userMessage, topic = null) {
        try {
            // Load user profile
            const profile = await this.loadUserProfile(userId);

            // Get conversation history
            const history = this.conversationHistory.get(userId) || [];

            // Build system prompt with comprehensible input constraints
            const systemPrompt = this.buildSystemPrompt(profile, topic);

            // Build messages for GPT-4
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];

            // Generate response
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages,
                temperature: 0.8,
                max_tokens: 150, // Keep responses concise for language learners
                presence_penalty: 0.6,
                frequency_penalty: 0.3
            });

            const aiResponse = completion.choices[0].message.content;

            // Analyze response for comprehensible input compliance
            const analysis = await this.analyzeResponse(aiResponse, profile);

            // Update conversation history
            history.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            );
            
            // Keep only last 10 messages for context
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }
            
            this.conversationHistory.set(userId, history);

            // Track interaction for adaptive learning
            await this.trackInteraction(userId, userMessage, aiResponse, analysis);

            return {
                response: aiResponse,
                analysis,
                audioUrl: null, // Will be generated separately
                corrections: this.generateCorrections(userMessage, profile),
                newWords: analysis.newWords
            };
        } catch (error) {
            console.error('Error generating AI response:', error);
            throw error;
        }
    }

    /**
     * Build system prompt with comprehensible input constraints
     * @param {Object} profile - User profile
     * @param {string} topic - Conversation topic
     * @returns {string} System prompt
     */
    buildSystemPrompt(profile, topic) {
        const { level, knownWords, interests, vocabularySize } = profile;

        const levelInstructions = {
            A1: 'Use only present tense. Simple sentences (5-8 words). Basic vocabulary.',
            A2: 'Use present and past tense. Simple sentences (8-12 words). Common vocabulary.',
            B1: 'Use present, past, and future tenses. Medium complexity (12-15 words).',
            B2: 'Use all tenses including subjunctive. Complex sentences allowed.',
            C1: 'Natural, sophisticated Spanish. All tenses and moods.',
            C2: 'Native-level Spanish. Idioms and cultural references allowed.'
        };

        const topicInstruction = topic 
            ? `We are discussing: ${topic}. Keep the conversation on this topic.`
            : `We can discuss any of these topics: ${interests.slice(0, 3).join(', ')}`;

        return `You are a friendly Spanish language learning partner having a conversation with a ${level} learner.

CRITICAL CONSTRAINTS (Comprehensible Input - Krashen's i+1):
1. Use ONLY these ${vocabularySize} known words when possible: ${knownWords.slice(0, 200).join(', ')}
2. You MAY introduce maximum 1-2 NEW words per response (5% new content)
3. When using a new word, use context clues so meaning is clear
4. ${levelInstructions[level]}
5. Be conversational and natural, not like a teacher
6. Ask questions to keep conversation going
7. Stay on topic and relevant to learner's interests

${topicInstruction}

Your goal: Have an engaging conversation that is 95% comprehensible and 5% challenging.

DO NOT:
- Use vocabulary lists or translations
- Act like a formal teacher
- Correct errors explicitly (model correct usage instead)
- Use words far above their level
- Make sentences longer than their level allows

Example good response (A2): "¡Hola! ¿Qué hiciste ayer? Yo fui al parque con mis amigos. Hacía buen tiempo."

Now, respond naturally to their message:`;
    }

    /**
     * Analyze AI response for comprehensible input compliance
     * @param {string} response - AI response text
     * @param {Object} profile - User profile
     * @returns {Object} Analysis results
     */
    async analyzeResponse(response, profile) {
        const analyzer = require('./content-difficulty-analyzer');
        
        // Extract words from response
        const words = response
            .toLowerCase()
            .replace(/[¿¡.,!?;:()"'\[\]{}]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 0 && /^[a-záéíóúñü]+$/.test(w));

        const uniqueWords = [...new Set(words)];
        const knownWordSet = new Set(profile.knownWords.map(w => w.toLowerCase()));

        // Find new words (unknown to user)
        const newWords = uniqueWords.filter(word => !knownWordSet.has(word));
        const knownWordCount = uniqueWords.length - newWords.length;
        
        const comprehensibility = (knownWordCount / uniqueWords.length) * 100;

        // Analyze difficulty level
        const analysis = analyzer.analyzeTranscription(response, false);

        return {
            totalWords: words.length,
            uniqueWords: uniqueWords.length,
            newWords: newWords.slice(0, 5), // Show max 5 new words
            newWordCount: newWords.length,
            comprehensibility: Math.round(comprehensibility),
            targetLevel: profile.level,
            actualLevel: analysis.level,
            optimal: comprehensibility >= 90 && comprehensibility <= 98,
            tooHard: comprehensibility < 85,
            tooEasy: comprehensibility > 98
        };
    }

    /**
     * Generate text-to-speech audio for AI response
     * @param {string} text - Text to convert to speech
     * @param {string} voice - Voice ID (alloy, echo, fable, onyx, nova, shimmer)
     * @returns {Buffer} Audio buffer
     */
    async generateSpeech(text, voice = 'nova') {
        try {
            const mp3 = await openai.audio.speech.create({
                model: 'tts-1',
                voice: voice,
                input: text,
                speed: 0.9 // Slightly slower for language learners
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            return buffer;
        } catch (error) {
            console.error('Error generating speech:', error);
            throw error;
        }
    }

    /**
     * Transcribe user's voice input using Whisper
     * @param {Buffer} audioBuffer - Audio file buffer
     * @returns {Object} Transcription with language detection
     */
    async transcribeAudio(audioBuffer, expectedLanguage = 'es') {
        try {
            // Create a temporary file-like object from buffer
            const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

            const transcription = await openai.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                language: expectedLanguage,
                response_format: 'verbose_json'
            });

            return {
                text: transcription.text,
                language: transcription.language,
                duration: transcription.duration,
                confidence: transcription.segments?.[0]?.confidence || 1.0
            };
        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw error;
        }
    }

    /**
     * Generate corrections and feedback on user's message
     * @param {string} userMessage - User's message
     * @param {Object} profile - User profile
     * @returns {Array} Corrections and suggestions
     */
    async generateCorrections(userMessage, profile) {
        try {
            // Use GPT-4 to analyze grammar and provide gentle corrections
            const correction = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a gentle Spanish teacher. Analyze this ${profile.level} learner's message for errors. 
                        
                        If there are errors, provide:
                        1. What they said (incorrect)
                        2. Better way to say it (correct)
                        3. Brief explanation in English
                        
                        If perfect, just say "Perfect!"
                        
                        Keep feedback encouraging and brief (1-2 sentences max).`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.3,
                max_tokens: 100
            });

            const feedback = correction.choices[0].message.content;

            // Parse feedback
            if (feedback.toLowerCase().includes('perfect')) {
                return [];
            }

            return [{
                type: 'grammar',
                original: userMessage,
                corrected: feedback.split('\n')[1] || userMessage,
                explanation: feedback
            }];
        } catch (error) {
            console.error('Error generating corrections:', error);
            return [];
        }
    }

    /**
     * Track conversation interaction for analytics
     * @param {string} userId - User ID
     * @param {string} userMessage - User message
     * @param {string} aiResponse - AI response
     * @param {Object} analysis - Response analysis
     */
    async trackInteraction(userId, userMessage, aiResponse, analysis) {
        try {
            await prisma.userInteraction.create({
                data: {
                    userId,
                    type: 'ai_conversation',
                    contentId: 'chatbot',
                    difficulty: analysis.actualLevel,
                    timeSpent: Math.round(userMessage.length / 3), // Rough estimate: 3 chars/sec
                    completed: true,
                    metadata: JSON.stringify({
                        comprehensibility: analysis.comprehensibility,
                        newWordsIntroduced: analysis.newWords,
                        turnCount: (this.conversationHistory.get(userId) || []).length / 2
                    })
                }
            });

            // Update user's last activity
            await prisma.user.update({
                where: { id: userId },
                data: { lastActivity: new Date() }
            });
        } catch (error) {
            console.error('Error tracking interaction:', error);
            // Don't throw - tracking failure shouldn't break chat
        }
    }

    /**
     * Start a new conversation with a specific topic
     * @param {string} userId - User ID
     * @param {string} topic - Conversation topic
     * @returns {Object} Opening message
     */
    async startConversation(userId, topic) {
        // Clear previous conversation history
        this.conversationHistory.set(userId, []);

        const profile = await this.loadUserProfile(userId);

        // Generate opening message
        const opening = await this.generateResponse(
            userId,
            `Hola, quiero hablar sobre ${topic}`,
            topic
        );

        return opening;
    }

    /**
     * Get conversation suggestions based on user profile
     * @param {string} userId - User ID
     * @returns {Array} Conversation topics
     */
    async getSuggestedTopics(userId) {
        const profile = await this.loadUserProfile(userId);

        const levelTopics = {
            A1: ['family', 'daily routine', 'food', 'colors', 'numbers', 'weather'],
            A2: ['hobbies', 'travel', 'shopping', 'health', 'past events', 'future plans'],
            B1: ['work', 'technology', 'environment', 'culture', 'news', 'opinions'],
            B2: ['politics', 'education', 'economy', 'social issues', 'abstract concepts'],
            C1: ['philosophy', 'literature', 'complex debates', 'professional topics'],
            C2: ['any topic', 'advanced discussions', 'cultural nuances']
        };

        // Combine level-appropriate topics with user interests
        const baseTopic = levelTopics[profile.level] || levelTopics.B1;
        const userInterests = profile.interests.slice(0, 3);

        return {
            suggested: [...new Set([...userInterests, ...baseTopic.slice(0, 6)])],
            level: profile.level,
            vocabularySize: profile.vocabularySize
        };
    }

    /**
     * Clear conversation history for a user
     * @param {string} userId - User ID
     */
    clearHistory(userId) {
        this.conversationHistory.delete(userId);
    }

    /**
     * Get conversation stats
     * @param {string} userId - User ID
     * @returns {Object} Stats
     */
    getConversationStats(userId) {
        const history = this.conversationHistory.get(userId) || [];
        const turns = history.length / 2;

        return {
            totalTurns: Math.floor(turns),
            messagesInHistory: history.length,
            conversationActive: history.length > 0
        };
    }
}

// Export singleton
const aiConversationPartner = new AIConversationPartner();
module.exports = aiConversationPartner;

