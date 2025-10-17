/**
 * 🧠 AI COACH SYSTEM
 * 
 * Provides personalized learning assistance:
 * - Answer questions about grammar and vocabulary
 * - Generate example sentences
 * - Explain cultural context
 * - Provide pronunciation feedback
 * - Encourage and motivate learners
 */

class AICoachSystem {
    constructor(openaiClient = null) {
        this.openai = openaiClient;
        
        // Coach personality and expertise
        this.COACH_PERSONA = `You are an enthusiastic and patient Spanish language coach. 
You specialize in helping learners understand vocabulary, grammar, and cultural context.
You provide clear explanations, give helpful examples, and always encourage learners.
Keep responses concise (2-3 sentences) unless asked for more detail.`;
        
        // Response types
        this.RESPONSE_TYPES = {
            VOCABULARY: 'vocabulary',
            GRAMMAR: 'grammar',
            EXAMPLE: 'example',
            PRONUNCIATION: 'pronunciation',
            CULTURE: 'culture',
            ENCOURAGEMENT: 'encouragement'
        };
    }
    
    /**
     * Main chat interface - answer any learning question
     */
    async chat(userId, message, learningContext = {}) {
        console.log(`💬 AI Coach processing question from ${userId}`);
        
        // Build context for AI
        const contextPrompt = this.buildContextPrompt(learningContext);
        
        // If OpenAI available, use it for intelligent responses
        if (this.openai) {
            return await this.generateAIResponse(message, contextPrompt);
        }
        
        // Fallback: pattern-matched responses
        return this.generatePatternResponse(message, learningContext);
    }
    
    /**
     * Build context prompt from learning session
     */
    buildContextPrompt(context) {
        let prompt = `Current learning context:\n`;
        
        if (context.currentTopic) {
            prompt += `- Topic: ${context.currentTopic}\n`;
        }
        
        if (context.recentWords && context.recentWords.length > 0) {
            prompt += `- Recently learned words: ${context.recentWords.join(', ')}\n`;
        }
        
        if (context.currentArticle) {
            prompt += `- Article context: ${context.currentArticle.substring(0, 200)}...\n`;
        }
        
        if (context.userLevel) {
            prompt += `- Student level: ${context.userLevel}\n`;
        }
        
        return prompt;
    }
    
