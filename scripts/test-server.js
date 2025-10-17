/**
 * Test Server for Playwright E2E Tests
 * Starts server on port 3002 with proper cleanup
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const PORT = process.env.TEST_PORT || 3002;
let server;

// Simple test server without complex dependencies
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mock API endpoints for testing
app.get('/api/health/status', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/videos', (req, res) => {
    res.json({
        videos: [
            {
                id: 'test-video-1',
                title: 'Test Video 1',
                url: '/videos/test.mp4',
                thumbnail: '/images/test-thumb.jpg',
                level: 'A1'
            }
        ]
    });
});

app.get('/api/articles', (req, res) => {
    res.json({
        articles: [
            {
                id: 'test-article-1',
                title: 'Test Article',
                content: 'Test content',
                level: 'A1'
            }
        ]
    });
});

app.get('/api/user/words/:userId', (req, res) => {
    res.json({
        words: [
            { word: 'hola', translation: 'hello', level: 'A1' },
            { word: 'gracias', translation: 'thank you', level: 'A1' }
        ]
    });
});

// Catch-all route - serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

function startServer() {
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, (err) => {
            if (err) {
                console.error('❌ Test server failed to start:', err.message);
                reject(err);
            } else {
                console.log(`✅ Test server running on http://localhost:${PORT}`);
                resolve(server);
            }
        });
    });
}

function stopServer() {
    return new Promise((resolve) => {
        if (server) {
            server.close(() => {
                console.log('✅ Test server stopped');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n📍 SIGTERM received, shutting down gracefully...');
    await stopServer();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n📍 SIGINT received, shutting down gracefully...');
    await stopServer();
    process.exit(0);
});

// Start server if run directly
if (require.main === module) {
    startServer().catch((err) => {
        console.error('Failed to start test server:', err);
        process.exit(1);
    });
}

module.exports = { startServer, stopServer, PORT };

