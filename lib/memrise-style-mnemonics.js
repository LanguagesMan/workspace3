// 🧠 MEMRISE-STYLE MNEMONICS - BUT BETTER
// AI-powered memory tricks, visual associations, false friend warnings

class MemriseStyleMnemonics {
    constructor() {
        this.mnemonics = new Map();
        this.falseFriends = this.initializeFalseFriends();
        this.wordFamilies = this.initializeWordFamilies();
        this.visualAssociations = new Map();
    }

    /**
     * FALSE FRIENDS - Critical for English speakers learning Spanish
     */
    initializeFalseFriends() {
        return {
            'embarazada': {
                falseEnglish: 'embarrassed',
                actualMeaning: 'pregnant',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Don\'t be embarrassed to say you\'re pregnant!',
                severity: 'high',
                example: 'Ella está embarazada (She is pregnant, NOT embarrassed!)'
            },
            'constipado': {
                falseEnglish: 'constipated',
                actualMeaning: 'having a cold',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Don\'t confuse a cold with constipation!',
                severity: 'medium',
                example: 'Estoy constipado (I have a cold, not constipated)'
            },
            'éxito': {
                falseEnglish: 'exit',
                actualMeaning: 'success',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Success is not an exit!',
                severity: 'medium',
                example: 'Tuvo mucho éxito (He had great success, not an exit)'
            },
            'actual': {
                falseEnglish: 'actual',
                actualMeaning: 'current/present',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Actual means current, not real',
                severity: 'medium',
                example: 'La situación actual (the current situation)'
            },
            'realizar': {
                falseEnglish: 'realize',
                actualMeaning: 'to carry out/accomplish',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'You realize you need to carry out your plans',
                severity: 'low',
                example: 'Realizar un proyecto (carry out a project)'
            },
            'largo': {
                falseEnglish: 'large',
                actualMeaning: 'long',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Large things aren\'t always long',
                severity: 'medium',
                example: 'Un camino largo (a long road, not large)'
            },
            'sensible': {
                falseEnglish: 'sensible',
                actualMeaning: 'sensitive',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Sensitive people aren\'t always sensible',
                severity: 'low',
                example: 'Una persona sensible (a sensitive person)'
            },
            'soportar': {
                falseEnglish: 'support',
                actualMeaning: 'to tolerate/endure',
                warning: '⚠️ FALSE FRIEND!',
                mnemonic: 'Support means tolerate here',
                severity: 'medium',
                example: 'No puedo soportarlo (I can\'t stand it)'
            }
        };
    }

    /**
     * WORD FAMILIES - Show related words for pattern recognition
     */
    initializeWordFamilies() {
        return {
            'comer': {
                family: 'eating',
                related: ['comida', 'comedor', 'comestible', 'comilón'],
                root: 'com-',
                pattern: 'verb → noun',
                mnemonic: 'All about eating!'
            },
            'beber': {
                family: 'drinking',
                related: ['bebida', 'bebedor', 'bebible'],
                root: 'beb-',
                pattern: 'verb → noun',
                mnemonic: 'All about drinking!'
            },
            'escribir': {
                family: 'writing',
                related: ['escritor', 'escritura', 'escrito', 'escritorio'],
                root: 'escrib-/escrit-',
                pattern: 'verb → noun',
                mnemonic: 'All about writing!'
            },
            'leer': {
                family: 'reading',
                related: ['lectura', 'lector', 'legible', 'leyenda'],
                root: 'le-',
                pattern: 'verb → noun',
                mnemonic: 'All about reading!'
            },
            'hablar': {
                family: 'speaking',
                related: ['hablador', 'hablante', 'habla'],
                root: 'habl-',
                pattern: 'verb → noun',
                mnemonic: 'All about speaking!'
            }
        };
    }

    /**
     * Generate mnemonic for any word
     * BETTER THAN MEMRISE: AI-generated, not user-dependent
     */
    generateMnemonic(word, meaning, context = '') {
        const existingMnemonic = this.mnemonics.get(word);
        if (existingMnemonic) return existingMnemonic;
        
        // Check for false friends first
        const falseFriend = this.falseFriends[word.toLowerCase()];
        if (falseFriend) {
            return {
                type: 'false_friend',
                word,
                meaning,
                ...falseFriend,
                icon: '⚠️'
            };
        }
        
        // Check for word families
        const family = this.wordFamilies[word.toLowerCase()];
        if (family) {
            return {
                type: 'word_family',
                word,
                meaning,
                ...family,
                icon: '👨‍👩‍👧‍👦'
            };
        }
        
        // Generate sound-alike mnemonic
        const soundAlike = this.generateSoundAlikeMnemonic(word, meaning);
        if (soundAlike) {
            return soundAlike;
        }
        
        // Generate etymology-based mnemonic
        const etymology = this.generateEtymologyMnemonic(word, meaning);
        if (etymology) {
            return etymology;
        }
        
        // Generate contextual mnemonic
        return this.generateContextualMnemonic(word, meaning, context);
    }

