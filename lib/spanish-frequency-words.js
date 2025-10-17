/**
 * 🎯 SPANISH FREQUENCY-BASED LEARNING SYSTEM
 * Focus on TOP 100 most important Spanish words with VIRAL contexts!
 * Merged from workspace-4 archives into workspace3
 */

// 🔥 TOP 20 ULTRA HIGH FREQUENCY WORDS (Most Common in Spanish)
exports.ULTRA_HIGH_FREQUENCY_WORDS = [
  {
    word: 'no',
    translation: 'no',
    frequency: 1,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When someone asks if you did your homework',
        spanishPhrase: '¡NO!',
        englishTranslation: 'NO!',
        viralHook: 'Every student ever 😅',
        category: 'reactions',
        relatability: 10
      },
      {
        scenario: 'When you see your bank account balance',
        spanishPhrase: '¡NO, NO, NO!',
        englishTranslation: 'NO, NO, NO!',
        viralHook: 'Adult realities hit different 💸',
        category: 'drama',
        relatability: 9
      }
    ]
  },
  {
    word: 'sí',
    translation: 'yes',
    frequency: 2,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When someone offers you free food',
        spanishPhrase: '¡SÍ, SÍ, SÍ!',
        englishTranslation: 'YES, YES, YES!',
        viralHook: 'Free food = instant happiness 🍕',
        category: 'reactions',
        relatability: 10
      },
      {
        scenario: 'When your crush texts you back',
        spanishPhrase: '¡SÍ!',
        englishTranslation: 'YES!',
        viralHook: 'Victory dance time 💃',
        category: 'transformation',
        relatability: 9
      }
    ]
  },
  {
    word: 'hola',
    translation: 'hello',
    frequency: 3,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you awkwardly run into your ex',
        spanishPhrase: 'Hola... 😬',
        englishTranslation: 'Hello... 😬',
        viralHook: 'Most awkward word in existence',
        category: 'fails',
        relatability: 10
      },
      {
        scenario: 'When you confidently walk into the wrong classroom',
        spanishPhrase: 'Hola... wait...',
        englishTranslation: 'Hello... wait...',
        viralHook: 'Confidence vs Reality 🚪',
        category: 'fails',
        relatability: 9
      }
    ]
  },
  {
    word: 'yo',
    translation: 'I',
    frequency: 4,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When someone blames you for something you definitely did',
        spanishPhrase: '¿YO?',
        englishTranslation: 'ME?',
        viralHook: 'The universal "who, me?" defense 🙄',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'qué',
    translation: 'what',
    frequency: 5,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When someone explains something you will never understand',
        spanishPhrase: '¿Qué?',
        englishTranslation: 'What?',
        viralHook: 'Confusion is a universal language 🤔',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'porque',
    translation: 'because',
    frequency: 6,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When your parents ask why you did something stupid',
        spanishPhrase: 'Porque... sí',
        englishTranslation: 'Because... yes',
        viralHook: 'Peak teenage logic 🎯',
        category: 'fails',
        relatability: 9
      }
    ]
  },
  {
    word: 'cómo',
    translation: 'how',
    frequency: 7,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you see someone do something impossible',
        spanishPhrase: '¿Cómo?!',
        englishTranslation: 'How?!',
        viralHook: 'Mind = blown 🤯',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'muy',
    translation: 'very',
    frequency: 8,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When food is absolutely delicious',
        spanishPhrase: '¡Muy rico!',
        englishTranslation: 'Very delicious!',
        viralHook: 'Food appreciation is universal 😋',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'bueno',
    translation: 'good/well',
    frequency: 9,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When something is just okay but you are being polite',
        spanishPhrase: 'Bueno... 😬',
        englishTranslation: 'Well... 😬',
        viralHook: 'Polite suffering is real 🥴',
        category: 'reactions',
        relatability: 9
      }
    ]
  },
  {
    word: 'gracias',
    translation: 'thank you',
    frequency: 10,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When someone does literally anything nice for you',
        spanishPhrase: '¡Gracias!',
        englishTranslation: 'Thank you!',
        viralHook: 'Gratitude is wholesome ❤️',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'por favor',
    translation: 'please',
    frequency: 11,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you desperately need something',
        spanishPhrase: '¡Por favor!',
        englishTranslation: 'Please!',
        viralHook: 'Desperation knows no language 🙏',
        category: 'drama',
        relatability: 9
      }
    ]
  },
  {
    word: 'perdón',
    translation: 'sorry',
    frequency: 12,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you accidentally bump into someone',
        spanishPhrase: 'Perdón',
        englishTranslation: 'Sorry',
        viralHook: 'Polite panic mode activated 😰',
        category: 'fails',
        relatability: 10
      }
    ]
  },
  {
    word: 'quiero',
    translation: 'I want',
    frequency: 13,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you see dessert on the menu',
        spanishPhrase: '¡Quiero eso!',
        englishTranslation: 'I want that!',
        viralHook: 'Dessert temptation wins every time 🍰',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'tengo',
    translation: 'I have',
    frequency: 14,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you need to explain you have a problem',
        spanishPhrase: 'Tengo un problema',
        englishTranslation: 'I have a problem',
        viralHook: 'Universal struggle statement 😅',
        category: 'drama',
        relatability: 9
      }
    ]
  },
  {
    word: 'estoy',
    translation: 'I am',
    frequency: 15,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you are exhausted after work',
        spanishPhrase: 'Estoy cansado',
        englishTranslation: 'I am tired',
        viralHook: 'Mood of the century 😴',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'es',
    translation: 'is',
    frequency: 16,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When something is absolutely crazy',
        spanishPhrase: '¡Es loco!',
        englishTranslation: 'It\'s crazy!',
        viralHook: 'Mind-blowing reactions 🤪',
        category: 'reactions',
        relatability: 9
      }
    ]
  },
  {
    word: 'no sé',
    translation: 'I don\'t know',
    frequency: 17,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When someone asks you a question in class',
        spanishPhrase: 'No sé',
        englishTranslation: 'I don\'t know',
        viralHook: 'The classic student survival phrase 📚',
        category: 'fails',
        relatability: 10
      }
    ]
  },
  {
    word: 'me gusta',
    translation: 'I like',
    frequency: 18,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you try new food and love it',
        spanishPhrase: '¡Me gusta!',
        englishTranslation: 'I like it!',
        viralHook: 'Food discovery joy 🎉',
        category: 'reactions',
        relatability: 10
      }
    ]
  },
  {
    word: 'voy',
    translation: 'I go',
    frequency: 19,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you are leaving somewhere fast',
        spanishPhrase: '¡Ya voy!',
        englishTranslation: 'I\'m going!',
        viralHook: 'Running late panic 🏃',
        category: 'reactions',
        relatability: 9
      }
    ]
  },
  {
    word: 'casa',
    translation: 'house/home',
    frequency: 20,
    difficulty: 'beginner',
    contexts: [
      {
        scenario: 'When you finally get home after a long day',
        spanishPhrase: '¡Por fin en casa!',
        englishTranslation: 'Finally home!',
        viralHook: 'Best feeling ever 🏠',
        category: 'transformation',
        relatability: 10
      }
    ]
  }
];

// Generate frequency-based content recommendation
exports.getFrequencyWords = (level = 'beginner', count = 10) => {
  return exports.ULTRA_HIGH_FREQUENCY_WORDS
    .filter(w => w.difficulty === level)
    .slice(0, count);
};

// Get random viral context for a word
exports.getRandomViralContext = (word) => {
  const wordData = exports.ULTRA_HIGH_FREQUENCY_WORDS.find(w => w.word === word);
  if (!wordData || !wordData.contexts.length) return null;

  const randomIndex = Math.floor(Math.random() * wordData.contexts.length);
  return {
    ...wordData.contexts[randomIndex],
    word: wordData.word,
    translation: wordData.translation,
    frequency: wordData.frequency
  };
};

console.log('🎯 Spanish Frequency System loaded - TOP 20 words with viral contexts!');
