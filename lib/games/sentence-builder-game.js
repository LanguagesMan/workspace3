/**
 * 🏗️ SENTENCE BUILDER GAME
 * Build correct Spanish sentences from scrambled words
 */

class SentenceBuilderGame {
    constructor() {
        this.name = 'Sentence Builder';
        this.description = 'Arrange words to form correct Spanish sentences';
        this.icon = '🏗️';
        this.xpPerSentence = 15;
    }

    /**
     * Generate game session
     */
    generateGame(user, options = {}) {
        const {
            sentenceCount = 5,
            timeLimit = 120,
            difficulty = user.progress.level
        } = options;

        const sentences = this.selectSentences(difficulty, sentenceCount);
        
        const challenges = sentences.map((sentence, index) => ({
            id: `sentence_${index}`,
            original: sentence.spanish,
            translation: sentence.english,
            words: this.scrambleWords(sentence.spanish),
            correctOrder: sentence.spanish.split(' '),
            completed: false,
            attempts: 0
        }));

        return {
            id: `game_sentence_builder_${Date.now()}`,
            type: 'sentence_builder',
            userId: user.id,
            level: difficulty,
            challenges: challenges,
            totalSentences: sentenceCount,
            timeLimit: timeLimit,
            xpReward: sentenceCount * this.xpPerSentence,
            startedAt: new Date().toISOString(),
            completed: false,
            score: null
        };
    }

    /**
     * Select sentences based on level
     */
    selectSentences(level, count) {
        const sentences = {
            A1: [
                { spanish: 'Yo soy estudiante', english: 'I am a student' },
                { spanish: 'Me gusta el café', english: 'I like coffee' },
                { spanish: 'Tengo un perro', english: 'I have a dog' },
                { spanish: 'Vivo en Madrid', english: 'I live in Madrid' },
                { spanish: 'Hoy hace sol', english: 'Today it is sunny' }
            ],
            A2: [
                { spanish: 'Quiero aprender español', english: 'I want to learn Spanish' },
                { spanish: 'Voy al supermercado mañana', english: 'I am going to the supermarket tomorrow' },
                { spanish: 'Mi familia es muy grande', english: 'My family is very big' },
                { spanish: 'Trabajo en una oficina', english: 'I work in an office' },
                { spanish: 'Me encanta viajar por el mundo', english: 'I love traveling around the world' }
            ],
            B1: [
                { spanish: 'Estoy aprendiendo a cocinar comida española', english: 'I am learning to cook Spanish food' },
                { spanish: 'Necesito practicar más para mejorar', english: 'I need to practice more to improve' },
                { spanish: 'El año pasado viajé a Barcelona', english: 'Last year I traveled to Barcelona' },
                { spanish: 'Me gustaría vivir en España algún día', english: 'I would like to live in Spain someday' },
                { spanish: 'La cultura española es muy interesante', english: 'Spanish culture is very interesting' }
            ]
        };

        const levelSentences = sentences[level] || sentences.A2;
        return levelSentences.slice(0, count);
    }

    /**
     * Scramble words in sentence
     */
    scrambleWords(sentence) {
        const words = sentence.split(' ');
        return words.sort(() => Math.random() - 0.5);
    }

    /**
     * Check if sentence is correct
     */
    checkSentence(challenge, userSentence) {
        const correct = challenge.correctOrder.join(' ').toLowerCase();
        const user = userSentence.join(' ').toLowerCase();
        return correct === user;
    }

    /**
     * Calculate score
     */
    calculateScore(game, timeElapsed) {
        const completed = game.challenges.filter(c => c.completed).length;
        const baseScore = completed * 100;
        const timeBonus = Math.max(0, (game.timeLimit - timeElapsed) * 1);
        const attemptsAvg = game.challenges.reduce((sum, c) => sum + c.attempts, 0) / game.challenges.length;
        const accuracyBonus = Math.max(0, (3 - attemptsAvg) * 50);
        
        return Math.round(baseScore + timeBonus + accuracyBonus);
    }
}

module.exports = SentenceBuilderGame;