    /**
     * Generate sound-alike mnemonics (sounds like English)
     */
    generateSoundAlikeMnemonic(word, meaning) {
        const soundAlikes = {
            'gato': {
                soundsLike: 'got-oh',
                mnemonic: 'I GOT-OH a cat!',
                meaning: 'cat',
                icon: '🐱'
            },
            'perro': {
                soundsLike: 'pear-oh',
                mnemonic: 'My dog loves PEARs!',
                meaning: 'dog',
                icon: '🐕'
            },
            'coche': {
                soundsLike: 'coach',
                mnemonic: 'My COACH drives a car',
                meaning: 'car',
                icon: '🚗'
            },
            'mesa': {
                soundsLike: 'may-sah',
                mnemonic: 'MAY-SAH sit at the table?',
                meaning: 'table',
                icon: '🪑'
            },
            'libro': {
                soundsLike: 'lee-broh',
                mnemonic: 'LEE BROught a book',
                meaning: 'book',
                icon: '📚'
            },
            'casa': {
                soundsLike: 'cah-sah',
                mnemonic: 'My house is my CAH-SAH (castle)',
                meaning: 'house',
                icon: '🏠'
            },
            'agua': {
                soundsLike: 'ah-gwah',
                mnemonic: 'AH! GWAH-ter (water)',
                meaning: 'water',
                icon: '💧'
            },
            'leche': {
                soundsLike: 'leh-chay',
                mnemonic: 'LAY-CHAY the milk down',
                meaning: 'milk',
                icon: '🥛'
            },
            'noche': {
                soundsLike: 'no-chay',
                mnemonic: 'NO-CHAY more light at night',
                meaning: 'night',
                icon: '🌙'
            },
            'mucho': {
                soundsLike: 'moo-cho',
                mnemonic: 'MOO-CHO means MUCH',
                meaning: 'much/many',
                icon: '➕'
            }
        };
        
        const soundAlike = soundAlikes[word.toLowerCase()];
        if (soundAlike) {
            return {
                type: 'sound_alike',
                word,
                meaning,
                ...soundAlike
            };
        }
        
        return null;
    }

    /**
     * Generate etymology-based mnemonics (cognates, Latin roots)
     */
    generateEtymologyMnemonic(word, meaning) {
        const cognates = {
            'similar': {
                english: 'similar',
                mnemonic: 'Same word in English!',
                type: 'perfect_cognate',
                icon: '🎯'
            },
            'diferente': {
                english: 'different',
                mnemonic: 'Almost identical to English!',
                type: 'near_cognate',
                icon: '🔄'
            },
            'importante': {
                english: 'important',
                mnemonic: 'Remove -e, add -t = English',
                type: 'near_cognate',
                icon: '⭐'
            },
            'posible': {
                english: 'possible',
                mnemonic: 'Just add an extra S!',
                type: 'near_cognate',
                icon: '✅'
            },
            'familia': {
                english: 'family',
                mnemonic: 'Family is almost the same!',
                type: 'near_cognate',
                icon: '👨‍👩‍👧‍👦'
            },
            'música': {
                english: 'music',
                mnemonic: 'Music with an accent!',
                type: 'near_cognate',
                icon: '🎵'
            },
            'doctor': {
                english: 'doctor',
                mnemonic: 'Same as English!',
                type: 'perfect_cognate',
                icon: '👨‍⚕️'
            },
            'hotel': {
                english: 'hotel',
                mnemonic: 'Same as English!',
                type: 'perfect_cognate',
                icon: '🏨'
            }
        };
        
        const cognate = cognates[word.toLowerCase()];
        if (cognate) {
            return {
                type: 'etymology',
                word,
                meaning,
                ...cognate
            };
        }
        
        return null;
    }

    /**
     * Generate contextual mnemonic from video context
     */
    generateContextualMnemonic(word, meaning, context) {
        if (!context) {
            return {
                type: 'basic',
                word,
                meaning,
                mnemonic: `Remember: ${word} = ${meaning}`,
                icon: '💡'
            };
        }
        
        return {
            type: 'contextual',
            word,
            meaning,
            context,
            mnemonic: `Remember from video: "${context}"`,
            icon: '🎬'
        };
    }

