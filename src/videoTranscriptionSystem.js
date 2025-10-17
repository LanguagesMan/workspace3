/**
 * Genius Video Transcription & Focus Word System
 * Extracts focus words from AI-generated videos and orders by Spanish frequency
 * Each video focuses on ONE word for progressive vocabulary learning
 */

export class VideoTranscriptionSystem {
  constructor() {
    // Spanish word frequency list (most common 1000+ words)
    this.spanishFrequencyList = [
      // TOP 50 MOST COMMON SPANISH WORDS
      'el', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no',
      'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al',
      'la', 'una', 'con', 'todo', 'pero', 'más', 'hacer', 'muy', 'poder', 'decir',
      'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque',
      'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre',

      // LEARNING-FOCUSED VOCABULARY (51-200)
      'casa', 'agua', 'día', 'tiempo', 'año', 'vida', 'mano', 'trabajo', 'ojo', 'mundo',
      'hora', 'vez', 'país', 'problema', 'parte', 'lugar', 'caso', 'manera', 'forma', 'nombre',
      'hombre', 'mujer', 'niño', 'niña', 'hijo', 'madre', 'padre', 'familia', 'amigo', 'persona',
      'gente', 'grupo', 'empresa', 'gobierno', 'estado', 'ciudad', 'pueblo', 'calle', 'casa', 'puerta',
      'mesa', 'silla', 'cama', 'cocina', 'comida', 'comer', 'beber', 'dormir', 'caminar', 'correr',
      'hablar', 'escuchar', 'mirar', 'leer', 'escribir', 'estudiar', 'trabajar', 'jugar', 'cantar', 'bailar',
      'reír', 'llorar', 'amar', 'odiar', 'gustar', 'querer', 'necesitar', 'tener', 'estar', 'hacer',
      'bueno', 'malo', 'grande', 'pequeño', 'alto', 'bajo', 'gordo', 'delgado', 'joven', 'viejo',
      'nuevo', 'viejo', 'rápido', 'lento', 'fácil', 'difícil', 'caliente', 'frío', 'dulce', 'salado',
      'rojo', 'azul', 'verde', 'amarillo', 'negro', 'blanco', 'rosa', 'morado', 'naranja', 'gris',
      'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
      'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'hoy', 'ayer', 'mañana',
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre',
      'noviembre', 'diciembre', 'primavera', 'verano', 'otoño', 'invierno', 'sol', 'luna', 'estrella', 'cielo',
      'perro', 'gato', 'pájaro', 'pez', 'caballo', 'vaca', 'cerdo', 'pollo', 'ratón', 'león',

      // INTERMEDIATE VOCABULARY (201-500)
      'escuela', 'universidad', 'hospital', 'tienda', 'mercado', 'banco', 'oficina', 'hotel', 'restaurante', 'café',
      'parque', 'playa', 'montaña', 'río', 'lago', 'bosque', 'jardín', 'flor', 'árbol', 'hierba',
      'auto', 'coche', 'bicicleta', 'autobús', 'tren', 'avión', 'barco', 'moto', 'camión', 'taxi',
      'teléfono', 'computadora', 'televisión', 'radio', 'música', 'película', 'libro', 'periódico', 'revista', 'internet',
      'doctor', 'enfermera', 'maestro', 'estudiante', 'ingeniero', 'abogado', 'policía', 'bombero', 'cocinero', 'vendedor'
    ];

    // Word importance scores based on learning progression
    this.wordImportanceScores = this.generateImportanceScores();

    // Video transcription patterns for different content types
    this.transcriptionPatterns = {
      objects_comedy: this.generateObjectComedyTranscription,
      historical_vlog: this.generateHistoricalVlogTranscription,
      cultural_humor: this.generateCulturalHumorTranscription,
      character_interaction: this.generateCharacterInteractionTranscription
    };
  }

