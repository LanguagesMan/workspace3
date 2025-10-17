import http from 'http';
import { main } from './index.js';
import { SpanishFeedAlgorithm } from './spanishFeedAlgorithm.js';
import { SpanishProgressTracker } from './spanishProgressTracker.js';
import { SpanishViralTrends } from './spanishViralTrends.js';
import { VideoInjectionSystem } from './videoInjectionSystem.js';
import { VideoTranscriptionSystem } from './videoTranscriptionSystem.js';
import { db } from './database.js';

const PORT = process.env.PORT || 3002;

// Helper to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    // 🗄️ DATABASE API ENDPOINTS
    if (req.url.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');

      // GET /api/user/level/:userId
      if (req.method === 'GET' && req.url.match(/^\/api\/user\/level\/(.+)$/)) {
        const userId = req.url.match(/^\/api\/user\/level\/(.+)$/)[1];
        const result = db.getUserLevel(userId);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // GET /api/user/words/:userId
      if (req.method === 'GET' && req.url.match(/^\/api\/user\/words\/(.+)$/)) {
        const userId = req.url.match(/^\/api\/user\/words\/(.+)$/)[1];
        const urlParams = new URL(req.url, `http://localhost:${PORT}`);
        const levelFilter = urlParams.searchParams.get('level');
        const result = db.getUserWords(userId, levelFilter);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // POST /api/words/learned
      if (req.method === 'POST' && req.url === '/api/words/learned') {
        const body = await parseBody(req);
        const { userId, word, translation, level, context } = body;
        const result = db.saveWordLearned(userId, word, translation, level, context);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // GET /api/user/stats/:userId
      if (req.method === 'GET' && req.url.match(/^\/api\/user\/stats\/(.+)$/)) {
        const userId = req.url.match(/^\/api\/user\/stats\/(.+)$/)[1];
        const result = db.getUserStats(userId);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // GET /api/user/progress/:userId
      if (req.method === 'GET' && req.url.match(/^\/api\/user\/progress\/(.+)$/)) {
        const userId = req.url.match(/^\/api\/user\/progress\/(.+)$/)[1];
        const result = db.getUserProgress(userId);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // GET /api/user/quests/:userId
      if (req.method === 'GET' && req.url.match(/^\/api\/user\/quests\/(.+)$/)) {
        const userId = req.url.match(/^\/api\/user\/quests\/(.+)$/)[1];
        const result = db.getDailyQuests(userId);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // GET /api/unified-feed - CORE FEED API (Videos + Articles + Memes)
      if (req.method === 'GET' && req.url.startsWith('/api/unified-feed')) {
        const videoCatalog = await import('../lib/video-catalog.js');
        const catalog = videoCatalog.default || videoCatalog;
        const videos = catalog.getAllVideos ? catalog.getAllVideos() : (Array.isArray(catalog) ? catalog : []);

        // TikTok 2-2-1 pattern: 2 videos, 2 articles, 1 meme
        const feedVideos = videos.slice(0, 2).map(v => ({
          ...v,
          type: 'video',
          videoPath: v.videoPath || `/videos/reels/${v.filename}`,
          videoUrl: v.videoPath || `/videos/reels/${v.filename}`
        }));

        const feedArticles = [
          {
            type: 'article',
            title: 'Breaking News Report',
            spanish: 'Últimas noticias de España',
            source: 'CNN Español',
            thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400'
          },
          {
            type: 'article',
            title: 'Broadcast Countdown 3s',
            spanish: 'Transmisión en vivo',
            source: 'BBC Mundo',
            thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'
          }
        ];

        const feedMemes = [
          {
            type: 'meme',
            title: 'Quick Spanish Tip',
            spanish: '😂 Cuando dices "embarazada" pero querías decir "avergonzada"',
            source: 'Spanish Memes',
            thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400'
          }
        ];

        const response = {
          success: true,
          videos: [...feedVideos, ...feedArticles, ...feedMemes],
          total: feedVideos.length + feedArticles.length + feedMemes.length
        };

        res.writeHead(200);
        res.end(JSON.stringify(response));
        return;
      }
    }

    if (req.method === 'POST' && req.url === '/regenerate') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { index } = JSON.parse(body);

          // Generate new concept to replace the one at specified index
          const generator = await import('./contentGenerator.js');
          const contentGen = new generator.ContentGenerator();
          const newConcept = contentGen.generateDiverseContent();

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            concept: newConcept,
            index: index
          }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    });

    // Generate content with Spanish feed integration
    const concepts = await main();

    // Generate Spanish learning recommendations with progress tracking and viral trends
    const spanishAlgorithm = new SpanishFeedAlgorithm();
    const progressTracker = new SpanishProgressTracker();
    const viralTrends = new SpanishViralTrends();
    const videoInjector = new VideoInjectionSystem();
    const transcriptionSystem = new VideoTranscriptionSystem();

    // INJECT VIDEOS - Start autonomous video injection
    if (!videoInjector.isInjecting) {
      videoInjector.startVideoInjection();
    }

    // Get adaptive content based on learner progress
    const adaptiveContent = progressTracker.getAdaptiveSpanishContent();
    const spanishRecommendations = spanishAlgorithm.generateFeedRecommendations(3);
    const progressFeedback = progressTracker.generateProgressFeedback();
    const viralRecommendations = viralTrends.generateViralFeedRecommendations(3);
    const injectedVideos = videoInjector.getInjectedVideos();

    // GENIUS SYSTEM: Generate transcribed video feed ordered by word importance
    const userLevel = progressFeedback.level?.toLowerCase() || 'beginner';
    const transcribedVideoFeed = transcriptionSystem.generateTranscribedVideoFeed(concepts, userLevel, 10);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Feed - Spanish Learning</title>
    <style>
        /* UNIFIED DESIGN SYSTEM - TikTok Style */
        :root {
            /* OPTIMIZED COLOR SYSTEM */
            --primary: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            --secondary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            --golden: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            --viral: linear-gradient(135deg, #FF6B35 0%, #FF4458 100%);
            --card-bg: rgba(255,255,255,0.98);
            --card-hover: rgba(255,255,255,1);

            /* PERFORMANCE-OPTIMIZED SHADOWS */
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
            --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
            --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
            --shadow-xl: 0 16px 40px rgba(0,0,0,0.15);

            /* TIKTOK-OPTIMIZED SPACING */
            --radius: 20px;
            --radius-sm: 12px;
            --radius-lg: 24px;
            --space-xs: 4px;
            --space-sm: 8px;
            --space-md: 16px;
            --space-lg: 24px;
            --space-xl: 32px;
            --space-2xl: 48px;

            /* HIGH-PERFORMANCE TRANSITIONS */
            --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-slow: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-bounce: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

            /* OPTIMIZED TYPOGRAPHY */
            --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;

            /* ENGAGEMENT COLORS */
            --like-color: #ff2d55;
            --share-color: #007bff;
            --save-color: #34c759;
            --comment-color: #8e8e93;

            /* PERFORMANCE FLAGS */
            --gpu-acceleration: translateZ(0);
            --will-change: transform, opacity;
        }

        * { box-sizing: border-box; }

        body {
            font-family: var(--font);
            margin: 0;
            padding: var(--space-lg);
            background: #0a0a0a;
            min-height: 100vh;
            color: #ffffff;
            line-height: 1.6;
            overflow-x: hidden;
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            transform: var(--gpu-acceleration);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            padding: 32px;
            border-radius: var(--radius);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            position: relative;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary);
            border-radius: var(--radius) var(--radius) 0 0;
        }
        /* OPTIMIZED TIKTOK-STYLE CARD SYSTEM */
        .concept {
            margin: var(--space-lg) 0;
            padding: var(--space-xl);
            background: var(--card-bg);
            border: 2px solid transparent;
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
            opacity: 0;
            animation: tiktokSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(20px);
            will-change: var(--will-change);
            transform: var(--gpu-acceleration);
        }

        .concept::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            transition: var(--transition-fast);
            opacity: 0;
        }

        .concept:hover {
            transform: translateY(-8px) var(--gpu-acceleration);
            box-shadow: var(--shadow-lg);
            background: var(--card-hover);
            border-color: rgba(255, 107, 53, 0.2);
        }

        .concept:hover::before {
            opacity: 1;
            background: var(--viral);
        }

        .concept:active {
            transform: translateY(-4px) scale(0.98) var(--gpu-acceleration);
            transition: var(--transition-fast);
        }

        .high-viral {
            border-color: #FF6B35;
            background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
        }

        .high-viral::before {
            background: var(--viral);
        }

        .high-viral::after {
            content: '🔥';
            position: absolute;
            top: var(--space-md);
            right: var(--space-md);
            font-size: 24px;
            animation: tiktokBounce 2s ease-in-out infinite;
            z-index: 2;
        }

        .golden-standard {
            border-color: #ffd700;
            background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
            position: relative;
            overflow: hidden;
        }

        .golden-standard::before {
            background: var(--golden);
        }

        .golden-standard::after {
            content: '⭐';
            position: absolute;
            top: var(--space-md);
            right: var(--space-md);
            font-size: 24px;
            animation: tiktokSparkle 3s ease-in-out infinite;
            z-index: 2;
        }

        /* SPANISH LEARNING ENGAGEMENT ENHANCEMENTS */
        .word-focus-highlight {
            background: linear-gradient(135deg, var(--viral), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 800;
            position: relative;
            animation: tiktokPulse 2s ease-in-out infinite;
        }

        .word-pronunciation-btn {
            position: relative;
            overflow: hidden;
        }

        .word-pronunciation-btn::after {
            content: '🔊';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: soundWave 0.6s ease-out;
        }

        .word-pronunciation-btn.playing::after {
            animation: soundWave 0.6s ease-out;
        }

        @keyframes soundWave {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
            }
        }

        .learning-progress-bar {
            height: 8px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }

        .learning-progress-fill {
            height: 100%;
            background: var(--success);
            border-radius: 4px;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }

        .learning-progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: progressShimmer 2s ease-in-out infinite;
        }

        @keyframes progressShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .engagement-buttons {
            display: flex;
            gap: var(--space-sm);
            flex-wrap: wrap;
            margin-top: var(--space-md);
        }

        .engagement-buttons button {
            flex: 1;
            min-width: 120px;
            position: relative;
            overflow: hidden;
        }

        .btn-like:hover {
            background: linear-gradient(135deg, var(--like-color), #ff1744);
            transform: translateY(-4px) scale(1.05) var(--gpu-acceleration);
            animation: tiktokHeartbeat 0.6s ease-in-out;
        }

        .btn-share:hover {
            background: linear-gradient(135deg, var(--share-color), #0056b3);
            transform: translateY(-4px) scale(1.05) var(--gpu-acceleration);
        }

        .btn-save:hover {
            background: linear-gradient(135deg, var(--save-color), #28a745);
            transform: translateY(-4px) scale(1.05) var(--gpu-acceleration);
        }

        /* GAMIFICATION ELEMENTS */
        .learning-streak {
            background: linear-gradient(135deg, #ff6b35, #ffd23f);
            color: white;
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--radius);
            font-size: 14px;
            font-weight: 600;
            position: relative;
            overflow: hidden;
        }

        .learning-streak::before {
            content: '🔥';
            margin-right: var(--space-xs);
            animation: tiktokBounce 1.5s ease-in-out infinite;
        }

        .vocabulary-achievement {
            background: var(--golden);
            color: #333;
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--radius);
            font-size: 12px;
            font-weight: 600;
            position: relative;
            animation: tiktokFloatIn 0.8s ease-out;
        }

        .vocabulary-achievement::before {
            content: '🏆';
            margin-right: var(--space-xs);
        }

        /* STAGGERED ANIMATIONS */
        .concept:nth-child(1) { animation-delay: 0.1s; }
        .concept:nth-child(2) { animation-delay: 0.2s; }
        .concept:nth-child(3) { animation-delay: 0.3s; }
        .concept:nth-child(4) { animation-delay: 0.4s; }
        .concept:nth-child(5) { animation-delay: 0.5s; }

        /* UNIFIED TYPOGRAPHY */
        .viral-score {
            background: var(--viral);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
            font-size: 18px;
        }
        /* TIKTOK-OPTIMIZED BUTTON SYSTEM */
        button {
            font-family: var(--font);
            font-weight: 600;
            border: none;
            border-radius: var(--radius);
            padding: var(--space-md) var(--space-lg);
            cursor: pointer;
            transition: var(--transition-bounce);
            box-shadow: var(--shadow-sm);
            position: relative;
            overflow: hidden;
            font-size: 14px;
            will-change: var(--will-change);
            transform: var(--gpu-acceleration);
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:hover::before,
        button:focus::before {
            left: 100%;
        }

        button:hover {
            transform: translateY(-4px) scale(1.02) var(--gpu-acceleration);
            box-shadow: var(--shadow-md);
        }

        button:active {
            transform: translateY(-2px) scale(0.98) var(--gpu-acceleration);
            transition: var(--transition-fast);
        }

        button:focus {
            outline: 2px solid var(--like-color);
            outline-offset: 2px;
        }

        /* ENGAGEMENT BUTTON VARIANTS */
        .btn-like {
            background: linear-gradient(135deg, var(--like-color), #ff1744);
            color: white;
        }

        .btn-share {
            background: linear-gradient(135deg, var(--share-color), #0056b3);
            color: white;
        }

        .btn-save {
            background: linear-gradient(135deg, var(--save-color), #28a745);
            color: white;
        }

        /* TIKTOK-OPTIMIZED ANIMATIONS */
        @keyframes tiktokSlideUp {
            0% {
                opacity: 0;
                transform: translateY(40px) scale(0.9) var(--gpu-acceleration);
                filter: blur(4px);
            }
            50% {
                opacity: 0.6;
                transform: translateY(20px) scale(0.95) var(--gpu-acceleration);
                filter: blur(2px);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1) var(--gpu-acceleration);
                filter: blur(0);
            }
        }

        @keyframes tiktokPulse {
            0%, 100% {
                transform: scale(1) var(--gpu-acceleration);
                opacity: 1;
            }
            50% {
                transform: scale(1.08) var(--gpu-acceleration);
                opacity: 0.9;
            }
        }

        @keyframes tiktokBounce {
            0%, 20%, 53%, 80%, 100% {
                transform: translateY(0) var(--gpu-acceleration);
            }
            40%, 43% {
                transform: translateY(-16px) scale(1.02) var(--gpu-acceleration);
            }
            70% {
                transform: translateY(-8px) scale(1.01) var(--gpu-acceleration);
            }
        }

        @keyframes tiktokSparkle {
            0% {
                transform: scale(1) rotate(0deg) var(--gpu-acceleration);
                opacity: 1;
                filter: hue-rotate(0deg);
            }
            50% {
                transform: scale(1.3) rotate(180deg) var(--gpu-acceleration);
                opacity: 0.8;
                filter: hue-rotate(90deg);
            }
            100% {
                transform: scale(1) rotate(360deg) var(--gpu-acceleration);
                opacity: 1;
                filter: hue-rotate(0deg);
            }
        }

        @keyframes tiktokSlideIn {
            0% {
                transform: translateX(100%) var(--gpu-acceleration);
                opacity: 0;
                filter: blur(2px);
            }
            100% {
                transform: translateX(0) var(--gpu-acceleration);
                opacity: 1;
                filter: blur(0);
            }
        }

        @keyframes tiktokFloatIn {
            0% {
                opacity: 0;
                transform: translateY(-20px) scale(0.8) var(--gpu-acceleration);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1) var(--gpu-acceleration);
            }
        }

        @keyframes tiktokHeartbeat {
            0%, 100% {
                transform: scale(1) var(--gpu-acceleration);
            }
            25% {
                transform: scale(1.1) var(--gpu-acceleration);
            }
            50% {
                transform: scale(1.2) var(--gpu-acceleration);
            }
            75% {
                transform: scale(1.1) var(--gpu-acceleration);
            }
        }

        /* UNIFIED DASHBOARD COMPONENTS */
        .tiktok-metric-card:hover {
            transform: translateY(-4px);
            background: rgba(255,255,255,0.2);
        }

        .tiktok-info-card {
            transition: var(--transition);
        }

        .tiktok-info-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        /* SPACING UTILITIES */
        .space-sm { margin: var(--space-sm); }
        .space-md { margin: var(--space-md); }
        .space-lg { margin: var(--space-lg); }
        .space-xl { margin: var(--space-xl); }

        /* TIKTOK-OPTIMIZED MOBILE RESPONSIVENESS */
        @media (max-width: 768px) {
            body {
                padding: var(--space-sm);
                font-size: 16px; /* Prevent zoom on iOS */
            }

            .container {
                margin: 0;
                padding: var(--space-md);
                border-radius: var(--radius-sm);
            }

            .concept {
                padding: var(--space-lg);
                margin: var(--space-md) 0;
                border-radius: var(--radius-sm);
                transform: var(--gpu-acceleration);
            }

            button {
                padding: var(--space-md) var(--space-lg);
                font-size: 14px;
                min-height: 44px; /* iOS touch target */
                border-radius: var(--radius-sm);
            }

            .tiktok-dashboard {
                padding: var(--space-lg);
                border-radius: var(--radius-sm);
            }

            .tiktok-metric-card {
                padding: var(--space-md);
                border-radius: var(--radius-sm);
            }

            /* Mobile grid optimization */
            [style*="grid-template-columns"] {
                grid-template-columns: 1fr !important;
                gap: var(--space-md) !important;
            }
        }

        @media (max-width: 480px) {
            body {
                padding: var(--space-xs);
            }

            .container {
                padding: var(--space-sm);
                margin: var(--space-xs);
            }

            .concept {
                padding: var(--space-md);
                margin: var(--space-sm) 0;
            }

            .tiktok-dashboard {
                padding: var(--space-md);
                margin: var(--space-sm) 0;
            }

            .tiktok-metric-card {
                padding: var(--space-sm);
            }

            button {
                padding: var(--space-sm) var(--space-md);
                font-size: 13px;
                width: 100%;
                margin: var(--space-xs) 0;
            }

            /* Mobile typography */
            h1 { font-size: 1.8rem; }
            h2 { font-size: 1.5rem; }
            h3 { font-size: 1.3rem; }
            h4 { font-size: 1.1rem; }

            /* Mobile button groups */
            [style*="display: flex"] {
                flex-direction: column !important;
                gap: var(--space-sm) !important;
            }
        }

        /* TOUCH INTERACTION OPTIMIZATIONS */
        @media (hover: none) and (pointer: coarse) {
            .concept:hover {
                transform: none;
            }

            .concept:active {
                transform: scale(0.98) var(--gpu-acceleration);
                transition: var(--transition-fast);
            }

            button:hover {
                transform: none;
            }

            button:active {
                transform: scale(0.95) var(--gpu-acceleration);
                transition: var(--transition-fast);
            }

            .tiktok-metric-card:hover {
                transform: none;
            }

            .tiktok-metric-card:active {
                transform: scale(0.98) var(--gpu-acceleration);
            }
        }

        /* HIGH DPI DISPLAY OPTIMIZATION */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .concept,
            .tiktok-dashboard,
            .tiktok-metric-card {
                border-width: 0.5px;
            }
        }

        /* ADVANCED TIKTOK MICRO-INTERACTIONS */
        .concept {
            cursor: pointer;
            user-select: none;
        }

        .concept:hover .viral-score {
            animation: tiktokPulse 0.8s ease-in-out;
        }

        .concept:hover .concept-title {
            color: var(--like-color);
            transition: color var(--transition-fast);
        }

        /* LIKE BUTTON ANIMATION */
        .btn-like {
            position: relative;
            overflow: visible;
        }

        .btn-like.liked {
            background: linear-gradient(135deg, var(--like-color), #ff1744);
            animation: likeExplosion 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .btn-like.liked::before {
            content: '❤️';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 20px;
            animation: heartFloat 1s ease-out forwards;
            pointer-events: none;
        }

        @keyframes likeExplosion {
            0% { transform: scale(1) var(--gpu-acceleration); }
            50% { transform: scale(1.3) var(--gpu-acceleration); }
            100% { transform: scale(1.1) var(--gpu-acceleration); }
        }

        @keyframes heartFloat {
            0% {
                opacity: 1;
                transform: translateX(-50%) translateY(0) scale(0.5);
            }
            50% {
                opacity: 1;
                transform: translateX(-50%) translateY(-20px) scale(1.2);
            }
            100% {
                opacity: 0;
                transform: translateX(-50%) translateY(-40px) scale(0.8);
            }
        }

        /* SHARE BUTTON RIPPLE EFFECT */
        .btn-share {
            position: relative;
            overflow: hidden;
        }

        .btn-share.sharing::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.6);
            transform: translate(-50%, -50%);
            animation: shareRipple 0.6s ease-out;
        }

        @keyframes shareRipple {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
            }
            100% {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }

        /* WORD LEARNING EFFECTS */
        .word-learned {
            position: relative;
            overflow: visible;
        }

        .word-learned::after {
            content: '✨';
            position: absolute;
            top: -5px;
            right: -5px;
            font-size: 16px;
            animation: sparkleSuccess 2s ease-in-out infinite;
        }

        @keyframes sparkleSuccess {
            0%, 100% {
                transform: scale(1) rotate(0deg);
                opacity: 0.8;
            }
            50% {
                transform: scale(1.3) rotate(180deg);
                opacity: 1;
            }
        }

        /* HOVER CARD LIFT EFFECT */
        .concept:hover {
            animation: cardLiftHover 0.3s ease-out forwards;
        }

        @keyframes cardLiftHover {
            0% {
                transform: translateY(0) scale(1) var(--gpu-acceleration);
                box-shadow: var(--shadow-sm);
            }
            100% {
                transform: translateY(-8px) scale(1.02) var(--gpu-acceleration);
                box-shadow: var(--shadow-xl);
            }
        }

        /* LOADING SKELETON ANIMATIONS */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loadingSkeleton 1.5s ease-in-out infinite;
        }

        @keyframes loadingSkeleton {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* ACCESSIBILITY */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        button:focus,
        .concept:focus,
        .tiktok-info-card:focus {
            outline: 3px solid var(--like-color);
            outline-offset: 3px;
            box-shadow: 0 0 0 6px rgba(255, 45, 85, 0.1);
        }

        /* KEYBOARD NAVIGATION */
        .concept:focus-visible,
        button:focus-visible {
            outline: 3px solid var(--primary);
            outline-offset: 3px;
            animation: focusPulse 1s ease-in-out infinite;
        }

        @keyframes focusPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(255, 107, 53, 0.1); }
        }
    </style>
</head>
<body>
    <div class="container" data-testid="app-root" role="main" aria-label="Spanish Learning Video Generator">
        <h1>🎬 AI Feed: Spanish Learning Videos</h1>
        <p>Generating viral Spanish learning content beyond GLOBO</p>

        <!-- 🔥 GAMIFICATION HEADER (60% engagement boost from competitive intel) -->
        <div style="display: flex; gap: var(--space-lg); margin: var(--space-lg) 0; flex-wrap: wrap;">
            <!-- Streak Counter -->
            <div style="flex: 1; min-width: 200px; background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: var(--space-lg); border-radius: var(--radius); color: white; box-shadow: var(--shadow-md);">
                <div style="display: flex; align-items: center; gap: var(--space-sm);">
                    <span style="font-size: 2.5em;">🔥</span>
                    <div>
                        <div id="streak-count" style="font-size: 2em; font-weight: 700; line-height: 1;">0</div>
                        <small style="opacity: 0.9;">Day Streak</small>
                    </div>
                </div>
            </div>

            <!-- XP Progress -->
            <div style="flex: 2; min-width: 300px; background: rgba(255, 255, 255, 0.05); padding: var(--space-lg); border-radius: var(--radius); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: var(--shadow-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                    <span id="user-level" style="font-weight: 700; color: #FF6B35;">A1</span>
                    <span id="xp-display" style="font-weight: 600;">0 / 500 XP</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); height: 12px; border-radius: 6px; overflow: hidden;">
                    <div id="xp-bar" style="height: 100%; background: linear-gradient(90deg, #FF6B35, #F7931E); width: 0%; transition: width 0.5s ease;"></div>
                </div>
                <small style="opacity: 0.7; margin-top: var(--space-xs); display: block;">Next level: <span id="next-level">A2</span></small>
            </div>

            <!-- Words Count -->
            <div style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: var(--space-lg); border-radius: var(--radius); color: white; box-shadow: var(--shadow-md); text-align: center;">
                <div id="words-count" style="font-size: 2em; font-weight: 700; line-height: 1;">0</div>
                <small style="opacity: 0.9;">Words Learned</small>
            </div>
        </div>
        <div class="tiktok-info-card" style="margin: var(--space-lg) 0; padding: var(--space-lg); background: var(--card-bg); border-left: 4px solid #FF6B35; border-radius: var(--radius); box-shadow: var(--shadow-sm);">
            <small><strong>💡 Tip:</strong> Content is sorted by Golden Standard score. Use 👍/👎 to rate concepts and help improve future generation!</small>
            <details style="margin-top: var(--space-sm);">
                <summary style="cursor: pointer; font-weight: 600; color: #FF6B35;">⭐ What makes content Golden Standard?</summary>
                <div style="margin-top: 5px; font-size: 12px; line-height: 1.4;">
                    <strong>Golden criteria (vision-aligned):</strong><br>
                    • Object personification with Spanish vocabulary (25pts)<br>
                    • Historical figures in modern contexts (25pts)<br>
                    • Cultural authenticity with humor (20pts)<br>
                    • Immediate visual comedy elements (20pts)<br>
                    • Direct Spanish learning integration (10pts)<br>
                    • High viral potential bonus (up to 25pts)
                </div>
            </details>
        </div>

        <div class="tiktok-dashboard" style="margin: var(--space-xl) 0; padding: var(--space-xl); background: var(--primary); border-radius: var(--radius); color: white; box-shadow: var(--shadow-lg);">
            <h2>🚀 Viral Content Analytics</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg); margin: var(--space-lg) 0;">
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">🎯 Diversity Score</h4>
                    <p style="font-size: 2em; margin: var(--space-sm) 0; font-weight: 700;" id="diversity-score">--</p>
                    <small id="diversity-status">Analyzing content...</small>
                </div>
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">⚡ Viral Potential</h4>
                    <p style="font-size: 2em; margin: var(--space-sm) 0; font-weight: 700;" id="avg-viral">--</p>
                    <small id="viral-trend">Loading trends...</small>
                </div>
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">⭐ Golden Rate</h4>
                    <p style="font-size: 2em; margin: var(--space-sm) 0; font-weight: 700;" id="golden-rate">--</p>
                    <small id="golden-count">Content quality</small>
                </div>
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">🎭 Top Content</h4>
                    <p style="font-size: 1.5em; margin: var(--space-sm) 0; font-weight: 600;" id="top-content-type">--</p>
                    <small id="content-distribution">Type distribution</small>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <h4>📊 Content Type Distribution</h4>
                <div id="content-type-bars" style="margin-top: 10px;">
                    <div class="type-bar" data-type="objects_comedy">
                        <span style="font-size: 12px; width: 120px; display: inline-block;">🥄 Objects Comedy:</span>
                        <div style="background: rgba(255,255,255,0.2); width: 200px; height: 12px; border-radius: 6px; display: inline-block; vertical-align: middle; margin: 0 10px;">
                            <div id="bar-objects_comedy" style="background: #FFE66D; height: 100%; border-radius: 6px; width: 0%; transition: width 0.5s ease;"></div>
                        </div>
                        <span id="pct-objects_comedy" style="font-size: 12px;">0%</span>
                    </div>
                    <div class="type-bar" data-type="historical_vlog" style="margin-top: 8px;">
                        <span style="font-size: 12px; width: 120px; display: inline-block;">🎭 Historical Vlog:</span>
                        <div style="background: rgba(255,255,255,0.2); width: 200px; height: 12px; border-radius: 6px; display: inline-block; vertical-align: middle; margin: 0 10px;">
                            <div id="bar-historical_vlog" style="background: #A8E6CF; height: 100%; border-radius: 6px; width: 0%; transition: width 0.5s ease;"></div>
                        </div>
                        <span id="pct-historical_vlog" style="font-size: 12px;">0%</span>
                    </div>
                    <div class="type-bar" data-type="character_interaction" style="margin-top: 8px;">
                        <span style="font-size: 12px; width: 120px; display: inline-block;">🤝 Character Mix:</span>
                        <div style="background: rgba(255,255,255,0.2); width: 200px; height: 12px; border-radius: 6px; display: inline-block; vertical-align: middle; margin: 0 10px;">
                            <div id="bar-character_interaction" style="background: #FFB3BA; height: 100%; border-radius: 6px; width: 0%; transition: width 0.5s ease;"></div>
                        </div>
                        <span id="pct-character_interaction" style="font-size: 12px;">0%</span>
                    </div>
                    <div class="type-bar" data-type="cultural_humor" style="margin-top: 8px;">
                        <span style="font-size: 12px; width: 120px; display: inline-block;">🇪🇸 Cultural Fun:</span>
                        <div style="background: rgba(255,255,255,0.2); width: 200px; height: 12px; border-radius: 6px; display: inline-block; vertical-align: middle; margin: 0 10px;">
                            <div id="bar-cultural_humor" style="background: #BFCFFF; height: 100%; border-radius: 6px; width: 0%; transition: width 0.5s ease;"></div>
                        </div>
                        <span id="pct-cultural_humor" style="font-size: 12px;">0%</span>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="batchOptimizeAll()" style="background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);">⚡ Batch Optimize All Content</button>
                </div>
            </div>
        </div>

        <div class="tiktok-dashboard" style="margin: var(--space-xl) 0; padding: var(--space-xl); background: var(--success); border-radius: var(--radius); color: white; box-shadow: var(--shadow-lg);">
            <h2>📊 Spanish Learning Progress Dashboard</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg); margin: var(--space-lg) 0;">
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">🎯 Current Level</h4>
                    <p style="font-size: 2em; margin: var(--space-sm) 0; font-weight: 700;">${progressFeedback.level.toUpperCase()}</p>
                    <small>Confidence: ${progressFeedback.confidenceLevel}%</small>
                </div>
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">✅ Accuracy</h4>
                    <p style="font-size: 2em; margin: var(--space-sm) 0; font-weight: 700;">${progressFeedback.overallAccuracy}%</p>
                    <small>Recent: ${progressFeedback.recentPerformance}%</small>
                </div>
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">📚 Lessons</h4>
                    <p style="font-size: 2em; margin: var(--space-sm) 0; font-weight: 700;">${progressFeedback.completedLessons}</p>
                    <small>${progressFeedback.studyTime} minutes studied</small>
                </div>
                <div class="tiktok-metric-card" style="background: rgba(255,255,255,0.15); padding: var(--space-lg); border-radius: var(--radius); backdrop-filter: blur(10px); transition: var(--transition);">
                    <h4 style="margin: 0 0 var(--space-sm) 0;">🚀 Adaptive Level</h4>
                    <p style="font-size: 1.5em; margin: var(--space-sm) 0; font-weight: 600;">×${progressFeedback.adaptiveMultiplier.toFixed(1)}</p>
                    <small>${progressFeedback.recommendation.type}</small>
                </div>
            </div>
            <div class="tiktok-info-card" style="background: rgba(255,255,255,0.1); padding: var(--space-lg); border-radius: var(--radius); margin-top: var(--space-lg);">
                <h4 style="margin: 0 0 var(--space-sm) 0;">💡 Personalized Recommendation</h4>
                <p><strong>${progressFeedback.recommendation.message}</strong></p>
                <p><em>${progressFeedback.recommendation.suggestedAction}</em></p>
            </div>
        </div>

        <div class="tiktok-dashboard" style="margin: var(--space-xl) 0; padding: var(--space-xl); background: var(--primary); border-radius: var(--radius); color: white; box-shadow: var(--shadow-lg);">
            <h2>🇪🇸 Adaptive Spanish Learning Feed</h2>
            <p>AI-powered content adapted to your ${adaptiveContent.recommendedLevel} level</p>
            <div class="tiktok-info-card" style="background: rgba(255,255,255,0.1); padding: var(--space-md); border-radius: var(--radius); margin: var(--space-md) 0;">
                <small><strong>Focus Areas:</strong> ${adaptiveContent.focusAreas.join(', ')} | <strong>Style:</strong> ${adaptiveContent.contentPreferences.preferredStyle}</small>
            </div>
            <div class="spanish-recommendations">
                ${spanishRecommendations.map((rec, index) => `
                    <div class="concept" style="margin: var(--space-lg) 0; padding: var(--space-lg); background: rgba(255,255,255,0.1); border-radius: var(--radius); border-left: 4px solid #fff; backdrop-filter: blur(10px); transition: var(--transition);">
                        <h4 style="margin: 0 0 var(--space-sm) 0;">📚 ${rec.type.replace('_', ' ').toUpperCase()} (Priority: ${rec.feedPriority})</h4>
                        <p><strong>🎯 Spanish Content:</strong> ${rec.spanishContent}</p>
                        <p><strong>💡 Learning Goal:</strong> ${rec.learningObjective}</p>
                        <div style="margin: var(--space-sm) 0;">
                            <strong>🔥 Viral Potential:</strong>
                            <div style="display: inline-block; margin-left: var(--space-sm); vertical-align: middle;">
                                <div style="background: rgba(255,255,255,0.2); width: 120px; height: 8px; border-radius: 4px; display: inline-block; vertical-align: middle;">
                                    <div style="background: ${rec.viralPotential >= 80 ? '#ff4444' : rec.viralPotential >= 60 ? '#ff8844' : '#ffaa44'}; width: ${rec.viralPotential}%; height: 100%; border-radius: 4px; animation: ${rec.viralPotential >= 80 ? 'pulse 1.5s infinite' : 'none'};"></div>
                                </div>
                                <span style="margin-left: var(--space-sm); font-weight: bold; color: ${rec.viralPotential >= 80 ? '#ff4444' : '#fff'};">${rec.viralPotential}%</span>
                                ${rec.viralPotential >= 80 ? '<span style="margin-left: 5px; animation: bounce 2s infinite;">🚀</span>' : ''}
                            </div>
                        </div>
                        <p><strong>🎬 Concept:</strong> ${rec.concept}</p>
                        <small style="opacity: 0.8;">ID: ${rec.id}</small>
                        <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm);">
                            <button onclick="trackProgress('${rec.id}', true)" style="background: var(--success); color: white;">✅ Mastered</button>
                            <button onclick="trackProgress('${rec.id}', false)" style="background: var(--primary); color: white;">⏳ Still Learning</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="tiktok-info-card" style="background: rgba(255,255,255,0.1); padding: var(--space-lg); border-radius: var(--radius); margin-top: var(--space-lg);">
                <h4 style="margin: 0 0 var(--space-sm) 0;">🎯 Next Goals</h4>
                <ul style="margin: var(--space-md) 0;">
                    ${adaptiveContent.personalizedGoals.map(goal => `<li>${goal}</li>`).join('')}
                </ul>
                <p><strong>Next Milestone:</strong> ${adaptiveContent.nextMilestone.current}/${adaptiveContent.nextMilestone.target} lessons (${adaptiveContent.nextMilestone.progress}%)</p>
            </div>
        </div>

        <div class="tiktok-dashboard" style="margin: var(--space-xl) 0; padding: var(--space-xl); background: var(--golden); color: #333; box-shadow: var(--shadow-lg);">
            <h2>🎯 Genius Word-Focused Video Feed</h2>
            <p>Each video teaches ONE specific word, ordered by importance for your level: <strong>${transcribedVideoFeed.vocabularyStats.vocabularyLevel}</strong></p>

            <div class="tiktok-info-card" style="background: rgba(0,0,0,0.05); padding: var(--space-md); border-radius: var(--radius); margin: var(--space-md) 0;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-md); text-align: center;">
                    <div>
                        <strong style="font-size: 1.5em; color: #FF6B35;">${transcribedVideoFeed.vocabularyStats.totalUniqueWords}</strong>
                        <div style="font-size: 0.9em;">Unique Words</div>
                    </div>
                    <div>
                        <strong style="font-size: 1.5em; color: #4CAF50;">${transcribedVideoFeed.vocabularyStats.coverageOfTop1000}%</strong>
                        <div style="font-size: 0.9em;">Top 1000 Coverage</div>
                    </div>
                    <div>
                        <strong style="font-size: 1.5em; color: #667eea;">${transcribedVideoFeed.vocabularyStats.recommendedStudyTime}min</strong>
                        <div style="font-size: 0.9em;">Study Time</div>
                    </div>
                    <div>
                        <strong style="font-size: 1.5em; color: #ffd700;">${Math.round(transcribedVideoFeed.vocabularyStats.averageWordImportance)}</strong>
                        <div style="font-size: 0.9em;">Avg Importance</div>
                    </div>
                </div>
            </div>

            <h3>📚 Progressive Learning Order (Most Important Words First)</h3>
            <div class="vocabulary-progression" style="margin: var(--space-lg) 0;">
                ${transcribedVideoFeed.videos.slice(0, 8).map((video, index) => `
                    <div class="concept" style="margin: var(--space-md) 0; padding: var(--space-lg); background: rgba(255,255,255,0.1); border-radius: var(--radius); position: relative; border-left: 4px solid ${video.wordImportance >= 95 ? '#FF6B35' : video.wordImportance >= 85 ? '#F7931E' : video.wordImportance >= 75 ? '#ffd700' : '#4CAF50'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                            <div style="display: flex; align-items: center; gap: var(--space-md);">
                                <div style="background: ${video.wordImportance >= 95 ? '#FF6B35' : video.wordImportance >= 85 ? '#F7931E' : video.wordImportance >= 75 ? '#ffd700' : '#4CAF50'}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                                    ${index + 1}
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 1.3em; color: #1a1a1a;">
                                        📖 Focus Word: <span style="background: var(--viral); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">${video.focusWord.toUpperCase()}</span>
                                    </h4>
                                    <small style="color: #666;">Rank #${video.frequencyRank} • ${video.learningLevel} • ${video.wordCategory.replace('_', ' ')}</small>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: rgba(255,107,53,0.1); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius); border: 1px solid #FF6B35;">
                                    <strong style="color: #FF6B35;">${video.wordImportance}/100</strong>
                                    <div style="font-size: 0.8em; color: #666;">Importance</div>
                                </div>
                            </div>
                        </div>

                        <div style="background: rgba(0,0,0,0.05); padding: var(--space-md); border-radius: var(--radius); margin: var(--space-sm) 0;">
                            <h5 style="margin: 0 0 var(--space-xs) 0; color: #FF6B35;">🎬 Video Transcription:</h5>
                            <p style="margin: 0; font-style: italic; line-height: 1.4;">"${video.transcription}"</p>
                            <small style="color: #666; margin-top: var(--space-xs); display: block;">
                                Word repetitions: ${video.repetitionCount} • Content type: ${video.type}
                            </small>
                        </div>

                        <div style="margin-top: var(--space-md); display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                            <button onclick="playVideoWord('${video.focusWord}')" style="background: var(--primary); color: white;">🔊 Hear Pronunciation</button>
                            <button onclick="markWordLearned('${video.focusWord}')" style="background: var(--success); color: white;">✅ Mark as Learned</button>
                            <button onclick="addToStudyList('${video.focusWord}')" style="background: var(--secondary); color: white;">📚 Add to Study List</button>
                            <button onclick="showWordDetails('${video.focusWord}', ${video.wordImportance}, '${video.wordCategory}')" style="background: var(--golden); color: #333;">📖 Word Details</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="tiktok-info-card" style="background: rgba(0,0,0,0.05); padding: var(--space-lg); border-radius: var(--radius); margin-top: var(--space-lg);">
                <h4 style="margin: 0 0 var(--space-md) 0;">📊 Learning Progression Analytics</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg);">
                    <div>
                        <h5 style="margin: 0 0 var(--space-sm) 0;">📈 Word Categories</h5>
                        ${Object.entries(transcribedVideoFeed.learningProgression.wordsByCategory).slice(0, 5).map(([category, count]) => `
                            <div style="display: flex; justify-content: space-between; margin: var(--space-xs) 0;">
                                <span>${category.replace('_', ' ')}</span>
                                <strong>${count} words</strong>
                            </div>
                        `).join('')}
                    </div>
                    <div>
                        <h5 style="margin: 0 0 var(--space-sm) 0;">🎯 Difficulty Levels</h5>
                        ${Object.entries(transcribedVideoFeed.learningProgression.difficultyDistribution).slice(0, 5).map(([level, count]) => `
                            <div style="display: flex; justify-content: space-between; margin: var(--space-xs) 0;">
                                <span>${level.replace('_', ' ')}</span>
                                <strong>${count} videos</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top: var(--space-lg); text-align: center;">
                    <button onclick="generateNewWordFeed()" style="background: var(--primary); color: white; padding: var(--space-md) var(--space-xl);">🔄 Generate New Word-Focused Feed</button>
                </div>
            </div>
        </div>

        <div class="concepts">
            ${concepts
                .sort((a, b) => {
                    // INTELLIGENT RANKING: Priority order for maximum viral impact
                    const getViralScore = (concept) => {
                        let score = concept.viralPotential;
                        if (concept.goldenStandard?.rating === 'GOLDEN') score += 50;
                        if (concept.goldenStandard?.rating === 'GOOD') score += 20;
                        if (concept.type === 'objects_comedy') score += 10; // Human feedback priority
                        if (concept.type === 'historical_vlog') score += 10; // Human feedback priority
                        return score;
                    };
                    return getViralScore(b) - getViralScore(a);
                })
                .map((concept, index) => `
                <div class="concept ${concept.viralPotential >= 70 ? 'high-viral' : ''} ${concept.goldenStandard?.rating === 'GOLDEN' ? 'golden-standard' : ''}" data-concept-id="${concept.id}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h3 style="margin: 0;">Type: ${concept.type} ${concept.viralPotential >= 70 ? '🔥' : ''} ${concept.goldenStandard?.rating === 'GOLDEN' ? '⭐' : ''}</h3>
                        <div class="viral-rank" style="background: ${index === 0 ? '#ff6b35' : index === 1 ? '#f7931e' : index === 2 ? '#ffd700' : '#ccc'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                            #${index + 1} ${index === 0 ? '👑 TOP VIRAL' : index === 1 ? '🚀 HIGH' : index === 2 ? '⭐ GOLD' : 'RANKED'}
                        </div>
                    </div>
                    <p><strong>Hook:</strong> ${concept.hook}</p>
                    <p><strong>Spanish Focus:</strong> ${concept.spanishFocus}</p>
                    <p><strong>Concept:</strong> ${concept.concept}</p>
                    <p class="viral-score">Viral Potential: ${concept.viralPotential}%</p>
                    <p class="golden-score">Golden Standard: ${concept.goldenStandard?.rating || 'N/A'} (${concept.goldenStandard?.score || 0}%)</p>

                    <!-- VIRAL AMPLIFICATION SYSTEM -->
                    <div class="viral-amplification" style="margin: 15px 0; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                        <h4 style="margin: 0 0 10px 0; font-size: 14px;">🚀 Social Media Viral Forecast</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
                            <div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 5px; text-align: center;">
                                <div style="font-size: 16px;">📱</div>
                                <div style="font-size: 11px; margin: 2px 0;">TikTok</div>
                                <div style="font-weight: bold; font-size: 13px;">${Math.min(100, Math.round(concept.viralPotential * (concept.type === 'objects_comedy' ? 1.2 : 1.0)))}%</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 5px; text-align: center;">
                                <div style="font-size: 16px;">📸</div>
                                <div style="font-size: 11px; margin: 2px 0;">Instagram</div>
                                <div style="font-weight: bold; font-size: 13px;">${Math.min(100, Math.round(concept.viralPotential * (concept.type === 'historical_vlog' ? 1.15 : 0.95)))}%</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 5px; text-align: center;">
                                <div style="font-size: 16px;">🎥</div>
                                <div style="font-size: 11px; margin: 2px 0;">YouTube</div>
                                <div style="font-weight: bold; font-size: 13px;">${Math.min(100, Math.round(concept.viralPotential * (concept.type === 'cultural_humor' ? 1.1 : 0.9)))}%</div>
                            </div>
                        </div>
                        <div style="font-size: 11px; opacity: 0.9;">
                            <strong>Best Platform:</strong> ${concept.viralPotential > 80 ? 'TikTok 📱' : concept.type === 'historical_vlog' ? 'Instagram 📸' : 'Multi-Platform 🌐'}
                            <span style="margin-left: 10px;"><strong>Peak Time:</strong> ${concept.viralPotential > 75 ? '6-9 PM' : '8-10 PM'}</span>
                        </div>
                    </div>

                    <!-- COMEDY TIMING OPTIMIZATION -->
                    <div class="comedy-timing" style="margin: 15px 0; padding: 12px; background: linear-gradient(135deg, #FF6B35, #F7931E); border-radius: 8px; color: white;">
                        <h4 style="margin: 0 0 10px 0; font-size: 14px;">🎭 Comedy Timing Analysis</h4>
                        <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                            <div style="font-size: 12px; margin-bottom: 5px;"><strong>Hook Delivery:</strong> ${concept.hook}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 11px; min-width: 60px;">0-3s Timeline:</span>
                                <div style="flex: 1; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; position: relative;">
                                    <div style="height: 100%; background: #FFE66D; border-radius: 4px; width: ${Math.min(100, (concept.viralPotential / 100) * 100)}%; position: relative;">
                                        <div style="position: absolute; right: 0; top: -18px; font-size: 10px; color: #FFE66D;">⚡${concept.viralPotential >= 80 ? '0.5s' : concept.viralPotential >= 60 ? '1.2s' : '2.1s'}</div>
                                    </div>
                                </div>
                                <span style="font-size: 11px; color: #FFE66D;">${concept.viralPotential >= 80 ? 'INSTANT' : concept.viralPotential >= 60 ? 'QUICK' : 'GOOD'}</span>
                            </div>
                        </div>
                        <div style="font-size: 10px; text-align: center; opacity: 0.8;">
                            ${concept.viralPotential >= 80 ? '🏆 Perfect hook timing! Viral potential maximized' : concept.viralPotential >= 60 ? '⚡ Strong opening! Good engagement predicted' : '📈 Solid hook! Room for timing optimization'}
                        </div>
                    </div>

                    <small>ID: ${concept.id}</small>
                    <div style="margin-top: 10px; display: flex; gap: 8px; align-items: center;">
                        <button onclick="rateConcept(${index}, true)" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">👍 Like</button>
                        <button onclick="rateConcept(${index}, false)" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">👎 Dislike</button>
                        <button onclick="regenerateConcept(${index})" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">🔄 Regenerate</button>
                        <button onclick="shareToSocial('${concept.id}', '${concept.type}')" style="padding: 5px 10px; background: #6f42c1; color: white; border: none; border-radius: 3px; cursor: pointer;">📤 Share</button>
                        <button onclick="previewConcept('${concept.id}', '${concept.spanishFocus}', '${concept.concept.replace(/'/g, "\\'")}', '${concept.type}')" style="padding: 5px 10px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer;">👁️ Preview</button>
                        <button onclick="optimizeConcept('${concept.id}', ${concept.viralPotential}, '${concept.goldenStandard?.rating || 'NONE'}', '${concept.type}', ${index})" style="padding: 5px 10px; background: #fd7e14; color: white; border: none; border-radius: 3px; cursor: pointer;">⚡ Optimize</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <footer>
            <p>✅ Content generation complete - Ready for video production</p>
            <p>🎭 All concepts include funny hooks within first 3 seconds</p>
            <p>🌍 Expanding Spanish learning beyond single character approach</p>
        </footer>
    </div>

    <script>
        // 🔥 Load user gamification data on page load
        async function loadUserStats() {
            try {
                const userId = 'demo-user'; // Demo user for now

                // Fetch user level and streak
                const levelRes = await fetch('/api/user/level/' + userId);
                const levelData = await levelRes.json();

                // Fetch user progress
                const progressRes = await fetch('/api/user/progress/' + userId);
                const progressData = await progressRes.json();

                if (levelData.success) {
                    document.getElementById('streak-count').textContent = levelData.streak;
                    document.getElementById('words-count').textContent = levelData.wordsCount;
                }

                if (progressData.success) {
                    const progress = progressData.progress;
                    document.getElementById('user-level').textContent = progress.currentLevel;
                    document.getElementById('next-level').textContent = progress.nextLevel;
                    document.getElementById('xp-display').textContent = progress.xpCurrent + ' / ' + progress.xpNeeded + ' XP';
                    document.getElementById('xp-bar').style.width = progress.percentToNext + '%';
                }
            } catch (error) {
                console.error('Failed to load user stats:', error);
            }
        }

        // Load stats when page loads
        loadUserStats();

        function regenerateConcept(index) {
            const button = event.target;
            button.textContent = '⏳ Generating...';
            button.disabled = true;

            fetch('/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const conceptDiv = button.closest('.concept');
                    const concept = data.concept;

                    const viralIcon = concept.viralPotential >= 70 ? '🔥' : '';
                    const goldenIcon = concept.goldenStandard?.rating === 'GOLDEN' ? '⭐' : '';
                    const goldenRating = concept.goldenStandard?.rating || 'N/A';
                    const goldenScore = concept.goldenStandard?.score || 0;

                    conceptDiv.innerHTML =
                        '<h3>Type: ' + concept.type + ' ' + viralIcon + ' ' + goldenIcon + '</h3>' +
                        '<p><strong>Hook:</strong> ' + concept.hook + '</p>' +
                        '<p><strong>Spanish Focus:</strong> ' + concept.spanishFocus + '</p>' +
                        '<p><strong>Concept:</strong> ' + concept.concept + '</p>' +
                        '<p class="viral-score">Viral Potential: ' + concept.viralPotential + '%</p>' +
                        '<p class="golden-score">Golden Standard: ' + goldenRating + ' (' + goldenScore + '%)</p>' +
                        '<small>ID: ' + concept.id + '</small>' +
                        '<div style="margin-top: 10px; display: flex; gap: 8px; align-items: center;">' +
                        '<button onclick="rateConcept(' + index + ', true)" style="padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">👍 Like</button>' +
                        '<button onclick="rateConcept(' + index + ', false)" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">👎 Dislike</button>' +
                        '<button onclick="regenerateConcept(' + index + ')" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">🔄 Regenerate</button>' +
                        '</div>';

                    // Update styling based on new concept
                    const highViral = concept.viralPotential >= 70 ? 'high-viral' : '';
                    const goldenStandard = concept.goldenStandard?.rating === 'GOLDEN' ? 'golden-standard' : '';
                    conceptDiv.className = 'concept ' + highViral + ' ' + goldenStandard;
                }
            })
            .catch(error => {
                button.textContent = '🔄 Regenerate';
                button.disabled = false;
                console.error('Error:', error);
            });
        }

        function rateConcept(index, isPositive) {
            const conceptDiv = document.querySelectorAll('.concept')[index];
            const buttons = conceptDiv.querySelectorAll('button');
            const likeBtn = buttons[0];
            const dislikeBtn = buttons[1];

            // Visual feedback
            if (isPositive) {
                likeBtn.style.background = '#155724';
                likeBtn.textContent = '👍 Liked!';
                dislikeBtn.style.opacity = '0.5';
                conceptDiv.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
            } else {
                dislikeBtn.style.background = '#721c24';
                dislikeBtn.textContent = '👎 Disliked';
                likeBtn.style.opacity = '0.5';
                conceptDiv.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
            }

            // Disable both rating buttons after rating
            likeBtn.disabled = true;
            dislikeBtn.disabled = true;

            // Future: Send feedback to server for golden standard algorithm improvement
            console.log('User feedback:', { index, rating: isPositive ? 'positive' : 'negative' });
        }

        // Update viral metrics dashboard with current content data
        function updateViralMetrics() {
            const concepts = ${JSON.stringify(concepts)};
            if (!concepts || concepts.length === 0) return;

            // Calculate diversity analytics
            const diversityData = concepts[0]?.diversityAnalytics;
            if (diversityData) {
                document.getElementById('diversity-score').textContent = diversityData.diversityScore + '%';
                const status = diversityData.diversityScore >= 80 ? 'Excellent diversity' :
                              diversityData.diversityScore >= 60 ? 'Good variety' : 'Needs more variety';
                document.getElementById('diversity-status').textContent = status;
            }

            // Calculate viral potential stats
            const viralPotentials = concepts.map(c => c.viralPotential);
            const avgViral = Math.round(viralPotentials.reduce((a, b) => a + b, 0) / viralPotentials.length);
            document.getElementById('avg-viral').textContent = avgViral + '%';
            const viralTrend = avgViral >= 80 ? '🚀 Trending high' : avgViral >= 60 ? '📈 Good potential' : '📊 Building';
            document.getElementById('viral-trend').textContent = viralTrend;

            // Calculate golden rate
            const goldenCount = concepts.filter(c => c.goldenStandard?.rating === 'GOLDEN').length;
            const goldenRate = Math.round((goldenCount / concepts.length) * 100);
            document.getElementById('golden-rate').textContent = goldenRate + '%';
            document.getElementById('golden-count').textContent = goldenCount + '/' + concepts.length + ' golden';

            // Find top content type
            const typeCounts = {};
            concepts.forEach(c => {
                typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
            });
            const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
            const typeNames = {
                'objects_comedy': '🥄 Objects',
                'historical_vlog': '🎭 Historical',
                'character_interaction': '🤝 Characters',
                'cultural_humor': '🇪🇸 Cultural'
            };
            document.getElementById('top-content-type').textContent = typeNames[topType[0]] || topType[0];
            document.getElementById('content-distribution').textContent = topType[1] + '/' + concepts.length + ' items';

            // Update content type bars
            const total = concepts.length;
            Object.keys(typeCounts).forEach(type => {
                const count = typeCounts[type] || 0;
                const percentage = Math.round((count / total) * 100);
                const bar = document.getElementById('bar-' + type);
                const pct = document.getElementById('pct-' + type);
                if (bar && pct) {
                    bar.style.width = percentage + '%';
                    pct.textContent = percentage + '%';
                }
            });
        }

        // VIRAL AMPLIFICATION: Social media sharing functionality
        function shareToSocial(conceptId, contentType) {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🚀 Sharing...';
            button.style.background = '#e91e63';

            // Simulate social media optimization
            setTimeout(() => {
                const platforms = ['TikTok', 'Instagram', 'YouTube Shorts'];
                const platform = platforms[Math.floor(Math.random() * platforms.length)];

                // Show viral amplification feedback
                const conceptDiv = button.closest('.concept');
                const amplificationDiv = conceptDiv.querySelector('.viral-amplification');

                // Add sharing success animation
                amplificationDiv.style.animation = 'pulse 0.5s ease-in-out';

                // Update button with success state
                button.textContent = '✅ Shared to ' + platform;
                button.style.background = '#28a745';

                // Show amplification boost notification
                const notification = document.createElement('div');
                notification.innerHTML = '🎯 Viral boost activated for ' + platform + '! Engagement prediction +15%';
                notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #007bff; color: white; padding: 12px; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease-out';
                document.body.appendChild(notification);

                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);

                // Reset button after 2 seconds
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '#6f42c1';
                }, 2000);
            }, 1000);
        }

        // INSTANT PREVIEW: Spanish learning content preview with pronunciation
        function previewConcept(conceptId, spanishFocus, concept, contentType) {
            const button = event.target;
            button.textContent = '🎬 Loading...';
            button.style.background = '#20c997';

            // Create immersive preview modal
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center;';

            const preview = document.createElement('div');
            preview.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; position: relative; animation: fadeIn 0.3s ease-out;';

            const spanishWords = ['hola', 'gracias', 'por favor', 'de nada', 'buenos días', 'adiós', 'cómo estás', 'muy bien'];
            const randomSpanish = spanishWords[Math.floor(Math.random() * spanishWords.length)];

            preview.innerHTML = \`
                <button onclick="closePreview()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>

                <h2 style="margin: 0 0 20px 0; text-align: center;">🎬 Spanish Learning Preview</h2>

                <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #FFE66D;">📚 Concepto (\${contentType})</h3>
                    <p style="margin: 0; font-size: 16px; line-height: 1.5;">\${concept}</p>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #A8E6CF;">🗣️ Pronunciación Interactiva</h3>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #FFE66D;">\${randomSpanish}</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">[\${randomSpanish === 'hola' ? 'OH-lah' : randomSpanish === 'gracias' ? 'GRAH-see-ahs' : 'es-pah-NYOL'}]</div>
                        <button onclick="playPronunciation('\${randomSpanish}')" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 14px;">🔊 Escuchar</button>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #FFB6C1;">🎯 Enfoque de Aprendizaje</h3>
                    <p style="margin: 0; font-size: 14px;">
                        <strong>Área:</strong> \${spanishFocus}<br>
                        <strong>Nivel:</strong> Principiante-Intermedio<br>
                        <strong>Duración:</strong> 15-30 segundos<br>
                        <strong>Técnica:</strong> Inmersión cómica
                    </p>
                </div>

                <div style="text-align: center; margin-top: 25px;">
                    <button onclick="startLearning('\${conceptId}')" style="background: #FF6B35; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px; margin-right: 10px;">🚀 ¡Empezar Ahora!</button>
                    <button onclick="closePreview()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px;">Cerrar</button>
                </div>
            \`;

            modal.appendChild(preview);
            document.body.appendChild(modal);

            // Reset button
            setTimeout(() => {
                button.textContent = '👁️ Preview';
                button.style.background = '#17a2b8';
            }, 500);

            // Close on outside click
            modal.onclick = (e) => { if (e.target === modal) closePreview(); };
        }

        function closePreview() {
            const modals = document.querySelectorAll('div[style*="position: fixed"]');
            modals.forEach(modal => {
                if (modal.style.zIndex === '2000') modal.remove();
            });
        }

        function playPronunciation(word) {
            // Simulate pronunciation with visual feedback
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🎵 Reproduciendo...';
            button.style.background = '#007bff';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#28a745';

                // Show pronunciation feedback
                const feedback = document.createElement('div');
                feedback.innerHTML = '✨ ¡Perfecto! Practica más con videos similares';
                feedback.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #28a745; color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 3000;';
                document.body.appendChild(feedback);

                setTimeout(() => feedback.remove(), 2000);
            }, 1500);
        }

        function startLearning(conceptId) {
            closePreview();
            const notification = document.createElement('div');
            notification.innerHTML = '🎓 ¡Comenzando experiencia de aprendizaje inmersivo! Generando contenido personalizado...';
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 8px; z-index: 1000; max-width: 300px; animation: slideIn 0.3s ease-out';
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 4000);
        }

        // REAL-TIME OPTIMIZATION ENGINE: AI-powered content enhancement
        function optimizeConcept(conceptId, viralPotential, goldenRating, contentType, index) {
            const button = event.target;
            button.textContent = '🧠 Analyzing...';
            button.style.background = '#e83e8c';

            // AI-powered optimization analysis
            setTimeout(() => {
                const optimizations = [];
                const improvements = [];

                // Golden Standard Enhancement
                if (goldenRating !== 'GOLDEN') {
                    if (contentType === 'objects_comedy') {
                        optimizations.push('Add personified object with Spanish vocabulary');
                        improvements.push('+25 Golden Points');
                    }
                    if (contentType === 'historical_vlog') {
                        optimizations.push('Include famous historical figure in modern context');
                        improvements.push('+25 Golden Points');
                    }
                }

                // Viral Potential Enhancement
                if (viralPotential < 90) {
                    optimizations.push('Strengthen 0-3 second hook timing');
                    optimizations.push('Add instant visual comedy element');
                    improvements.push(\`+\${Math.floor((90 - viralPotential) / 2)} Viral Points\`);
                }

                // Spanish Learning Enhancement
                optimizations.push('Integrate pronunciation humor');
                optimizations.push('Add cultural authenticity elements');
                improvements.push('+15 Learning Points');

                // Create optimization modal
                const modal = document.createElement('div');
                modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center;';

                const optimization = document.createElement('div');
                optimization.style.cssText = 'background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%); color: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; position: relative; animation: fadeIn 0.3s ease-out;';

                optimization.innerHTML = \`
                    <button onclick="closeOptimization()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>

                    <h2 style="margin: 0 0 20px 0; text-align: center;">⚡ AI Content Optimization</h2>

                    <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #FFE66D;">🎯 Current Status</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <div style="text-align: center;">
                                <div style="font-size: 20px; font-weight: bold;">\${viralPotential}%</div>
                                <div style="font-size: 12px;">Viral Potential</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 20px; font-weight: bold;">\${goldenRating}</div>
                                <div style="font-size: 12px;">Golden Rating</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 20px; font-weight: bold;">\${contentType.split('_')[0]}</div>
                                <div style="font-size: 12px;">Content Type</div>
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #A8E6CF;">🚀 AI Recommendations</h3>
                        \${optimizations.map(opt => \`<div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px; font-size: 14px;">• \${opt}</div>\`).join('')}
                    </div>

                    <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #FFB6C1;">📈 Expected Improvements</h3>
                        \${improvements.map(imp => \`<div style="margin: 5px 0; color: #90EE90; font-weight: bold; font-size: 14px;">✨ \${imp}</div>\`).join('')}
                        <div style="margin-top: 10px; padding: 10px; background: rgba(144, 238, 144, 0.2); border-radius: 5px; text-align: center; font-weight: bold;">
                            🎯 Projected Golden Standard: \${goldenRating === 'GOLDEN' ? 'ENHANCED' : 'GOLDEN'}
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 25px;">
                        <button onclick="applyOptimizations('\${conceptId}', \${index})" style="background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px; margin-right: 10px;">🔧 Apply Optimizations</button>
                        <button onclick="closeOptimization()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px;">Cancel</button>
                    </div>
                \`;

                modal.appendChild(optimization);
                document.body.appendChild(modal);

                // Reset button
                button.textContent = '⚡ Optimize';
                button.style.background = '#fd7e14';

                // Close on outside click
                modal.onclick = (e) => { if (e.target === modal) closeOptimization(); };
            }, 1500);
        }

        function closeOptimization() {
            const modals = document.querySelectorAll('div[style*="position: fixed"]');
            modals.forEach(modal => {
                if (modal.style.zIndex === '2000') modal.remove();
            });
        }

        function applyOptimizations(conceptId, index) {
            closeOptimization();

            // Simulate optimization application
            const conceptDiv = document.querySelectorAll('.concept')[index];
            const viralScore = conceptDiv.querySelector('.viral-score');
            const goldenScore = conceptDiv.querySelector('.golden-score');
            const viralRank = conceptDiv.querySelector('.viral-rank');

            // Visual optimization feedback
            conceptDiv.style.animation = 'pulse 1s ease-in-out';
            conceptDiv.style.background = 'linear-gradient(135deg, #FFE66D, #A8E6CF)';

            setTimeout(() => {
                // Update scores with optimization improvements
                const newViralPotential = Math.min(100, parseInt(viralScore.textContent.match(/\d+/)[0]) + Math.floor(Math.random() * 15) + 5);
                viralScore.innerHTML = \`Viral Potential: \${newViralPotential}% <span style="color: #28a745;">↗️ OPTIMIZED</span>\`;
                goldenScore.innerHTML = \`Golden Standard: GOLDEN (95%) <span style="color: #ffd700;">⭐ ENHANCED</span>\`;

                // Update ranking badge
                viralRank.style.background = '#ffd700';
                viralRank.innerHTML = '#1 👑 OPTIMIZED';

                // Success notification
                const notification = document.createElement('div');
                notification.innerHTML = '🎉 Content optimized! Viral potential increased by AI recommendations';
                notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 8px; z-index: 1000; max-width: 300px; animation: slideIn 0.3s ease-out';
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                    conceptDiv.style.animation = '';
                    conceptDiv.style.background = '';
                }, 4000);
            }, 1000);
        }

        // BATCH OPTIMIZATION: Automated scalable content optimization system
        function batchOptimizeAll() {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🚀 Processing Batch...';
            button.style.background = '#dc3545';
            button.disabled = true;

            const concepts = document.querySelectorAll('.concept');
            let processedCount = 0;

            // Create progress modal
            const progressModal = document.createElement('div');
            progressModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center;';

            const progressDiv = document.createElement('div');
            progressDiv.style.cssText = 'background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 40px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center; animation: fadeIn 0.3s ease-out;';

            progressDiv.innerHTML = \`
                <h2 style="margin: 0 0 20px 0;">⚡ Batch Optimization in Progress</h2>
                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;" id="batch-progress">0/\${concepts.length}</div>
                    <div style="background: rgba(255,255,255,0.2); height: 12px; border-radius: 6px; overflow: hidden;">
                        <div id="batch-progress-bar" style="height: 100%; background: #FFE66D; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="margin-top: 10px; font-size: 14px;" id="batch-status">Analyzing content for optimization opportunities...</div>
                </div>
                <div style="font-size: 12px; opacity: 0.8;">
                    🎯 Upgrading all content to Golden Standard<br>
                    ⚡ Maximizing viral potential across platforms<br>
                    🇪🇸 Enhancing Spanish learning integration
                </div>
            \`;

            progressModal.appendChild(progressDiv);
            document.body.appendChild(progressModal);

            // Process each concept with staggered timing
            concepts.forEach((concept, index) => {
                setTimeout(() => {
                    // Visual feedback for current optimization
                    concept.style.animation = 'pulse 0.5s ease-in-out';
                    concept.style.border = '2px solid #28a745';

                    // Update progress
                    processedCount++;
                    const progressPercent = Math.round((processedCount / concepts.length) * 100);
                    document.getElementById('batch-progress').textContent = \`\${processedCount}/\${concepts.length}\`;
                    document.getElementById('batch-progress-bar').style.width = progressPercent + '%';

                    // Update status message
                    const statusMessages = [
                        'Enhancing golden standard compliance...',
                        'Optimizing 0-3 second hook timing...',
                        'Boosting viral potential algorithms...',
                        'Integrating Spanish learning elements...',
                        'Applying AI recommendations...',
                        'Finalizing optimization...'
                    ];
                    const statusIndex = Math.floor((processedCount / concepts.length) * statusMessages.length);
                    document.getElementById('batch-status').textContent = statusMessages[Math.min(statusIndex, statusMessages.length - 1)];

                    // Apply optimizations to concept
                    const viralScore = concept.querySelector('.viral-score');
                    const goldenScore = concept.querySelector('.golden-score');
                    const viralRank = concept.querySelector('.viral-rank');

                    if (viralScore && goldenScore && viralRank) {
                        // Enhanced optimization with random improvements
                        const currentViral = parseInt(viralScore.textContent.match(/\d+/)[0]);
                        const newViral = Math.min(100, currentViral + Math.floor(Math.random() * 10) + 5);

                        viralScore.innerHTML = \`Viral Potential: \${newViral}% <span style="color: #28a745;">↗️ BATCH OPTIMIZED</span>\`;
                        goldenScore.innerHTML = \`Golden Standard: GOLDEN (97%) <span style="color: #ffd700;">⭐ ENHANCED</span>\`;
                        viralRank.style.background = '#ffd700';
                        viralRank.innerHTML = \`#\${index + 1} 👑 OPTIMIZED\`;
                    }

                    // Remove optimization visual after delay
                    setTimeout(() => {
                        concept.style.animation = '';
                        concept.style.border = '';
                    }, 1000);

                    // Complete batch when all processed
                    if (processedCount === concepts.length) {
                        setTimeout(() => {
                            // Success completion
                            progressDiv.innerHTML = \`
                                <h2 style="margin: 0 0 20px 0;">🎉 Batch Optimization Complete!</h2>
                                <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                                    <div style="font-size: 24px; font-weight: bold; color: #FFE66D; margin-bottom: 10px;">100% Optimized</div>
                                    <div style="font-size: 16px; margin-bottom: 15px;">All \${concepts.length} concepts enhanced to Golden Standard</div>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 14px;">
                                        <div>📈 +15% Avg Viral</div>
                                        <div>⭐ 100% Golden</div>
                                        <div>🇪🇸 Enhanced Learning</div>
                                    </div>
                                </div>
                                <button onclick="closeBatchModal()" style="background: #007bff; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px;">Close</button>
                            \`;

                            // Reset button
                            button.textContent = originalText;
                            button.style.background = '#28a745';
                            button.disabled = false;

                            // Auto-close after 5 seconds
                            setTimeout(() => {
                                if (progressModal.parentNode) closeBatchModal();
                            }, 5000);
                        }, 500);
                    }
                }, index * 200); // Stagger optimization by 200ms each
            });
        }

        function closeBatchModal() {
            const modals = document.querySelectorAll('div[style*="position: fixed"]');
            modals.forEach(modal => {
                if (modal.style.zIndex === '2000') modal.remove();
            });
        }

        // GENIUS WORD-FOCUSED LEARNING FUNCTIONS
        function playVideoWord(word) {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🔊 Playing...';
            button.style.background = '#20c997';

            // Simulate pronunciation with enhanced feedback
            setTimeout(() => {
                button.textContent = '✨ Played!';
                button.style.background = '#28a745';

                // Show pronunciation feedback with word details
                const feedback = document.createElement('div');
                feedback.innerHTML = \`
                    <div style="font-weight: bold; margin-bottom: 8px;">📢 "\${word.toUpperCase()}"</div>
                    <div style="font-size: 12px; opacity: 0.9;">Pronunciation practiced! This word is crucial for Spanish fluency.</div>
                \`;
                feedback.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #007bff; color: white; padding: 15px; border-radius: 8px; z-index: 1000; max-width: 250px; animation: slideIn 0.3s ease-out; box-shadow: 0 4px 16px rgba(0,0,0,0.15);';
                document.body.appendChild(feedback);

                setTimeout(() => {
                    feedback.remove();
                    button.textContent = originalText;
                    button.style.background = 'var(--primary)';
                }, 3000);
            }, 1500);
        }

        function markWordLearned(word) {
            const button = event.target;
            button.textContent = '✅ Learned!';
            button.style.background = '#155724';
            button.disabled = true;

            // Add to learned words tracking
            const learnedWords = JSON.parse(localStorage.getItem('learnedSpanishWords') || '[]');
            if (!learnedWords.includes(word)) {
                learnedWords.push(word);
                localStorage.setItem('learnedSpanishWords', JSON.stringify(learnedWords));
            }

            // Show success feedback
            const notification = document.createElement('div');
            notification.innerHTML = \`
                <div style="font-weight: bold;">🎉 Word Mastered!</div>
                <div style="font-size: 14px; margin-top: 5px;">"\${word.toUpperCase()}" added to your vocabulary!</div>
                <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">Total learned: \${learnedWords.length} words</div>
            \`;
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease-out';
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 4000);
        }

        function addToStudyList(word) {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '📚 Added!';
            button.style.background = '#6f42c1';

            // Add to study list
            const studyList = JSON.parse(localStorage.getItem('spanishStudyList') || '[]');
            if (!studyList.includes(word)) {
                studyList.push(word);
                localStorage.setItem('spanishStudyList', JSON.stringify(studyList));
            }

            // Show feedback
            const notification = document.createElement('div');
            notification.innerHTML = \`📖 "\${word.toUpperCase()}" added to study list! (\${studyList.length} words total)\`;
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #6f42c1; color: white; padding: 12px; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease-out';
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
                button.textContent = originalText;
                button.style.background = 'var(--secondary)';
            }, 2500);
        }

        function showWordDetails(word, importance, category) {
            // Create detailed word modal
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; justify-content: center; align-items: center;';

            const wordDetails = document.createElement('div');
            wordDetails.style.cssText = 'background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; position: relative; animation: fadeIn 0.3s ease-out;';

            const frequencyRank = Math.floor(Math.random() * 1000) + 1; // Simulate from frequency list
            const usageExamples = {
                'casa': ['Mi casa es pequeña', 'La casa tiene jardín', 'Vamos a casa'],
                'agua': ['Bebo mucha agua', 'El agua está fría', 'Agua mineral por favor'],
                'tiempo': ['No tengo tiempo', 'El tiempo está bueno', 'Tiempo de estudiar']
            };

            wordDetails.innerHTML = \`
                <button onclick="closeWordDetails()" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.1); border: none; color: #333; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">×</button>

                <h2 style="margin: 0 0 20px 0; text-align: center;">📖 Word Analysis: \${word.toUpperCase()}</h2>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px;">
                        <h4 style="margin: 0 0 5px 0;">📊 Importance Score</h4>
                        <div style="font-size: 24px; font-weight: bold; color: #FF6B35;">\${importance}/100</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px;">
                        <h4 style="margin: 0 0 5px 0;">🏆 Frequency Rank</h4>
                        <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">#\${frequencyRank}</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0;">📚 Category</h4>
                    <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px;">\${category.replace('_', ' ')}</span>
                </div>

                <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0;">💡 Usage Examples</h4>
                    \${(usageExamples[word] || ['Palabra muy importante', 'Úsala en conversaciones', 'Practica a diario']).map(example =>
                        \`<div style="margin: 5px 0; padding: 8px; background: rgba(255,255,255,0.3); border-radius: 5px; font-style: italic;">"\${example}"\`
                    ).join('')}
                </div>

                <div style="text-align: center;">
                    <button onclick="practiceWordAgain('\${word}')" style="background: #FF6B35; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px; margin-right: 10px;">🔄 Practice Again</button>
                    <button onclick="closeWordDetails()" style="background: rgba(0,0,0,0.1); color: #333; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px;">Close</button>
                </div>
            \`;

            modal.appendChild(wordDetails);
            document.body.appendChild(modal);

            // Close on outside click
            modal.onclick = (e) => { if (e.target === modal) closeWordDetails(); };
        }

        function closeWordDetails() {
            const modals = document.querySelectorAll('div[style*="position: fixed"]');
            modals.forEach(modal => {
                if (modal.style.zIndex === '2000') modal.remove();
            });
        }

        function practiceWordAgain(word) {
            closeWordDetails();
            // Simulate practice session
            const notification = document.createElement('div');
            notification.innerHTML = \`🎯 Starting practice session for "\${word.toUpperCase()}"...\`;
            notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #FF6B35; color: white; padding: 15px; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease-out';
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 3000);
        }

        function generateNewWordFeed() {
            const button = event.target;
            button.textContent = '🔄 Generating...';
            button.disabled = true;
            button.style.background = '#dc3545';

            // Simulate feed regeneration
            setTimeout(() => {
                // Refresh page to show new feed
                window.location.reload();
            }, 2000);
        }

        // Initialize word tracking system
        function initializeWordTracking() {
            const learnedWords = JSON.parse(localStorage.getItem('learnedSpanishWords') || '[]');
            const studyList = JSON.parse(localStorage.getItem('spanishStudyList') || '[]');

            console.log(\`📚 Spanish Learning Progress: \${learnedWords.length} words learned, \${studyList.length} in study list\`);

            // Show progress indicator if user has learned words
            if (learnedWords.length > 0) {
                const progressIndicator = document.createElement('div');
                progressIndicator.innerHTML = \`🎉 Welcome back! You've learned \${learnedWords.length} Spanish words!\`;
                progressIndicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #28a745; color: white; padding: 12px; border-radius: 8px; z-index: 1000; animation: slideIn 0.5s ease-out';
                document.body.appendChild(progressIndicator);

                setTimeout(() => progressIndicator.remove(), 5000);
            }
        }

        // PERFORMANCE MONITORING & OPTIMIZATION SYSTEM
        class TikTokPerformanceMonitor {
            constructor() {
                this.metrics = {
                    pageLoadTime: 0,
                    renderTime: 0,
                    interactionLatency: [],
                    animationFrames: 0,
                    scrollPerformance: []
                };
                this.observers = {};
                this.init();
            }

            init() {
                this.measurePageLoad();
                this.setupIntersectionObserver();
                this.setupPerformanceObserver();
                this.optimizeScrolling();
                this.preloadCriticalResources();
            }

            measurePageLoad() {
                const startTime = performance.now();
                document.addEventListener('DOMContentLoaded', () => {
                    this.metrics.pageLoadTime = performance.now() - startTime;
                    console.log(\`🚀 TikTok Page Load: \${this.metrics.pageLoadTime.toFixed(2)}ms\`);
                });

                window.addEventListener('load', () => {
                    this.metrics.renderTime = performance.now() - startTime;
                    console.log(\`🎨 TikTok Render Complete: \${this.metrics.renderTime.toFixed(2)}ms\`);
                    this.optimizeAfterLoad();
                });
            }

            setupIntersectionObserver() {
                // Optimize card animations based on viewport visibility
                this.observers.intersection = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.willChange = 'transform, opacity';
                            entry.target.classList.add('in-viewport');
                        } else {
                            entry.target.style.willChange = 'auto';
                            entry.target.classList.remove('in-viewport');
                        }
                    });
                }, {
                    rootMargin: '50px',
                    threshold: 0.1
                });

                // Observe all concept cards
                document.querySelectorAll('.concept, .tiktok-metric-card').forEach(card => {
                    this.observers.intersection.observe(card);
                });
            }

            setupPerformanceObserver() {
                if ('PerformanceObserver' in window) {
                    // Monitor frame drops and animation performance
                    const observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach(entry => {
                            if (entry.entryType === 'measure') {
                                console.log(\`📊 Performance: \${entry.name} - \${entry.duration.toFixed(2)}ms\`);
                            }
                        });
                    });
                    observer.observe({ entryTypes: ['measure', 'navigation'] });
                }
            }

            optimizeScrolling() {
                let ticking = false;
                let lastScrollTop = 0;

                const optimizedScroll = () => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollDelta = Math.abs(scrollTop - lastScrollTop);

                    // Reduce animation complexity during fast scrolling
                    if (scrollDelta > 10) {
                        document.body.classList.add('fast-scrolling');
                        clearTimeout(this.scrollTimeout);
                        this.scrollTimeout = setTimeout(() => {
                            document.body.classList.remove('fast-scrolling');
                        }, 150);
                    }

                    lastScrollTop = scrollTop;
                    ticking = false;
                };

                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(optimizedScroll);
                        ticking = true;
                    }
                }, { passive: true });
            }

            preloadCriticalResources() {
                // Preload next batch of word-focused content
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = '/regenerate';
                document.head.appendChild(link);
            }

            optimizeAfterLoad() {
                // Enable high-performance mode after initial load
                requestAnimationFrame(() => {
                    document.body.classList.add('performance-optimized');

                    // Optimize button interactions
                    this.optimizeButtonInteractions();

                    // Setup lazy loading for non-critical content
                    this.setupLazyLoading();
                });
            }

            optimizeButtonInteractions() {
                document.querySelectorAll('button').forEach(button => {
                    button.addEventListener('touchstart', (e) => {
                        e.target.style.transform = 'scale(0.95) translateZ(0)';
                    }, { passive: true });

                    button.addEventListener('touchend', (e) => {
                        e.target.style.transform = '';
                    }, { passive: true });
                });
            }

            setupLazyLoading() {
                // Lazy load non-critical dashboard sections
                const lazyElements = document.querySelectorAll('[data-lazy]');
                const lazyObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            element.classList.add('lazy-loaded');
                            lazyObserver.unobserve(element);
                        }
                    });
                });

                lazyElements.forEach(el => lazyObserver.observe(el));
            }

            measureInteraction(name, fn) {
                return (...args) => {
                    const start = performance.now();
                    const result = fn.apply(this, args);
                    const duration = performance.now() - start;
                    this.metrics.interactionLatency.push({ name, duration });

                    if (duration > 16) { // If slower than 60fps
                        console.warn(\`⚠️ Slow interaction: \${name} took \${duration.toFixed(2)}ms\`);
                    }

                    return result;
                };
            }

            getPerformanceReport() {
                return {
                    ...this.metrics,
                    avgInteractionLatency: this.metrics.interactionLatency.reduce((a, b) => a + b.duration, 0) / this.metrics.interactionLatency.length || 0,
                    slowInteractions: this.metrics.interactionLatency.filter(i => i.duration > 16).length
                };
            }
        }

        // ENHANCED SMOOTH SCROLLING SYSTEM
        class TikTokSmoothScroll {
            constructor() {
                this.setupSmoothScrolling();
                this.addScrollToTopButton();
            }

            setupSmoothScrolling() {
                // Enhanced smooth scrolling for all anchor links
                document.addEventListener('click', (e) => {
                    if (e.target.getAttribute('href')?.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(e.target.getAttribute('href'));
                        if (target) {
                            this.smoothScrollTo(target);
                        }
                    }
                });
            }

            smoothScrollTo(element) {
                const start = window.pageYOffset;
                const target = element.offsetTop - 100; // Account for header
                const distance = target - start;
                const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1s
                let startTime = null;

                const animateScroll = (currentTime) => {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);

                    // Easing function for smooth deceleration
                    const easeInOutCubic = progress < 0.5
                        ? 4 * progress * progress * progress
                        : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;

                    window.scrollTo(0, start + distance * easeInOutCubic);

                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    }
                };

                requestAnimationFrame(animateScroll);
            }

            addScrollToTopButton() {
                const scrollBtn = document.createElement('button');
                scrollBtn.innerHTML = '🚀';
                scrollBtn.className = 'scroll-to-top';
                scrollBtn.style.cssText = \`
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0;
                    transform: translateY(100px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1000;
                    box-shadow: var(--shadow-lg);
                \`;

                scrollBtn.addEventListener('click', () => {
                    this.smoothScrollTo(document.body);
                });

                document.body.appendChild(scrollBtn);

                // Show/hide based on scroll position
                window.addEventListener('scroll', () => {
                    if (window.pageYOffset > 300) {
                        scrollBtn.style.opacity = '1';
                        scrollBtn.style.transform = 'translateY(0)';
                    } else {
                        scrollBtn.style.opacity = '0';
                        scrollBtn.style.transform = 'translateY(100px)';
                    }
                }, { passive: true });
            }
        }

        // TIKTOK SWIPE GESTURES & TOUCH CONTROLS
        class TikTokGestureController {
            constructor() {
                this.startX = 0;
                this.startY = 0;
                this.currentX = 0;
                this.currentY = 0;
                this.isDragging = false;
                this.init();
            }

            init() {
                this.setupSwipeGestures();
                this.setupDoubleTapLike();
                this.setupLongPressShare();
                this.setupPinchZoom();
            }

            setupSwipeGestures() {
                document.addEventListener('touchstart', (e) => {
                    this.startX = e.touches[0].clientX;
                    this.startY = e.touches[0].clientY;
                }, { passive: true });

                document.addEventListener('touchmove', (e) => {
                    if (!this.isDragging) {
                        this.currentX = e.touches[0].clientX;
                        this.currentY = e.touches[0].clientY;
                    }
                }, { passive: true });

                document.addEventListener('touchend', (e) => {
                    this.handleSwipeGesture();
                }, { passive: true });
            }

            handleSwipeGesture() {
                const deltaX = this.currentX - this.startX;
                const deltaY = this.currentY - this.startY;
                const minSwipeDistance = 50;

                // Horizontal swipes
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.onSwipeRight();
                    } else {
                        this.onSwipeLeft();
                    }
                }

                // Vertical swipes
                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.onSwipeDown();
                    } else {
                        this.onSwipeUp();
                    }
                }
            }

            onSwipeRight() {
                // Navigate to previous content or show sidebar
                this.showSwipeFeedback('→ Previous', '#4CAF50');
                this.navigateToPreviousContent();
            }

            onSwipeLeft() {
                // Navigate to next content or hide sidebar
                this.showSwipeFeedback('← Next', '#FF6B35');
                this.navigateToNextContent();
            }

            onSwipeUp() {
                // Scroll to top or show more options
                this.showSwipeFeedback('↑ Scroll Up', '#667eea');
                this.scrollToTop();
            }

            onSwipeDown() {
                // Refresh content or scroll to bottom
                this.showSwipeFeedback('↓ Refresh', '#ffd700');
                this.refreshContent();
            }

            showSwipeFeedback(text, color) {
                const feedback = document.createElement('div');
                feedback.textContent = text;
                feedback.style.cssText = \`
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: \${color};
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    z-index: 9999;
                    pointer-events: none;
                    animation: swipeFeedback 0.8s ease-out forwards;
                \`;

                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 800);
            }

            setupDoubleTapLike() {
                let lastTap = 0;

                document.addEventListener('touchend', (e) => {
                    const currentTime = new Date().getTime();
                    const tapLength = currentTime - lastTap;

                    if (tapLength < 500 && tapLength > 0) {
                        // Double tap detected
                        this.handleDoubleTapLike(e);
                        e.preventDefault();
                    }
                    lastTap = currentTime;
                });
            }

            handleDoubleTapLike(e) {
                const target = e.target.closest('.concept');
                if (target) {
                    this.createHeartAnimation(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                    this.incrementLikeCount(target);
                }
            }

            createHeartAnimation(x, y) {
                const heart = document.createElement('div');
                heart.textContent = '❤️';
                heart.style.cssText = \`
                    position: fixed;
                    left: \${x - 15}px;
                    top: \${y - 15}px;
                    font-size: 30px;
                    pointer-events: none;
                    z-index: 9999;
                    animation: heartBurst 1.2s ease-out forwards;
                \`;

                document.body.appendChild(heart);
                setTimeout(() => heart.remove(), 1200);
            }

            setupLongPressShare() {
                let pressTimer;

                document.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => {
                        this.handleLongPressShare(e);
                    }, 800);
                });

                document.addEventListener('touchend', () => {
                    clearTimeout(pressTimer);
                });

                document.addEventListener('touchmove', () => {
                    clearTimeout(pressTimer);
                });
            }

            handleLongPressShare(e) {
                const target = e.target.closest('.concept');
                if (target) {
                    this.showShareOptions(target, e.touches[0].clientX, e.touches[0].clientY);
                    navigator.vibrate && navigator.vibrate(50); // Haptic feedback
                }
            }

            showShareOptions(element, x, y) {
                const shareMenu = document.createElement('div');
                shareMenu.innerHTML = \`
                    <div class="share-option" data-action="copy">📋 Copy</div>
                    <div class="share-option" data-action="twitter">🐦 Twitter</div>
                    <div class="share-option" data-action="whatsapp">💬 WhatsApp</div>
                    <div class="share-option" data-action="email">📧 Email</div>
                \`;
                shareMenu.style.cssText = \`
                    position: fixed;
                    left: \${x - 100}px;
                    top: \${y - 150}px;
                    background: rgba(0,0,0,0.9);
                    border-radius: 15px;
                    padding: 10px;
                    z-index: 9999;
                    animation: shareMenuAppear 0.3s ease-out;
                \`;

                document.body.appendChild(shareMenu);

                shareMenu.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    if (action) {
                        this.executeShareAction(action, element);
                        shareMenu.remove();
                    }
                });

                setTimeout(() => shareMenu.remove(), 5000);
            }

            setupPinchZoom() {
                let initialDistance = 0;
                let currentScale = 1;

                document.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                    }
                });

                document.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 2) {
                        e.preventDefault();
                        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                        const scale = currentDistance / initialDistance;
                        this.handlePinchZoom(scale);
                    }
                }, { passive: false });
            }

            getDistance(touch1, touch2) {
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                return Math.sqrt(dx * dx + dy * dy);
            }

            handlePinchZoom(scale) {
                const target = document.querySelector('.concept:hover') || document.querySelector('.concept');
                if (target && scale > 1.1) {
                    target.style.transform = \`scale(\${Math.min(scale, 1.5)}) var(--gpu-acceleration)\`;
                } else if (target) {
                    target.style.transform = 'scale(1) var(--gpu-acceleration)';
                }
            }

            // Navigation methods
            navigateToPreviousContent() {
                const current = document.querySelector('.concept.active') || document.querySelector('.concept');
                const previous = current?.previousElementSibling;
                if (previous) {
                    this.activateContent(previous);
                }
            }

            navigateToNextContent() {
                const current = document.querySelector('.concept.active') || document.querySelector('.concept');
                const next = current?.nextElementSibling;
                if (next) {
                    this.activateContent(next);
                }
            }

            activateContent(element) {
                document.querySelectorAll('.concept').forEach(el => el.classList.remove('active'));
                element.classList.add('active');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            scrollToTop() {
                smoothScroll?.smoothScrollTo(document.body);
            }

            refreshContent() {
                // Trigger content refresh
                const refreshBtn = document.querySelector('[onclick*="generateNewWordFeed"]');
                refreshBtn?.click();
            }

            incrementLikeCount(element) {
                const likeBtn = element.querySelector('.btn-like');
                if (likeBtn) {
                    likeBtn.classList.add('liked');
                    setTimeout(() => likeBtn.classList.remove('liked'), 1000);
                }
            }

            executeShareAction(action, element) {
                const content = element.querySelector('.concept')?.textContent || 'Spanish Learning Content';

                switch (action) {
                    case 'copy':
                        navigator.clipboard?.writeText(content);
                        this.showSwipeFeedback('📋 Copied!', '#4CAF50');
                        break;
                    case 'twitter':
                        window.open(\`https://twitter.com/intent/tweet?text=\${encodeURIComponent(content)}\`);
                        break;
                    case 'whatsapp':
                        window.open(\`https://wa.me/?text=\${encodeURIComponent(content)}\`);
                        break;
                    case 'email':
                        window.open(\`mailto:?subject=Spanish Learning&body=\${encodeURIComponent(content)}\`);
                        break;
                }
            }
        }

        // Add gesture-specific CSS animations
        const gestureStyles = document.createElement('style');
        gestureStyles.textContent = \`
            @keyframes swipeFeedback {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }

            @keyframes heartBurst {
                0% {
                    opacity: 1;
                    transform: scale(0.5) rotate(0deg);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.5) rotate(180deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.8) rotate(360deg) translateY(-50px);
                }
            }

            @keyframes shareMenuAppear {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .share-option {
                padding: 8px 12px;
                color: white;
                border-radius: 8px;
                margin: 2px 0;
                cursor: pointer;
                transition: background 0.2s;
            }

            .share-option:hover {
                background: rgba(255,255,255,0.1);
            }

            .concept.active {
                border-color: var(--like-color);
                box-shadow: 0 0 20px rgba(255, 45, 85, 0.3);
            }
        \`;
        document.head.appendChild(gestureStyles);

        // TIKTOK PARTICLE SYSTEM & VISUAL EFFECTS
        class TikTokParticleSystem {
            constructor() {
                this.particles = [];
                this.canvas = this.createCanvas();
                this.ctx = this.canvas.getContext('2d');
                this.init();
            }

            createCanvas() {
                const canvas = document.createElement('canvas');
                canvas.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9998;
                \`;
                document.body.appendChild(canvas);
                this.resizeCanvas(canvas);
                window.addEventListener('resize', () => this.resizeCanvas(canvas));
                return canvas;
            }

            resizeCanvas(canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            init() {
                this.animate();
            }

            createParticle(x, y, type = 'like') {
                const particle = {
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -Math.random() * 3 - 1,
                    life: 1,
                    decay: 0.02,
                    size: Math.random() * 6 + 4,
                    type: type,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                };

                this.particles.push(particle);
            }

            createHeartBurst(x, y) {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const velocity = 2 + Math.random() * 2;
                    const particle = {
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity - 1,
                        life: 1,
                        decay: 0.015,
                        size: 12 + Math.random() * 6,
                        type: 'heart',
                        rotation: 0,
                        rotationSpeed: (Math.random() - 0.5) * 0.3
                    };
                    this.particles.push(particle);
                }
            }

            createSparkleEffect(x, y) {
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const velocity = 1 + Math.random() * 3;
                    const particle = {
                        x: x + Math.random() * 20 - 10,
                        y: y + Math.random() * 20 - 10,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity,
                        life: 1,
                        decay: 0.02,
                        size: 3 + Math.random() * 4,
                        type: 'sparkle',
                        rotation: 0,
                        rotationSpeed: Math.random() * 0.5
                    };
                    this.particles.push(particle);
                }
            }

            createWordMasteryEffect(x, y) {
                // Create celebratory particles for word learning
                for (let i = 0; i < 15; i++) {
                    const angle = (i / 15) * Math.PI * 2;
                    const velocity = 2 + Math.random() * 3;
                    const particle = {
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity - 2,
                        life: 1,
                        decay: 0.012,
                        size: 8 + Math.random() * 8,
                        type: 'star',
                        rotation: 0,
                        rotationSpeed: (Math.random() - 0.5) * 0.4,
                        color: \`hsl(\${Math.random() * 60 + 30}, 100%, 60%)\`
                    };
                    this.particles.push(particle);
                }
            }

            update() {
                this.particles = this.particles.filter(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.1; // Gravity
                    particle.rotation += particle.rotationSpeed;
                    particle.life -= particle.decay;
                    particle.size *= 0.99;

                    return particle.life > 0 && particle.size > 0.5;
                });
            }

            render() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.particles.forEach(particle => {
                    this.ctx.save();
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.rotation);
                    this.ctx.globalAlpha = particle.life;

                    const size = particle.size;

                    switch (particle.type) {
                        case 'heart':
                            this.ctx.fillStyle = '#ff2d55';
                            this.ctx.font = \`\${size}px serif\`;
                            this.ctx.textAlign = 'center';
                            this.ctx.fillText('❤️', 0, 0);
                            break;

                        case 'sparkle':
                            this.ctx.fillStyle = '#ffd700';
                            this.ctx.beginPath();
                            this.ctx.moveTo(0, -size);
                            this.ctx.lineTo(size * 0.3, -size * 0.3);
                            this.ctx.lineTo(size, 0);
                            this.ctx.lineTo(size * 0.3, size * 0.3);
                            this.ctx.lineTo(0, size);
                            this.ctx.lineTo(-size * 0.3, size * 0.3);
                            this.ctx.lineTo(-size, 0);
                            this.ctx.lineTo(-size * 0.3, -size * 0.3);
                            this.ctx.closePath();
                            this.ctx.fill();
                            break;

                        case 'star':
                            this.ctx.fillStyle = particle.color || '#ffd700';
                            this.ctx.font = \`\${size}px serif\`;
                            this.ctx.textAlign = 'center';
                            this.ctx.fillText('⭐', 0, 0);
                            break;

                        case 'like':
                        default:
                            this.ctx.fillStyle = '#ff6b35';
                            this.ctx.beginPath();
                            this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                            this.ctx.fill();
                            break;
                    }

                    this.ctx.restore();
                });
            }

            animate() {
                this.update();
                this.render();
                requestAnimationFrame(() => this.animate());
            }

            triggerEffect(type, x, y) {
                switch (type) {
                    case 'like':
                        this.createHeartBurst(x, y);
                        break;
                    case 'sparkle':
                        this.createSparkleEffect(x, y);
                        break;
                    case 'wordMastery':
                        this.createWordMasteryEffect(x, y);
                        break;
                    default:
                        this.createParticle(x, y);
                }
            }
        }

        // ENHANCED VISUAL FEEDBACK SYSTEM
        class TikTokVisualFeedback {
            constructor() {
                this.feedbackQueue = [];
                this.init();
            }

            init() {
                this.setupButtonFeedback();
                this.setupWordProgressFeedback();
                this.setupScrollFeedback();
            }

            setupButtonFeedback() {
                document.addEventListener('click', (e) => {
                    const button = e.target.closest('button');
                    if (button) {
                        this.createButtonRipple(button, e.clientX, e.clientY);

                        if (button.classList.contains('btn-like')) {
                            this.handleLikeEffect(e.clientX, e.clientY);
                        } else if (button.classList.contains('btn-share')) {
                            this.handleShareEffect(e.clientX, e.clientY);
                        } else if (button.classList.contains('btn-save')) {
                            this.handleSaveEffect(e.clientX, e.clientY);
                        }
                    }
                });
            }

            createButtonRipple(button, x, y) {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);

                ripple.style.cssText = \`
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.6);
                    transform: scale(0);
                    animation: rippleEffect 0.6s linear;
                    width: \${size}px;
                    height: \${size}px;
                    left: \${x - rect.left - size / 2}px;
                    top: \${y - rect.top - size / 2}px;
                    pointer-events: none;
                \`;

                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }

            handleLikeEffect(x, y) {
                // Trigger particle system
                particleSystem?.triggerEffect('like', x, y);

                // Create floating heart
                this.createFloatingEmoji('❤️', x, y, '#ff2d55');

                // Show like count animation
                this.showCountAnimation('+1', x, y + 30, '#ff2d55');
            }

            handleShareEffect(x, y) {
                particleSystem?.triggerEffect('sparkle', x, y);
                this.createFloatingEmoji('📤', x, y, '#007bff');
                this.showCountAnimation('Shared!', x, y + 30, '#007bff');
            }

            handleSaveEffect(x, y) {
                this.createFloatingEmoji('💾', x, y, '#34c759');
                this.showCountAnimation('Saved!', x, y + 30, '#34c759');
            }

            createFloatingEmoji(emoji, x, y, color) {
                const element = document.createElement('div');
                element.textContent = emoji;
                element.style.cssText = \`
                    position: fixed;
                    left: \${x - 15}px;
                    top: \${y - 15}px;
                    font-size: 30px;
                    pointer-events: none;
                    z-index: 9999;
                    animation: floatingEmoji 2s ease-out forwards;
                \`;

                document.body.appendChild(element);
                setTimeout(() => element.remove(), 2000);
            }

            showCountAnimation(text, x, y, color) {
                const element = document.createElement('div');
                element.textContent = text;
                element.style.cssText = \`
                    position: fixed;
                    left: \${x - 25}px;
                    top: \${y}px;
                    color: \${color};
                    font-weight: bold;
                    font-size: 16px;
                    pointer-events: none;
                    z-index: 9999;
                    animation: countUp 1.5s ease-out forwards;
                \`;

                document.body.appendChild(element);
                setTimeout(() => element.remove(), 1500);
            }

            setupWordProgressFeedback() {
                // Enhanced feedback for Spanish word learning
                document.addEventListener('click', (e) => {
                    if (e.target.matches('[onclick*="markWordLearned"]')) {
                        const rect = e.target.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        particleSystem?.triggerEffect('wordMastery', centerX, centerY);
                        this.showWordMasteryFeedback(centerX, centerY);
                    }
                });
            }

            showWordMasteryFeedback(x, y) {
                const messages = ['¡Excelente!', '¡Fantástico!', '¡Perfecto!', '¡Increíble!'];
                const message = messages[Math.floor(Math.random() * messages.length)];

                const element = document.createElement('div');
                element.innerHTML = \`
                    <div style="font-size: 24px; font-weight: bold; color: #ffd700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        🏆 \${message}
                    </div>
                    <div style="font-size: 14px; color: #4CAF50; margin-top: 5px;">
                        Word mastered! Keep going! 🚀
                    </div>
                \`;
                element.style.cssText = \`
                    position: fixed;
                    left: \${x - 100}px;
                    top: \${y - 80}px;
                    text-align: center;
                    pointer-events: none;
                    z-index: 9999;
                    animation: masteryBurst 2.5s ease-out forwards;
                \`;

                document.body.appendChild(element);
                setTimeout(() => element.remove(), 2500);
            }

            setupScrollFeedback() {
                let scrollIndicator = null;

                window.addEventListener('scroll', () => {
                    if (!scrollIndicator) {
                        scrollIndicator = this.createScrollIndicator();
                    }

                    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                    this.updateScrollIndicator(scrollIndicator, scrollPercent);
                }, { passive: true });
            }

            createScrollIndicator() {
                const indicator = document.createElement('div');
                indicator.style.cssText = \`
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 4px;
                    height: 100vh;
                    background: rgba(255,255,255,0.1);
                    z-index: 9999;
                    pointer-events: none;
                \`;

                const progress = document.createElement('div');
                progress.style.cssText = \`
                    width: 100%;
                    height: 0%;
                    background: var(--primary);
                    transition: height 0.1s ease-out;
                    border-radius: 2px;
                \`;

                indicator.appendChild(progress);
                document.body.appendChild(indicator);

                return { indicator, progress };
            }

            updateScrollIndicator(scrollIndicator, percent) {
                if (scrollIndicator?.progress) {
                    scrollIndicator.progress.style.height = \`\${Math.min(percent, 100)}%\`;
                }
            }
        }

        // Add visual feedback CSS animations
        const visualStyles = document.createElement('style');
        visualStyles.textContent = \`
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            @keyframes floatingEmoji {
                0% {
                    transform: translateY(0) scale(0.5);
                    opacity: 1;
                }
                50% {
                    transform: translateY(-30px) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-60px) scale(0.8);
                    opacity: 0;
                }
            }

            @keyframes countUp {
                0% {
                    transform: translateY(0) scale(0.5);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-40px) scale(1);
                    opacity: 0;
                }
            }

            @keyframes masteryBurst {
                0% {
                    transform: scale(0.3);
                    opacity: 0;
                }
                20% {
                    transform: scale(1.2);
                    opacity: 1;
                }
                80% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(0.8);
                    opacity: 0;
                }
            }
        \`;
        document.head.appendChild(visualStyles);

        // TIKTOK INFINITE SCROLL & CONTENT LOADING
        class TikTokInfiniteScroll {
            constructor() {
                this.isLoading = false;
                this.hasMore = true;
                this.currentPage = 1;
                this.threshold = 200; // pixels from bottom
                this.init();
            }

            init() {
                this.setupInfiniteScroll();
                this.setupContentPreloader();
                this.setupLoadingIndicators();
            }

            setupInfiniteScroll() {
                let scrollTimeout;

                window.addEventListener('scroll', () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        this.checkScrollPosition();
                    }, 100);
                }, { passive: true });
            }

            checkScrollPosition() {
                if (this.isLoading || !this.hasMore) return;

                const scrollPosition = window.innerHeight + window.scrollY;
                const documentHeight = document.documentElement.offsetHeight;

                if (documentHeight - scrollPosition < this.threshold) {
                    this.loadMoreContent();
                }
            }

            async loadMoreContent() {
                if (this.isLoading) return;

                this.isLoading = true;
                this.showLoadingIndicator();

                try {
                    // Simulate content loading with progressive enhancement
                    await this.simulateContentLoad();
                    this.appendNewContent();
                    this.currentPage++;

                    // Update performance metrics
                    performanceMonitor?.measureInteraction('content_load', () => {
                        console.log(\`📄 Loaded page \${this.currentPage}\`);
                    })();

                } catch (error) {
                    console.error('Content loading failed:', error);
                    this.showErrorFeedback();
                } finally {
                    this.isLoading = false;
                    this.hideLoadingIndicator();
                }
            }

            async simulateContentLoad() {
                return new Promise(resolve => {
                    setTimeout(resolve, 800 + Math.random() * 400); // 0.8-1.2s realistic load time
                });
            }

            appendNewContent() {
                const conceptsContainer = document.querySelector('.concepts');
                if (!conceptsContainer) return;

                // Generate new Spanish learning content
                const newContent = this.generateNewSpanishContent();

                newContent.forEach((content, index) => {
                    const conceptCard = this.createConceptCard(content, index);
                    conceptCard.style.opacity = '0';
                    conceptCard.style.transform = 'translateY(50px)';

                    conceptsContainer.appendChild(conceptCard);

                    // Animate in with stagger
                    setTimeout(() => {
                        conceptCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        conceptCard.style.opacity = '1';
                        conceptCard.style.transform = 'translateY(0)';
                    }, index * 100);
                });

                // Setup observers for new content
                performanceMonitor?.setupIntersectionObserver();
            }

            generateNewSpanishContent() {
                const contentTypes = ['objects_comedy', 'historical_vlog', 'cultural_humor', 'character_interaction'];
                const spanishWords = ['mesa', 'silla', 'libro', 'agua', 'casa', 'tiempo', 'familia', 'comida'];

                return Array.from({ length: 3 }, (_, i) => ({
                    id: \`infinite_\${Date.now()}_\${i}\`,
                    type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
                    focusWord: spanishWords[Math.floor(Math.random() * spanishWords.length)],
                    viralPotential: 70 + Math.random() * 30,
                    goldenStandard: { rating: Math.random() > 0.7 ? 'GOLDEN' : 'GOOD' },
                    concept: \`Generated infinite scroll content focusing on Spanish learning\`,
                    hook: \`Interactive \${spanishWords[Math.floor(Math.random() * spanishWords.length)]} learning experience\`,
                    spanishFocus: 'vocabulary, pronunciation, cultural context'
                }));
            }

            createConceptCard(content, index) {
                const card = document.createElement('div');
                card.className = \`concept \${content.viralPotential >= 80 ? 'high-viral' : ''} \${content.goldenStandard.rating === 'GOLDEN' ? 'golden-standard' : ''}\`;
                card.setAttribute('data-concept-id', content.id);

                card.innerHTML = \`
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                        <h3 style="margin: 0; color: #1a1a1a;" class="concept-title">
                            📖 Focus Word: <span class="word-focus-highlight">\${content.focusWord.toUpperCase()}</span>
                        </h3>
                        <div class="viral-rank" style="background: var(--primary); color: white; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius); font-size: 12px; font-weight: 600;">
                            🔥 \${Math.round(content.viralPotential)}% viral
                        </div>
                    </div>
                    <p><strong>🎬 Concept:</strong> \${content.concept}</p>
                    <p><strong>🎯 Hook:</strong> \${content.hook}</p>
                    <p><strong>📚 Spanish Focus:</strong> \${content.spanishFocus}</p>
                    <div class="engagement-buttons" style="margin-top: var(--space-lg);">
                        <button class="btn-like" onclick="likeContent('\${content.id}')">❤️ Like</button>
                        <button class="btn-share" onclick="shareContent('\${content.id}')">📤 Share</button>
                        <button class="btn-save" onclick="saveContent('\${content.id}')">💾 Save</button>
                        <button onclick="markWordLearned('\${content.focusWord}')" style="background: var(--success); color: white;">✅ Learned</button>
                    </div>
                \`;

                return card;
            }

            showLoadingIndicator() {
                const loader = document.createElement('div');
                loader.id = 'infinite-loader';
                loader.innerHTML = \`
                    <div style="text-align: center; padding: var(--space-xl); color: #666;">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto var(--space-md);"></div>
                        <p>Loading more Spanish content...</p>
                    </div>
                \`;

                document.querySelector('.concepts')?.appendChild(loader);
            }

            hideLoadingIndicator() {
                document.getElementById('infinite-loader')?.remove();
            }

            showErrorFeedback() {
                const error = document.createElement('div');
                error.style.cssText = \`
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #ff4444;
                    color: white;
                    padding: var(--space-md);
                    border-radius: var(--radius);
                    z-index: 9999;
                    animation: slideIn 0.3s ease-out;
                \`;
                error.textContent = '⚠️ Failed to load content. Swipe down to retry.';

                document.body.appendChild(error);
                setTimeout(() => error.remove(), 3000);
            }

            setupContentPreloader() {
                // Preload next batch when user is 50% through current content
                const preloadObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.target.classList.contains('concept')) {
                            const concepts = document.querySelectorAll('.concept');
                            const currentIndex = Array.from(concepts).indexOf(entry.target);
                            const totalConcepts = concepts.length;

                            if (currentIndex / totalConcepts > 0.5 && !this.isLoading) {
                                // Preload next batch
                                this.preloadNextBatch();
                            }
                        }
                    });
                }, { threshold: 0.5 });

                document.querySelectorAll('.concept').forEach(concept => {
                    preloadObserver.observe(concept);
                });
            }

            preloadNextBatch() {
                // Preload resources for smooth experience
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = \`/api/content?page=\${this.currentPage + 1}\`;
                document.head.appendChild(link);
            }

            setupLoadingIndicators() {
                // Add loading skeleton styles
                const skeletonStyles = document.createElement('style');
                skeletonStyles.textContent = \`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    .content-skeleton {
                        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: loadingSkeleton 1.5s ease-in-out infinite;
                        border-radius: var(--radius);
                    }

                    .skeleton-title {
                        height: 24px;
                        width: 60%;
                        margin-bottom: var(--space-md);
                    }

                    .skeleton-text {
                        height: 16px;
                        width: 100%;
                        margin-bottom: var(--space-sm);
                    }

                    .skeleton-button {
                        height: 40px;
                        width: 80px;
                        margin-right: var(--space-sm);
                    }
                \`;
                document.head.appendChild(skeletonStyles);
            }
        }

        // SPANISH LEARNING GAMIFICATION SYSTEM
        class SpanishLearningGamification {
            constructor() {
                this.userStats = this.loadUserStats();
                this.achievements = this.initializeAchievements();
                this.streaks = this.loadStreaks();
                this.init();
            }

            init() {
                this.setupProgressTracking();
                this.setupAchievementSystem();
                this.setupStreakSystem();
                this.setupLevelProgression();
                this.displayCurrentStats();
            }

            loadUserStats() {
                return JSON.parse(localStorage.getItem('spanishLearningStats') || JSON.stringify({
                    wordsLearned: 0,
                    totalScore: 0,
                    currentLevel: 1,
                    experiencePoints: 0,
                    streakDays: 0,
                    lastActiveDate: null,
                    achievements: [],
                    favoriteWords: [],
                    weeklyGoal: 25,
                    monthlyGoal: 100
                }));
            }

            saveUserStats() {
                localStorage.setItem('spanishLearningStats', JSON.stringify(this.userStats));
            }

            setupProgressTracking() {
                // Track word learning progress
                document.addEventListener('click', (e) => {
                    if (e.target.matches('[onclick*="markWordLearned"]')) {
                        const word = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                        this.addWordProgress(word);
                    }
                });

                // Track engagement actions
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-like')) {
                        this.addExperience(5, 'like');
                    } else if (e.target.classList.contains('btn-share')) {
                        this.addExperience(10, 'share');
                    } else if (e.target.classList.contains('btn-save')) {
                        this.addExperience(3, 'save');
                    }
                });
            }

            addWordProgress(word) {
                this.userStats.wordsLearned++;
                this.userStats.experiencePoints += 25;
                this.userStats.totalScore += 100;

                if (!this.userStats.favoriteWords.includes(word)) {
                    this.userStats.favoriteWords.push(word);
                }

                this.checkLevelUp();
                this.checkAchievements();
                this.updateStreak();
                this.saveUserStats();

                // Show gamification feedback
                this.showWordMasteryReward(word);
                this.updateProgressDisplays();
            }

            addExperience(points, action) {
                this.userStats.experiencePoints += points;
                this.userStats.totalScore += points * 2;

                this.checkLevelUp();
                this.saveUserStats();

                // Show experience gain
                this.showExperienceGain(points, action);
            }

            checkLevelUp() {
                const requiredXP = this.userStats.currentLevel * 100;
                if (this.userStats.experiencePoints >= requiredXP) {
                    this.userStats.currentLevel++;
                    this.userStats.experiencePoints -= requiredXP;
                    this.showLevelUpCelebration();
                }
            }

            showWordMasteryReward(word) {
                // Create celebration with Spanish phrases
                const celebrations = [
                    { text: '¡Felicidades!', translation: 'Congratulations!' },
                    { text: '¡Excelente trabajo!', translation: 'Excellent work!' },
                    { text: '¡Sigue así!', translation: 'Keep it up!' },
                    { text: '¡Qué bueno!', translation: 'How good!' }
                ];

                const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];

                const reward = document.createElement('div');
                reward.innerHTML = \`
                    <div style="background: var(--golden); color: #333; padding: var(--space-lg); border-radius: var(--radius); text-align: center; box-shadow: var(--shadow-lg);">
                        <div style="font-size: 32px; margin-bottom: var(--space-sm);">🏆</div>
                        <div style="font-size: 20px; font-weight: bold; margin-bottom: var(--space-xs);">\${celebration.text}</div>
                        <div style="font-size: 14px; opacity: 0.8; margin-bottom: var(--space-sm);">(\${celebration.translation})</div>
                        <div style="font-size: 16px; color: var(--primary);">Word "\${word}" mastered!</div>
                        <div style="margin-top: var(--space-md);">
                            <span class="vocabulary-achievement">+25 XP</span>
                            <span class="vocabulary-achievement" style="margin-left: var(--space-sm);">+100 Score</span>
                        </div>
                    </div>
                \`;

                reward.style.cssText = \`
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    animation: masteryReward 3s ease-out forwards;
                    pointer-events: none;
                \`;

                document.body.appendChild(reward);
                setTimeout(() => reward.remove(), 3000);

                // Trigger particle celebration
                particleSystem?.triggerEffect('wordMastery', window.innerWidth / 2, window.innerHeight / 2);
            }

            showLevelUpCelebration() {
                const levelUp = document.createElement('div');
                levelUp.innerHTML = \`
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: var(--space-2xl); border-radius: var(--radius); text-align: center; box-shadow: var(--shadow-xl);">
                        <div style="font-size: 48px; margin-bottom: var(--space-md);">🎉</div>
                        <div style="font-size: 28px; font-weight: bold; margin-bottom: var(--space-sm);">¡LEVEL UP!</div>
                        <div style="font-size: 20px; margin-bottom: var(--space-md);">Level \${this.userStats.currentLevel}</div>
                        <div style="font-size: 16px; opacity: 0.9;">You're becoming a Spanish master!</div>
                        <div style="margin-top: var(--space-lg);">
                            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: var(--space-md) var(--space-xl); border-radius: var(--radius); cursor: pointer;">
                                ¡Continuar! (Continue!)
                            </button>
                        </div>
                    </div>
                \`;

                levelUp.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: levelUpAppear 0.5s ease-out;
                \`;

                document.body.appendChild(levelUp);
            }

            setupStreakSystem() {
                const today = new Date().toDateString();
                const lastActive = this.userStats.lastActiveDate;

                if (lastActive !== today) {
                    if (this.isConsecutiveDay(lastActive)) {
                        this.userStats.streakDays++;
                    } else {
                        this.userStats.streakDays = 1;
                    }
                    this.userStats.lastActiveDate = today;
                    this.saveUserStats();
                }

                this.displayStreakIndicator();
            }

            isConsecutiveDay(lastActive) {
                if (!lastActive) return false;
                const last = new Date(lastActive);
                const today = new Date();
                const diffTime = today - last;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays === 1;
            }

            displayStreakIndicator() {
                if (this.userStats.streakDays >= 3) {
                    const streak = document.createElement('div');
                    streak.className = 'learning-streak';
                    streak.textContent = \`\${this.userStats.streakDays} day streak!\`;
                    streak.style.cssText = \`
                        position: fixed;
                        top: var(--space-lg);
                        left: var(--space-lg);
                        z-index: 1000;
                        animation: streakPulse 2s ease-in-out infinite;
                    \`;

                    document.body.appendChild(streak);
                }
            }

            displayCurrentStats() {
                // Add floating stats panel
                const statsPanel = document.createElement('div');
                statsPanel.innerHTML = \`
                    <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: var(--space-md); border-radius: var(--radius); box-shadow: var(--shadow-md); font-size: 12px;">
                        <div style="display: flex; gap: var(--space-md); align-items: center;">
                            <div><strong>Level:</strong> \${this.userStats.currentLevel}</div>
                            <div><strong>XP:</strong> \${this.userStats.experiencePoints}</div>
                            <div><strong>Words:</strong> \${this.userStats.wordsLearned}</div>
                            <div><strong>Score:</strong> \${this.userStats.totalScore.toLocaleString()}</div>
                        </div>
                        <div style="margin-top: var(--space-sm);">
                            <div class="learning-progress-bar">
                                <div class="learning-progress-fill" style="width: \${(this.userStats.experiencePoints / (this.userStats.currentLevel * 100)) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                \`;

                statsPanel.style.cssText = \`
                    position: fixed;
                    bottom: var(--space-lg);
                    left: var(--space-lg);
                    z-index: 1000;
                \`;

                document.body.appendChild(statsPanel);
            }

            initializeAchievements() {
                return [
                    { id: 'first_word', name: 'Primera Palabra', description: 'Learn your first Spanish word', threshold: 1, type: 'words' },
                    { id: 'vocabulary_builder', name: 'Constructor de Vocabulario', description: 'Learn 10 Spanish words', threshold: 10, type: 'words' },
                    { id: 'word_master', name: 'Maestro de Palabras', description: 'Learn 50 Spanish words', threshold: 50, type: 'words' },
                    { id: 'streak_starter', name: 'Inicio de Racha', description: 'Maintain a 7-day learning streak', threshold: 7, type: 'streak' },
                    { id: 'social_learner', name: 'Aprendiz Social', description: 'Share 5 learning moments', threshold: 5, type: 'shares' }
                ];
            }
        }

        // TIKTOK CONTENT OPTIMIZER
        class TikTokContentOptimizer {
            constructor() {
                this.contentCache = new Map();
                this.qualityThreshold = 75;
                this.init();
            }

            init() {
                this.setupContentOptimization();
                this.setupImageOptimization();
                this.setupFontOptimization();
                this.setupMemoryManagement();
            }

            setupContentOptimization() {
                // Optimize content rendering based on viewport
                const contentObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.optimizeContentForViewport(entry.target);
                        } else {
                            this.deoptimizeContentOutsideViewport(entry.target);
                        }
                    });
                }, {
                    rootMargin: '100px',
                    threshold: 0.1
                });

                document.querySelectorAll('.concept').forEach(concept => {
                    contentObserver.observe(concept);
                });
            }

            optimizeContentForViewport(element) {
                // Enable high-quality rendering for visible content
                element.style.willChange = 'transform, opacity';
                element.style.contain = 'layout style paint';

                // Preload related content
                this.preloadRelatedContent(element);
            }

            deoptimizeContentOutsideViewport(element) {
                // Reduce resource usage for non-visible content
                element.style.willChange = 'auto';
                element.style.contain = 'none';
            }

            preloadRelatedContent(element) {
                const wordFocus = element.querySelector('.word-focus-highlight')?.textContent;
                if (wordFocus && !this.contentCache.has(wordFocus)) {
                    // Cache related Spanish content
                    this.contentCache.set(wordFocus, {
                        examples: this.generateWordExamples(wordFocus),
                        pronunciation: this.generatePronunciationData(wordFocus),
                        usage: this.generateUsageContexts(wordFocus)
                    });
                }
            }

            generateWordExamples(word) {
                const examples = {
                    'casa': ['Mi casa es grande', 'La casa tiene jardín', 'Vamos a casa'],
                    'agua': ['Bebo agua fría', 'El agua está limpia', 'Necesito más agua'],
                    'tiempo': ['No tengo tiempo', 'El tiempo pasa rápido', 'Hace buen tiempo'],
                    'amor': ['El amor es hermoso', 'Siento amor por ti', 'Amor verdadero'],
                    'vida': ['La vida es bella', 'Amo mi vida', 'Vida nueva'],
                    'feliz': ['Soy muy feliz', 'Día feliz', 'Momento feliz'],
                    'español': ['Hablo español', 'Aprendo español', 'Español es divertido'],
                    'amigo': ['Mi mejor amigo', 'Amigo verdadero', 'Buenos amigos'],
                    'familia': ['Mi familia hermosa', 'Tiempo en familia', 'Familia unida'],
                    'comida': ['Comida deliciosa', 'Me gusta la comida', 'Comida española']
                };
                return examples[word.toLowerCase()] || ['Ejemplo con ' + word, 'Uso de ' + word, 'Práctica con ' + word];
            }

            generatePronunciationData(word) {
                const pronunciations = {
                    'casa': 'KAH-sah',
                    'agua': 'AH-gwah',
                    'tiempo': 'tee-EHM-poh',
                    'amor': 'ah-MOHR',
                    'vida': 'VEE-dah',
                    'feliz': 'feh-LEES',
                    'español': 'es-pahn-YOHL',
                    'amigo': 'ah-MEE-goh',
                    'familia': 'fah-MEE-lee-ah',
                    'comida': 'koh-MEE-dah'
                };
                return pronunciations[word.toLowerCase()] || word.toUpperCase();
            }

            generateUsageContexts(word) {
                const contexts = {
                    'casa': ['hogar, vivienda', 'arquitectura', 'vida familiar'],
                    'agua': ['bebida esencial', 'naturaleza', 'salud'],
                    'tiempo': ['concepto temporal', 'clima', 'planificación'],
                    'amor': ['sentimientos', 'relaciones', 'emociones'],
                    'vida': ['existencia', 'experiencias', 'filosofía'],
                    'feliz': ['emociones positivas', 'estado de ánimo', 'bienestar'],
                    'español': ['idioma', 'cultura', 'comunicación'],
                    'amigo': ['relaciones sociales', 'amistad', 'compañía'],
                    'familia': ['parentesco', 'lazos familiares', 'hogar'],
                    'comida': ['alimentación', 'cultura gastronómica', 'nutrición']
                };
                return contexts[word.toLowerCase()] || ['uso general', 'vocabulario básico', 'conversación'];
            }

            setupImageOptimization() {
                // Optimize images for better performance
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    img.loading = 'lazy';
                    img.style.willChange = 'auto';

                    // Add intersection observer for progressive loading
                    const imageObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target;
                                img.style.filter = 'blur(0px)';
                                img.style.opacity = '1';
                                imageObserver.unobserve(img);
                            }
                        });
                    });

                    imageObserver.observe(img);
                });
            }

            setupFontOptimization() {
                // Preload critical fonts for Spanish characters
                const fontPreload = document.createElement('link');
                fontPreload.rel = 'preload';
                fontPreload.as = 'font';
                fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
                fontPreload.crossOrigin = 'anonymous';
                document.head.appendChild(fontPreload);

                // Optimize font rendering
                document.documentElement.style.fontDisplay = 'swap';
                document.documentElement.style.textRendering = 'optimizeLegibility';
            }

            setupMemoryManagement() {
                // Clean up cache periodically
                setInterval(() => {
                    if (this.contentCache.size > 50) {
                        const oldestEntries = Array.from(this.contentCache.entries()).slice(0, 20);
                        oldestEntries.forEach(([key]) => this.contentCache.delete(key));
                        console.log('🧹 Cache cleaned: removed', oldestEntries.length, 'entries');
                    }
                }, 60000); // Clean every minute
            }
        }

        // Add gamification styles
        const gamificationStyles = document.createElement('style');
        gamificationStyles.textContent = \`
            @keyframes masteryReward {
                0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            }

            @keyframes levelUpAppear {
                0% { opacity: 0; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
            }

            @keyframes streakPulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
        \`;
        document.head.appendChild(gamificationStyles);

        // Initialize all systems
        let performanceMonitor, smoothScroll, gestureController, particleSystem, visualFeedback, infiniteScroll, gamificationSystem, contentOptimizer;

        // Run initialization and metrics update when page loads
        setTimeout(() => {
            updateViralMetrics();
            initializeWordTracking();

            // Initialize performance systems
            performanceMonitor = new TikTokPerformanceMonitor();
            smoothScroll = new TikTokSmoothScroll();
            gestureController = new TikTokGestureController();

            // Initialize particle effects and visual feedback
            particleSystem = new TikTokParticleSystem();
            visualFeedback = new TikTokVisualFeedback();

            // Initialize infinite scroll and content optimization
            infiniteScroll = new TikTokInfiniteScroll();
            gamificationSystem = new SpanishLearningGamification();
            contentOptimizer = new TikTokContentOptimizer();

            // Log performance report after 3 seconds
            setTimeout(() => {
                const report = performanceMonitor.getPerformanceReport();
                console.log('📊 TikTok Performance Report:', report);

                // Additional performance optimizations
                optimizeForSmoothScrolling();
                enableHardwareAcceleration();
                setupAdvancedCaching();
            }, 3000);

            function optimizeForSmoothScrolling() {
                // Enable smooth scrolling for the entire page
                document.documentElement.style.scrollBehavior = 'smooth';

                // Optimize scroll performance with requestAnimationFrame
                let isScrolling = false;
                window.addEventListener('scroll', () => {
                    if (!isScrolling) {
                        requestAnimationFrame(() => {
                            // Update visible content efficiently
                            updateVisibleContent();
                            isScrolling = false;
                        });
                        isScrolling = true;
                    }
                }, { passive: true });
            }

            function enableHardwareAcceleration() {
                // Apply hardware acceleration to key elements
                const acceleratedElements = document.querySelectorAll('.concept, .word-focus-highlight, .viral-metric, .social-media-card');
                acceleratedElements.forEach(el => {
                    el.style.transform = 'translateZ(0)';
                    el.style.backfaceVisibility = 'hidden';
                    el.style.perspective = '1000px';
                });

                // Optimize CSS containment
                document.querySelectorAll('.concept').forEach(concept => {
                    concept.style.contain = 'layout style paint';
                });
            }

            function setupAdvancedCaching() {
                // Implement service worker for advanced caching
                if ('serviceWorker' in navigator) {
                    const swCode = `
                        const CACHE_NAME = 'tiktok-spanish-v1';
                        const urlsToCache = [
                            '/',
                            '/favicon.ico'
                        ];

                        self.addEventListener('install', (event) => {
                            event.waitUntil(
                                caches.open(CACHE_NAME)
                                    .then((cache) => cache.addAll(urlsToCache))
                            );
                        });

                        self.addEventListener('fetch', (event) => {
                            event.respondWith(
                                caches.match(event.request)
                                    .then((response) => {
                                        return response || fetch(event.request);
                                    })
                            );
                        });
                    `;

                    const blob = new Blob([swCode], { type: 'application/javascript' });
                    const swUrl = URL.createObjectURL(blob);

                    navigator.serviceWorker.register(swUrl)
                        .then(() => console.log('🔧 Service Worker registered for caching'))
                        .catch(() => console.log('⚠️ Service Worker registration failed'));
                }
            }

            function updateVisibleContent() {
                // Efficiently update only visible content
                const visibleConcepts = document.querySelectorAll('.concept');
                const viewport = {
                    top: window.scrollY,
                    bottom: window.scrollY + window.innerHeight
                };

                visibleConcepts.forEach(concept => {
                    const rect = concept.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                    if (isVisible) {
                        // Enhance visible content
                        concept.style.opacity = '1';
                        concept.style.transform = 'translateY(0)';

                        // Add micro-interactions
                        concept.addEventListener('mouseenter', () => {
                            concept.style.transform = 'translateY(-2px) scale(1.02)';
                            concept.style.boxShadow = 'var(--shadow-lg)';
                        }, { passive: true });

                        concept.addEventListener('mouseleave', () => {
                            concept.style.transform = 'translateY(0) scale(1)';
                            concept.style.boxShadow = 'var(--shadow-md)';
                        }, { passive: true });
                    }
                });
            }
        }, 100);
    </script>
</body>
</html>`;

    res.end(html);
  } catch (error) {
    if (!res.headersSent) {
      res.writeHead(500);
      res.end(`Error: ${error.message}`);
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 AI Feed server running on http://localhost:${PORT}`);
});

export { server };