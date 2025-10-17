/**
 * 🎭 SCENARIO-BASED CONVERSATION PRACTICE
 * 
 * Real-world conversation scenarios with role-playing
 * Prepare users for actual Spanish conversations they'll encounter
 * 
 * Inspired by: Babbel Live, Rosetta Stone Scenarios, Pimsleur Conversations
 * 
 * Key Features:
 * - Pre-defined scenarios (ordering food, job interview, doctor, etc.)
 * - Branching conversations based on user choices
 * - Vocabulary and phrases specific to each scenario
 * - Performance scoring and feedback
 * - Progressive difficulty
 */

const aiConversationPartner = require('./ai-conversation-partner');

class ScenarioPracticeSystem {
    constructor() {
        this.scenarios = this.initializeScenarios();
        this.userProgress = new Map(); // userId -> scenario progress
    }

    /**
     * Initialize scenario library
     */
    initializeScenarios() {
        return {
            // BEGINNER SCENARIOS (A1-A2)
            restaurant_ordering: {
                id: 'restaurant_ordering',
                name: 'Ordering at a Restaurant',
                description: 'Practice ordering food and drinks at a Spanish restaurant',
                icon: '🍽️',
                level: 'A2',
                difficulty: 'easy',
                duration: '5-10 min',
                vocabulary: [
                    'mesa', 'menú', 'plato', 'bebida', 'cuenta',
                    'quisiera', 'para mí', 'de postre', 'la cuenta por favor'
                ],
                roles: {
                    user: 'Customer',
                    ai: 'Waiter/Waitress'
                },
                objectives: [
                    'Greet the waiter',
                    'Ask for the menu',
                    'Order a main dish and drink',
                    'Ask for the bill'
                ],
                startingPrompt: '¡Buenas tardes! Bienvenido a nuestro restaurante. ¿Mesa para cuántas personas?',
                keyPhrases: [
                    'Una mesa para dos, por favor',
                    'Quisiera ver el menú',
                    'Para mí, el pollo con arroz',
                    'Una botella de agua, por favor',
                    'La cuenta, por favor'
                ],
                tips: [
                    'Use "quisiera" (I would like) for polite requests',
                    'Remember to say "por favor" (please)',
                    '"La cuenta" means the bill'
                ],
                scenario_flow: [
                    { step: 1, ai: 'greeting', user_expected: 'respond_table_size' },
                    { step: 2, ai: 'bring_menu', user_expected: 'order_food' },
                    { step: 3, ai: 'confirm_order', user_expected: 'order_drink' },
                    { step: 4, ai: 'serve_food', user_expected: 'eat_enjoy' },
                    { step: 5, ai: 'dessert_offer', user_expected: 'decline_or_accept' },
                    { step: 6, ai: 'ready_bill', user_expected: 'ask_for_bill' }
                ]
            },

            shopping_market: {
                id: 'shopping_market',
                name: 'Shopping at the Market',
                description: 'Buy fruits, vegetables, and groceries',
                icon: '🛒',
                level: 'A2',
                difficulty: 'easy',
                duration: '5-10 min',
                vocabulary: [
                    'mercado', 'fruta', 'verdura', 'precio', 'kilo',
                    '¿cuánto cuesta?', 'deme', 'más', 'menos'
                ],
                roles: {
                    user: 'Shopper',
                    ai: 'Vendor'
                },
                objectives: [
                    'Ask for prices',
                    'Request specific quantities',
                    'Negotiate (if appropriate)',
                    'Pay and thank'
                ],
                startingPrompt: '¡Buenos días! ¿Qué le puedo ofrecer hoy?',
                keyPhrases: [
                    '¿Cuánto cuesta el kilo de tomates?',
                    'Deme dos kilos, por favor',
                    '¿Tiene naranjas frescas?',
                    'Es demasiado caro',
                    'Gracias, aquí tiene el dinero'
                ],
                tips: [
                    '"¿Cuánto cuesta?" means "How much does it cost?"',
                    '"Deme" means "Give me"',
                    'Prices in Spanish: "cinco euros" = 5 euros'
                ]
            },

            directions_lost: {
                id: 'directions_lost',
                name: 'Asking for Directions',
                description: 'You\'re lost in a Spanish city. Ask locals for help.',
                icon: '🗺️',
                level: 'A2',
                difficulty: 'easy',
                duration: '5 min',
                vocabulary: [
                    'dónde está', 'calle', 'derecha', 'izquierda', 'recto',
                    'cerca', 'lejos', 'mapa', 'perdido'
                ],
                roles: {
                    user: 'Tourist',
                    ai: 'Local'
                },
                objectives: [
                    'Explain you\'re lost',
                    'Ask for directions',
                    'Understand left/right/straight',
                    'Thank them'
                ],
                startingPrompt: '¿En qué puedo ayudarle?',
                keyPhrases: [
                    'Estoy perdido/a',
                    '¿Dónde está la estación de tren?',
                    '¿A la derecha o a la izquierda?',
                    '¿Está cerca de aquí?',
                    'Muchas gracias por su ayuda'
                ],
                tips: [
                    'Derecha = right, Izquierda = left, Recto = straight',
                    '"¿Dónde está...?" = Where is...?'
                ]
            },

            // INTERMEDIATE SCENARIOS (B1)
            job_interview: {
                id: 'job_interview',
                name: 'Job Interview',
                description: 'Interview for a Spanish-speaking position',
                icon: '💼',
                level: 'B1',
                difficulty: 'medium',
                duration: '10-15 min',
                vocabulary: [
                    'experiencia', 'habilidades', 'puesto', 'empresa', 'sueldo',
                    'currículum', 'disponibilidad', 'fortalezas', 'debilidades'
                ],
                roles: {
                    user: 'Job Candidate',
                    ai: 'Interviewer'
                },
                objectives: [
                    'Introduce yourself professionally',
                    'Describe your experience',
                    'Discuss your skills',
                    'Ask questions about the position',
                    'Express interest in the role'
                ],
                startingPrompt: 'Buenos días. Gracias por venir a la entrevista. Cuénteme sobre usted y su experiencia.',
                keyPhrases: [
                    'Tengo X años de experiencia en...',
                    'Mis principales habilidades son...',
                    '¿Cuál es el horario de trabajo?',
                    'Estoy muy interesado/a en este puesto',
                    '¿Cuándo puedo esperar una respuesta?'
                ],
                tips: [
                    'Use formal "usted" not informal "tú"',
                    'Highlight your "fortalezas" (strengths)',
                    'Prepare to discuss your "experiencia" (experience)'
                ]
            },

            doctor_appointment: {
                id: 'doctor_appointment',
                name: 'Doctor Appointment',
                description: 'Describe symptoms and understand medical advice',
                icon: '🏥',
                level: 'B1',
                difficulty: 'medium',
                duration: '10 min',
                vocabulary: [
                    'dolor', 'síntomas', 'fiebre', 'receta', 'medicina',
                    'me duele', 'desde cuándo', 'alergia', 'tratamiento'
                ],
                roles: {
                    user: 'Patient',
                    ai: 'Doctor'
                },
                objectives: [
                    'Describe your symptoms',
                    'Answer medical questions',
                    'Understand the diagnosis',
                    'Get prescription information'
                ],
                startingPrompt: 'Buenos días. ¿Qué le trae por aquí hoy? ¿Cuáles son sus síntomas?',
                keyPhrases: [
                    'Me duele la cabeza/garganta',
                    'Tengo fiebre desde hace dos días',
                    'No tengo alergias',
                    '¿Necesito tomar medicina?',
                    '¿Cuántas veces al día?'
                ],
                tips: [
                    '"Me duele" = It hurts me',
                    '"Desde hace" = since/for (time)',
                    'Remember to mention any allergies!'
                ]
            },

            hotel_checkin: {
                id: 'hotel_checkin',
                name: 'Hotel Check-in',
                description: 'Check into a hotel and handle requests',
                icon: '🏨',
                level: 'A2',
                difficulty: 'easy',
                duration: '8 min',
                vocabulary: [
                    'reserva', 'habitación', 'llave', 'piso', 'desayuno',
                    'wifi', 'maleta', 'estacionamiento'
                ],
                roles: {
                    user: 'Hotel Guest',
                    ai: 'Receptionist'
                },
                objectives: [
                    'Confirm reservation',
                    'Provide ID/passport',
                    'Ask about amenities',
                    'Get room key'
                ],
                startingPrompt: 'Bienvenido al Hotel Plaza. ¿Tiene una reserva?',
                keyPhrases: [
                    'Sí, tengo una reserva a nombre de...',
                    '¿El desayuno está incluido?',
                    '¿Hay wifi gratis?',
                    '¿A qué hora es el desayuno?',
                    '¿Dónde está el ascensor?'
                ],
                tips: [
                    'Have your reservation number ready',
                    'Ask about "desayuno" (breakfast) and "wifi"'
                ]
            },

            // ADVANCED SCENARIOS (B2+)
            business_meeting: {
                id: 'business_meeting',
                name: 'Business Meeting',
                description: 'Participate in a professional business discussion',
                icon: '📊',
                level: 'B2',
                difficulty: 'hard',
                duration: '15-20 min',
                vocabulary: [
                    'propuesta', 'presupuesto', 'estrategia', 'objetivos',
                    'mercado', 'competencia', 'beneficios', 'riesgos'
                ],
                roles: {
                    user: 'Team Member',
                    ai: 'Manager'
                },
                objectives: [
                    'Present ideas clearly',
                    'Discuss strategy',
                    'Handle objections',
                    'Reach consensus'
                ],
                startingPrompt: 'Buenos días equipo. Hoy vamos a discutir nuestra estrategia para el próximo trimestre. ¿Quién quiere comenzar?',
                keyPhrases: [
                    'Mi propuesta es...',
                    'Según nuestro análisis de mercado...',
                    'Los beneficios incluyen...',
                    'Tengo algunas preocupaciones sobre...',
                    'Estoy de acuerdo con esa estrategia'
                ],
                tips: [
                    'Use subjunctive for suggestions: "Sugiero que..."',
                    'Professional vocabulary is key',
                    'Practice formal business expressions'
                ]
            },

            making_friends: {
                id: 'making_friends',
                name: 'Making New Friends',
                description: 'Strike up a casual conversation and make friends',
                icon: '👋',
                level: 'A2',
                difficulty: 'easy',
                duration: '10 min',
                vocabulary: [
                    'de dónde eres', 'hobby', 'tiempo libre', 'película',
                    'música', 'quedamos', 'número de teléfono'
                ],
                roles: {
                    user: 'New Friend',
                    ai: 'Potential Friend'
                },
                objectives: [
                    'Introduce yourself',
                    'Ask about interests',
                    'Find common ground',
                    'Exchange contact info'
                ],
                startingPrompt: '¡Hola! No te he visto antes por aquí. ¿Eres nuevo/a?',
                keyPhrases: [
                    'Sí, acabo de mudarme aquí',
                    '¿Qué te gusta hacer en tu tiempo libre?',
                    'A mí también me gusta...',
                    '¿Quieres tomar un café algún día?',
                    '¿Cuál es tu número de teléfono?'
                ],
                tips: [
                    'Use informal "tú" with peers',
                    'Show interest in their hobbies',
                    'Be friendly and open!'
                ]
            }
        };
    }

