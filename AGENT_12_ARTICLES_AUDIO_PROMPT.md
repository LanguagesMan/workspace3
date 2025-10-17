# 🎯 AGENT 12: Article Audio & Enhancement

**Branch:** `agent-12-articles-audio`  
**Estimated Time:** 2-3 hours  
**Priority:** HIGH - Major UX improvement

---

## 🎯 MISSION

Add professional audio narration to all articles and enhance the reading experience. Transform reading from passive to active learning with audio, word highlighting, and smart filters.

---

## 📋 CRITICAL TASKS

### Task 1: Text-to-Speech Engine (1 hour)
**File:** `/lib/text-to-speech-engine.js`

Integrate professional TTS for Spanish articles.

```javascript
const { Readable } = require('stream');
const { writeFile, readFile, existsSync } = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

class TextToSpeechEngine {
  
  constructor() {
    this.cacheDir = path.join(__dirname, '../cache/audio');
    this.provider = process.env.TTS_PROVIDER || 'google';  // google, elevenlabs, azure
  }
  
  /**
   * Generate audio for text
   * @param {string} text - Spanish text to convert
   * @param {object} options - Voice options
   * @returns {Promise<string>} - Path to audio file
   */
  async generateAudio(text, options = {}) {
    const {
      voice = 'es-ES-Standard-A',  // Spanish Spain female
      accent = 'spain',  // spain, mexico, argentina
      speed = 1.0
    } = options;
    
    // Check cache first
    const cacheKey = this.getCacheKey(text, voice, speed);
    const cachedPath = path.join(this.cacheDir, `${cacheKey}.mp3`);
    
    if (await this.existsInCache(cachedPath)) {
      return cachedPath;
    }
    
    // Generate new audio
    let audioBuffer;
    
    switch (this.provider) {
      case 'elevenlabs':
        audioBuffer = await this.generateElevenLabs(text, options);
        break;
      case 'azure':
        audioBuffer = await this.generateAzure(text, options);
        break;
      case 'google':
      default:
        audioBuffer = await this.generateGoogle(text, options);
    }
    
    // Save to cache
    await writeFile(cachedPath, audioBuffer);
    
    return cachedPath;
  }
  
  /**
   * Generate audio using Google Cloud TTS
   */
  async generateGoogle(text, options) {
    const textToSpeech = require('@google-cloud/text-to-speech');
    const client = new textToSpeech.TextToSpeechClient();
    
    const request = {
      input: { text },
      voice: {
        languageCode: 'es-ES',
        name: options.voice || 'es-ES-Standard-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: options.speed || 1.0,
        pitch: 0
      }
    };
    
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  }
  
  /**
   * Generate audio using ElevenLabs (premium quality)
   */
  async generateElevenLabs(text, options) {
    const fetch = require('node-fetch');
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    const voiceId = this.getElevenLabsVoice(options.accent);
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: options.speed || 1.0
          }
        })
      }
    );
    
    return await response.buffer();
  }
  
  getElevenLabsVoice(accent) {
    const voices = {
      'spain': 'pNInz6obpgDQGcFmaJgB',  // Spanish Spain
      'mexico': 'EXAVITQu4vr4xnSDxMaL',  // Spanish Mexico
      'argentina': 'TX3LPaxmHKxFdv7VOQHJ'  // Spanish Argentina
    };
    return voices[accent] || voices['spain'];
  }
  
  /**
   * Generate audio using Azure Cognitive Services
   */
  async generateAzure(text, options) {
    const sdk = require('microsoft-cognitiveservices-speech-sdk');
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'eastus';
    
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisVoiceName = options.voice || 'es-ES-ElviraNeural';
    
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          synthesizer.close();
          resolve(result.audioData);
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  }
  
  /**
   * Generate audio with timestamps for word-level sync
   */
  async generateWithTimestamps(text) {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    const result = {
      audioPath: null,
      sentences: [],
      totalDuration: 0
    };
    
    let currentTime = 0;
    
    for (const sentence of sentences) {
      const audioPath = await this.generateAudio(sentence);
      const duration = await this.getAudioDuration(audioPath);
      
      result.sentences.push({
        text: sentence.trim(),
        startTime: currentTime,
        endTime: currentTime + duration,
        audioPath
      });
      
      currentTime += duration;
    }
    
    result.totalDuration = currentTime;
    
    // Merge all audio files
    result.audioPath = await this.mergeAudioFiles(
      result.sentences.map(s => s.audioPath)
    );
    
    return result;
  }
  
  getCacheKey(text, voice, speed) {
    const hash = crypto.createHash('md5');
    hash.update(`${text}-${voice}-${speed}`);
    return hash.digest('hex');
  }
  
  async existsInCache(filePath) {
    try {
      return existsSync(filePath);
    } catch {
      return false;
    }
  }
  
  async getAudioDuration(audioPath) {
    // Use ffprobe to get duration
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
      );
      return parseFloat(stdout);
    } catch {
      // Estimate: ~150 words per minute
      return 0.4;  // seconds per sentence
    }
  }
  
  async mergeAudioFiles(audioPaths) {
    // Use ffmpeg to concatenate
    const outputPath = path.join(this.cacheDir, `merged_${Date.now()}.mp3`);
    const listFile = path.join(this.cacheDir, `list_${Date.now()}.txt`);
    
    const listContent = audioPaths.map(p => `file '${p}'`).join('\n');
    await writeFile(listFile, listContent);
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`
    );
    
    return outputPath;
  }
}

