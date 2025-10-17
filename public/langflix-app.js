// 🧠 VIDA - Complete Spanish Learning Platform
// Genius-level implementation with all 6 sections

class VidaApp {
    constructor() {
        this.currentSection = 'videos';
        this.currentUser = this.getOrCreateUser();
        this.videos = [];
        this.articles = [];
        this.music = [];
        this.stories = [];
        this.currentVideoIndex = 0;
        this.currentStoryIndex = 0;
        this.knownWords = new Set();
        this.isRecording = false;
        this.recognition = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing VIDA app...');
        
        // Setup navigation
        this.setupNavigation();
        
        // Load user progress
        await this.loadUserProgress();
        
        // Load all content
        await this.loadAllContent();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ VIDA app ready!');
    }

    getOrCreateUser() {
        let user = localStorage.getItem('vida_user');
        if (!user) {
            user = {
                id: 'user_' + Date.now(),
                level: 'A2',
                knownWords: [],
                streak: 0,
                xp: 0,
                createdAt: Date.now()
            };
            localStorage.setItem('vida_user', JSON.stringify(user));
        } else {
            user = JSON.parse(user);
        }
        return user;
    }

    async loadUserProgress() {
        try {
            const response = await fetch(`/api/mvp/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: this.currentUser.id })
            });
            const data = await response.json();
            if (data.success) {
                this.currentUser = { ...this.currentUser, ...data.user };
                this.knownWords = new Set(this.currentUser.knownWords || []);
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }

    setupNavigation() {
        // Top nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                this.switchSection(section);
            });
        });

        // Bottom nav items
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });
    }

    switchSection(section) {
        console.log(`📱 Switching to ${section} section`);
        
        // Update active states
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });
        
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `${section}-section`);
        });
        
        this.currentSection = section;
        
        // Load section content if not loaded
        this.loadSectionContent(section);
    }

    async loadAllContent() {
        // Load videos first (priority)
        await this.loadVideos();
    }

    async loadSectionContent(section) {
        switch (section) {
            case 'videos':
                if (this.videos.length === 0) await this.loadVideos();
                break;
            case 'articles':
                if (this.articles.length === 0) await this.loadArticles();
                break;
            case 'music':
                if (this.music.length === 0) await this.loadMusic();
                break;
            case 'stories':
                if (this.stories.length === 0) await this.loadStories();
                break;
            case 'social':
                await this.loadSocialFeed();
                break;
        }
    }

    async loadVideos() {
        console.log('🎬 Loading videos from Langfeed...');
        
        try {
            const response = await fetch('/api/videos/with-subtitles');
            const data = await response.json();
            
            if (data.success && data.videos) {
                this.videos = data.videos;
                console.log(`✅ Loaded ${this.videos.length} videos`);
                this.renderVideos();
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showError('videos', 'Could not load videos. Please try again.');
        }
    }

    renderVideos() {
        const container = document.getElementById('video-feed');
        container.innerHTML = '';
        
        if (this.videos.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px;">No videos available</div>';
            return;
        }

        this.videos.forEach((video, index) => {
            const videoCard = this.createVideoCard(video, index);
            container.appendChild(videoCard);
        });

        // Setup video observers for autoplay
        this.setupVideoObservers();
    }

    createVideoCard(video, index) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.index = index;

        card.innerHTML = `
            <video class="video-player" 
                   src="${video.path}" 
                   loop 
                   playsinline
                   data-video-index="${index}">
            </video>
            
            <div class="video-controls">
                <button class="control-btn" data-action="speed">1×</button>
                <button class="control-btn" data-action="like">❤️</button>
                <button class="control-btn" data-action="save">💾</button>
                <button class="control-btn" data-action="share">↗️</button>
            </div>
            
            <div class="video-overlay">
                <div class="video-title">${video.title || video.name}</div>
                <div class="subtitles-container" data-video-index="${index}"></div>
            </div>
        `;

        // Add control button handlers
        card.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleVideoControl(btn.dataset.action, index);
            });
        });

        return card;
    }

    setupVideoObservers() {
        const options = {
            root: document.getElementById('video-feed'),
            threshold: 0.7
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (entry.isIntersecting) {
                    video.play();
                    this.loadSubtitles(video.dataset.videoIndex);
                } else {
                    video.pause();
                }
            });
        }, options);

        document.querySelectorAll('.video-card').forEach(card => {
            observer.observe(card);
        });
    }

    async loadSubtitles(videoIndex) {
        const video = this.videos[videoIndex];
        if (!video || !video.subtitlesPath) return;

        try {
            const response = await fetch(video.subtitlesPath);
            const srtText = await response.text();
            const subtitles = this.parseSRT(srtText);
            
            this.displaySubtitles(videoIndex, subtitles);
        } catch (error) {
            console.error('Error loading subtitles:', error);
        }
    }

    parseSRT(srtText) {
        const blocks = srtText.trim().split(/\n\n+/);
        const subtitles = [];
        let englishBuffer = null;

        blocks.forEach(block => {
            const lines = block.split('\n');
            if (lines.length >= 3) {
                const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
                if (timeMatch) {
                    const text = lines.slice(2).join(' ');
                    const startTime = this.parseTime(timeMatch[1]);
                    const endTime = this.parseTime(timeMatch[2]);

                    // Detect if this is English or Spanish
                    // English lines come first, Spanish lines come second with same timestamp
                    const isSpanish = /[áéíóúñü¿¡]/i.test(text);

                    if (!isSpanish && !englishBuffer) {
                        // This is English, buffer it
                        englishBuffer = { start: startTime, end: endTime, english: text };
                    } else if (isSpanish && englishBuffer &&
                               Math.abs(englishBuffer.start - startTime) < 0.1) {
                        // This is Spanish matching the English buffer
                        subtitles.push({
                            start: startTime,
                            end: endTime,
                            spanish: this.addAIPunctuation(text),
                            english: englishBuffer.english
                        });
                        englishBuffer = null;
                    } else if (isSpanish) {
                        // Spanish without English pair
                        subtitles.push({
                            start: startTime,
                            end: endTime,
                            spanish: this.addAIPunctuation(text),
                            english: text // fallback
                        });
                    } else {
                        // English without Spanish pair (shouldn't happen in Langfeed)
                        subtitles.push({
                            start: startTime,
                            end: endTime,
                            spanish: text,
                            english: text
                        });
                    }
                }
            }
        });

        return subtitles;
    }

    addAIPunctuation(text) {
        // AI-style punctuation for Spanish (matching server logic)
        let punctuated = text.trim();

        if (!/[.!?]$/.test(punctuated)) {
            if (/^(qué|cuál|cuándo|dónde|cómo|por qué|quién)/i.test(punctuated)) {
                punctuated += '?';
            } else if (/^(ay|wow|oh|guau|increíble|genial)/i.test(punctuated) || /\b(muy|tan|tanto)\b/i.test(punctuated)) {
                punctuated += '!';
            } else {
                punctuated += '.';
            }
        }

        punctuated = punctuated.charAt(0).toUpperCase() + punctuated.slice(1);

        if (punctuated.endsWith('?') && !punctuated.startsWith('¿')) {
            punctuated = '¿' + punctuated;
        }
        if (punctuated.endsWith('!') && !punctuated.startsWith('¡')) {
            punctuated = '¡' + punctuated;
        }

        return punctuated;
    }

    parseTime(timeString) {
        const [hours, minutes, seconds] = timeString.split(':');
        const [secs, millis] = seconds.split(',');
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis) / 1000;
    }

    displaySubtitles(videoIndex, subtitles) {
        const container = document.querySelector(`.subtitles-container[data-video-index="${videoIndex}"]`);
        const video = document.querySelector(`video[data-video-index="${videoIndex}"]`);

        if (!container || !video) return;

        const updateSubtitle = () => {
            const currentTime = video.currentTime;
            const current = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);

            if (current) {
                // YouTube/TikTok style: dual-language line-by-line display
                // Spanish on top with clickable words, English below
                const spanishWords = (current.spanish || current.text || '').split(' ');
                const spanishHtml = spanishWords.map(word =>
                    `<span class="clickable-word" data-word="${word.toLowerCase().replace(/[^\w]/g, '')}">${word}</span>`
                ).join(' ');

                const englishText = current.english || current.text || '';

                container.innerHTML = `
                    <div class="subtitle-line spanish-line">
                        <span class="lang-flag">🇪🇸</span>
                        ${spanishHtml}
                    </div>
                    <div class="subtitle-line english-line">
                        <span class="lang-flag">🇺🇸</span>
                        ${englishText}
                    </div>
                `;

                // Add click handlers to Spanish words
                container.querySelectorAll('.clickable-word').forEach(wordEl => {
                    wordEl.addEventListener('click', () => {
                        this.showWordTranslation(wordEl.dataset.word, current.text);
                    });
                });
            } else {
                container.innerHTML = '';
            }
        };

        video.addEventListener('timeupdate', updateSubtitle);
    }

    async showWordTranslation(word, context) {
        console.log(`🔍 Translating word: ${word}`);
        
        try {
            const response = await fetch('/api/translate/word', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word, sourceLang: 'es', targetLang: 'en' })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showTranslationPopup(word, data.translation, context);
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showTranslationPopup(word, 'Translation unavailable', context);
        }
    }

    showTranslationPopup(word, translation, example) {
        const popup = document.getElementById('translation-popup');
        document.getElementById('popup-word').textContent = word;
        document.getElementById('popup-translation').textContent = translation;
        document.getElementById('popup-example').textContent = example;
        
        popup.classList.add('active');
    }

    handleVideoControl(action, videoIndex) {
        const video = document.querySelector(`video[data-video-index="${videoIndex}"]`);
        const btn = document.querySelector(`.video-card[data-index="${videoIndex}"] .control-btn[data-action="${action}"]`);
        
        switch (action) {
            case 'speed':
                const speeds = [0.5, 0.75, 1, 1.25, 1.5];
                const currentSpeed = video.playbackRate;
                const nextSpeed = speeds[(speeds.indexOf(currentSpeed) + 1) % speeds.length];
                video.playbackRate = nextSpeed;
                btn.textContent = `${nextSpeed}×`;
                break;
                
            case 'like':
                btn.textContent = btn.textContent === '❤️' ? '🤍' : '❤️';
                this.saveEngagement(videoIndex, 'like');
                break;
                
            case 'save':
                btn.textContent = btn.textContent === '💾' ? '✅' : '💾';
                this.saveEngagement(videoIndex, 'save');
                break;
                
            case 'share':
                this.shareVideo(videoIndex);
                break;
        }
    }

    async loadArticles() {
        console.log('📰 Loading articles...');
        
        try {
            const response = await fetch(`/api/news/spanish?level=${this.currentUser.level}&count=20`);
            const data = await response.json();
            
            if (data.articles) {
                this.articles = data.articles;
                console.log(`✅ Loaded ${this.articles.length} articles`);
                this.renderArticles();
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('articles', 'Could not load articles.');
        }
    }

    renderArticles() {
        const container = document.getElementById('articles-feed');
        container.innerHTML = '';
        
        this.articles.forEach((article, index) => {
            const card = this.createArticleCard(article, index);
            container.appendChild(card);
        });
    }

    createArticleCard(article, index) {
        const card = document.createElement('div');
        card.className = 'article-card';
        
        card.innerHTML = `
            ${article.image ? `<img src="${article.image}" class="article-image" alt="${article.title}">` : ''}
            <div class="article-content">
                <div class="article-title">${article.title}</div>
                <div class="article-text">${article.summary || article.content?.substring(0, 200) + '...'}</div>
                <div class="article-actions">
                    <button class="action-btn" data-action="read">📖 Read More</button>
                    <button class="action-btn" data-action="simplify">⬇️ Simplify</button>
                    <button class="action-btn" data-action="translate">🌐 Translate</button>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.openArticle(index));
        
        card.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleArticleAction(btn.dataset.action, index);
            });
        });
        
        return card;
    }

    openArticle(index) {
        const article = this.articles[index];
        // TODO: Open full article view with clickable word translations
        console.log('Opening article:', article.title);
    }

    async handleArticleAction(action, index) {
        const article = this.articles[index];
        
        switch (action) {
            case 'read':
                this.openArticle(index);
                break;
                
            case 'simplify':
                // Simplify content for user level
                await this.simplifyArticle(index);
                break;
                
            case 'translate':
                // Show English translation
                await this.translateArticle(index);
                break;
        }
    }

    async simplifyArticle(index) {
        // TODO: Call AI API to simplify content
        console.log('Simplifying article:', index);
    }

    async loadMusic() {
        console.log('🎵 Loading music...');
        
        try {
            const response = await fetch(`/api/music/spanish?level=${this.currentUser.level}&limit=20`);
            const data = await response.json();
            
            if (data.songs) {
                this.music = data.songs;
                console.log(`✅ Loaded ${this.music.length} songs`);
                this.renderMusic();
            }
        } catch (error) {
            console.error('Error loading music:', error);
            this.showError('music', 'Could not load music.');
        }
    }

    renderMusic() {
        const container = document.getElementById('music-list');
        container.innerHTML = '';
        
        this.music.forEach((song, index) => {
            const card = this.createMusicCard(song, index);
            container.appendChild(card);
        });
    }

    createMusicCard(song, index) {
        const card = document.createElement('div');
        card.className = 'music-card';
        
        card.innerHTML = `
            <div class="music-artwork"></div>
            <div class="music-info">
                <div class="music-title">${song.title}</div>
                <div class="music-artist">${song.artist}</div>
            </div>
            <button class="control-btn" style="width: 40px; height: 40px;">▶️</button>
        `;
        
        card.addEventListener('click', () => this.playMusic(index));
        
        return card;
    }

    playMusic(index) {
        const song = this.music[index];
        console.log('Playing song:', song.title);
        
        // Show music player
        const player = document.getElementById('music-player');
        player.classList.add('active');
        
        // Display lyrics
        this.displayLyrics(song);
    }

    displayLyrics(song) {
        const container = document.getElementById('lyrics-container');
        
        if (song.lyrics) {
            const lines = song.lyrics.split('\n');
            container.innerHTML = lines.map(line => 
                `<div class="lyric-line">${line}</div>`
            ).join('');
        }
    }

    async loadStories() {
        console.log('📖 Loading stories...');
        
        this.stories = [
            {
                id: 1,
                image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
                spanish: '¡Buenos días! ☀️',
                english: 'Good morning!',
                audio: null
            },
            {
                id: 2,
                image: 'https://images.unsplash.com/photo-1533167649158-6d508895b680',
                spanish: 'El café está listo ☕',
                english: 'Coffee is ready',
                audio: null
            },
            {
                id: 3,
                image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
                spanish: '¿Qué tal tu día? 🌟',
                english: 'How\'s your day?',
                audio: null
            }
        ];
        
        this.renderStories();
    }

    renderStories() {
        const container = document.getElementById('stories-container');
        container.innerHTML = '';
        
        // Create progress bars
        const progressContainer = document.createElement('div');
        progressContainer.className = 'story-progress';
        this.stories.forEach((_, i) => {
            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            bar.innerHTML = '<div class="progress-fill"></div>';
            progressContainer.appendChild(bar);
        });
        container.appendChild(progressContainer);
        
        // Create story cards
        this.stories.forEach((story, index) => {
            const card = this.createStoryCard(story, index);
            container.appendChild(card);
        });
        
        // Show first story
        this.showStory(0);
        
        // Setup tap navigation
        container.addEventListener('click', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            if (x < rect.width / 2) {
                this.previousStory();
            } else {
                this.nextStory();
            }
        });
    }

    createStoryCard(story, index) {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.dataset.index = index;
        
        card.innerHTML = `
            <img src="${story.image}" class="story-image" alt="Story">
            <div class="story-text">
                <div class="story-spanish">${story.spanish}</div>
                <div class="story-english">${story.english}</div>
            </div>
        `;
        
        return card;
    }

    showStory(index) {
        if (index < 0 || index >= this.stories.length) return;
        
        this.currentStoryIndex = index;
        
        // Update active story
        document.querySelectorAll('.story-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        
        // Update progress bars
        document.querySelectorAll('.progress-bar').forEach((bar, i) => {
            const fill = bar.querySelector('.progress-fill');
            if (i < index) {
                fill.style.width = '100%';
            } else if (i === index) {
                fill.style.width = '0%';
                // Animate progress
                setTimeout(() => fill.style.width = '100%', 100);
            } else {
                fill.style.width = '0%';
            }
        });
    }

    nextStory() {
        this.showStory(this.currentStoryIndex + 1);
    }

    previousStory() {
        this.showStory(this.currentStoryIndex - 1);
    }

    async loadSocialFeed() {
        console.log('🌍 Loading social feed...');
        
        // Mock social posts
        const posts = [
            {
                username: 'Spanish_Celeb',
                platform: 'Instagram',
                content: '¡Hola amigos! Hoy quiero compartir algo especial con ustedes... 🌟',
                avatar: null
            },
            {
                username: 'learn_español',
                platform: 'TikTok',
                content: '¿Sabías que "embarazada" no significa "embarrassed"? 😅',
                avatar: null
            }
        ];
        
        this.renderSocialFeed(posts);
    }

    renderSocialFeed(posts) {
        const container = document.getElementById('social-feed');
        container.innerHTML = '';
        
        posts.forEach(post => {
            const card = this.createSocialCard(post);
            container.appendChild(card);
        });
    }

    createSocialCard(post) {
        const card = document.createElement('div');
        card.className = 'social-card';
        
        card.innerHTML = `
            <div class="social-header">
                <div class="social-avatar"></div>
                <div>
                    <div class="social-username">${post.username}</div>
                    <div class="social-platform">${post.platform}</div>
                </div>
            </div>
            <div class="social-content">${post.content}</div>
        `;
        
        return card;
    }

    setupEventListeners() {
        // Translation popup close
        document.getElementById('close-popup-btn').addEventListener('click', () => {
            document.getElementById('translation-popup').classList.remove('active');
        });
        
        // Save word button
        document.getElementById('save-word-btn').addEventListener('click', () => {
            const word = document.getElementById('popup-word').textContent;
            this.saveWord(word);
            document.getElementById('translation-popup').classList.remove('active');
        });
        
        // Chat input
        const chatInput = document.getElementById('chat-input');
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });
        
        // Voice button
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.toggleVoiceRecording();
        });
    }

    async saveWord(word) {
        this.knownWords.add(word);
        
        try {
            await fetch('/api/mvp/xp/' + this.currentUser.id, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 10, reason: 'word_learned' })
            });
            
            console.log(`✅ Saved word: ${word} (+10 XP)`);
        } catch (error) {
            console.error('Error saving word:', error);
        }
    }

    async saveEngagement(videoIndex, type) {
        try {
            await fetch('/api/engagement', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': this.currentUser.id
                },
                body: JSON.stringify({
                    itemId: this.videos[videoIndex].id,
                    engagementType: type
                })
            });
        } catch (error) {
            console.error('Error saving engagement:', error);
        }
    }

    shareVideo(videoIndex) {
        const video = this.videos[videoIndex];
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: 'Check out this Spanish learning video!',
                url: window.location.href
            });
        }
    }

    async sendChatMessage(message) {
        if (!message.trim()) return;
        
        // Add user message
        this.addChatMessage(message, 'user');
        
        // Simulate AI response (TODO: integrate real AI API)
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'ai');
        }, 1000);
    }

    addChatMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        const message = document.createElement('div');
        message.className = `message ${sender}`;
        message.innerHTML = `<div class="message-bubble">${text}</div>`;
        container.appendChild(message);
        container.scrollTop = container.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const responses = [
            '¡Muy bien! Estás progresando.',
            '¿Puedes decirme más sobre eso?',
            'Interesante. ¿Qué más te gustaría aprender?',
            'Perfecto. Sigamos practicando.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    toggleVoiceRecording() {
        const btn = document.getElementById('voice-btn');
        
        if (!this.isRecording) {
            this.startVoiceRecording();
            btn.classList.add('recording');
            btn.textContent = '⏹️';
        } else {
            this.stopVoiceRecording();
            btn.classList.remove('recording');
            btn.textContent = '🎤';
        }
        
        this.isRecording = !this.isRecording;
    }

    startVoiceRecording() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice recognition not supported in this browser');
            return;
        }
        
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = false;
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
        };
        
        this.recognition.start();
    }

    stopVoiceRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    showError(section, message) {
        const container = document.getElementById(`${section}-feed`) || 
                         document.getElementById(`${section}-section`);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">😔</div>
                    <div>${message}</div>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.vidaApp = new VidaApp();
    });
} else {
    window.vidaApp = new VidaApp();
}
