/**
 * OpenAI Whisper Transcription Service
 *
 * Uses OpenAI API for high-quality video transcription and translation
 * Processes langfeed videos with CEFR difficulty grading
 *
 * @module openai-whisper-service
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

class OpenAIWhisperService {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.model = options.model || 'whisper-1';
    this.language = options.language || 'es'; // Spanish
    this.outputDir = options.outputDir || './cache/transcriptions';
    this.batchSize = options.batchSize || 5; // Concurrent API calls

    if (!this.apiKey) {
      throw new Error('OpenAI API key required. Set OPENAI_API_KEY env variable or pass apiKey option.');
    }
  }

  /**
   * Initialize service - ensure output directory exists
   */
  async initialize() {
    await fs.mkdir(this.outputDir, { recursive: true });
    console.log('✅ OpenAI Whisper service initialized');
  }

  /**
   * Transcribe a single video using OpenAI Whisper API
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
      // Extract audio from video using ffmpeg
      const audioPath = path.join(this.outputDir, `${videoName}.mp3`);
      await this.extractAudio(videoPath, audioPath);

      // Transcribe using OpenAI API
      const transcription = await this.callWhisperAPI(audioPath, 'transcribe');

      // Translate using OpenAI API
      const translation = await this.callWhisperAPI(audioPath, 'translate');

      // Get video metadata
      const metadata = await this.getVideoMetadata(videoPath);

      // Grade difficulty
      const difficulty = this.gradeDifficulty(transcription.text, metadata.duration);

      // Combine results
      const fullResults = {
        videoPath: videoPath,
        videoName: videoName,
        transcription: {
          text: transcription.text,
          segments: transcription.segments || [],
          language: transcription.language || this.language
        },
        translation: {
          text: translation.text,
          segments: translation.segments || []
        },
        metadata: metadata,
        difficulty: difficulty,
        processedAt: new Date().toISOString()
      };

      // Save results
      await fs.writeFile(outputPath, JSON.stringify(fullResults, null, 2));

      // Clean up audio file
      await fs.unlink(audioPath).catch(() => {});

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
   * Extract audio from video using ffmpeg
   */
  async extractAudio(videoPath, audioPath) {
    try {
      execSync(
        `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -ab 32k "${audioPath}" -y`,
        { stdio: 'ignore' }
      );
    } catch (error) {
      throw new Error(`Audio extraction failed: ${error.message}`);
    }
  }

  /**
   * Call OpenAI Whisper API
   */
  async callWhisperAPI(audioPath, task = 'transcribe') {
    const FormData = require('form-data');
    const axios = require('axios');

    const form = new FormData();
    form.append('file', fsSync.createReadStream(audioPath));
    form.append('model', this.model);
    form.append('timestamp_granularities[]', 'segment');

    if (task === 'transcribe') {
      form.append('language', this.language);
      form.append('response_format', 'verbose_json');
    }

    const endpoint = task === 'transcribe'
      ? 'https://api.openai.com/v1/audio/transcriptions'
      : 'https://api.openai.com/v1/audio/translations';

    try {
      const response = await axios.post(endpoint, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return response.data;
    } catch (error) {
      throw new Error(`Whisper API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get video metadata using ffprobe
   */
  async getVideoMetadata(videoPath) {
    try {
      const output = execSync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`,
        { encoding: 'utf-8' }
      );

      const data = JSON.parse(output);
      const videoStream = data.streams.find(s => s.codec_type === 'video');

      return {
        duration: parseFloat(data.format.duration),
        size: parseInt(data.format.size),
        bitrate: parseInt(data.format.bit_rate),
        width: videoStream?.width,
        height: videoStream?.height,
        fps: eval(videoStream?.r_frame_rate) || 30
      };
    } catch (error) {
      console.error(`Failed to get metadata for ${videoPath}:`, error.message);
      return { duration: 8 }; // Default 8 seconds for langfeed videos
    }
  }

  /**
   * Grade difficulty using CEFR standards
   */
  gradeDifficulty(text, duration = 8) {
    if (!text || text.trim().length === 0) {
      return {
        level: 'UNKNOWN',
        levelName: 'Unknown',
        confidence: 0,
        metrics: {}
      };
    }

    // Calculate metrics
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const uniqueWords = new Set(words);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / (wordCount || 1);
    const wordsPerMinute = (wordCount / duration) * 60;

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
      console.log(`\n📦 Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(videoPaths.length / this.batchSize)} (${batch.length} videos)`);

      const batchPromises = batch.map(videoPath => this.transcribeVideo(videoPath));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);

      const successful = batchResults.filter(r => !r.error).length;
      console.log(`✅ Batch complete: ${successful}/${batch.length} successful`);
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

    if (files.length === 0) {
      console.log('⚠️ No videos found');
      return { totalVideos: 0, successful: 0, failed: 0, difficultyDistribution: {} };
    }

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
}

module.exports = OpenAIWhisperService;