    /**
     * Get visual association (image URL or emoji)
     */
    getVisualAssociation(word, meaning) {
        // In production, this would fetch from image API (Unsplash, etc.)
        const emojiMap = {
            // Animals
            'gato': '🐱', 'perro': '🐕', 'pájaro': '🐦', 'pez': '🐟',
            'caballo': '🐴', 'vaca': '🐄', 'cerdo': '🐷', 'ratón': '🐭',
            
            // Food
            'comida': '🍽️', 'pan': '🍞', 'agua': '💧', 'leche': '🥛',
            'carne': '🥩', 'pollo': '🍗', 'pescado': '🐟', 'verduras': '🥗',
            'frutas': '🍎', 'manzana': '🍎', 'naranja': '🍊', 'plátano': '🍌',
            
            // Travel
            'coche': '🚗', 'avión': '✈️', 'tren': '🚂', 'barco': '🚢',
            'bicicleta': '🚲', 'autobús': '🚌', 'taxi': '🚕',
            
            // Places
            'casa': '🏠', 'escuela': '🏫', 'hospital': '🏥', 'hotel': '🏨',
            'restaurante': '🍽️', 'tienda': '🏪', 'banco': '🏦',
            
            // Nature
            'sol': '☀️', 'luna': '🌙', 'estrella': '⭐', 'árbol': '🌳',
            'flor': '🌸', 'montaña': '⛰️', 'playa': '🏖️', 'mar': '🌊',
            
            // Weather
            'lluvia': '🌧️', 'nieve': '❄️', 'viento': '💨', 'nublado': '☁️',
            
            // Time
            'día': '📅', 'noche': '🌙', 'hora': '⏰', 'reloj': '⌚',
            
            // Body
            'cabeza': '👤', 'mano': '✋', 'pie': '🦶', 'ojo': '👁️',
            'oído': '👂', 'boca': '👄',
            
            // Emotions
            'feliz': '😊', 'triste': '😢', 'enojado': '😠', 'amor': '❤️',
            
            // Objects
            'libro': '📚', 'teléfono': '📱', 'computadora': '💻', 'reloj': '⏰',
            'dinero': '💰', 'llave': '🔑', 'puerta': '🚪'
        };
        
        return emojiMap[word.toLowerCase()] || '💡';
    }

    /**
     * Generate comprehensive flashcard with mnemonic
     */
    generateFlashcard(word, meaning, context = '', audioUrl = null) {
        const mnemonic = this.generateMnemonic(word, meaning, context);
        const visual = this.getVisualAssociation(word, meaning);
        const family = this.wordFamilies[word.toLowerCase()];
        const falseFriend = this.falseFriends[word.toLowerCase()];
        
        return {
            word,
            meaning,
            mnemonic,
            visual,
            context,
            audioUrl,
            family: family || null,
            falseFriend: falseFriend || null,
            tips: this.generateLearningTips(word, meaning, mnemonic)
        };
    }

    /**
     * Generate learning tips
     */
    generateLearningTips(word, meaning, mnemonic) {
        const tips = [];
        
        if (mnemonic.type === 'false_friend') {
            tips.push({
                type: 'warning',
                message: `⚠️ Don't confuse with English "${mnemonic.falseEnglish}"`,
                priority: 'high'
            });
        }
        
        if (mnemonic.type === 'perfect_cognate') {
            tips.push({
                type: 'success',
                message: '✅ Easy! Same as English',
                priority: 'low'
            });
        }
        
        if (mnemonic.type === 'word_family') {
            tips.push({
                type: 'info',
                message: `👨‍👩‍👧‍👦 Related words: ${mnemonic.related.join(', ')}`,
                priority: 'medium'
            });
        }
        
        tips.push({
            type: 'practice',
            message: '💪 Use it 3 times today to remember it!',
            priority: 'medium'
        });
        
        return tips;
    }

    /**
     * Get pronunciation tip
     */
    getPronunciationTip(word) {
        const pronunciationTips = {
            'll': 'Sounds like Y in "yes"',
            'ñ': 'Sounds like NY in "canyon"',
            'j': 'Like H in "hot" but stronger',
            'r': 'Rolled R - tap tongue on roof',
            'rr': 'Strongly rolled R',
            'h': 'Silent! Don\'t pronounce',
            'v': 'Sounds like B',
            'z': 'Sounds like TH in "think" (Spain)',
            'c': 'Before e/i: like TH (Spain) or S (Latin America)'
        };
        
        const tips = [];
        for (const [pattern, tip] of Object.entries(pronunciationTips)) {
            if (word.includes(pattern)) {
                tips.push({ pattern, tip });
            }
        }
        
        return tips;
    }

    /**
     * Store custom user mnemonic (like Memrise "mems")
     */
    addCustomMnemonic(word, userMnemonic, userId) {
        const key = `${word}_${userId}`;
        this.mnemonics.set(key, {
            type: 'user_created',
            word,
            mnemonic: userMnemonic,
            userId,
            createdAt: Date.now(),
            icon: '✏️'
        });
        return true;
    }

    /**
     * Get all mnemonics for a word
     */
    getAllMnemonics(word) {
        const official = this.generateMnemonic(word, '', '');
        const userMnemonics = [];
        
        // In production, fetch from database
        // For now, just return official
        return {
            official,
            userCreated: userMnemonics,
            total: 1 + userMnemonics.length
        };
    }
}

module.exports = new MemriseStyleMnemonics();

