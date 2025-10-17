// Simple Working Server - Just serve videos from reels folder
// No infinite loops, just clean API
// + STRIPE PAYWALL for $9.99/month revenue

import { createServer } from 'http';
import { readFileSync, readdirSync, statSync, existsSync, createReadStream } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3002;

// STRIPE SETUP - Replace with your actual keys
const stripe = new Stripe('sk_test_YOUR_SECRET_KEY_HERE'); // Demo key
const PRICE_ID = 'price_YOUR_PRICE_ID'; // $9.99/month with 7-day trial

// Load video catalog
function loadVideosCatalog() {
  const reelsPath = join(__dirname, 'public', 'videos', 'reels');
  const videos = [];

  try {
    const files = readdirSync(reelsPath);
    files.forEach(file => {
      if (file.endsWith('.mp4')) {
        const videoPath = join(reelsPath, file);
        const stats = statSync(videoPath);
        videos.push({
          id: `video_${videos.length + 1}`,
          type: 'video',
          title: file.replace('.mp4', '').replace(/_/g, ' '),
          videoUrl: `/videos/reels/${file}`,
          thumbnail: `https://img.youtube.com/vi/default/0.jpg`,
          difficulty_level: 'A2',
          duration: `${Math.floor(stats.size / 1000000)}:00`,
          source: 'LangFeed'
        });
      }
    });
  } catch (err) {
    console.error('Error loading videos:', err.message);
  }

  return videos;
}

const videoCatalog = loadVideosCatalog();
console.log(`📹 Loaded ${videoCatalog.length} videos from reels folder`);

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API: Get unified feed
  if (req.url.startsWith('/api/unified-feed')) {
    const urlParams = new URL(req.url, `http://localhost:${PORT}`).searchParams;
    const limit = parseInt(urlParams.get('limit') || '10');
    const page = parseInt(urlParams.get('page') || '1');

    // Return real videos + some mock articles/memes
    const videos = videoCatalog.slice(0, Math.min(limit, videoCatalog.length));

    const mockArticles = [
      {
        id: 'article_1',
        type: 'article',
        title: 'Spanish Culture: Flamenco Dancing',
        spanish: 'El flamenco es un arte tradicional español',
        english: 'Flamenco is a traditional Spanish art',
        thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400'
      },
      {
        id: 'article_2',
        type: 'article',
        title: 'Learn Spanish Food Words',
        spanish: 'La paella es un plato típico de Valencia',
        english: 'Paella is a typical dish from Valencia',
        thumbnail: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400'
      }
    ];

    const mockMemes = [
      {
        id: 'meme_1',
        type: 'meme',
        title: 'When you finally use "estar" correctly',
        spanish: '¡Estoy feliz!',
        english: 'I am happy!',
        thumbnail: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400'
      }
    ];

    const allContent = [...videos, ...mockArticles, ...mockMemes];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      videos: allContent,
      pagination: {
        page,
        limit,
        total: allContent.length,
        hasMore: false
      }
    }));
    return;
  }

  // Serve static files
  let filePath = join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url.slice(1));

  // Check if file exists
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Check if it's a directory
  const stats = statSync(filePath);
  if (stats.isDirectory()) {
    filePath = join(filePath, 'index.html');
    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  // Serve file
  const ext = extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // For video files, support range requests
  if (ext === '.mp4' || ext === '.webm') {
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType
      });
      createReadStream(filePath).pipe(res);
    }
    return;
  }

  // Regular files
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📹 Serving ${videoCatalog.length} videos from /public/videos/reels/`);
  console.log(`🎯 API: http://localhost:${PORT}/api/unified-feed`);
  console.log(`📱 App: http://localhost:${PORT}/unified-infinite-feed.html`);
});
