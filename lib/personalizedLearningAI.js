// AI-Powered Personalized Learning Engine
// Integrates with Workspace3 Hub for cross-app intelligence and dynamic content generation

export class PersonalizedLearningAI {
  constructor(workspace3Hub) {
    this.workspace3Hub = workspace3Hub;
    this.userProfile = null;
    this.learningPatterns = new Map();
    this.vocabularyProgress = new Map();
    this.contentHistory = [];
    this.aiPrompts = this.initializeAIPrompts();
    this.characterConsistency = this.initializeCharacters();
  }

  initializeCharacters() {
    return {
      GLOBE: {
        personality: "wise-cracking interdimensional traveler",
        catchphrases: ["¡Increíble!", "No me lo esperaba", "¿Qué está pasando?"],
        reactions: ["surprised", "confused", "excited", "annoyed"]
      },
      MARCO: {
        personality: "bumbling tourist who causes chaos",
        catchphrases: ["¡Ay, no!", "Lo siento mucho", "¿Dónde estoy?"],
        reactions: ["panicked", "apologetic", "lost", "clumsy"]
      },
      SOFIA: {
        personality: "smart, exasperated character who explains Spanish",
        catchphrases: ["Escucha bien", "Te explico", "¡Qué problema!"],
        reactions: ["explaining", "frustrated", "patient", "teaching"]
      }
    };
  }

  initializeAIPrompts() {
    return {
      storyGeneration: `Generate a surreal comedy Spanish learning story featuring GLOBE, Marco, and Sofia with CONSISTENT character designs. Include:
        - Setup (3 seconds): Normal object/situation with GLOBE's wise-cracking personality
        - Transformation: Something changes dramatically (visual surprise like vision.md examples)
        - Comedy Peak: Hilarious consequence featuring Marco's bumbling and Sofia's explanations
        - Spanish Learning: 1-2 sentences with vocabulary matching the visual
        - HILARIOUS SURPRISE ENDING: Unexpected twist that makes viewers laugh out loud
        Character consistency requirements: GLOBE same design, Marco consistent appearance, Sofia same look
        Focus on beginner Spanish vocabulary: {vocabulary_level}
        User's weak areas: {weak_areas}
        Recent progress: {recent_progress}`,

      vocabularyAdaptation: `Adapt Spanish vocabulary lesson for user level {level}:
        - Current knowledge: {known_words}
        - Struggle areas: {difficult_concepts}
        - Learning preferences: {preferences}
        Create 3 new words with visual comedy scenarios using Globe Universe characters.`,

      progressiveChallenge: `Generate next learning challenge based on:
        - Mastered concepts: {mastered}
        - Current level: {level}
        - Time spent: {time_spent}
        - Cross-app activity: {app_usage}
        Create personalized Globe adventure that teaches {target_concept}.`
    };
  }

  async initializeUserProfile(userId) {
    try {
      // Connect to Workspace3 Hub for cross-app data
      const crossAppData = await this.workspace3Hub.getUserProfile(userId);

      this.userProfile = {
        id: userId,
        spanishLevel: crossAppData.spanishLevel || 'beginner',
        vocabularyKnown: crossAppData.vocabularyKnown || [],
        weakAreas: crossAppData.weakAreas || [],
        learningPreferences: crossAppData.learningPreferences || ['visual', 'comedy'],
        timeSpent: crossAppData.timeSpent || 0,
        appUsageHistory: crossAppData.appUsageHistory || {},
        lastActive: Date.now()
      };

      console.log(`🧠 AI Learning Profile initialized for user ${userId}`);
      return this.userProfile;
    } catch (error) {
      console.error('❌ Profile initialization failed:', error);
      // Fallback to basic profile
      this.userProfile = {
        id: userId,
        spanishLevel: 'beginner',
        vocabularyKnown: ['hola', 'gracias', 'por favor'],
        weakAreas: ['conjugation', 'gender'],
        learningPreferences: ['visual', 'comedy'],
        timeSpent: 0,
        appUsageHistory: {},
        lastActive: Date.now()
      };
      return this.userProfile;
    }
  }

  async generatePersonalizedContent(contentType = 'story') {
    if (!this.userProfile) {
      throw new Error('User profile not initialized');
    }

    const context = this.buildLearningContext();

    switch (contentType) {
      case 'story':
        return await this.generateGlobeStory(context);
      case 'vocabulary':
        return await this.generateVocabularyLesson(context);
      case 'challenge':
        return await this.generateProgressiveChallenge(context);
      case 'review':
        return await this.generatePersonalizedReview(context);
      default:
        return await this.generateGlobeStory(context);
    }
  }