    /**
     * Start a scenario practice session
     */
    async startScenario(userId, scenarioId, userLevel = 'A2') {
        const scenario = this.scenarios[scenarioId];
        
        if (!scenario) {
            throw new Error('Scenario not found');
        }

        // Check if scenario is appropriate for user level
        if (!this.isAppropriateLevel(scenario.level, userLevel)) {
            return {
                error: 'Level mismatch',
                message: `This scenario is ${scenario.level} level. Your level is ${userLevel}.`,
                suggestion: this.getSuggestedScenarios(userLevel)
            };
        }

        // Initialize user progress for this scenario
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = {
            sessionId,
            scenarioId,
            userId,
            startedAt: new Date().toISOString(),
            currentStep: 0,
            completedObjectives: [],
            phrasesUsed: [],
            vocabularyEncountered: [],
            mistakes: [],
            score: 0
        };

        // Store session
        if (!this.userProgress.has(userId)) {
            this.userProgress.set(userId, new Map());
        }
        this.userProgress.get(userId).set(sessionId, session);

        return {
            session,
            scenario: {
                ...scenario,
                nextMessage: scenario.startingPrompt
            },
            instructions: this.getScenarioInstructions(scenario)
        };
    }

    /**
     * Process user's response in scenario
     */
    async processScenarioResponse(userId, sessionId, userMessage) {
        const session = this.getUserSession(userId, sessionId);
        
        if (!session) {
            throw new Error('Session not found');
        }

        const scenario = this.scenarios[session.scenarioId];
        
        // Analyze user's response
        const analysis = this.analyzeResponse(userMessage, scenario);
        
        // Check if key phrases were used
        const phrasesUsed = this.checkKeyPhrases(userMessage, scenario.keyPhrases);
        session.phrasesUsed.push(...phrasesUsed);

        // Generate AI response (using conversation partner)
        const aiResponse = await this.generateContextualResponse(
            userId,
            userMessage,
            scenario,
            session.currentStep
        );

        // Update session
        session.currentStep++;
        session.vocabularyEncountered.push(...analysis.vocabularyUsed);
        
        // Check objectives completion
        const completedObjective = this.checkObjectiveCompletion(
            session.currentStep,
            scenario.objectives
        );
        
        if (completedObjective) {
            session.completedObjectives.push(completedObjective);
        }

        // Check if scenario is complete
        const isComplete = session.currentStep >= scenario.scenario_flow.length;
        
        if (isComplete) {
            return this.completeScenario(userId, sessionId);
        }

        return {
            aiMessage: aiResponse,
            analysis,
            phrasesUsed,
            progress: {
                currentStep: session.currentStep,
                totalSteps: scenario.scenario_flow.length,
                objectivesCompleted: session.completedObjectives.length,
                totalObjectives: scenario.objectives.length
            },
            tip: this.getContextualTip(scenario, session.currentStep),
            isComplete: false
        };
    }

