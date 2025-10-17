/**
 * Video Transcription & Grading Service
 *
 * Uses Whisper for transcription and CEFR standards for difficulty grading
 * Processes 673 videos in parallel batches
 *
 * @module video-transcription-service
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * CEFR Difficulty Levels
 * Based on European Framework: A1 (Beginner) to C2 (Proficient)
 */
const CEFR_LEVELS = {
  A1: { name: 'Beginner', wpm: [0, 100], avgWordLength: [0, 4], uniqueWords: [0, 500] },
  A2: { name: 'Elementary', wpm: [100, 120], avgWordLength: [4, 4.5], uniqueWords: [500, 1000] },
  B1: { name: 'Intermediate', wpm: [120, 140], avgWordLength: [4.5, 5], uniqueWords: [1000, 2000] },
  B2: { name: 'Upper Intermediate', wpm: [140, 160], avgWordLength: [5, 5.5], uniqueWords: [2000, 4000] },
  C1: { name: 'Advanced', wpm: [160, 180], avgWordLength: [5.5, 6], uniqueWords: [4000, 8000] },
  C2: { name: 'Proficient', wpm: [180, 300], avgWordLength: [6, 10], uniqueWords: [8000, Infinity] }
};

/**
 * Common words by CEFR level (for vocabulary difficulty assessment)
 */
const COMMON_WORDS = {
  A1: new Set(['the', 'a', 'an', 'is', 'am', 'are', 'I', 'you', 'he', 'she', 'it', 'we', 'they',
               'hello', 'hi', 'yes', 'no', 'please', 'thank', 'you', 'good', 'bad', 'big', 'small']),
  A2: new Set(['have', 'has', 'do', 'does', 'can', 'will', 'would', 'could', 'should', 'like',
               'want', 'need', 'go', 'come', 'see', 'know', 'think', 'make', 'get', 'take']),
  B1: new Set(['although', 'however', 'therefore', 'because', 'since', 'while', 'unless',
               'despite', 'regarding', 'concerning', 'regarding', 'consider', 'suggest']),
  B2: new Set(['nevertheless', 'furthermore', 'consequently', 'significantly', 'substantially',
               'considerably', 'predominantly', 'comprehensive', 'substantial', 'initiative']),
  C1: new Set(['notwithstanding', 'albeit', 'hitherto', 'thereof', 'whereby', 'pursuant',
               'aforementioned', 'heretofore', 'predominantly', 'substantiate']),
  C2: new Set(['recalcitrant', 'indefatigable', 'obfuscate', 'ephemeral', 'ubiquitous',
               'paradigm', 'dichotomy', 'juxtaposition', 'quintessential', 'propensity'])
};

class VideoTranscriptionService {
  constructor(options = {}) {
    this.whisperModel = options.whisperModel || 'base';  // base, small, medium, large
    this.language = options.language || 'es';  // Spanish videos
    this.targetLanguage = options.targetLanguage || 'en';  // Translate to English
    this.batchSize = options.batchSize || 10;  // Process 10 videos concurrently
    this.outputDir = options.outputDir || './cache/transcriptions';
  }

