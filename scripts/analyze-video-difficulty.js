/**
 * GENIUS VIDEO DIFFICULTY ANALYZER
 *
 * Analyzes transcript content to determine EXACT difficulty level (A1-C2)
 *
 * Methodology (Research-based):
 * - Word frequency analysis (most important factor)
 * - Sentence complexity (words per sentence)
 * - Vocabulary diversity (unique words / total words)
 * - Grammar complexity (verb tenses, subjunctive, etc.)
 * - Speaking speed (words per minute)
 *
 * CEFR Level Criteria:
 * A1 (Beginner): Top 500 words, simple present/past, <80 WPM
 * A2 (Elementary): Top 1000 words, basic tenses, 80-100 WPM
 * B1 (Intermediate): Top 2000 words, compound sentences, 100-120 WPM
 * B2 (Upper-Int): Top 3500 words, subjunctive intro, 120-140 WPM
 * C1 (Advanced): Top 5000 words, complex grammar, 140-160 WPM
 * C2 (Mastery): Top 10000+ words, native speed, 160+ WPM
 */

const fs = require('fs');
const path = require('path');

// Load frequency database
const frequencyData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/spanish-frequency-10k.json'), 'utf8')
);

// CEFR level boundaries (word frequency rank)
const CEFR_BOUNDARIES = {
    A1: { maxRank: 500, maxWPM: 80, maxWordsPerSentence: 8 },
    A2: { maxRank: 1000, maxWPM: 100, maxWordsPerSentence: 10 },
    B1: { maxRank: 2000, maxWPM: 120, maxWordsPerSentence: 12 },
    B2: { maxRank: 3500, maxWPM: 140, maxWordsPerSentence: 15 },
    C1: { maxRank: 5000, maxWPM: 160, maxWordsPerSentence: 18 },
    C2: { maxRank: 10000, maxWPM: 200, maxWordsPerSentence: 25 }
};

/**
 * Analyze video transcript and return difficulty score
 */