    /**
     * Generate contextual AI response based on scenario
     */
    async generateContextualResponse(userId, userMessage, scenario, step) {
        // Build context-aware prompt for AI
        const scenarioContext = `
You are roleplaying as: ${scenario.roles.ai}
Scenario: ${scenario.name} (${scenario.description})
Current step: ${step + 1}
Your goal: Guide the conversation naturally while staying in character.
Level: ${scenario.level}

Expected flow: ${JSON.stringify(scenario.scenario_flow[step] || {})}, 

Respond naturally as the ${scenario.roles.ai} would in this situation.
Keep responses short (1-2 sentences) and at ${scenario.level} level.
`;

        // Use AI conversation partner
        try {
            const response = await aiConversationPartner.generateResponse(
                userId,
                userMessage,
                scenario.name
            );
            
            return response.response;
        } catch (error) {
            console.error('Error generating scenario response:', error);
            // Fallback response
            return '¿Puede repetir eso, por favor?';
        }
    }

    /**
     * Complete scenario and calculate score
     */
    completeScenario(userId, sessionId) {
        const session = this.getUserSession(userId, sessionId);
        const scenario = this.scenarios[session.scenarioId];

        // Calculate score
        const objectiveScore = (session.completedObjectives.length / scenario.objectives.length) * 100;
        const phraseScore = (session.phrasesUsed.length / scenario.keyPhrases.length) * 100;
        const vocabularyScore = (session.vocabularyEncountered.length / scenario.vocabulary.length) * 100;

        const totalScore = Math.round(
            (objectiveScore * 0.5) + (phraseScore * 0.3) + (vocabularyScore * 0.2)
        );

        session.score = totalScore;
        session.completedAt = new Date().toISOString();

        // Generate feedback
        const feedback = this.generateScenarioFeedback(session, scenario);

        return {
            isComplete: true,
            score: totalScore,
            grade: this.getScoreGrade(totalScore),
            feedback,
            stats: {
                objectivesCompleted: session.completedObjectives.length,
                totalObjectives: scenario.objectives.length,
                keyPhrasesUsed: session.phrasesUsed.length,
                totalKeyPhrases: scenario.keyPhrases.length,
                vocabularyEncountered: session.vocabularyEncountered.length,
                totalVocabulary: scenario.vocabulary.length,
                duration: this.calculateDuration(session.startedAt, session.completedAt)
            },
            rewards: {
                xp: Math.round(totalScore * 2), // 2 XP per score point
                badge: totalScore >= 90 ? '🏆 Scenario Master' : totalScore >= 75 ? '⭐ Well Done' : '📚 Keep Practicing'
            },
            nextScenario: this.getNextScenario(scenario.id, scenario.level)
        };
    }