    /**
     * Generate AI response using OpenAI
     */
    async generateAIResponse(question, contextPrompt) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: this.COACH_PERSONA },
                    { role: 'system', content: contextPrompt },
                    { role: 'user', content: question }
                ],
                temperature: 0.7,
                max_tokens: 300
            });
            
            return {
                success: true,
                response: response.choices[0].message.content,
                type: this.classifyQuestion(question),
                timestamp: new Date()
            };
        } catch (error) {
            console.error('AI Coach error:', error);
            return this.generatePatternResponse(question, {});
        }
    }
    
    /**
     * Classify question type
     */
    classifyQuestion(question) {
        const q = question.toLowerCase();
        
        if (q.includes('mean') || q.includes('translation') || q.includes('what is')) {
            return this.RESPONSE_TYPES.VOCABULARY;
        }
        if (q.includes('grammar') || q.includes('conjugate') || q.includes('tense')) {
            return this.RESPONSE_TYPES.GRAMMAR;
        }
        if (q.includes('example') || q.includes('sentence') || q.includes('use')) {
            return this.RESPONSE_TYPES.EXAMPLE;
        }
        if (q.includes('pronounce') || q.includes('sound') || q.includes('say')) {
            return this.RESPONSE_TYPES.PRONUNCIATION;
        }
        if (q.includes('culture') || q.includes('tradition') || q.includes('custom')) {
            return this.RESPONSE_TYPES.CULTURE;
        }
        
        return this.RESPONSE_TYPES.VOCABULARY;
    }
    
    /**
     * Generate pattern-based response (fallback)
     */
    generatePatternResponse(question, context) {
        const type = this.classifyQuestion(question);
        
        const responses = {
            [this.RESPONSE_TYPES.VOCABULARY]: `Great question! That word is commonly used in Spanish conversations. Try using it in a sentence to practice!`,
            [this.RESPONSE_TYPES.GRAMMAR]: `Spanish grammar can be tricky! Remember that practice makes perfect. Try focusing on one rule at a time.`,
            [this.RESPONSE_TYPES.EXAMPLE]: `Here's an example: You can use this word in everyday situations. Keep practicing and it will become natural!`,
            [this.RESPONSE_TYPES.PRONUNCIATION]: `For pronunciation, try saying it slowly first, then gradually speed up. Listening to native speakers helps a lot!`,
            [this.RESPONSE_TYPES.CULTURE]: `Spanish culture is rich and diverse! Each region has unique traditions. Keep exploring and learning!`
        };
        
        return {
            success: true,
            response: responses[type] || `That's a great question! Keep learning and practicing.`,
            type,
            timestamp: new Date(),
            fallback: true
        };
    }
    
    /**
     * Explain grammar from learned content
     */
    async explainGrammar(grammarPoint, examples = []) {
        const explanations = {
            'present_tense': {
                title: 'Present Tense (Presente)',
                explanation: 'Used to describe actions happening now or habitual actions.',
                examples: ['Yo hablo español (I speak Spanish)', 'Ella come frutas (She eats fruits)'],
                tip: 'Regular -ar, -er, -ir verbs follow predictable patterns!'
            },
            'preterite': {
                title: 'Preterite Tense (Pretérito)',
                explanation: 'Used for completed actions in the past.',
                examples: ['Ayer comí pizza (Yesterday I ate pizza)', 'Fui al mercado (I went to the market)'],
                tip: 'Focus on irregular verbs like ir, ser, hacer first!'
            },
            'subjunctive': {
                title: 'Subjunctive Mood (Subjuntivo)',
                explanation: 'Used to express wishes, doubts, emotions, or hypothetical situations.',
                examples: ['Espero que tengas un buen día (I hope you have a good day)', 'Quiero que vengas (I want you to come)'],
                tip: 'This is advanced! Learn trigger words like "espero que", "quiero que" first.'
            },
            'ser_vs_estar': {
                title: 'Ser vs Estar',
                explanation: 'Both mean "to be" but ser is for permanent traits, estar for temporary states.',
                examples: ['Soy alto (I am tall - permanent)', 'Estoy cansado (I am tired - temporary)'],
                tip: 'Remember: SER = Permanent, ESTAR = Temporary/Location'
            }
        };
        
        return explanations[grammarPoint] || {
            title: 'Grammar Concept',
            explanation: 'This is an important Spanish grammar rule. Practice with examples!',
            examples: examples,
            tip: 'Keep practicing and it will become natural!'
        };
    }
    
    /**
     * Generate example sentences with learned words
     */
    async generateExamples(word, count = 3, difficulty = 'A2') {
        const examples = [
            {
                spanish: `Me gusta ${word} mucho.`,
                english: `I like ${word} a lot.`,
                difficulty: 'A1'
            },
            {
                spanish: `¿Tienes ${word}?`,
                english: `Do you have ${word}?`,
                difficulty: 'A1'
            },
            {
                spanish: `Necesito comprar ${word} en el mercado.`,
                english: `I need to buy ${word} at the market.`,
                difficulty: 'A2'
            },
            {
                spanish: `El ${word} está muy bueno hoy.`,
                english: `The ${word} is very good today.`,
                difficulty: 'A2'
            },
            {
                spanish: `Prefiero ${word} porque es más saludable.`,
                english: `I prefer ${word} because it's healthier.`,
                difficulty: 'B1'
            }
        ];
        
        // Filter by difficulty if needed
        const filtered = examples.filter(ex => ex.difficulty <= difficulty);
        
        return filtered.slice(0, count);
    }
    
    /**
     * Provide pronunciation feedback (text-to-speech + tips)
     */
    async getPronunciationHelp(word) {
        // Analyze word for pronunciation tips
        const tips = [];
        
        // Check for common pronunciation challenges
        if (word.includes('rr')) {
            tips.push('Roll the "rr" sound by vibrating your tongue against the roof of your mouth');
        }
        if (word.includes('j') || word.includes('g')) {
            tips.push('The "j" and "g" (before e/i) make a strong "h" sound from the back of your throat');
        }
        if (word.includes('ñ')) {
            tips.push('The "ñ" sounds like "ny" in "canyon"');
        }
        if (word.includes('ll')) {
            tips.push('The "ll" sounds like "y" in "yes" (in most regions)');
        }
        if (word.includes('v') || word.includes('b')) {
            tips.push('In Spanish, "b" and "v" are pronounced the same way');
        }
        
        return {
            word,
            audioUrl: `/api/tts?text=${encodeURIComponent(word)}&lang=es`,
            tips: tips.length > 0 ? tips : ['Listen carefully and repeat slowly'],
            syllables: this.syllabify(word),
            phonetic: this.approximatePhonetic(word)
        };
    }
    
    /**
     * Syllabify Spanish word (simplified)
     */
    syllabify(word) {
        // Simplified syllabification
        const vowels = 'aeiouáéíóú';
        const syllables = [];
        let currentSyllable = '';
        
        for (let i = 0; i < word.length; i++) {
            currentSyllable += word[i];
            
            if (vowels.includes(word[i].toLowerCase())) {
                // Add consonants after vowel until next vowel
                let j = i + 1;
                while (j < word.length && !vowels.includes(word[j].toLowerCase())) {
                    currentSyllable += word[j];
                    j++;
                }
                syllables.push(currentSyllable);
                currentSyllable = '';
                i = j - 1;
            }
        }
        
        if (currentSyllable) {
            syllables.push(currentSyllable);
        }
        
        return syllables.join('-');
    }
    
    /**
     * Approximate phonetic transcription
     */
    approximatePhonetic(word) {
        let phonetic = word.toLowerCase();
        
        // Simple replacements
        phonetic = phonetic.replace(/ñ/g, 'ny');
        phonetic = phonetic.replace(/ll/g, 'y');
        phonetic = phonetic.replace(/j/g, 'h');
        phonetic = phonetic.replace(/v/g, 'b');
        phonetic = phonetic.replace(/c([ei])/g, 's$1');
        phonetic = phonetic.replace(/z/g, 's');
        
        return phonetic;
    }
    
    /**
     * Provide encouragement based on progress
     */
    getEncouragement(progress) {
        const { wordsLearned, quizzesCompleted, streakDays } = progress;
        
        const encouragements = [
            `🌟 Amazing! You've learned ${wordsLearned} words!`,
            `🔥 ${streakDays} day streak! You're on fire!`,
            `🎯 ${quizzesCompleted} quizzes completed! Keep it up!`,
            `💪 You're making great progress! Spanish is getting easier!`,
            `🚀 Wow! Your Spanish is improving every day!`,
            `⭐ You're becoming more fluent with every session!`
        ];
        
        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }
    
    /**
     * Suggest next learning steps
     */
    suggestNextSteps(userProgress) {
        const suggestions = [];
        
        if (userProgress.wordsLearned < 100) {
            suggestions.push({
                title: 'Build your foundation',
                description: 'Focus on learning the 100 most common Spanish words',
                action: 'Continue daily lessons',
                priority: 'high'
            });
        }
        
        if (userProgress.quizzesCompleted < 10) {
            suggestions.push({
                title: 'Practice with quizzes',
                description: 'Test your knowledge with interactive quizzes',
                action: 'Try a quiz now',
                priority: 'medium'
            });
        }
        
        if (!userProgress.hasWatchedVideos) {
            suggestions.push({
                title: 'Learn from videos',
                description: 'Watch native speakers and improve comprehension',
                action: 'Watch a video',
                priority: 'high'
            });
        }
        
        if (userProgress.currentLevel === 'A1' && userProgress.daysActive > 30) {
            suggestions.push({
                title: 'Take level assessment',
                description: "You might be ready for A2! Let's find out.",
                action: 'Take assessment',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }
    
    /**
     * Explain cultural context
     */
    explainCulture(topic) {
        const culturalNotes = {
            'tapas': {
                title: 'Tapas Culture',
                explanation: 'Tapas are small Spanish dishes served with drinks. It\'s a social tradition where friends gather at bars to share food and conversation.',
                regions: ['Spain (especially Andalusia)'],
                tips: 'Try "ir de tapas" (going for tapas) - order several small dishes to share!'
            },
            'siesta': {
                title: 'The Siesta',
                explanation: 'A traditional afternoon rest period, typically from 2-5 PM. Many businesses close during this time.',
                regions: ['Spain', 'parts of Latin America'],
                tips: 'Not as common in modern cities, but still observed in smaller towns'
            },
            'mate': {
                title: 'Mate (Yerba Mate)',
                explanation: 'A traditional South American caffeine-rich drink, shared among friends in a special ritual.',
                regions: ['Argentina', 'Uruguay', 'Paraguay'],
                tips: 'It\'s polite to accept when offered, drink and pass it back!'
            }
        };
        
        return culturalNotes[topic] || {
            title: 'Spanish Culture',
            explanation: 'Spanish-speaking cultures are diverse and rich in traditions!',
            tips: 'Keep exploring and learning about different regions!'
        };
    }
}

module.exports = AICoachSystem;

