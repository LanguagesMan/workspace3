/**
 * 📖 AI STORY GENERATOR
 * 
 * Generate personalized stories at user's exact CEFR level
 * Using comprehensible input theory (i+1)
 * Integrates user's vocabulary and interests
 */

const OpenAI = require('openai');
const vocabularyTracker = require('./vocabulary-tracker');
const frequencyLookup = require('./frequency-lookup');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class AIStoryGenerator {
    constructor() {
        // Story genres and themes
        this.GENRES = [
            'adventure', 'romance', 'mystery', 'comedy', 'drama', 
            'science-fiction', 'fantasy', 'slice-of-life', 'thriller'
        ];

        this.THEMES = [
            'travel', 'food', 'friendship', 'family', 'work', 
            'school', 'hobbies', 'shopping', 'daily-life', 'sports'
        ];

        // Story length targets
        this.LENGTH_TARGETS = {
            'micro': { words: 50, sentences: 5, name: 'Micro Story' },
            'short': { words: 150, sentences: 12, name: 'Short Story' },
            'medium': { words: 300, sentences: 25, name: 'Medium Story' },
            'long': { words: 500, sentences: 40, name: 'Long Story' }
        };
    }

    /**
     * Generate a personalized story for a user
     * @param {string} userId - User ID
     * @param {Object} options - Story options
     * @returns {Object} Generated story
     */
    async generateStory(userId, options = {}) {
        try {
            const {
                genre = 'adventure',
                theme = 'travel',
                length = 'short',
                level = 'B1',
                customPrompt = null
            } = options;

            console.log(`📖 Generating ${length} ${genre} story at ${level} level for user ${userId}...`);

            // Get user's vocabulary
            const knownWords = await vocabularyTracker.getKnownWords(userId);
            const learningWords = await vocabularyTracker.getLearningWords(userId);

            // Get target vocabulary for this level
            const targetVocab = this.getVocabularyForLevel(level);

            // Select words to teach (1-3 new words per story)
            const newWords = this.selectNewWords(knownWords, targetVocab, 3);

            // Build the prompt
            const prompt = this.buildStoryPrompt(
                genre, theme, length, level, 
                knownWords, learningWords, newWords, customPrompt
            );

            // Generate story with GPT-4
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(level)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 1000
            });

            const storyText = completion.choices[0].message.content.trim();

            // Parse the story
            const story = this.parseStory(storyText);

            // Analyze the generated story
            const analysis = await this.analyzeStory(story.text, userId);

            // Generate audio (TTS)
            const audioUrl = await this.generateAudio(story.text);

            return {
                success: true,
                story: {
                    ...story,
                    genre,
                    theme,
                    length,
                    level,
                    newWords,
                    analysis,
                    audioUrl,
                    createdAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Error generating story:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Build the story generation prompt
     */
    buildStoryPrompt(genre, theme, length, level, knownWords, learningWords, newWords, customPrompt) {
        const lengthTarget = this.LENGTH_TARGETS[length];
        
        let prompt = `Generate an engaging ${genre} story in Spanish about ${theme}.\n\n`;

        prompt += `REQUIREMENTS:\n`;
        prompt += `- Length: Approximately ${lengthTarget.words} words (${lengthTarget.sentences} sentences)\n`;
        prompt += `- CEFR Level: ${level}\n`;
        prompt += `- Use simple, clear language appropriate for ${level} learners\n`;
        prompt += `- Include these new vocabulary words naturally: ${newWords.join(', ')}\n`;
        
        if (learningWords.length > 0) {
            const reviewWords = learningWords.slice(0, 5).map(w => w.word);
            prompt += `- Try to include these words the user is learning: ${reviewWords.join(', ')}\n`;
        }

        prompt += `\nSTORY STRUCTURE:\n`;
        prompt += `1. Title (in Spanish)\n`;
        prompt += `2. Story text\n`;
        prompt += `3. At the end, list the new vocabulary words with translations\n`;

        if (customPrompt) {
            prompt += `\nADDITIONAL CONTEXT: ${customPrompt}\n`;
        }

        prompt += `\nMake it interesting, culturally relevant, and perfect for language learning!`;

        return prompt;
    }

    /**
     * Get system prompt for GPT-4
     */
    getSystemPrompt(level) {
        const levelGuidelines = {
            'A1': 'Use only present tense, basic vocabulary (top 500 most common words), very simple sentence structures.',
            'A2': 'Use present and past tenses, basic vocabulary (top 1000 words), simple sentences with some compound sentences.',
            'B1': 'Use various tenses, intermediate vocabulary (top 2000 words), mix of simple and complex sentences.',
            'B2': 'Use all tenses including subjunctive, advanced vocabulary (top 4000 words), complex sentence structures.',
            'C1': 'Use sophisticated vocabulary and all grammatical structures naturally.',
            'C2': 'Write as a native speaker with rich, idiomatic language.'
        };

        return `You are an expert Spanish language teacher and creative writer. Your task is to write engaging stories in Spanish that are perfectly tailored for language learners at specific CEFR levels.

GUIDELINES:
- Write in clear, natural Spanish
- ${levelGuidelines[level] || levelGuidelines['B1']}
- Make stories culturally authentic and interesting
- Include dialogue when appropriate
- Emphasize comprehensible input (i+1 theory): 95% known words, 5% new words
- Format: Title on first line, then story, then vocabulary list

VOCABULARY LIST FORMAT:
---
Vocabulario Nuevo:
- word: translation (context)

Remember: The goal is to teach through engaging content, not boring exercises!`;
    }

    /**
     * Parse the generated story
     */
    parseStory(text) {
        const lines = text.split('\n').filter(line => line.trim());
        
        let title = '';
        let storyText = '';
        let vocabulary = [];

        let inVocab = false;

        for (const line of lines) {
            if (!title && line.trim()) {
                title = line.trim();
            } else if (line.includes('---') || line.toLowerCase().includes('vocabulario')) {
                inVocab = true;
            } else if (inVocab && line.includes(':')) {
                const match = line.match(/[-•]\s*(.+?):\s*(.+?)(?:\((.+)\))?$/);
                if (match) {
                    vocabulary.push({
                        word: match[1].trim(),
                        translation: match[2].trim(),
                        context: match[3] ? match[3].trim() : ''
                    });
                }
            } else if (!inVocab && line.trim()) {
                storyText += line.trim() + ' ';
            }
        }

        return {
            title: title || 'Historia',
            text: storyText.trim(),
            vocabulary
        };
    }

    /**
     * Analyze the generated story
     */
    async analyzeStory(text, userId) {
        const contentDifficultyAnalyzer = require('./content-difficulty-analyzer');
        
        // Get story analysis
        const analysis = await contentDifficultyAnalyzer.analyzeTranscription(text, 'es');
        
        // Get user-specific analysis
        const userAnalysis = await contentDifficultyAnalyzer.calculateDifficultyForUser(
            userId,
            analysis
        );

        return {
            wordCount: analysis.wordCount,
            uniqueWords: analysis.uniqueWords.length,
            cefrLevel: analysis.cefrLevel,
            comprehensionRate: userAnalysis.comprehensionRate,
            difficulty: userAnalysis.difficulty
        };
    }

    /**
     * Generate audio for the story
     */
    async generateAudio(text) {
        try {
            const ttsService = require('./tts-service');
            
            // Generate TTS
            const audioBuffer = await ttsService.generateSpeech(text, 'es', 'nova');
            
            // Save to file system
            const fs = require('fs');
            const path = require('path');
            const crypto = require('crypto');
            
            const filename = `story_${crypto.randomBytes(8).toString('hex')}.mp3`;
            const audioPath = path.join(__dirname, '../public/audio/stories', filename);
            
            // Ensure directory exists
            const dir = path.dirname(audioPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(audioPath, audioBuffer);
            
            return `/audio/stories/${filename}`;
        } catch (error) {
            console.error('Error generating audio:', error);
            return null;
        }
    }

    /**
     * Get vocabulary appropriate for a CEFR level
     */
    getVocabularyForLevel(level) {
        const ranges = {
            'A1': { start: 1, end: 500 },
            'A2': { start: 501, end: 1000 },
            'B1': { start: 1001, end: 2000 },
            'B2': { start: 2001, end: 4000 },
            'C1': { start: 4001, end: 6000 },
            'C2': { start: 6001, end: 10000 }
        };

        const range = ranges[level] || ranges['B1'];
        const vocab = [];

        for (let rank = range.start; rank <= range.end && rank <= 10000; rank++) {
            const word = frequencyLookup.getWordAtRank(rank);
            if (word) {
                vocab.push(word);
            }
        }

        return vocab;
    }

    /**
     * Select new words to teach in the story
     */
    selectNewWords(knownWords, targetVocab, count) {
        const knownSet = new Set(knownWords.map(w => w.toLowerCase()));
        
        const newWords = targetVocab
            .filter(word => !knownSet.has(word.toLowerCase()))
            .slice(0, count * 3); // Get extras for variety

        // Shuffle and take requested count
        return newWords
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    /**
     * Generate a dialogue scenario
     */
    async generateDialogue(userId, options = {}) {
        try {
            const {
                scenario = 'restaurant',
                participants = 2,
                level = 'B1',
                exchanges = 10
            } = options;

            console.log(`💬 Generating dialogue: ${scenario} at ${level} level...`);

            // Get user's vocabulary
            const knownWords = await vocabularyTracker.getKnownWords(userId);
            const learningWords = await vocabularyTracker.getLearningWords(userId);

            const prompt = `Create a natural Spanish dialogue between ${participants} people in a ${scenario} scenario.

REQUIREMENTS:
- CEFR Level: ${level}
- Number of exchanges: ${exchanges}
- Include realistic conversation fillers and expressions
- Make it culturally authentic
- Include 2-3 new vocabulary words naturally

FORMAT:
Title: [Scenario name]
Characters: [List characters]

[Character 1]: [Dialogue]
[Character 2]: [Dialogue]
...

---
Vocabulario:
- word: translation`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Spanish conversation teacher. Create realistic, natural dialogues for language learners.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            });

            const dialogueText = completion.choices[0].message.content.trim();
            const dialogue = this.parseDialogue(dialogueText);

            // Generate audio for each line
            const audioUrls = await this.generateDialogueAudio(dialogue.lines);

            return {
                success: true,
                dialogue: {
                    ...dialogue,
                    scenario,
                    level,
                    audioUrls,
                    createdAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Error generating dialogue:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Parse dialogue text
     */
    parseDialogue(text) {
        const lines = text.split('\n').filter(l => l.trim());
        
        let title = '';
        let characters = [];
        let dialogueLines = [];
        let vocabulary = [];
        let inVocab = false;

        for (const line of lines) {
            if (line.toLowerCase().startsWith('title:') || line.toLowerCase().startsWith('título:')) {
                title = line.split(':')[1].trim();
            } else if (line.toLowerCase().startsWith('characters:') || line.toLowerCase().startsWith('personajes:')) {
                const charList = line.split(':')[1].trim();
                characters = charList.split(',').map(c => c.trim());
            } else if (line.includes('---') || line.toLowerCase().includes('vocabulario')) {
                inVocab = true;
            } else if (inVocab && line.includes(':')) {
                const match = line.match(/[-•]\s*(.+?):\s*(.+)/);
                if (match) {
                    vocabulary.push({
                        word: match[1].trim(),
                        translation: match[2].trim()
                    });
                }
            } else if (!inVocab && line.includes(':')) {
                const [speaker, ...textParts] = line.split(':');
                if (speaker && textParts.length > 0) {
                    dialogueLines.push({
                        speaker: speaker.trim().replace(/[\[\]]/g, ''),
                        text: textParts.join(':').trim()
                    });
                }
            }
        }

        return {
            title: title || 'Diálogo',
            characters,
            lines: dialogueLines,
            vocabulary
        };
    }

    /**
     * Generate audio for dialogue lines
     */
    async generateDialogueAudio(lines) {
        const audioUrls = [];
        
        for (const line of lines) {
            try {
                const audioUrl = await this.generateAudio(line.text);
                audioUrls.push({
                    speaker: line.speaker,
                    audioUrl
                });
            } catch (error) {
                console.error('Error generating dialogue audio:', error);
                audioUrls.push({
                    speaker: line.speaker,
                    audioUrl: null
                });
            }
        }

        return audioUrls;
    }

    /**
     * Generate a micro-lesson on a specific topic
     */
    async generateMicroLesson(userId, topic, level = 'B1') {
        try {
            console.log(`📚 Generating micro-lesson: ${topic} at ${level}...`);

            const prompt = `Create a brief, engaging micro-lesson in Spanish about "${topic}" for ${level} level learners.

STRUCTURE:
1. Title
2. Brief introduction (2-3 sentences)
3. Main explanation (3-4 sentences)
4. Example sentences (3 examples)
5. Quick practice tip

Keep it concise, clear, and actionable!`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Spanish language teacher creating bite-sized lessons.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const lessonText = completion.choices[0].message.content.trim();

            return {
                success: true,
                lesson: {
                    topic,
                    level,
                    content: lessonText,
                    createdAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Error generating micro-lesson:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new AIStoryGenerator();
