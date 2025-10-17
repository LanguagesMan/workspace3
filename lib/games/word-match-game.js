/**
 * 🎮 WORD MATCH GAME
 * Match Spanish words with English translations
 */

class WordMatchGame {
    constructor() {
        this.name = 'Word Match';
        this.description = 'Match Spanish words with their English translations';
        this.icon = '🎯';
        this.xpPerMatch = 5;
    }

    /**
     * Generate game session
     */
    generateGame(user, options = {}) {
        const {
            pairCount = 8,
            timeLimit = 60, // seconds
            difficulty = user.progress.level
        } = options;

        // Get words from user's word bank or level-appropriate words
        const words = this.selectWords(user, pairCount);
        
        // Create pairs
        const pairs = words.map((word, index) => ({
            id: `pair_${index}`,
            spanish: word.spanish,
            english: word.english,
            matched: false
        }));

        // Create shuffled cards
        const cards = this.createCards(pairs);

        return {
            id: `game_word_match_${Date.now()}`,
            type: 'word_match',
            userId: user.id,
            level: difficulty,
            pairs: pairs,
            cards: cards,
            totalPairs: pairCount,
            timeLimit: timeLimit,
            xpReward: pairCount * this.xpPerMatch,
            startedAt: new Date().toISOString(),
            completed: false,
            score: null
        };
    }

    /**
     * Select words for the game
     */
    selectWords(user, count) {
        const wordPairs = [
            { spanish: 'hola', english: 'hello' },
            { spanish: 'adiós', english: 'goodbye' },
            { spanish: 'gracias', english: 'thank you' },
            { spanish: 'por favor', english: 'please' },
            { spanish: 'sí', english: 'yes' },
            { spanish: 'no', english: 'no' },
            { spanish: 'casa', english: 'house' },
            { spanish: 'agua', english: 'water' },
            { spanish: 'comida', english: 'food' },
            { spanish: 'tiempo', english: 'time' },
            { spanish: 'día', english: 'day' },
            { spanish: 'noche', english: 'night' },
            { spanish: 'amigo', english: 'friend' },
            { spanish: 'familia', english: 'family' },
            { spanish: 'trabajo', english: 'work' },
            { spanish: 'escuela', english: 'school' },
            { spanish: 'libro', english: 'book' },
            { spanish: 'mesa', english: 'table' },
            { spanish: 'perro', english: 'dog' },
            { spanish: 'gato', english: 'cat' }
        ];

        // Shuffle and take count
        return wordPairs.sort(() => Math.random() - 0.5).slice(0, count);
    }

    /**
     * Create shuffled cards
     */
    createCards(pairs) {
        const cards = [];
        
        pairs.forEach((pair, index) => {
            cards.push({
                id: `card_es_${index}`,
                pairId: pair.id,
                text: pair.spanish,
                language: 'spanish',
                flipped: false,
                matched: false
            });
            
            cards.push({
                id: `card_en_${index}`,
                pairId: pair.id,
                text: pair.english,
                language: 'english',
                flipped: false,
                matched: false
            });
        });

        // Shuffle cards
        return cards.sort(() => Math.random() - 0.5);
    }

    /**
     * Check if two cards match
     */
    checkMatch(game, card1Id, card2Id) {
        const card1 = game.cards.find(c => c.id === card1Id);
        const card2 = game.cards.find(c => c.id === card2Id);

        if (!card1 || !card2) return false;

        return card1.pairId === card2.pairId;
    }

    /**
     * Calculate score
     */
    calculateScore(game, timeElapsed, moves) {
        const baseScore = game.totalPairs * 100;
        const timeBonus = Math.max(0, (game.timeLimit - timeElapsed) * 2);
        const movesPenalty = Math.max(0, (moves - game.totalPairs) * 5);
        
        return Math.round(baseScore + timeBonus - movesPenalty);
    }
}

module.exports = WordMatchGame;