  buildLearningContext() {
    const recentMistakes = this.getRecentMistakes();
    const strengthAreas = this.getStrengthAreas();
    const nextLevelConcepts = this.getNextLevelConcepts();

    return {
      level: this.userProfile.spanishLevel,
      knownVocabulary: this.userProfile.vocabularyKnown,
      weakAreas: this.userProfile.weakAreas,
      recentMistakes,
      strengthAreas,
      nextLevelConcepts,
      preferences: this.userProfile.learningPreferences,
      timeSpent: this.userProfile.timeSpent,
      crossAppActivity: this.userProfile.appUsageHistory
    };
  }

  async generateGlobeStory(context) {
    // Select appropriate vocabulary based on user level
    const targetVocabulary = this.selectTargetVocabulary(context);
    const character = this.selectMainCharacter(context);
    const scenario = this.generateScenario(targetVocabulary, character);

    const story = {
      id: this.generateContentId(),
      type: 'globe_story',
      character: character,
      targetVocabulary,
      difficulty: context.level,
      content: {
        setup: scenario.setup,
        transformation: scenario.transformation,
        comedyPeak: scenario.comedyPeak,
        spanishLesson: scenario.spanishLesson,
        surpriseEnding: scenario.surpriseEnding
      },
      interactiveElements: this.generateInteractiveElements(targetVocabulary),
      personalizedHints: this.generatePersonalizedHints(context, targetVocabulary),
      timestamp: Date.now()
    };

    // Log learning analytics
    this.logLearningEvent('story_generated', {
      vocabulary: targetVocabulary,
      difficulty: context.level,
      character: character
    });

    return story;
  }

  selectTargetVocabulary(context) {
    const vocabularyPools = {
      beginner: [
        { word: 'árbol', visual: 'tree', context: 'nature' },
        { word: 'casa', visual: 'house', context: 'home' },
        { word: 'gato', visual: 'cat', context: 'animals' },
        { word: 'agua', visual: 'water', context: 'drinks' },
        { word: 'grande', visual: 'big', context: 'size' }
      ],
      intermediate: [
        { word: 'transformar', visual: 'transform', context: 'action' },
        { word: 'sorprendente', visual: 'surprising', context: 'emotion' },
        { word: 'aventura', visual: 'adventure', context: 'story' },
        { word: 'misterioso', visual: 'mysterious', context: 'description' },
        { word: 'inesperado', visual: 'unexpected', context: 'surprise' }
      ],
      advanced: [
        { word: 'interdimensional', visual: 'interdimensional', context: 'science' },
        { word: 'consecuencia', visual: 'consequence', context: 'logic' },
        { word: 'exasperante', visual: 'exasperating', context: 'emotion' },
        { word: 'pronunciación', visual: 'pronunciation', context: 'language' },
        { word: 'desconcertante', visual: 'bewildering', context: 'confusion' }
      ]
    };

    const pool = vocabularyPools[context.level] || vocabularyPools.beginner;

    // Filter out known vocabulary
    const unknownWords = pool.filter(item =>
      !context.knownVocabulary.includes(item.word)
    );

    // Select 2-3 words focusing on weak areas
    const selectedWords = [];

    // Priority to weak areas
    context.weakAreas.forEach(weakArea => {
      const contextMatch = unknownWords.find(item => item.context === weakArea);
      if (contextMatch && selectedWords.length < 3) {
        selectedWords.push(contextMatch);
      }
    });

    // Fill remaining slots
    while (selectedWords.length < 2 && unknownWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * unknownWords.length);
      const word = unknownWords[randomIndex];
      if (!selectedWords.includes(word)) {
        selectedWords.push(word);
      }
    }