  /**
   * Initialize service - ensure Whisper is installed
   */
  async initialize() {
    try {
      // Check if whisper is installed
      const whisperCheck = await this.executeCommand('which', ['whisper']);
      console.log('✅ Whisper found:', whisperCheck.trim());
    } catch (error) {
      console.log('⚠️ Whisper not found, installing...');
      await this.installWhisper();
    }

    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Install Whisper via pip
   */
  async installWhisper() {
    try {
      await this.executeCommand('pip3', ['install', '-U', 'openai-whisper']);
      console.log('✅ Whisper installed successfully');
    } catch (error) {
      console.error('❌ Failed to install Whisper:', error.message);
      throw new Error('Whisper installation failed. Please install manually: pip3 install openai-whisper');
    }
  }

  /**
   * Transcribe a single video file
   */
  async transcribeVideo(videoPath) {
    const videoName = path.basename(videoPath, path.extname(videoPath));
    const outputPath = path.join(this.outputDir, `${videoName}.json`);

    // Check if already transcribed
    try {
      const existing = await fs.readFile(outputPath, 'utf-8');
      console.log(`✓ Already transcribed: ${videoName}`);
      return JSON.parse(existing);
    } catch (error) {
      // Not transcribed yet, proceed
    }

    console.log(`🎤 Transcribing: ${videoName}`);

    try {
      // Run Whisper
      const args = [
        videoPath,
        '--model', this.whisperModel,
        '--language', this.language,
        '--task', 'translate',  // Translate to English
        '--output_format', 'json',
        '--output_dir', this.outputDir
      ];

      const result = await this.executeCommand('whisper', args, { timeout: 300000 }); // 5min timeout

      // Read generated JSON
      const jsonPath = path.join(this.outputDir, `${videoName}.json`);
      const transcriptionData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));

      // Grade difficulty
      const gradingResults = this.gradeDifficulty(transcriptionData.text);

      // Combine results
      const fullResults = {
        videoPath: videoPath,
        videoName: videoName,
        transcription: transcriptionData.text,
        originalLanguage: this.language,
        translatedTo: this.targetLanguage,
        duration: transcriptionData.segments ?
          transcriptionData.segments[transcriptionData.segments.length - 1].end : null,
        segments: transcriptionData.segments,
        difficulty: gradingResults,
        processedAt: new Date().toISOString()
      };

      // Save enhanced results
      await fs.writeFile(outputPath, JSON.stringify(fullResults, null, 2));

      return fullResults;
    } catch (error) {
      console.error(`❌ Failed to transcribe ${videoName}:`, error.message);
      return {
        videoPath: videoPath,
        videoName: videoName,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Grade difficulty using CEFR standards
   */
  gradeDifficulty(text) {
    if (!text || text.trim().length === 0) {
      return {
        level: 'UNKNOWN',
        confidence: 0,
        metrics: {}
      };
    }

    // Calculate metrics
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const uniqueWords = new Set(words);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;

    // Estimate speaking duration (assuming text is ~8 seconds)
    const durationSeconds = 8;
    const wordsPerMinute = (wordCount / durationSeconds) * 60;

    // Count vocabulary by CEFR level
    const vocabularyBreakdown = {};
    let totalCategorized = 0;

    for (const [level, wordSet] of Object.entries(COMMON_WORDS)) {
      const matchCount = words.filter(word => wordSet.has(word)).length;
      vocabularyBreakdown[level] = matchCount;
      totalCategorized += matchCount;
    }

    // Score each CEFR level
    const scores = {};
    for (const [level, criteria] of Object.entries(CEFR_LEVELS)) {
      let score = 0;

      // WPM score
      if (wordsPerMinute >= criteria.wpm[0] && wordsPerMinute <= criteria.wpm[1]) {
        score += 0.4;
      }

      // Word length score
      if (avgWordLength >= criteria.avgWordLength[0] && avgWordLength <= criteria.avgWordLength[1]) {
        score += 0.3;
      }

      // Unique words score
      if (uniqueWords.size >= criteria.uniqueWords[0] && uniqueWords.size <= criteria.uniqueWords[1]) {
        score += 0.3;
      }

      scores[level] = score;
    }

    // Find best matching level
    const bestLevel = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    return {
      level: bestLevel,
      levelName: CEFR_LEVELS[bestLevel].name,
      confidence: scores[bestLevel],
      metrics: {
        wordCount: wordCount,
        uniqueWordCount: uniqueWords.size,
        avgWordLength: avgWordLength.toFixed(2),
        wordsPerMinute: wordsPerMinute.toFixed(0),
        vocabularyBreakdown: vocabularyBreakdown,
        scores: scores
      }
    };
  }

  /**
   * Process videos in parallel batches
   */
  async processVideoBatch(videoPaths) {
    const results = [];

    for (let i = 0; i < videoPaths.length; i += this.batchSize) {
      const batch = videoPaths.slice(i, i + this.batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / this.batchSize) + 1} (${batch.length} videos)`);

      const batchPromises = batch.map(videoPath => this.transcribeVideo(videoPath));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);

      console.log(`✅ Batch complete: ${batchResults.filter(r => !r.error).length}/${batch.length} successful`);
    }

    return results;
  }

  /**
   * Process all videos in a directory
   */
  async processDirectory(directory) {
    console.log(`📂 Scanning directory: ${directory}`);

    // Find all MP4 files
    const files = await this.findVideoFiles(directory);
    console.log(`📹 Found ${files.length} videos to process`);

    // Process in batches
    const results = await this.processVideoBatch(files);

    // Generate summary
    const summary = this.generateSummary(results);

    // Save summary
    const summaryPath = path.join(this.outputDir, 'processing-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n✅ Processing complete!`);
    console.log(`📊 Summary saved to: ${summaryPath}`);

    return summary;
  }

  /**
   * Find all video files recursively
   */
  async findVideoFiles(directory) {
    const { execSync } = require('child_process');
    const output = execSync(`find "${directory}" -type f -name "*.mp4"`, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  }

  /**
   * Generate processing summary
   */
  generateSummary(results) {
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    const difficultyDistribution = {};
    successful.forEach(result => {
      const level = result.difficulty?.level || 'UNKNOWN';
      difficultyDistribution[level] = (difficultyDistribution[level] || 0) + 1;
    });

    return {
      totalVideos: results.length,
      successful: successful.length,
      failed: failed.length,
      difficultyDistribution: difficultyDistribution,
      failedVideos: failed.map(r => ({ video: r.videoName, error: r.error })),
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Helper: Execute command and return output
   */
  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Command exited with code ${code}`));
        }
      });

      if (options.timeout) {
        setTimeout(() => {
          process.kill();
          reject(new Error('Command timeout'));
        }, options.timeout);
      }
    });
  }
}

module.exports = VideoTranscriptionService;
