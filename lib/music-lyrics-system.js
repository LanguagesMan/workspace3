/**
 * 🎵 MUSIC & LYRICS LEARNING SYSTEM
 * 
 * Learn Spanish through music with synchronized lyrics
 * Analyze song difficulty and extract vocabulary
 */

const { PrismaClient } = require('@prisma/client');
const contentDifficultyAnalyzer = require('./content-difficulty-analyzer');

const prisma = new PrismaClient();

class MusicLyricsSystem {
    constructor() {
        // Music genres
        this.GENRES = [
            'pop', 'rock', 'reggaeton', 'salsa', 'bachata',
            'cumbia', 'vallenato', 'flamenco', 'latin-pop', 'indie'
        ];

        // Popular Spanish artists by level
        this.ARTISTS_BY_LEVEL = {
            'A1': ['Maná', 'Juanes', 'Shakira'],
            'A2': ['Carlos Vives', 'Jesse & Joy', 'Pablo Alborán'],
            'B1': ['Rosalía', 'Bad Bunny', 'J Balvin'],
            'B2': ['Camarón de la Isla', 'Joaquín Sabina', 'Andrés Calamaro'],
            'C1': ['Silvio Rodríguez', 'Joan Manuel Serrat', 'Alejandro Sanz']
        };
    }