    return selectedWords;
  }

  selectMainCharacter(context) {
    // Select character based on learning preferences and recent activity
    const characterPreferences = {
      visual: 'GLOBE', // Good for transformations
      comedy: 'MARCO', // Good for chaos and humor
      explanation: 'SOFIA', // Good for clear learning
      adventure: 'GLOBE' // Good for stories
    };

    const preference = context.preferences[0] || 'visual';
    return characterPreferences[preference] || 'GLOBE';
  }

  generateScenario(vocabulary, character) {
    const primaryWord = vocabulary[0];
    const characterData = this.characterConsistency[character];

    // Generate scenario based on character and vocabulary
    const scenarios = {
      GLOBE: {
        setup: `Globe examina un ${primaryWord.word} pequeño y ordinario`,
        transformation: `De repente, el ${primaryWord.word} comienza a ${this.getTransformationVerb(primaryWord)}`,
        comedyPeak: `Globe queda ${characterData.reactions[0]} cuando el ${primaryWord.word} se vuelve completamente ${this.getComedicAdjective()}`,
        spanishLesson: `"¡El ${primaryWord.word} es ${this.getDescriptiveAdjective()}!" dice Globe.`,
        surpriseEnding: `El ${primaryWord.word} ${this.getSurpriseAction()} y ${characterData.catchphrases[0]}`
      },
      MARCO: {
        setup: `Marco encuentra un ${primaryWord.word} en su mochila`,
        transformation: `Cuando Marco toca el ${primaryWord.word}, este se transforma dramáticamente`,
        comedyPeak: `Marco ${characterData.reactions[0]} y causa un caos total con el ${primaryWord.word}`,
        spanishLesson: `"¡${characterData.catchphrases[0]}! El ${primaryWord.word} está ${this.getStateAdjective()}!" grita Marco.`,
        surpriseEnding: `El ${primaryWord.word} ${this.getSurpriseAction()} y Marco ${characterData.catchphrases[1]}`
      },
      SOFIA: {
        setup: `Sofia observa un ${primaryWord.word} comportándose de manera extraña`,
        transformation: `El ${primaryWord.word} comienza a ${this.getEducationalTransformation()}`,
        comedyPeak: `Sofia ${characterData.reactions[2]} mientras explica por qué el ${primaryWord.word} hace esto`,
        spanishLesson: `"${characterData.catchphrases[0]}: El ${primaryWord.word} es ${this.getEducationalAdjective()}" explica Sofia pacientemente.`,
        surpriseEnding: `Resulta que el ${primaryWord.word} ${this.getSurpriseEducationalTwist()}`
      }
    };

    return scenarios[character] || scenarios.GLOBE;
  }

  getTransformationVerb(vocabulary) {
    const verbs = ['crecer', 'brillar', 'moverse', 'cambiar', 'expandirse'];
    return verbs[Math.floor(Math.random() * verbs.length)];
  }

  getComedicAdjective() {
    const adjectives = ['enorme', 'pequeñísimo', 'colorido', 'peludo', 'brillante'];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  getDescriptiveAdjective() {
    const adjectives = ['increíble', 'sorprendente', 'extraño', 'mágico', 'divertido'];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  getStateAdjective() {
    const adjectives = ['loco', 'roto', 'perdido', 'confundido', 'cambiado'];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  getEducationalTransformation() {
    const transformations = ['hablar en español', 'enseñar vocabulario', 'mostrar ejemplos', 'explicar gramática'];
    return transformations[Math.floor(Math.random() * transformations.length)];
  }

  getEducationalAdjective() {
    const adjectives = ['educativo', 'útil', 'importante', 'necesario', 'fundamental'];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  getSurpriseAction() {
    const actions = ['empieza a bailar', 'canta una canción', 'hace magia', 'cuenta chistes', 'vuela por el aire'];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  getSurpriseEducationalTwist() {
    const twists = [
      'estaba enseñando una lección importante',
      'era un profesor de español disfrazado',
      'quería ayudar con la pronunciación',
      'tenía un mensaje secreto en español'
    ];
    return twists[Math.floor(Math.random() * twists.length)];
  }

  generateInteractiveElements(vocabulary) {
    return vocabulary.map(word => ({
      type: 'pronunciation_practice',
      word: word.word,
      audioPrompt: `Repite: ${word.word}`,
      visualCue: word.visual,
      feedback: 'pronunciation_score'
    }));
  }

  generatePersonalizedHints(context, vocabulary) {
    const hints = [];

    vocabulary.forEach(word => {
      if (context.weakAreas.includes(word.context)) {
        hints.push({
          type: 'weak_area_support',
          word: word.word,
          hint: `Recuerda: ${word.word} es ${this.getGrammarHint(word)}`,
          practice: `Practica ${word.word} en diferentes contextos`
        });
      }
    });

    return hints;
  }

  getGrammarHint(vocabulary) {
    const genderHints = {
      'árbol': 'masculino (el árbol)',
      'casa': 'femenino (la casa)',
      'agua': 'femenino (el agua - excepción)',
      'gato': 'masculino (el gato)'
    };

    return genderHints[vocabulary.word] || 'una palabra importante';
  }

  async syncWithWorkspace3Hub(learningData) {
    try {
      const syncData = {
        userId: this.userProfile.id,
        spanishProgress: {
          vocabularyLearned: learningData.vocabularyLearned,
          timeSpent: learningData.timeSpent,
          storiesCompleted: learningData.storiesCompleted,
          weakAreas: learningData.weakAreas,
          strengthAreas: learningData.strengthAreas
        },
        appType: 'ai-feed-learning',
        timestamp: Date.now()
      };

      const result = await this.workspace3Hub.syncUserDataAcrossApps(syncData);
      console.log('🔄 Learning data synced across apps:', result);
      return result;
    } catch (error) {
      console.error('❌ Workspace3 sync failed:', error);
      return null;
    }
  }

  trackLearningProgress(action, data) {
    const progressEvent = {
      userId: this.userProfile.id,
      action,
      data,
      timestamp: Date.now()
    };

    // Update local learning patterns
    this.learningPatterns.set(action, {
      count: (this.learningPatterns.get(action)?.count || 0) + 1,
      lastSeen: Date.now(),
      data
    });

    // Sync with Workspace3 Hub
    this.syncWithWorkspace3Hub({
      vocabularyLearned: this.userProfile.vocabularyKnown,
      timeSpent: this.userProfile.timeSpent,
      storiesCompleted: this.contentHistory.length,
      weakAreas: this.userProfile.weakAreas,
      strengthAreas: this.getStrengthAreas()
    });

    return progressEvent;
  }

  getRecentMistakes() {
    // Analyze recent learning patterns for mistakes
    const mistakes = [];
    this.learningPatterns.forEach((pattern, action) => {
      if (action.includes('incorrect') || action.includes('retry')) {
        mistakes.push({
          area: action,
          frequency: pattern.count,
          lastOccurrence: pattern.lastSeen
        });
      }
    });
    return mistakes.slice(-5); // Last 5 mistakes
  }

  getStrengthAreas() {
    const strengths = [];
    this.learningPatterns.forEach((pattern, action) => {
      if (action.includes('correct') || action.includes('completed')) {
        strengths.push({
          area: action,
          proficiency: pattern.count,
          lastSuccess: pattern.lastSeen
        });
      }
    });
    return strengths.slice(-5); // Top 5 strengths
  }

  getNextLevelConcepts() {
    const levelProgression = {
      beginner: ['present_tense', 'basic_vocabulary', 'pronunciation'],
      intermediate: ['past_tense', 'subjunctive', 'complex_vocabulary'],
      advanced: ['conditional', 'advanced_grammar', 'idiomatic_expressions']
    };

    const currentLevel = this.userProfile.spanishLevel;
    const levels = Object.keys(levelProgression);
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex < levels.length - 1) {
      return levelProgression[levels[currentIndex + 1]];
    }

    return levelProgression[currentLevel];
  }

  generateContentId() {
    return `ai_content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  logLearningEvent(eventType, data) {
    console.log(`📚 Learning Event: ${eventType}`, data);
    this.contentHistory.push({
      eventType,
      data,
      timestamp: Date.now(),
      userId: this.userProfile?.id
    });
  }

  // Public API methods for real-time integration
  async getPersonalizedRecommendations() {
    const context = this.buildLearningContext();
    return {
      nextStory: await this.generateGlobeStory(context),
      vocabularyFocus: context.weakAreas.slice(0, 3),
      recommendedPracticeTime: this.calculateOptimalPracticeTime(),
      crossAppSuggestions: await this.getCrossAppSuggestions()
    };
  }

  calculateOptimalPracticeTime() {
    const baseTime = 15; // 15 minutes base
    const levelMultiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2
    };

    const level = this.userProfile?.spanishLevel || 'beginner';
    return Math.round(baseTime * levelMultiplier[level]);
  }

  async getCrossAppSuggestions() {
    try {
      const workspace3Data = await this.workspace3Hub.getCrossAppRecommendations(this.userProfile.id);
      return {
        videoContent: workspace3Data.suggestedVideos || [],
        practiceApps: workspace3Data.recommendedApps || [],
        sharedVocabulary: workspace3Data.sharedProgress || []
      };
    } catch (error) {
      console.error('❌ Cross-app suggestions failed:', error);
      return {
        videoContent: [],
        practiceApps: [],
        sharedVocabulary: []
      };
    }
  }
}