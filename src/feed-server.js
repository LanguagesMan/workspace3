import http from 'http';
import { readFileSync, createReadStream, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import { generateImage, generateAudio, SUPPORTED_LANGUAGES, generateScenario } from './ai-services.js';
import { VideoScanner } from './video-scanner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// In-memory storage for community posts
const communityPosts = new Map();

// Video library
const videoScanner = new VideoScanner(join(__dirname, '../public/videos'));

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

      // 🎨 POST /api/generate/image - Generate AI image
      if (req.method === 'POST' && req.url === '/api/generate/image') {
        const body = await parseBody(req);
        const { prompt, style } = body;
        const result = await generateImage(prompt, style);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // 🔊 POST /api/generate/audio - Generate OpenAI TTS
      if (req.method === 'POST' && req.url === '/api/generate/audio') {
        const body = await parseBody(req);
        const { text, language, voice } = body;
        const result = await generateAudio(text, language, voice);

        if (result.success) {
          res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
          res.end(result.audio);
        } else {
          res.writeHead(500);
          res.end(JSON.stringify({ error: result.error }));
        }
        return;
      }

      // 🌍 GET /api/languages - Get supported languages
      if (req.method === 'GET' && req.url === '/api/languages') {
        res.writeHead(200);
        res.end(JSON.stringify({ languages: SUPPORTED_LANGUAGES }));
        return;
      }

      // 🎲 GET /api/scenario/:language - Get random scenario
      if (req.method === 'GET' && req.url.match(/^\/api\/scenario\/(.+)$/)) {
        const language = req.url.match(/^\/api\/scenario\/(.+)$/)[1];
        const scenario = generateScenario(language);
        res.writeHead(200);
        res.end(JSON.stringify(scenario));
        return;
      }

      // 📱 POST /api/community/post - Create community post
      if (req.method === 'POST' && req.url === '/api/community/post') {
        const body = await parseBody(req);
        const { userId, text, translation, imageUrl, language } = body;

        const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const post = {
          id: postId,
          userId,
          text,
          translation,
          imageUrl,
          language,
          createdAt: new Date().toISOString(),
          likes: 0,
          shares: 0
        };

        communityPosts.set(postId, post);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, post }));
        return;
      }

      // 📱 GET /api/community/posts - Get community posts
      if (req.method === 'GET' && req.url.startsWith('/api/community/posts')) {
        const urlParams = new URL(req.url, `http://localhost:${PORT}`);
        const language = urlParams.searchParams.get('language');

        let posts = Array.from(communityPosts.values());
        if (language) {
          posts = posts.filter(p => p.language === language);
        }

        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.writeHead(200);
        res.end(JSON.stringify({ posts, total: posts.length }));
        return;
      }

      // ❤️ POST /api/community/like/:postId - Like a post
      if (req.method === 'POST' && req.url.match(/^\/api\/community\/like\/(.+)$/)) {
        const postId = req.url.match(/^\/api\/community\/like\/(.+)$/)[1];
        const post = communityPosts.get(postId);

        if (post) {
          post.likes += 1;
          communityPosts.set(postId, post);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, likes: post.likes }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Post not found' }));
        }
        return;
      }

      // 📰 GET /api/news/:language - Get news articles
      if (req.method === 'GET' && req.url.match(/^\/api\/news\/(.+)$/)) {
        const language = req.url.match(/^\/api\/news\/(.+)$/)[1];

        // Mock news articles
        const newsArticles = {
          es: [
            { title: 'Nueva tecnología revoluciona el aprendizaje', description: 'Los estudiantes ahora pueden aprender español de manera más efectiva con IA' },
            { title: 'España gana el campeonato mundial', description: 'El equipo español celebra su victoria en el torneo internacional' }
          ],
          en: [
            { title: 'AI transforms language learning', description: 'Students can now learn more effectively with artificial intelligence' }
          ],
          fr: [
            { title: 'La France célèbre la journée de la langue', description: 'Des événements culturels dans tout le pays' }
          ]
        };

        const articles = newsArticles[language] || newsArticles.es;
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, articles }));
        return;
      }

      // 🎬 GET /api/videos/library - Get video library
      if (req.method === 'GET' && req.url === '/api/videos/library') {
        const videos = videoScanner.scan();
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, videos: videos.slice(0, 10) }));
        return;
      }

      // 🎬 GET /api/videos/stream/:videoId - Stream video
      if (req.method === 'GET' && req.url.startsWith('/api/videos/stream/')) {
        const videoId = decodeURIComponent(req.url.replace('/api/videos/stream/', ''));
        const videoPath = join(__dirname, '../public/videos', videoId);

        try {
          const stat = statSync(videoPath);
          const fileSize = stat.size;
          const range = req.headers.range;

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = createReadStream(videoPath, { start, end });

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': 'video/mp4'
            });
            file.pipe(res);
          } else {
            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': 'video/mp4'
            });
            createReadStream(videoPath).pipe(res);
          }
        } catch (e) {
          res.writeHead(404);
          res.end('Video not found');
        }
        return;
      }
    }

    // Route for ultimate feed (default)
    if (req.url === '/' || req.url === '/ultimate') {
      const htmlPath = join(__dirname, '../public/ultimate-feed.html');
      const html = readFileSync(htmlPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
      return;
    }

    // Route for AI feed
    if (req.url === '/ai') {
      const htmlPath = join(__dirname, '../public/ai-feed.html');
      const html = readFileSync(htmlPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
      return;
    }

    // Route for simple scroll feed
    if (req.url === '/simple') {
      const htmlPath = join(__dirname, '../public/simple-scroll-feed.html');
      const html = readFileSync(htmlPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
      return;
    }

    // Route for enhanced feed
    if (req.url === '/enhanced') {
      const htmlPath = join(__dirname, '../public/index.html');
      const html = readFileSync(htmlPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
      return;
    }

    // Default - serve AI feed
    const htmlPath = join(__dirname, '../public/ai-feed.html');
    const html = readFileSync(htmlPath, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    });
    res.end(html);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 AI Feed server running on http://localhost:${PORT}`);
  console.log(`🎬 Serving multi-language AI learning feed`);
  console.log(`📊 Database API: 6 endpoints active`);
  console.log(`🎨 AI Services: Runware image generation + OpenAI TTS`);
  console.log(`🌍 Languages: ${Object.keys(SUPPORTED_LANGUAGES).length} supported`);
  console.log(`📱 Community: User-generated content enabled`);
});