    /**
     * Add a song to the database with lyrics
     * @param {Object} songData - Song information
     * @returns {Object} Created song
     */
    async addSong(songData) {
        try {
            const {
                title,
                artist,
                lyrics,
                genre,
                youtubeUrl = null,
                spotifyUrl = null,
                duration = null
            } = songData;

            console.log(`🎵 Adding song: ${title} by ${artist}...`);

            // Analyze lyrics difficulty
            const analysis = await contentDifficultyAnalyzer.analyzeTranscription(lyrics, 'es');

            // Extract vocabulary from lyrics
            const vocabulary = this.extractVocabulary(lyrics, analysis);

            // Create song in database
            const song = await prisma.song.create({
                data: {
                    title,
                    artist,
                    genre,
                    youtubeUrl,
                    spotifyUrl,
                    duration,
                    level: analysis.cefrLevel
                }
            });

            // Create lyrics entry
            await prisma.lyrics.create({
                data: {
                    songId: song.id,
                    text: lyrics,
                    language: 'es',
                    vocabulary: JSON.stringify(vocabulary),
                    synchronized: false // TODO: Add LRC file support
                }
            });

            console.log(`   ✅ Song added: ${title} (${analysis.cefrLevel})`);

            return {
                success: true,
                song: {
                    ...song,
                    lyrics: {
                        text: lyrics,
                        vocabulary
                    },
                    analysis
                }
            };

        } catch (error) {
            console.error('Error adding song:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract vocabulary from lyrics
     * @param {string} lyrics - Song lyrics
     * @param {Object} analysis - Difficulty analysis
     * @returns {Array} Vocabulary items
     */
    extractVocabulary(lyrics, analysis) {
        const frequencyLookup = require('./frequency-lookup');
        const vocabulary = [];

        // Get unique words from analysis
        const uniqueWords = analysis.uniqueWords || [];

        for (const word of uniqueWords.slice(0, 20)) { // Top 20 words
            const wordData = frequencyLookup.getWordData(word);
            
            if (wordData) {
                vocabulary.push({
                    word: word,
                    rank: wordData.rank,
                    level: wordData.level,
                    frequency: this.countOccurrences(lyrics.toLowerCase(), word.toLowerCase())
                });
            }
        }

        return vocabulary.sort((a, b) => b.frequency - a.frequency);
    }

    /**
     * Count word occurrences in text
     */
    countOccurrences(text, word) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }

    /**
     * Get songs by level
     * @param {string} level - CEFR level
     * @param {number} limit - Max songs to return
     * @returns {Array} Songs
     */
    async getSongsByLevel(level, limit = 20) {
        try {
            const songs = await prisma.song.findMany({
                where: { level },
                include: {
                    lyrics: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });

            return songs;

        } catch (error) {
            console.error('Error getting songs:', error);
            return [];
        }
    }

    /**
     * Search songs by title or artist
     * @param {string} query - Search query
     * @param {number} limit - Max results
     * @returns {Array} Songs
     */
    async searchSongs(query, limit = 10) {
        try {
            const songs = await prisma.song.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { artist: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: {
                    lyrics: true
                },
                take: limit
            });

            return songs;

        } catch (error) {
            console.error('Error searching songs:', error);
            return [];
        }
    }

    /**
     * Get recommended songs for user
     * @param {string} userId - User ID
     * @param {number} limit - Max songs to return
     * @returns {Array} Recommended songs
     */
    async getRecommendedSongs(userId, limit = 10) {
        try {
            // Get user's level
            const levelProgression = require('./level-progression');
            const levelData = await levelProgression.calculateCurrentLevel(userId);
            const userLevel = levelData.currentLevel;

            // Get songs at user's level and adjacent levels
            const levels = this.getAdjacentLevels(userLevel);
            
            const songs = await prisma.song.findMany({
                where: {
                    level: { in: levels }
                },
                include: {
                    lyrics: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });

            return songs;

        } catch (error) {
            console.error('Error getting recommended songs:', error);
            return [];
        }
    }

    /**
     * Get adjacent CEFR levels
     */
    getAdjacentLevels(level) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        
        const result = [level];
        if (index > 0) result.push(levels[index - 1]);
        if (index < levels.length - 1) result.push(levels[index + 1]);
        
        return result;
    }

    /**
     * Create practice exercise from song
     * @param {string} songId - Song ID
     * @param {string} exerciseType - Type of exercise
     * @returns {Object} Exercise
     */
    async createExercise(songId, exerciseType = 'fill-in-blank') {
        try {
            const song = await prisma.song.findUnique({
                where: { id: songId },
                include: { lyrics: true }
            });

            if (!song || !song.lyrics) {
                throw new Error('Song or lyrics not found');
            }

            const lyrics = song.lyrics.text;
            const lines = lyrics.split('\n').filter(l => l.trim());

            if (exerciseType === 'fill-in-blank') {
                return this.createFillInBlankExercise(lines);
            }

            if (exerciseType === 'word-order') {
                return this.createWordOrderExercise(lines);
            }

            return { success: false, error: 'Unknown exercise type' };

        } catch (error) {
            console.error('Error creating exercise:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create fill-in-the-blank exercise
     */
    createFillInBlankExercise(lines) {
        const exercises = [];
        
        // Select random lines
        const selectedLines = lines
            .filter(line => line.split(' ').length >= 4) // At least 4 words
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        for (const line of selectedLines) {
            const words = line.trim().split(' ');
            
            // Remove a random word (not first or last)
            const removeIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
            const missingWord = words[removeIndex];
            
            const blankedLine = [
                ...words.slice(0, removeIndex),
                '_____',
                ...words.slice(removeIndex + 1)
            ].join(' ');

            exercises.push({
                question: blankedLine,
                answer: missingWord.toLowerCase().replace(/[.,!?]/g, ''),
                fullLine: line
            });
        }

        return {
            success: true,
            type: 'fill-in-blank',
            exercises
        };
    }

    /**
     * Create word order exercise
     */
    createWordOrderExercise(lines) {
        const exercises = [];
        
        // Select random lines
        const selectedLines = lines
            .filter(line => line.split(' ').length >= 4 && line.split(' ').length <= 8)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        for (const line of selectedLines) {
            const words = line.trim().split(' ');
            
            // Shuffle words
            const shuffled = [...words].sort(() => Math.random() - 0.5);

            exercises.push({
                question: shuffled.join(' '),
                answer: line,
                words: shuffled
            });
        }

        return {
            success: true,
            type: 'word-order',
            exercises
        };
    }

    /**
     * Track song playback
     */
    async trackPlayback(userId, songId) {
        try {
            await prisma.userInteraction.create({
                data: {
                    userId,
                    type: 'song_play',
                    contentId: songId,
                    metadata: JSON.stringify({
                        timestamp: new Date().toISOString()
                    })
                }
            });

            console.log(`   🎵 Tracked playback: ${songId} for user ${userId}`);

        } catch (error) {
            console.error('Error tracking playback:', error);
        }
    }

    /**
     * Get song statistics
     */
    async getSongStats(songId) {
        try {
            const plays = await prisma.userInteraction.count({
                where: {
                    type: 'song_play',
                    contentId: songId
                }
            });

            const uniqueListeners = await prisma.userInteraction.groupBy({
                by: ['userId'],
                where: {
                    type: 'song_play',
                    contentId: songId
                }
            });

            return {
                totalPlays: plays,
                uniqueListeners: uniqueListeners.length
            };

        } catch (error) {
            console.error('Error getting song stats:', error);
            return {
                totalPlays: 0,
                uniqueListeners: 0
            };
        }
    }
}

module.exports = new MusicLyricsSystem();

