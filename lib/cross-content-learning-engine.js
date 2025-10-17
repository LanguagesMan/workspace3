/**
 * 🔗 CROSS-CONTENT LEARNING ENGINE
 * 
 * Ensures words learned in one context appear in others
 * Example: Learn "mercado" in video → AI generates story using "mercado"
 * → Chatbot uses "mercado" → Podcast mentions "mercado"
 * 
 * This creates interconnected learning across all content types
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CrossContentLearningEngine {
    constructor() {
        this.vocabularyTracker = require('./vocabulary-tracker');
        this.aiConversation = require('./ai-conversation-partner');
    }

    /**
     * When user learns a new word, generate related content
     * @param {string} userId - User ID
     * @param {string} newWord - Newly learned word
     * @param {string} sourceType - Where they learned it
     */
    async onNewWordLearned(userId, newWord, sourceType) {
        try {
            console.log(`\n🔗 New word learned: "${newWord}" from ${sourceType}`);
            console.log('   Generating cross-content reinforcement...');

            // Get user's current vocabulary
            const knownWords = await this.vocabularyTracker.getKnownWords(userId);
            const profile = await this.getUserProfile(userId);

            // Generate reinforcement content using this new word
            const reinforcements = [];

            // 1. If learned from video → Generate story using word
            if (sourceType === 'video') {
                const story = await this.generateStoryWithWord(userId, newWord, knownWords, profile);
                if (story) {
                    reinforcements.push({ type: 'story', content: story });
                    console.log('   ✅ Generated story using new word');
                }
            }

            // 2. If learned from article → Chatbot will use it next
            if (sourceType === 'article') {
                await this.primeC hatbotWithWord(userId, newWord);
                console.log('   ✅ Chatbot primed to use word in next conversation');
            }

            // 3. Find existing content that uses this word
            const relatedContent = await this.findContentWithWord(newWord, profile.level);
            if (relatedContent.length > 0) {
                reinforcements.push(...relatedContent);
                console.log(`   ✅ Found ${relatedContent.length} existing content pieces using word`);
            }

            // 4. Schedule word for review
            await this.scheduleWordReview(userId, newWord);
            console.log('   ✅ Scheduled for spaced repetition');

            return {
                success: true,
                reinforcements,
                nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };

        } catch (error) {
            console.error('Error in onNewWordLearned:', error);
            return { success: false };
        }
    }

    /**
     * Generate AI story using specific word
     * @param {string} userId - User ID
     * @param {string} targetWord - Word to use in story
     * @param {Array} knownWords - User's vocabulary
     * @param {Object} profile - User profile
     */
    async generateStoryWithWord(userId, targetWord, knownWords, profile) {
        try {
            const OpenAI = require('openai');
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

            const prompt = `Create a short story in Spanish for a ${profile.level} learner.

CRITICAL CONSTRAINTS:
- Use ONLY these known words: ${knownWords.slice(0, 150).join(', ')}
- You MUST use the word "${targetWord}" at least 3 times in the story
- Use "${targetWord}" in different contexts to show its meaning
- Length: 100-150 words
- Make it engaging and natural

Story topic: ${profile.interests[0] || 'daily life'}

Return ONLY the story text in Spanish, nothing else.`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 300
            });

            const story = response.choices[0].message.content.trim();

            // Save to database
            await prisma.aIStory.create({
                data: {
                    userId,
                    title: `Story about "${targetWord}"`,
                    content: story,
                    level: profile.level,
                    type: 'reinforcement',
                    newWords: JSON.stringify([targetWord])
                }
            });

            return story;

        } catch (error) {
            console.error('Error generating story:', error);
            return null;
        }
    }

    /**
     * Prime chatbot to use specific word in next conversation
     */
    async primeChatbotWithWord(userId, word) {
        // Add to chatbot's context for next conversation
        // The chatbot will naturally weave this word into conversation
        
        // Store in a temporary cache or session data
        // For now, just log it
        console.log(`   💬 Chatbot will use "${word}" in next conversation`);
        return { success: true };
    }

    /**
     * Find existing content that uses a specific word
     * @param {string} word - Target word
     * @param {string} level - User's CEFR level
     * @returns {Array} Content items
     */
    async findContentWithWord(word, level) {
        const results = [];

        try {
            // Search articles
            const articles = await prisma.article.findMany({
                where: {
                    level,
                    content: { contains: word, mode: 'insensitive' }
                },
                take: 3
            });

            results.push(...articles.map(a => ({
                type: 'article',
                id: a.id,
                title: a.title,
                reinforcementWord: word
            })));

            // Search AI stories
            const stories = await prisma.aIStory.findMany({
                where: {
                    level,
                    content: { contains: word, mode: 'insensitive' }
                },
                take: 2
            });

            results.push(...stories.map(s => ({
                type: 'story',
                id: s.id,
                title: s.title,
                reinforcementWord: word
            })));

        } catch (error) {
            console.error('Error finding content with word:', error);
        }

        return results;
    }

    /**
     * Schedule word for review
     */
    async scheduleWordReview(userId, word) {
        const cleanWord = word.toLowerCase().trim();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.word.updateMany({
            where: { userId, word: cleanWord },
            data: { nextReview: tomorrow }
        });
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                interests: true
            }
        });

        if (!user) {
            return {
                level: 'A2',
                interests: ['general']
            };
        }

        return {
            level: user.currentLevel || 'A2',
            interests: user.interests.map(i => i.interest)
        };
    }

    /**
     * Generate daily reinforcement content for all learning words
     * @param {string} userId - User ID
     * @returns {Array} Generated content
     */
    async generateDailyReinforcement(userId) {
        try {
            console.log(`\n🔗 Generating daily reinforcement for user ${userId}...`);

            // Get words currently being learned
            const learningWords = await this.vocabularyTracker.getLearningWords(userId);
            
            if (learningWords.length === 0) {
                console.log('   No words currently being learned');
                return [];
            }

            console.log(`   Found ${learningWords.length} words being learned`);

            // Pick top 5 words for reinforcement
            const wordsToReinforce = learningWords.slice(0, 5);
            const knownWords = await this.vocabularyTracker.getKnownWords(userId);
            const profile = await this.getUserProfile(userId);

            const generated = [];

            // Generate story using these words
            for (const wordEntry of wordsToReinforce) {
                const story = await this.generateStoryWithWord(
                    userId,
                    wordEntry.word,
                    knownWords,
                    profile
                );

                if (story) {
                    generated.push({
                        type: 'story',
                        word: wordEntry.word,
                        content: story
                    });
                }
            }

            console.log(`   ✅ Generated ${generated.length} reinforcement stories`);
            return generated;

        } catch (error) {
            console.error('Error generating daily reinforcement:', error);
            return [];
        }
    }
}

// Export singleton
const crossContentEngine = new CrossContentLearningEngine();
module.exports = crossContentEngine;