module.exports = new TextToSpeechEngine();
```

---

### Task 2: Article Audio API (20 minutes)
**File:** `/api/articles/audio.js`

```javascript
const express = require('express');
const router = express.Router();
const ttsEngine = require('../../lib/text-to-speech-engine');
const { createReadStream } = require('fs');

// GET /api/articles/audio/:articleId - Get audio for article
router.get('/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { accent, speed } = req.query;
    
    // Get article content
    const article = await getArticleContent(articleId);
    
    // Generate audio
    const audioPath = await ttsEngine.generateAudio(article.content, {
      accent,
      speed: parseFloat(speed) || 1.0
    });
    
    // Stream audio file
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `inline; filename="article_${articleId}.mp3"`
    });
    
    const stream = createReadStream(audioPath);
    stream.pipe(res);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/audio-timestamps/:articleId - Get audio with timestamps
router.get('/timestamps/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await getArticleContent(articleId);
    
    const result = await ttsEngine.generateWithTimestamps(article.content);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getArticleContent(articleId) {
  // Fetch from database or API
  return {
    id: articleId,
    content: 'Article text here...'
  };
}

module.exports = router;
```

---

### Task 3: Enhanced Article Reader (1 hour)
**File:** `/public/discover-ai.html` (MAJOR UPDATE)

Add audio player, word highlighting, and smart filters.

```html
<!-- Add Audio Player -->
<div class="article-audio-player" id="audioPlayer" style="display: none;">
  <button class="audio-toggle" id="playPauseBtn">
    <span class="play-icon">▶️</span>
    <span class="pause-icon" style="display: none;">⏸️</span>
  </button>
  
  <div class="audio-progress">
    <div class="audio-progress-bar" id="progressBar"></div>
    <div class="audio-progress-handle" id="progressHandle"></div>
  </div>
  
  <div class="audio-time">
    <span id="currentTime">0:00</span> / <span id="totalTime">0:00</span>
  </div>
  
  <div class="audio-controls">
    <button class="speed-btn" id="speedBtn">1.0x</button>
    <button class="accent-btn" id="accentBtn">🇪🇸 Spain</button>
    <button class="download-btn">⬇️ Download</button>
  </div>
</div>

<!-- Article Content with Highlighting -->
<div class="article-reader">
  <div class="comprehension-indicator">
    <span class="emoji">📊</span>
    <span class="text">You know <strong id="comprehensionPercent">85%</strong> of this article</span>
    <span class="level-badge" id="articleLevel">B1</span>
  </div>
  
  <div class="article-content" id="articleContent">
    <!-- Words will be wrapped with highlighting -->
  </div>
</div>

<!-- Smart Filters -->
<div class="article-filters">
  <h3>Filter Articles</h3>
  
  <div class="filter-group">
    <label>Difficulty Level</label>
    <div class="level-filters">
      <button class="filter-btn" data-level="my-level">My Level (B1)</button>
      <button class="filter-btn" data-level="all">All Levels</button>
      <button class="filter-btn" data-level="challenge">Challenge Me</button>
    </div>
  </div>
  
  <div class="filter-group">
    <label>Comprehension Target</label>
    <input type="range" id="comprehensionSlider" 
           min="60" max="95" value="80" step="5">
    <span id="comprehensionTarget">70-90% known</span>
  </div>
  
  <div class="filter-group">
    <label>Interests</label>
    <div class="interest-chips">
      <button class="chip" data-interest="sports">⚽ Sports</button>
      <button class="chip" data-interest="tech">💻 Technology</button>
      <button class="chip" data-interest="food">🍽️ Food</button>
      <button class="chip" data-interest="news">📰 News</button>
      <button class="chip" data-interest="travel">✈️ Travel</button>
    </div>
  </div>
</div>

<style>
.audio-player {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.audio-progress {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}

.audio-progress-bar {
  height: 100%;
  background: #667eea;
  border-radius: 3px;
  transition: width 0.1s;
}

.article-content .word {
  cursor: pointer;
  transition: all 0.2s;
}

.article-content .word.unknown {
  background: rgba(255, 200, 0, 0.2);
  border-bottom: 2px solid #ffc800;
  padding: 2px 0;
}

.article-content .word.known {
  color: inherit;
}

.article-content .word.current-playing {
  background: rgba(102, 126, 234, 0.3);
  font-weight: 600;
}

.comprehension-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f4ff;
  border-radius: 12px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.level-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.interest-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 6px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.chip.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}
</style>

<script>
// Audio Player Logic
class ArticleAudioPlayer {
  constructor(articleId) {
    this.articleId = articleId;
    this.audio = new Audio();
    this.currentSpeed = 1.0;
    this.currentAccent = 'spain';
    this.timestamps = [];
    this.init();
  }
  
  async init() {
    // Load audio with timestamps
    const response = await fetch(`/api/articles/audio-timestamps/${this.articleId}`);
    const data = await response.json();
    
    this.timestamps = data.sentences;
    this.audio.src = `/api/articles/audio/${this.articleId}`;
    
    this.setupEventListeners();
    this.highlightWords();
  }
  
  setupEventListeners() {
    document.getElementById('playPauseBtn').onclick = () => this.togglePlay();
    document.getElementById('speedBtn').onclick = () => this.cycleSpeed();
    
    this.audio.ontimeupdate = () => this.updateProgress();
    this.audio.onended = () => this.onEnded();
  }
  
  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
      document.querySelector('.play-icon').style.display = 'none';
      document.querySelector('.pause-icon').style.display = 'inline';
    } else {
      this.audio.pause();
      document.querySelector('.play-icon').style.display = 'inline';
      document.querySelector('.pause-icon').style.display = 'none';
    }
  }
  
  cycleSpeed() {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(this.currentSpeed);
    this.currentSpeed = speeds[(currentIndex + 1) % speeds.length];
    this.audio.playbackRate = this.currentSpeed;
    document.getElementById('speedBtn').textContent = this.currentSpeed + 'x';
  }
  
  updateProgress() {
    const percent = (this.audio.currentTime / this.audio.duration) * 100;
    document.getElementById('progressBar').style.width = percent + '%';
    
    // Highlight current sentence
    this.highlightCurrentSentence();
  }
  
  highlightCurrentSentence() {
    const currentTime = this.audio.currentTime;
    
    // Find current sentence
    const current = this.timestamps.find(s =>
      currentTime >= s.startTime && currentTime < s.endTime
    );
    
    if (current) {
      // Remove previous highlights
      document.querySelectorAll('.current-playing').forEach(el => {
        el.classList.remove('current-playing');
      });
      
      // Add highlight to current sentence
      const element = document.querySelector(`[data-sentence="${current.text}"]`);
      if (element) {
        element.classList.add('current-playing');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  async highlightWords() {
    const content = document.getElementById('articleContent');
    const userId = getUserId();
    
    // Get user's known words
    const response = await fetch(`/api/vocabulary/${userId}`);
    const data = await response.json();
    const knownWords = new Set(data.words.map(w => w.word.toLowerCase()));
    
    // Get article words
    const text = content.textContent;
    const words = text.match(/[\wáéíóúñü]+/gi) || [];
    
    // Calculate comprehension
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    const knownCount = uniqueWords.filter(w => knownWords.has(w)).length;
    const comprehension = Math.round((knownCount / uniqueWords.length) * 100);
    
    document.getElementById('comprehensionPercent').textContent = comprehension + '%';
    
    // Wrap words with spans
    let highlightedHTML = text;
    uniqueWords.forEach(word => {
      const isKnown = knownWords.has(word.toLowerCase());
      const className = isKnown ? 'word known' : 'word unknown';
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedHTML = highlightedHTML.replace(
        regex,
        `<span class="${className}" data-word="${word}">${word}</span>`
      );
    });
    
    content.innerHTML = highlightedHTML;
    
    // Add click handlers
    content.querySelectorAll('.word').forEach(span => {
      span.onclick = () => this.showTranslation(span.dataset.word);
    });
  }
  
  async showTranslation(word) {
    // Show translation popup
    const response = await fetch(`/api/translate?text=${word}&target=en`);
    const data = await response.json();
    showPopup(word, data.translation);
  }
}

// Initialize when article loads
const player = new ArticleAudioPlayer(currentArticleId);
</script>
```

---

### Task 4: Playwright Tests (20 minutes)
**File:** `/tests/articles-audio-enhanced.spec.js`

```javascript
test.describe('Article Audio & Enhancement', () => {
  
  test('Audio player loads and plays', async ({ page }) => {
    await page.goto('http://localhost:3001/discover-ai.html');
    await page.click('.article-card:first-child');
    
    await expect(page.locator('.audio-player')).toBeVisible();
    
    await page.click('#playPauseBtn');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'screenshots/article-audio-playing.png', fullPage: true });
  });
  
  test('Word highlighting shows comprehension', async ({ page }) => {
    await page.goto('http://localhost:3001/discover-ai.html');
    await page.click('.article-card:first-child');
    
    await expect(page.locator('.comprehension-indicator')).toBeVisible();
    await expect(page.locator('.word.unknown')).toHaveCount.greaterThan(0);
    
    await page.screenshot({ path: 'screenshots/word-highlighting.png', fullPage: true });
  });
  
  test('Clicking word shows translation', async ({ page }) => {
    await page.goto('http://localhost:3001/discover-ai.html');
    await page.click('.article-card:first-child');
    
    await page.click('.word.unknown:first-child');
    
    await expect(page.locator('.translation-popup')).toBeVisible();
    await page.screenshot({ path: 'screenshots/word-translation-popup.png' });
  });
  
  test('Article filters work', async ({ page }) => {
    await page.goto('http://localhost:3001/discover-ai.html');
    
    await page.click('[data-level="my-level"]');
    await page.waitForTimeout(500);
    
    // Verify filtered articles
    await page.screenshot({ path: 'screenshots/article-filters.png', fullPage: true });
  });
});
```

---

## 🎯 SUCCESS CRITERIA

- ✅ Audio plays for all articles
- ✅ Word highlighting works accurately
- ✅ Comprehension calculation correct
- ✅ Audio syncs with text highlighting
- ✅ Speed controls work (0.5x - 1.5x)
- ✅ Filters narrow down content correctly
- ✅ All tests pass

**GO BUILD THE BEST ARTICLE READER! 🚀**