    /**
     * Analyze user's response
     */
    analyzeResponse(userMessage, scenario) {
        const words = userMessage.toLowerCase().split(/\s+/);
        const vocabularyUsed = words.filter(word => 
            scenario.vocabulary.some(v => v.toLowerCase().includes(word))
        );

        return {
            vocabularyUsed: [...new Set(vocabularyUsed)],
            wordCount: words.length,
            usedScenarioVocab: vocabularyUsed.length > 0
        };
    }

    /**
     * Check if key phrases were used
     */
    checkKeyPhrases(userMessage, keyPhrases) {
        const used = [];
        const normalized = userMessage.toLowerCase();

        for (const phrase of keyPhrases) {
            const normalizedPhrase = phrase.toLowerCase();
            if (normalized.includes(normalizedPhrase)) {
                used.push(phrase);
            }
        }

        return used;
    }

    /**
     * Check objective completion
     */
    checkObjectiveCompletion(step, objectives) {
        if (step < objectives.length) {
            return objectives[step];
        }
        return null;
    }

    /**
     * Get contextual tip
     */
    getContextualTip(scenario, step) {
        if (scenario.tips && scenario.tips[step]) {
            return scenario.tips[step];
        }
        return scenario.tips ? scenario.tips[0] : 'Keep going!';
    }

