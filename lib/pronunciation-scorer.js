/**
 * 🎤 PRONUNCIATION SCORER
 * 
 * Advanced pronunciation analysis and scoring system
 * Uses Whisper API + phonetic analysis to score pronunciation accuracy
 * 
 * Inspired by: Duolingo pronunciation exercises, ELSA Speak, Rosetta Stone TruAccent
 * 
 * Key Features:
 * - Real-time pronunciation scoring (0-100)
 * - Phoneme-level feedback
 * - Common mistake detection
 * - Accent adaptation
 * - Progress tracking
 */

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class PronunciationScorer {
    constructor() {
        this.userProgress = new Map(); // userId -> pronunciation history
        
        // Common Spanish pronunciation challenges for English speakers
        this.COMMON_CHALLENGES = {
            rolled_r: {
                phonemes: ['r', 'rr'],
                difficulty: 'hard',
                feedback: 'Practice rolling your R: "perro", "carro", "ferrocarril"'
            },
            j_sound: {
                phonemes: ['j', 'ge', 'gi'],
                difficulty: 'medium',
                feedback: 'The Spanish "J" is guttural, like clearing your throat: "jalapeño", "girar"'
            },
            soft_d: {
                phonemes: ['d'],
                difficulty: 'easy',
                feedback: 'Spanish D between vowels is softer, like "TH" in "the": "nada", "todo"'
            },
            ll_sound: {
                phonemes: ['ll', 'y'],
                difficulty: 'easy',
                feedback: 'LL and Y sound like English "Y": "llama" = "yama"'
            },
            ñ_sound: {
                phonemes: ['ñ'],
                difficulty: 'medium',
                feedback: 'Ñ sounds like "NY": "mañana" = "man-YA-na"'
            },
            vowels: {
                phonemes: ['a', 'e', 'i', 'o', 'u'],
                difficulty: 'easy',
                feedback: 'Spanish vowels are pure and short. No diphthongs like in English.'
            }
        };
    }

    /**
     * Score user pronunciation
     * @param {Buffer} audioBuffer - User's audio recording
     * @param {string} targetText - Text they were trying to say
     * @param {string} userId - User ID
     * @returns {Object} Detailed scoring and feedback
     */
    async scorePronunciation(audioBuffer, targetText, userId) {
        try {
            // 1. Transcribe audio using Whisper
            const transcription = await this.transcribeWithConfidence(audioBuffer);

            // 2. Calculate accuracy score
            const accuracy = this.calculateAccuracy(targetText, transcription.text);

            // 3. Analyze pronunciation issues
            const analysis = this.analyzePronunciation(targetText, transcription);

            // 4. Generate specific feedback
            const feedback = this.generateFeedback(targetText, transcription, analysis);

            // 5. Track progress
            this.trackProgress(userId, {
                targetText,
                spokenText: transcription.text,
                score: accuracy.score,
                timestamp: new Date().toISOString()
            });

            return {
                score: accuracy.score, // 0-100
                grade: this.getGrade(accuracy.score),
                spokenText: transcription.text,
                targetText,
                accuracy: {
                    overall: accuracy.score,
                    wordLevel: accuracy.wordAccuracy,
                    confidence: transcription.confidence
                },
                analysis: {
                    mistakes: analysis.mistakes,
                    strengths: analysis.strengths,
                    challenges: analysis.challenges
                },
                feedback: feedback,
                improvement: this.getImprovementTip(analysis),
                progress: this.getUserProgress(userId)
            };
        } catch (error) {
            console.error('Error scoring pronunciation:', error);
            throw error;
        }
    }

    /**
     * Transcribe audio with Whisper and get confidence scores
     */
    async transcribeWithConfidence(audioBuffer) {
        try {
            const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

            const transcription = await openai.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                language: 'es',
                response_format: 'verbose_json',
                temperature: 0 // Lower temperature for more accurate transcription
            });

            // Extract confidence from segments
            const avgConfidence = transcription.segments
                ? transcription.segments.reduce((sum, seg) => sum + (seg.confidence || 0), 0) / transcription.segments.length
                : 1.0;

            return {
                text: transcription.text,
                language: transcription.language,
                duration: transcription.duration,
                confidence: avgConfidence,
                segments: transcription.segments || []
            };
        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw error;
        }
    }

    /**
     * Calculate pronunciation accuracy
     */
    calculateAccuracy(targetText, spokenText) {
        // Normalize texts
        const target = this.normalizeText(targetText);
        const spoken = this.normalizeText(spokenText);

        // Calculate Levenshtein distance
        const distance = this.levenshteinDistance(target, spoken);
        const maxLength = Math.max(target.length, spoken.length);
        
        // Calculate similarity score (0-100)
        const similarity = Math.max(0, 100 - (distance / maxLength) * 100);

        // Word-level accuracy
        const targetWords = target.split(/\s+/);
        const spokenWords = spoken.split(/\s+/);
        const wordAccuracy = this.calculateWordAccuracy(targetWords, spokenWords);

        return {
            score: Math.round(similarity),
            wordAccuracy: Math.round(wordAccuracy),
            distance,
            exactMatch: target === spoken
        };
    }

    /**
     * Calculate word-level accuracy
     */
    calculateWordAccuracy(targetWords, spokenWords) {
        let correct = 0;
        
        for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
            if (targetWords[i] === spokenWords[i]) {
                correct++;
            }
        }

        return (correct / targetWords.length) * 100;
    }

    /**
     * Analyze pronunciation issues
     */
    analyzePronunciation(targetText, transcription) {
        const target = this.normalizeText(targetText);
        const spoken = this.normalizeText(transcription.text);
        
        const mistakes = [];
        const strengths = [];
        const challenges = [];

        const targetWords = target.split(/\s+/);
        const spokenWords = spoken.split(/\s+/);

        // Word-by-word analysis
        for (let i = 0; i < targetWords.length; i++) {
            const targetWord = targetWords[i];
            const spokenWord = spokenWords[i] || '';

            if (targetWord === spokenWord) {
                strengths.push({
                    word: targetWord,
                    feedback: '✓ Perfect pronunciation'
                });
            } else if (spokenWord) {
                const similarity = this.wordSimilarity(targetWord, spokenWord);
                
                if (similarity > 70) {
                    mistakes.push({
                        word: targetWord,
                        spoken: spokenWord,
                        severity: 'minor',
                        feedback: 'Close! Try emphasizing each syllable.'
                    });
                } else {
                    mistakes.push({
                        word: targetWord,
                        spoken: spokenWord,
                        severity: 'major',
                        feedback: this.getDiagnosticFeedback(targetWord, spokenWord)
                    });

                    // Check if it's a known challenging phoneme
                    const challenge = this.identifyChallenge(targetWord);
                    if (challenge) {
                        challenges.push(challenge);
                    }
                }
            } else {
                mistakes.push({
                    word: targetWord,
                    spoken: '(not detected)',
                    severity: 'major',
                    feedback: 'Word was not detected. Speak louder and clearer.'
                });
            }
        }

        return {
            mistakes,
            strengths,
            challenges: [...new Set(challenges)] // Remove duplicates
        };
    }

    /**
     * Generate specific feedback
     */
    generateFeedback(targetText, transcription, analysis) {
        const feedback = [];

        // Overall assessment
        if (analysis.mistakes.length === 0) {
            feedback.push({
                type: 'success',
                message: '🎉 Perfect pronunciation! Native-like quality!',
                icon: '⭐'
            });
        } else if (analysis.mistakes.length <= 2) {
            feedback.push({
                type: 'good',
                message: '👍 Great job! Just a few minor improvements needed.',
                icon: '🌟'
            });
        } else {
            feedback.push({
                type: 'needs_improvement',
                message: '💪 Keep practicing! Focus on these specific sounds.',
                icon: '📈'
            });
        }

        // Specific word feedback
        analysis.mistakes.forEach(mistake => {
            feedback.push({
                type: 'correction',
                word: mistake.word,
                spoken: mistake.spoken,
                message: mistake.feedback,
                severity: mistake.severity,
                icon: mistake.severity === 'minor' ? '⚠️' : '❌'
            });
        });

        // Challenge-specific tips
        analysis.challenges.forEach(challenge => {
            feedback.push({
                type: 'tip',
                message: challenge.feedback,
                difficulty: challenge.difficulty,
                icon: '💡'
            });
        });

        return feedback;
    }

    /**
     * Get diagnostic feedback for specific word mistakes
     */
    getDiagnosticFeedback(targetWord, spokenWord) {
        // Check for common patterns
        if (targetWord.includes('rr') || targetWord.includes('r')) {
            return 'Focus on rolling your R sound. Try: "r-r-r-r"';
        }
        if (targetWord.includes('j') || targetWord.includes('ge') || targetWord.includes('gi')) {
            return 'The Spanish J/G sound comes from the throat, like clearing your throat.';
        }
        if (targetWord.includes('ñ')) {
            return 'Ñ sounds like "NY" as in "canyon". Try "mañana" = "man-YA-na"';
        }
        if (targetWord.includes('ll')) {
            return 'LL sounds like English Y. "Llama" = "YA-ma"';
        }
        
        return `Try breaking it into syllables: ${this.syllabify(targetWord)}`;
    }

    /**
     * Identify pronunciation challenge
     */
    identifyChallenge(word) {
        for (const [key, challenge] of Object.entries(this.COMMON_CHALLENGES)) {
            for (const phoneme of challenge.phonemes) {
                if (word.includes(phoneme)) {
                    return challenge;
                }
            }
        }
        return null;
    }

    /**
     * Get improvement tip
     */
    getImprovementTip(analysis) {
        if (analysis.challenges.length > 0) {
            const challenge = analysis.challenges[0];
            return {
                tip: challenge.feedback,
                practiceWords: this.getPracticeWords(challenge),
                difficulty: challenge.difficulty
            };
        }

        if (analysis.mistakes.length > 0) {
            return {
                tip: 'Try speaking more slowly and emphasizing each syllable.',
                practiceWords: analysis.mistakes.slice(0, 3).map(m => m.word)
            };
        }

        return {
            tip: '🌟 Your pronunciation is excellent! Keep practicing to maintain it.',
            practiceWords: []
        };
    }

    /**
     * Get practice words for specific challenge
     */
    getPracticeWords(challenge) {
        const practiceWords = {
            rolled_r: ['perro', 'carro', 'ferrocarril', 'rápido', 'rosa'],
            j_sound: ['jalapeño', 'jefe', 'girar', 'genial', 'naranja'],
            soft_d: ['nada', 'todo', 'ciudad', 'vida', 'hablado'],
            ll_sound: ['llama', 'llamar', 'lluvia', 'calle', 'pollo'],
            ñ_sound: ['mañana', 'niño', 'español', 'año', 'pequeño'],
            vowels: ['casa', 'mesa', 'piso', 'lobo', 'luna']
        };

        // Find matching practice words
        for (const [key, words] of Object.entries(practiceWords)) {
            const challengePhonemes = challenge.phonemes || [];
            if (challengePhonemes.some(p => key.includes(p))) {
                return words;
            }
        }

        return [];
    }

    /**
     * Track user's pronunciation progress
     */
    trackProgress(userId, attempt) {
        if (!this.userProgress.has(userId)) {
            this.userProgress.set(userId, []);
        }

        const history = this.userProgress.get(userId);
        history.push(attempt);

        // Keep only last 100 attempts
        if (history.length > 100) {
            history.shift();
        }
    }

    /**
     * Get user's pronunciation progress
     */
    getUserProgress(userId) {
        const history = this.userProgress.get(userId) || [];

        if (history.length === 0) {
            return {
                attempts: 0,
                averageScore: 0,
                improvement: 0,
                trend: 'new'
            };
        }

        const avgScore = history.reduce((sum, a) => sum + a.score, 0) / history.length;
        
        // Calculate improvement trend
        const recent = history.slice(-10);
        const older = history.slice(0, -10);
        const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
        const olderAvg = older.length > 0 
            ? older.reduce((sum, a) => sum + a.score, 0) / older.length
            : recentAvg;
        
        const improvement = recentAvg - olderAvg;

        return {
            attempts: history.length,
            averageScore: Math.round(avgScore),
            latestScore: history[history.length - 1].score,
            improvement: Math.round(improvement),
            trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
            recentAttempts: recent.map(a => a.score)
        };
    }

    /**
     * Get grade letter from score
     */
    getGrade(score) {
        if (score >= 95) return { letter: 'A+', emoji: '🌟', description: 'Native-like' };
        if (score >= 90) return { letter: 'A', emoji: '⭐', description: 'Excellent' };
        if (score >= 85) return { letter: 'B+', emoji: '🎯', description: 'Very Good' };
        if (score >= 80) return { letter: 'B', emoji: '👍', description: 'Good' };
        if (score >= 75) return { letter: 'C+', emoji: '📈', description: 'Fair' };
        if (score >= 70) return { letter: 'C', emoji: '💪', description: 'Needs Work' };
        return { letter: 'D', emoji: '📚', description: 'Keep Practicing' };
    }

    /**
     * Normalize text for comparison
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[¿¡.,!?;:()"'\[\]{}]/g, '')
            .trim();
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i - 1][j],    // deletion
                        dp[i][j - 1],    // insertion
                        dp[i - 1][j - 1] // substitution
                    );
                }
            }
        }

        return dp[m][n];
    }

    /**
     * Calculate word similarity percentage
     */
    wordSimilarity(word1, word2) {
        const distance = this.levenshteinDistance(word1, word2);
        const maxLength = Math.max(word1.length, word2.length);
        return Math.max(0, 100 - (distance / maxLength) * 100);
    }

    /**
     * Syllabify Spanish word (simple approximation)
     */
    syllabify(word) {
        // Simple syllable separation for Spanish
        return word
            .replace(/([aeiouáéíóú])([bcdfghjklmnpqrstvwxyz])/gi, '$1-$2')
            .replace(/([bcdfghjklmnpqrstvwxyz])([bcdfghjklmnpqrstvwxyz])/gi, '$1-$2');
    }
}

// Export singleton
const pronunciationScorer = new PronunciationScorer();
module.exports = pronunciationScorer;