  /**
   * GENIUS SYSTEM: Generate transcription for video and extract focus word
   * Each video focuses on ONE word repeated twice (sentence + character emphasis)
   */
  generateVideoTranscription(videoContent) {
    const focusWord = this.extractOrAssignFocusWord(videoContent);
    const transcriptionGenerator = this.transcriptionPatterns[videoContent.type] || this.generateDefaultTranscription;

    // Generate transcription with focus word emphasized
    const transcription = transcriptionGenerator.call(this, videoContent, focusWord);

    // Extract and validate focus word
    const extractedFocusWord = this.extractFocusWordFromTranscription(transcription);
    const wordImportance = this.getWordImportanceScore(extractedFocusWord);

    return {
      videoId: videoContent.id,
      focusWord: extractedFocusWord,
      transcription: transcription,
      wordImportance: wordImportance,
      frequencyRank: this.getWordFrequencyRank(extractedFocusWord),
      learningLevel: this.determineLearningLevel(wordImportance),
      wordCategory: this.categorizeWord(extractedFocusWord),
      repetitionCount: this.countWordRepetitions(transcription, extractedFocusWord),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract focus word from video content or assign strategically
   */
  extractOrAssignFocusWord(videoContent) {
    // Try to extract from existing Spanish focus
    if (videoContent.spanishFocus) {
      const words = videoContent.spanishFocus.toLowerCase().split(/[\s,]+/);
      for (const word of words) {
        if (this.isValidSpanishWord(word)) {
          return word;
        }
      }
    }

    // Try to extract from concept
    if (videoContent.concept) {
      const spanishWords = this.extractSpanishWordsFromText(videoContent.concept);
      if (spanishWords.length > 0) {
        return spanishWords[0];
      }
    }

    // Assign strategic word based on content type
    return this.assignStrategicFocusWord(videoContent.type);
  }

  /**
   * OBJECTS COMEDY: Focus on object names or action words
   */
  generateObjectComedyTranscription(videoContent, focusWord) {
    const objectActions = {
      'cuchara': 'La cuchara está muy confundida... ¡No sabe si es para sopa o para helado! *dramatic pause* ¡CUCHARA!',
      'silla': 'Esta silla no quiere que nadie se siente... ¡Está en huelga! *chair squeaks* ¡SILLA!',
      'mesa': 'La mesa está celosa porque todos ponen cosas encima de ella... *sad table noises* ¡MESA!',
      'libro': 'El libro está gritando porque nadie lo lee... ¡Solo lo usan para videos de TikTok! *book flapping* ¡LIBRO!',
      'teléfono': 'Mi teléfono no para de sonar... ¡Pero es solo mi mamá preguntando si comí! *ring ring* ¡TELÉFONO!'
    };

    return objectActions[focusWord] ||
      `¡Este ${focusWord} está actuando muy raro hoy! No hace lo que debe hacer... *confused noises* ¡${focusWord.toUpperCase()}!`;
  }

  /**
   * HISTORICAL VLOG: Historical figures teaching modern words
   */
  generateHistoricalVlogTranscription(videoContent, focusWord) {
    const historicalTeachers = [
      `Napoleón aquí... En mis tiempos no teníamos "${focusWord}" pero ahora es muy importante. ¡Aprendan esta palabra: ${focusWord.toUpperCase()}!`,
      `Einstein explicando... La relatividad del "${focusWord}" es fascinante para el aprendizaje moderno. ¡${focusWord.toUpperCase()}!`,
      `Frida Kahlo enseñando... Pinto esta palabra "${focusWord}" con los colores de mi alma... ¡${focusWord.toUpperCase()}!`,
      `Cervantes aquí... En El Quijote no escribí sobre "${focusWord}" pero es palabra noble... ¡${focusWord.toUpperCase()}!`
    ];

    return this.getRandomElement(historicalTeachers);
  }

  /**
   * CULTURAL HUMOR: Spanish culture teaching vocabulary
   */
  generateCulturalHumorTranscription(videoContent, focusWord) {
    const culturalScenarios = {
      'abuela': 'Mi abuela dice que sin abuela la vida no tiene sabor... ¡Es verdad! *cooking sounds* ¡ABUELA!',
      'familia': 'La familia española siempre grita pero es porque nos amamos mucho... *loud family noises* ¡FAMILIA!',
      'fiesta': 'En España toda excusa es buena para una fiesta... ¡Hasta celebramos el martes! *party music* ¡FIESTA!',
      'comida': 'La comida española es arte... ¡Y el que no come bien no vive bien! *chef kiss* ¡COMIDA!'
    };

    return culturalScenarios[focusWord] ||
      `En la cultura española "${focusWord}" es muy importante... ¡No puedes vivir sin ${focusWord}! ¡${focusWord.toUpperCase()}!`;
  }

  /**
   * CHARACTER INTERACTION: Multiple characters teaching one word
   */
  generateCharacterInteractionTranscription(videoContent, focusWord) {
    return `Personaje 1: "¿Qué significa ${focusWord}?"
Personaje 2: "¡Es fácil! ${focusWord} es cuando..."
Personaje 1: "¡Ah ya entiendo el ${focusWord}!"
Ambos: "¡${focusWord.toUpperCase()}!"`;
  }

  /**
   * Extract focus word from transcription (word repeated at least twice)
   */
  extractFocusWordFromTranscription(transcription) {
    const words = transcription.toLowerCase()
      .replace(/[¡!¿?.,;:()]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Count word frequencies
    const wordCounts = {};
    words.forEach(word => {
      if (this.isValidSpanishWord(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    // Find words repeated at least twice
    const repeatedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]); // Sort by frequency

    // Prioritize learning vocabulary over function words
    for (const [word, count] of repeatedWords) {
      if (this.isLearningVocabulary(word)) {
        return word;
      }
    }

    // Fallback to most repeated word
    return repeatedWords.length > 0 ? repeatedWords[0][0] : 'palabra';
  }

  /**
   * Generate importance scores for vocabulary progression
   */
  generateImportanceScores() {
    const scores = {};
    this.spanishFrequencyList.forEach((word, index) => {
      // Higher score = more basic/important word
      // Top 50 words: 90-100 points
      // Next 50: 80-89 points
      // Next 100: 70-79 points, etc.
      if (index < 50) scores[word] = 100 - (index * 0.2);
      else if (index < 100) scores[word] = 90 - ((index - 50) * 0.2);
      else if (index < 200) scores[word] = 80 - ((index - 100) * 0.1);
      else if (index < 300) scores[word] = 70 - ((index - 200) * 0.1);
      else scores[word] = Math.max(50, 60 - ((index - 300) * 0.02));
    });
    return scores;
  }

  /**
   * Get word importance score (higher = more basic/important)
   */
  getWordImportanceScore(word) {
    return this.wordImportanceScores[word.toLowerCase()] || 30; // Unknown words get low priority
  }

  /**
   * Get word frequency rank (1 = most common)
   */
  getWordFrequencyRank(word) {
    const index = this.spanishFrequencyList.indexOf(word.toLowerCase());
    return index === -1 ? 9999 : index + 1;
  }

  /**
   * Determine learning level based on word importance
   */
  determineLearningLevel(importanceScore) {
    if (importanceScore >= 95) return 'absolute_beginner';
    if (importanceScore >= 85) return 'beginner';
    if (importanceScore >= 75) return 'elementary';
    if (importanceScore >= 65) return 'intermediate';
    if (importanceScore >= 55) return 'upper_intermediate';
    return 'advanced';
  }

  /**
   * Categorize word by type for learning progression
   */
  categorizeWord(word) {
    const categories = {
      function_words: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se'],
      basic_nouns: ['casa', 'agua', 'día', 'tiempo', 'año', 'vida', 'mano', 'trabajo'],
      family_people: ['madre', 'padre', 'hijo', 'niño', 'hombre', 'mujer', 'familia'],
      colors_numbers: ['rojo', 'azul', 'verde', 'uno', 'dos', 'tres', 'cuatro'],
      actions_verbs: ['comer', 'beber', 'dormir', 'caminar', 'hablar', 'hacer'],
      adjectives: ['bueno', 'malo', 'grande', 'pequeño', 'alto', 'bajo'],
      time_calendar: ['lunes', 'martes', 'hoy', 'ayer', 'mañana', 'enero'],
      places_locations: ['escuela', 'casa', 'parque', 'ciudad', 'país']
    };

    for (const [category, words] of Object.entries(categories)) {
      if (words.includes(word.toLowerCase())) {
        return category;
      }
    }
    return 'general_vocabulary';
  }

  /**
   * Order videos by learning progression (beginners see most important words first)
   */
  orderVideosByLearningProgression(videosWithTranscriptions, userLevel = 'beginner') {
    return videosWithTranscriptions.sort((a, b) => {
      // Primary sort: word importance (higher = more basic)
      const importanceDiff = b.wordImportance - a.wordImportance;
      if (Math.abs(importanceDiff) > 5) return importanceDiff;

      // Secondary sort: word category progression
      const categoryOrder = {
        'function_words': 1,
        'basic_nouns': 2,
        'family_people': 3,
        'colors_numbers': 4,
        'actions_verbs': 5,
        'adjectives': 6,
        'time_calendar': 7,
        'places_locations': 8,
        'general_vocabulary': 9
      };

      const aCategoryOrder = categoryOrder[a.wordCategory] || 10;
      const bCategoryOrder = categoryOrder[b.wordCategory] || 10;
      const categoryDiff = aCategoryOrder - bCategoryOrder;
      if (categoryDiff !== 0) return categoryDiff;

      // Tertiary sort: frequency rank (lower = more common)
      return a.frequencyRank - b.frequencyRank;
    });
  }

  /**
   * Generate batch of transcribed videos for feed
   */
  generateTranscribedVideoFeed(videoContents, userLevel = 'beginner', count = 10) {
    // Generate transcriptions for all videos
    const videosWithTranscriptions = videoContents.map(video => {
      const transcriptionData = this.generateVideoTranscription(video);
      return {
        ...video,
        ...transcriptionData
      };
    });

    // Order by learning progression
    const orderedVideos = this.orderVideosByLearningProgression(videosWithTranscriptions, userLevel);

    // Filter by user level if needed
    const levelFilteredVideos = this.filterByUserLevel(orderedVideos, userLevel);

    return {
      videos: levelFilteredVideos.slice(0, count),
      totalAvailable: levelFilteredVideos.length,
      learningProgression: this.generateLearningProgression(levelFilteredVideos),
      vocabularyStats: this.generateVocabularyStats(levelFilteredVideos)
    };
  }

  /**
   * Filter videos by user learning level
   */
  filterByUserLevel(videos, userLevel) {
    const levelThresholds = {
      'absolute_beginner': 95,
      'beginner': 85,
      'elementary': 75,
      'intermediate': 65,
      'upper_intermediate': 55,
      'advanced': 0
    };

    const threshold = levelThresholds[userLevel] || 85;
    return videos.filter(video => video.wordImportance >= threshold);
  }

  /**
   * Generate learning progression analytics
   */
  generateLearningProgression(videos) {
    const progression = {
      wordsByCategory: {},
      difficultyDistribution: {},
      recommendedOrder: videos.slice(0, 20).map(v => ({
        word: v.focusWord,
        importance: v.wordImportance,
        level: v.learningLevel,
        category: v.wordCategory
      }))
    };

    videos.forEach(video => {
      // Count by category
      progression.wordsByCategory[video.wordCategory] =
        (progression.wordsByCategory[video.wordCategory] || 0) + 1;

      // Count by difficulty
      progression.difficultyDistribution[video.learningLevel] =
        (progression.difficultyDistribution[video.learningLevel] || 0) + 1;
    });

    return progression;
  }

  /**
   * Generate vocabulary learning statistics
   */
  generateVocabularyStats(videos) {
    const uniqueWords = new Set(videos.map(v => v.focusWord));
    const averageImportance = videos.reduce((sum, v) => sum + v.wordImportance, 0) / videos.length;

    return {
      totalUniqueWords: uniqueWords.size,
      averageWordImportance: Math.round(averageImportance),
      coverageOfTop1000: this.calculateTop1000Coverage(Array.from(uniqueWords)),
      recommendedStudyTime: uniqueWords.size * 2, // 2 minutes per word
      vocabularyLevel: this.assessVocabularyLevel(averageImportance)
    };
  }

  /**
   * Calculate coverage of top 1000 most frequent Spanish words
   */
  calculateTop1000Coverage(words) {
    const top1000 = this.spanishFrequencyList.slice(0, 1000);
    const coveredWords = words.filter(word => top1000.includes(word.toLowerCase()));
    return Math.round((coveredWords.length / top1000.length) * 100);
  }

  /**
   * Assess overall vocabulary level
   */
  assessVocabularyLevel(averageImportance) {
    if (averageImportance >= 95) return 'Absolute Beginner';
    if (averageImportance >= 85) return 'Beginner';
    if (averageImportance >= 75) return 'Elementary';
    if (averageImportance >= 65) return 'Intermediate';
    if (averageImportance >= 55) return 'Upper Intermediate';
    return 'Advanced';
  }

  // Utility functions
  isValidSpanishWord(word) {
    return word.length >= 2 && /^[a-záéíóúñü]+$/.test(word.toLowerCase());
  }

  isLearningVocabulary(word) {
    return this.spanishFrequencyList.includes(word.toLowerCase()) &&
           !['el', 'la', 'de', 'que', 'y', 'a', 'en'].includes(word.toLowerCase());
  }

  countWordRepetitions(text, word) {
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'gi');
    return (text.match(regex) || []).length;
  }

  extractSpanishWordsFromText(text) {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => this.isValidSpanishWord(word) && this.isLearningVocabulary(word));
  }

  assignStrategicFocusWord(contentType) {
    const strategicWords = {
      'objects_comedy': ['mesa', 'silla', 'libro', 'teléfono', 'cuchara'],
      'historical_vlog': ['historia', 'tiempo', 'guerra', 'paz', 'arte'],
      'cultural_humor': ['familia', 'fiesta', 'comida', 'abuela', 'casa'],
      'character_interaction': ['hablar', 'escuchar', 'amigo', 'conversación', 'palabra']
    };

    const words = strategicWords[contentType] || ['palabra', 'aprender', 'español'];
    return this.getRandomElement(words);
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}