function analyzeVideoDifficulty(transcript) {
    if (!transcript || !transcript.lines || transcript.lines.length === 0) {
        return null;
    }

    // Extract all text
    const fullText = transcript.lines
        .map(line => line.text)
        .join(' ')
        .toLowerCase();

    // Tokenize words (remove punctuation)
    const words = fullText
        .replace(/[.,!?¿¡;:()\"]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0);

    const totalWords = words.length;
    if (totalWords === 0) return null;

    // 1. WORD FREQUENCY ANALYSIS (Most Important)
    const wordFrequencyScore = calculateWordFrequencyScore(words);

    // 2. VOCABULARY DIVERSITY
    const uniqueWords = new Set(words);
    const vocabularyDiversity = uniqueWords.size / totalWords;

    // 3. SENTENCE COMPLEXITY
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = totalWords / Math.max(sentences.length, 1);

    // 4. SPEAKING SPEED (words per minute)
    const videoDuration = transcript.lines[transcript.lines.length - 1].endTime;
    const wordsPerMinute = (totalWords / videoDuration) * 60;

    // 5. GRAMMAR COMPLEXITY
    const grammarScore = calculateGrammarComplexity(fullText, words);

    // Calculate composite difficulty score (0-100)
    const difficultyScore =
        (wordFrequencyScore * 0.40) +     // 40% weight - most important
        (vocabularyDiversity * 100 * 0.20) + // 20% weight
        (Math.min(avgWordsPerSentence / 15, 1) * 100 * 0.15) + // 15% weight
        (Math.min(wordsPerMinute / 160, 1) * 100 * 0.15) +     // 15% weight
        (grammarScore * 0.10);            // 10% weight

    // Determine CEFR level
    const cefrLevel = determineCEFRLevel(
        wordFrequencyScore,
        avgWordsPerSentence,
        wordsPerMinute,
        vocabularyDiversity
    );

    // Find hardest words (for learning recommendations)
    const hardestWords = findHardestWords(words, 10);

    return {
        cefrLevel,
        difficultyScore: Math.round(difficultyScore),
        metrics: {
            totalWords,
            uniqueWords: uniqueWords.size,
            vocabularyDiversity: Math.round(vocabularyDiversity * 100),
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            wordsPerMinute: Math.round(wordsPerMinute),
            wordFrequencyScore: Math.round(wordFrequencyScore),
            grammarScore: Math.round(grammarScore),
            videoDuration: Math.round(videoDuration)
        },
        hardestWords,
        recommendation: generateRecommendation(cefrLevel, difficultyScore)
    };
}

/**
 * Calculate word frequency score (0-100)
 * Lower score = easier (common words)
 * Higher score = harder (rare words)
 */
function calculateWordFrequencyScore(words) {
    let totalRank = 0;
    let foundWords = 0;

    for (const word of words) {
        const wordData = frequencyData.words[word];
        if (wordData) {
            totalRank += wordData.rank;
            foundWords++;
        } else {
            // Unknown word = very rare = high rank
            totalRank += 10000;
            foundWords++;
        }
    }

    const avgRank = totalRank / Math.max(foundWords, 1);

    // Normalize to 0-100 scale
    // Rank 1-500 → 0-20 (A1)
    // Rank 501-1000 → 21-35 (A2)
    // Rank 1001-2000 → 36-50 (B1)
    // Rank 2001-3500 → 51-65 (B2)
    // Rank 3501-5000 → 66-80 (C1)
    // Rank 5001+ → 81-100 (C2)

    if (avgRank <= 500) return (avgRank / 500) * 20;
    if (avgRank <= 1000) return 20 + ((avgRank - 500) / 500) * 15;
    if (avgRank <= 2000) return 35 + ((avgRank - 1000) / 1000) * 15;
    if (avgRank <= 3500) return 50 + ((avgRank - 2000) / 1500) * 15;
    if (avgRank <= 5000) return 65 + ((avgRank - 3500) / 1500) * 15;
    return Math.min(80 + ((avgRank - 5000) / 5000) * 20, 100);
}

/**
 * Calculate grammar complexity score (0-100)
 */
function calculateGrammarComplexity(text, words) {
    let score = 0;

    // Check for advanced grammar patterns
    const patterns = {
        // A1-A2 level
        presentTense: /\b(soy|eres|es|somos|son|tengo|tienes|tiene)\b/g,

        // B1 level
        pastTense: /\b(fui|fue|tuve|tuvo|hice|hizo|era|estaba)\b/g,
        futureTense: /\b(seré|será|tendré|tendrá|haré|hará)\b/g,

        // B2 level
        conditional: /\b(sería|tendría|haría|podría|debería)\b/g,
        perfectTense: /\b(he|has|ha|hemos|han)\s+\w+do\b/g,

        // C1-C2 level
        subjunctive: /\b(sea|seas|seamos|sean|haya|fuera|tuviera)\b/g,
        passiveVoice: /\b(ser|fue|sido|siendo)\s+\w+do\b/g,
        complexConnectors: /\b(sin embargo|no obstante|por consiguiente|a pesar de)\b/g
    };

    // Count pattern occurrences
    const presentCount = (text.match(patterns.presentTense) || []).length;
    const pastCount = (text.match(patterns.pastTense) || []).length;
    const futureCount = (text.match(patterns.futureTense) || []).length;
    const conditionalCount = (text.match(patterns.conditional) || []).length;
    const perfectCount = (text.match(patterns.perfectTense) || []).length;
    const subjunctiveCount = (text.match(patterns.subjunctive) || []).length;
    const passiveCount = (text.match(patterns.passiveVoice) || []).length;
    const complexConnectorsCount = (text.match(patterns.complexConnectors) || []).length;

    // Calculate score based on grammar diversity
    if (presentCount > 0) score += 10; // Basic
    if (pastCount > 0) score += 15;    // Intermediate
    if (futureCount > 0) score += 20;  // Intermediate+
    if (conditionalCount > 0) score += 25; // Upper-intermediate
    if (perfectCount > 0) score += 30; // Advanced
    if (subjunctiveCount > 0) score += 40; // Very advanced
    if (passiveCount > 0) score += 35; // Advanced
    if (complexConnectorsCount > 0) score += 25; // Upper-intermediate

    return Math.min(score, 100);
}

/**
 * Determine CEFR level based on multiple factors
 */
function determineCEFRLevel(frequencyScore, wordsPerSentence, wpm, diversity) {
    // A1: Very easy
    if (frequencyScore <= 20 && wordsPerSentence <= 8 && wpm <= 80) {
        return 'A1';
    }

    // A2: Easy
    if (frequencyScore <= 35 && wordsPerSentence <= 10 && wpm <= 100) {
        return 'A2';
    }

    // B1: Intermediate
    if (frequencyScore <= 50 && wordsPerSentence <= 12 && wpm <= 120) {
        return 'B1';
    }

    // B2: Upper-Intermediate
    if (frequencyScore <= 65 && wordsPerSentence <= 15 && wpm <= 140) {
        return 'B2';
    }

    // C1: Advanced
    if (frequencyScore <= 80 && wordsPerSentence <= 18 && wpm <= 160) {
        return 'C1';
    }

    // C2: Mastery
    return 'C2';
}

/**
 * Find hardest words in transcript
 */
function findHardestWords(words, limit = 10) {
    const wordRanks = [];

    for (const word of words) {
        const wordData = frequencyData.words[word];
        if (wordData && wordData.rank > 100) { // Skip very common words
            wordRanks.push({
                word,
                rank: wordData.rank,
                cefrLevel: wordData.cefrLevel
            });
        }
    }

    // Sort by rank (higher = rarer/harder) and deduplicate
    const uniqueWords = new Map();
    wordRanks
        .sort((a, b) => b.rank - a.rank)
        .forEach(w => {
            if (!uniqueWords.has(w.word)) {
                uniqueWords.set(w.word, w);
            }
        });

    return Array.from(uniqueWords.values()).slice(0, limit);
}

/**
 * Generate recommendation text
 */
function generateRecommendation(cefrLevel, score) {
    const recommendations = {
        A1: 'Perfect for absolute beginners who never heard Spanish before. Simple vocabulary and slow speech.',
        A2: 'Good for beginners with basic Spanish knowledge. Common words and clear pronunciation.',
        B1: 'Ideal for intermediate learners. Mix of common and less frequent vocabulary.',
        B2: 'Challenging for intermediate learners. More complex grammar and faster speech.',
        C1: 'Advanced content with sophisticated vocabulary and native-like speed.',
        C2: 'Native-level content. Complex grammar, idioms, and very fast speech.'
    };

    return recommendations[cefrLevel] || 'Difficulty level not determined';
}

/**
 * Process all videos and generate difficulty report
 */
async function analyzeAllVideos() {
    const reelsDir = path.join(__dirname, '../public/reels');
    const videos = fs.readdirSync(reelsDir)
        .filter(f => f.endsWith('.mp4'))
        .map(f => f.replace('.mp4', ''));

    console.log(`🔍 Analyzing ${videos.length} videos for difficulty...\n`);

    const results = [];
    const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0, unknown: 0 };

    for (const videoId of videos) {
        const transcriptPath = path.join(reelsDir, `${videoId}.json`);

        if (!fs.existsSync(transcriptPath)) {
            console.log(`⚠️  ${videoId}: No transcript (skipped)`);
            levelCounts.unknown++;
            continue;
        }

        try {
            const transcript = JSON.parse(fs.readFileSync(transcriptPath, 'utf8'));
            const analysis = analyzeVideoDifficulty(transcript);

            if (analysis) {
                results.push({
                    videoId,
                    ...analysis
                });

                levelCounts[analysis.cefrLevel]++;

                console.log(`✅ ${videoId}: ${analysis.cefrLevel} (Score: ${analysis.difficultyScore})`);
                console.log(`   📊 ${analysis.metrics.totalWords} words, ${analysis.metrics.wordsPerMinute} WPM, ${analysis.metrics.uniqueWords} unique`);
                console.log(`   💡 Top hard words: ${analysis.hardestWords.slice(0, 3).map(w => w.word).join(', ')}`);
                console.log('');
            }
        } catch (error) {
            console.error(`❌ ${videoId}: Error - ${error.message}`);
            levelCounts.unknown++;
        }
    }

    // Sort by difficulty (easiest first)
    results.sort((a, b) => a.difficultyScore - b.difficultyScore);

    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIFFICULTY ANALYSIS REPORT');
    console.log('='.repeat(60));
    console.log(`\nTotal videos analyzed: ${results.length}`);
    console.log('\nLevel Distribution:');
    console.log(`  A1 (Beginner):           ${levelCounts.A1} videos`);
    console.log(`  A2 (Elementary):         ${levelCounts.A2} videos`);
    console.log(`  B1 (Intermediate):       ${levelCounts.B1} videos`);
    console.log(`  B2 (Upper-Intermediate): ${levelCounts.B2} videos`);
    console.log(`  C1 (Advanced):           ${levelCounts.C1} videos`);
    console.log(`  C2 (Mastery):            ${levelCounts.C2} videos`);
    console.log(`  Unknown:                 ${levelCounts.unknown} videos`);

    // Show top 10 easiest videos (for complete beginners)
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TOP 10 EASIEST VIDEOS (Perfect for complete beginners)');
    console.log('='.repeat(60));
    results.slice(0, 10).forEach((v, i) => {
        console.log(`\n${i + 1}. ${v.videoId}`);
        console.log(`   Level: ${v.cefrLevel} | Score: ${v.difficultyScore}/100`);
        console.log(`   ${v.recommendation}`);
        console.log(`   Metrics: ${v.metrics.totalWords} words @ ${v.metrics.wordsPerMinute} WPM`);
    });

    // Save results to JSON
    const outputPath = path.join(__dirname, '../data/video-difficulty-analysis.json');
    fs.writeFileSync(
        outputPath,
        JSON.stringify({
            generatedAt: new Date().toISOString(),
            totalVideos: results.length,
            levelDistribution: levelCounts,
            videos: results
        }, null, 2)
    );

    console.log(`\n✅ Results saved to: ${outputPath}`);

    return results;
}

// Run analysis
if (require.main === module) {
    analyzeAllVideos().catch(console.error);
}

module.exports = { analyzeVideoDifficulty, analyzeAllVideos };