    /**
     * Generate scenario feedback
     */
    generateScenarioFeedback(session, scenario) {
        const feedback = [];

        if (session.score >= 90) {
            feedback.push('🌟 Excellent performance! You handled the scenario like a native speaker!');
        } else if (session.score >= 75) {
            feedback.push('👍 Great job! You communicated effectively.');
        } else if (session.score >= 60) {
            feedback.push('📈 Good effort! With more practice, you\'ll master this scenario.');
        } else {
            feedback.push('💪 Keep practicing! Try the scenario again to improve.');
        }

        // Specific feedback
        if (session.completedObjectives.length === scenario.objectives.length) {
            feedback.push('✅ You completed all objectives!');
        } else {
            feedback.push(`⚠️ You completed ${session.completedObjectives.length}/${scenario.objectives.length} objectives.`);
        }

        if (session.phrasesUsed.length >= scenario.keyPhrases.length * 0.7) {
            feedback.push('🗣️ Great use of key phrases!');
        } else {
            feedback.push('💡 Try using more of the suggested key phrases next time.');
        }

        return feedback;
    }

    /**
     * Get score grade
     */
    getScoreGrade(score) {
        if (score >= 95) return { letter: 'A+', emoji: '🏆' };
        if (score >= 90) return { letter: 'A', emoji: '⭐' };
        if (score >= 85) return { letter: 'B+', emoji: '🎯' };
        if (score >= 80) return { letter: 'B', emoji: '👍' };
        if (score >= 75) return { letter: 'C+', emoji: '📈' };
        if (score >= 70) return { letter: 'C', emoji: '💪' };
        return { letter: 'D', emoji: '📚' };
    }

    /**
     * Get scenario instructions
     */
    getScenarioInstructions(scenario) {
        return {
            role: `You are: ${scenario.roles.user}`,
            objectives: scenario.objectives,
            keyPhrases: scenario.keyPhrases.slice(0, 5), // Show first 5
            tips: scenario.tips,
            vocabulary: scenario.vocabulary.slice(0, 10) // Show first 10
        };
    }

    /**
     * Get scenarios appropriate for user level
     */
    getSuggestedScenarios(userLevel) {
        const scenarios = [];
        
        for (const [id, scenario] of Object.entries(this.scenarios)) {
            if (this.isAppropriateLevel(scenario.level, userLevel)) {
                scenarios.push({
                    id: scenario.id,
                    name: scenario.name,
                    icon: scenario.icon,
                    difficulty: scenario.difficulty,
                    duration: scenario.duration
                });
            }
        }

        return scenarios;
    }

    /**
     * Check if scenario level is appropriate
     */
    isAppropriateLevel(scenarioLevel, userLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const scenarioIndex = levels.indexOf(scenarioLevel);
        const userIndex = levels.indexOf(userLevel);
        
        // Allow scenarios at user level or one level above
        return scenarioIndex <= userIndex + 1;
    }

    /**
     * Get next recommended scenario
     */
    getNextScenario(currentId, currentLevel) {
        const sameLevelScenarios = Object.values(this.scenarios).filter(
            s => s.level === currentLevel && s.id !== currentId
        );

        if (sameLevelScenarios.length > 0) {
            const random = sameLevelScenarios[Math.floor(Math.random() * sameLevelScenarios.length)];
            return {
                id: random.id,
                name: random.name,
                icon: random.icon
            };
        }

        return null;
    }

    /**
     * Get user session
     */
    getUserSession(userId, sessionId) {
        const sessions = this.userProgress.get(userId);
        return sessions ? sessions.get(sessionId) : null;
    }

    /**
     * Get user's scenario history
     */
    getUserScenarioHistory(userId) {
        const sessions = this.userProgress.get(userId);
        if (!sessions) return [];

        return Array.from(sessions.values())
            .filter(s => s.completedAt)
            .map(s => ({
                scenarioId: s.scenarioId,
                scenarioName: this.scenarios[s.scenarioId]?.name,
                score: s.score,
                completedAt: s.completedAt
            }));
    }

    /**
     * Calculate duration
     */
    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const minutes = Math.round((end - start) / 1000 / 60);
        return `${minutes} min`;
    }

    /**
     * Get all scenarios overview
     */
    getAllScenarios() {
        return Object.values(this.scenarios).map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            icon: s.icon,
            level: s.level,
            difficulty: s.difficulty,
            duration: s.duration
        }));
    }
}

// Export singleton
const scenarioPracticeSystem = new ScenarioPracticeSystem();
module.exports = scenarioPracticeSystem;


