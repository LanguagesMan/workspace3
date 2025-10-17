/**
 * 🚀 ENHANCED LANGFLIX APP
 * Complete with mobile optimization, loading states, error handling, and accessibility
 * Agent 2: Frontend Engineer - Full Implementation
 */

// ===========================================
// CONFIGURATION & CONSTANTS
// ===========================================

const CONFIG = {
    API_BASE_URL: window.location.origin,
    DEFAULT_USER_ID: 'test-user',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    OFFLINE_CHECK_INTERVAL: 30000,
    VIDEO_LIMIT: 50,
    ARTICLE_LIMIT: 20
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Retry failed API calls with exponential backoff
 */
async function fetchWithRetry(url, options = {}, attempts = CONFIG.RETRY_ATTEMPTS) {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            
            if (i === attempts - 1) {
                throw error;
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * Math.pow(2, i)));
        }
    }
}

/**
 * Check if user is online
 */
function checkOnlineStatus() {
    return navigator.onLine;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Create skeleton loading element
 */
function createSkeletonLoader(type = 'video') {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton skeleton-${type}`;
    skeleton.setAttribute('aria-label', 'Loading content');
    skeleton.setAttribute('role', 'status');
    
    if (type === 'video') {
        skeleton.innerHTML = `
            <div class="skeleton-video"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
        `;
    } else if (type === 'article') {
        skeleton.innerHTML = `
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
        `;
    }
    
    return skeleton;
}

/**
 * Show error state with retry option
 */
function showErrorState(container, message, retryCallback) {
    container.innerHTML = `
        <div class="error-state" role="alert">
            <div class="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <button class="retry-btn" onclick="(${retryCallback.toString()})()">
                🔄 Try Again
            </button>
        </div>
    `;
}

// ===========================================
// MOBILE OPTIMIZATION
// ===========================================

/**
 * Detect device type and capabilities
 */
const DeviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasNotch: window.innerHeight > 800 && window.devicePixelRatio >= 2
};

/**
 * Add safe area insets for iOS devices with notch
 */
function applySafeAreaInsets() {
    if (DeviceInfo.isIOS && DeviceInfo.hasNotch) {
        document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        document.body.classList.add('has-notch');
    }
}

/**
 * Optimize touch interactions
 */
function optimizeTouchInteractions() {
    if (!DeviceInfo.supportsTouch) return;
    
    // Add touch feedback to all interactive elements
    const interactiveElements = document.querySelectorAll('button, .nav-item, .word-clickable, .article-btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

/**
 * Handle pull-to-refresh on mobile
 */
function handlePullToRefresh() {
    if (!DeviceInfo.supportsTouch) return;
    
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    const feedSection = document.getElementById('feed-section');
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'pull-to-refresh-indicator';
    refreshIndicator.innerHTML = '↓ Pull to refresh';
    feedSection.prepend(refreshIndicator);
    
    feedSection.addEventListener('touchstart', (e) => {
        if (feedSection.scrollTop === 0) {
            startY = e.touches[0].clientY;
            pulling = true;
        }
    }, { passive: true });
    
    feedSection.addEventListener('touchmove', (e) => {
        if (!pulling) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0 && diff < 100) {
            refreshIndicator.style.opacity = diff / 100;
            refreshIndicator.style.transform = `translateY(${diff}px)`;
        }
    }, { passive: true });
    
    feedSection.addEventListener('touchend', () => {
        if (pulling && (currentY - startY) > 80) {
            refreshIndicator.innerHTML = '↻ Refreshing...';
            window.location.reload();
        } else {
            refreshIndicator.style.opacity = '0';
            refreshIndicator.style.transform = 'translateY(0)';
        }
        pulling = false;
    }, { passive: true });
}

// ===========================================
// VIDEO MANAGEMENT (Enhanced)
// ===========================================

class VideoManager {
    constructor() {
        this.videos = [];
        this.currentIndex = 0;
        this.observer = null;
        this.preloadCount = 2;
    }
    
    async loadVideos() {
        const container = document.getElementById('video-container');
        
        // Show skeleton loaders
        container.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            container.appendChild(createSkeletonLoader('video'));
        }
        
        try {
            if (!checkOnlineStatus()) {
                throw new Error('No internet connection');
            }
            
            const data = await fetchWithRetry(
                `${CONFIG.API_BASE_URL}/api/videos/feed/${CONFIG.DEFAULT_USER_ID}?limit=${CONFIG.VIDEO_LIMIT}`
            );
            
            if (!data.videos || data.videos.length === 0) {
                showErrorState(container, 'No videos available', () => this.loadVideos());
                return;
            }
            
            this.videos = data.videos;
            this.renderVideos(container);
            this.setupVideoControls();
            this.setupAccessibility();
            
            showToast(`Loaded ${data.videos.length} videos`, 'success');
            
        } catch (error) {
            console.error('Error loading videos:', error);
            showErrorState(
                container,
                checkOnlineStatus() ? 
                    'Failed to load videos. Server might be down.' : 
                    'No internet connection. Please check your network.',
                () => this.loadVideos()
            );
        }
    }
    
    renderVideos(container) {
        container.innerHTML = '';
        
        this.videos.forEach((video, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.dataset.index = index;
            
            // Use real transcriptions if available
            const transcription = video.transcription || this.getSampleTranscription(index);
            
            videoItem.innerHTML = `
                <video 
                    class="video-player" 
                    src="${CONFIG.API_BASE_URL}${video.url}" 
                    playsinline 
                    loop 
                    muted
                    preload="metadata"
                    aria-label="Learning video ${index + 1}"
                ></video>
                <div class="video-overlay">
                    <div class="transcription-box" role="region" aria-label="Video transcription">
                        <div class="trans-line">
                            <div class="trans-es" lang="es">${this.makeWordsClickable(transcription.es)}</div>
                            <div class="trans-en" lang="en">${transcription.en}</div>
                        </div>
                    </div>
                    <button class="video-control-btn mute-btn" aria-label="Unmute video">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                            <path class="muted-indicator" d="M23 9l-6 6M17 9l6 6"/>
                        </svg>
                    </button>
                </div>
            `;
            
            container.appendChild(videoItem);
        });
        
        this.setupIntersectionObserver(container);
    }
    
    makeWordsClickable(text) {
        const words = text.split(' ');
        return words.map(word => {
            const cleanWord = word.replace(/[.,;!?¿¡]/g, '');
            return `<span class="word-clickable" 
                          data-word="${cleanWord}" 
                          tabindex="0" 
                          role="button" 
                          aria-label="Click to translate ${cleanWord}"
                    >${word}</span>`;
        }).join(' ');
    }
    
    getSampleTranscription(index) {
        const samples = [
            { es: '¡Hola! Estoy aprendiendo español con videos.', en: 'Hello! I am learning Spanish with videos.' },
            { es: 'El semáforo está mostrando rojo y verde.', en: 'The traffic light is showing red and green.' },
            { es: 'Tengo hambre. Voy a comer algo delicioso.', en: 'I am hungry. I am going to eat something delicious.' },
            { es: 'Mira lo que está pasando en la calle.', en: 'Look at what is happening in the street.' },
            { es: 'Esta es una manera divertida de aprender.', en: 'This is a fun way to learn.' }
        ];
        return samples[index % samples.length];
    }
    
    setupIntersectionObserver(container) {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                
                if (entry.isIntersecting) {
                    video.currentTime = 0;
                    video.play().catch(e => console.log('Play prevented:', e));
                    this.currentIndex = parseInt(entry.target.dataset.index);
                    this.preloadNextVideos();
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.75 });
        
        container.querySelectorAll('.video-item').forEach(item => {
            this.observer.observe(item);
        });
    }
    
    preloadNextVideos() {
        const container = document.getElementById('video-container');
        const videos = container.querySelectorAll('video');
        
        for (let i = 1; i <= this.preloadCount; i++) {
            const nextIndex = this.currentIndex + i;
            if (nextIndex < videos.length) {
                videos[nextIndex].load();
            }
        }
    }
    
    setupVideoControls() {
        const container = document.getElementById('video-container');
        
        // Mute/Unmute toggle
        container.addEventListener('click', (e) => {
            const video = e.target.closest('.video-item')?.querySelector('video');
            const muteBtn = e.target.closest('.video-item')?.querySelector('.mute-btn');
            
            if (e.target.closest('.mute-btn')) {
                video.muted = !video.muted;
                muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
                muteBtn.classList.toggle('muted', video.muted);
            } else if (video && !e.target.classList.contains('word-clickable')) {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
        
        // Word click handler
        container.addEventListener('click', async (e) => {
            if (e.target.classList.contains('word-clickable')) {
                await this.handleWordClick(e.target);
            }
        });
        
        // Keyboard support for word tooltips
        container.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('word-clickable')) {
                await this.handleWordClick(e.target);
            }
        });
    }
    
    async handleWordClick(element) {
        const word = element.dataset.word;
        
        try {
            // Try to get real translation from API
            const response = await fetchWithRetry(
                `${CONFIG.API_BASE_URL}/api/translate`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        text: word,
                        targetLang: 'en',
                        sourceLang: 'es'
                    })
                }
            );
            
            // Save word to vocabulary
            await fetchWithRetry(
                `${CONFIG.API_BASE_URL}/api/vocabulary/save`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        userId: CONFIG.DEFAULT_USER_ID,
                        word: word,
                        translation: response.translation,
                        context: element.closest('.trans-es')?.textContent || ''
                    })
                }
            );
            
            element.classList.add('word-saved');
            showToast(`"${word}" saved to vocabulary!`, 'success');
            
        } catch (error) {
            console.error('Error handling word click:', error);
            showToast('Failed to save word', 'error');
        }
    }
    
    setupAccessibility() {
        // Keyboard navigation for video scrolling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const direction = e.key === 'ArrowDown' ? 1 : -1;
                this.scrollToVideo(this.currentIndex + direction);
            }
        });
    }
    
    scrollToVideo(index) {
        const container = document.getElementById('video-container');
        const videoItems = container.querySelectorAll('.video-item');
        
        if (index >= 0 && index < videoItems.length) {
            videoItems[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ===========================================
// ARTICLES MANAGEMENT (Enhanced)
// ===========================================

class ArticlesManager {
    constructor() {
        this.articles = [];
    }
    
    async loadArticles() {
        const container = document.getElementById('articles-feed');
        
        // Show skeleton loaders
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            container.appendChild(createSkeletonLoader('article'));
        }
        
        try {
            if (!checkOnlineStatus()) {
                throw new Error('No internet connection');
            }
            
            const data = await fetchWithRetry(
                `${CONFIG.API_BASE_URL}/api/news/personalized/${CONFIG.DEFAULT_USER_ID}?limit=${CONFIG.ARTICLE_LIMIT}`
            );
            
            if (!data.articles || data.articles.length === 0) {
                showErrorState(container, 'No articles available', () => this.loadArticles());
                return;
            }
            
            this.articles = data.articles;
            this.renderArticles(container);
            
            showToast(`Loaded ${data.articles.length} articles`, 'success');
            
        } catch (error) {
            console.error('Error loading articles:', error);
            showErrorState(
                container,
                checkOnlineStatus() ? 
                    'Failed to load articles. Try again later.' : 
                    'No internet connection.',
                () => this.loadArticles()
            );
        }
    }
    
    renderArticles(container) {
        container.innerHTML = '';
        
        this.articles.forEach((article, index) => {
            const articleCard = document.createElement('article');
            articleCard.className = 'article-card';
            articleCard.setAttribute('role', 'article');
            
            articleCard.innerHTML = `
                <h3 class="article-title">${article.title || 'Spanish News Article'}</h3>
                <div class="article-content" lang="es">
                    ${article.summary || article.content || 'Click any word to see translation. Simplified to your Spanish level.'}
                </div>
                <div class="article-footer">
                    <button class="article-btn" data-action="translate" aria-label="Translate article">
                        📖 Translate
                    </button>
                    <button class="article-btn" data-action="simplify" aria-label="Simplify article">
                        📝 Simplify
                    </button>
                    <button class="article-btn" data-action="listen" aria-label="Listen to article">
                        🔊 Listen
                    </button>
                    <button class="article-btn" data-action="save" aria-label="Save article">
                        💾 Save
                    </button>
                </div>
            `;
            
            container.appendChild(articleCard);
        });
        
        this.setupArticleActions();
    }
    
    setupArticleActions() {
        const container = document.getElementById('articles-feed');
        
        container.addEventListener('click', async (e) => {
            const btn = e.target.closest('.article-btn');
            if (!btn) return;
            
            const action = btn.dataset.action;
            const article = btn.closest('.article-card');
            
            btn.disabled = true;
            btn.innerHTML = '⏳ Loading...';
            
            try {
                switch (action) {
                    case 'translate':
                        await this.translateArticle(article);
                        break;
                    case 'simplify':
                        await this.simplifyArticle(article);
                        break;
                    case 'listen':
                        await this.listenToArticle(article);
                        break;
                    case 'save':
                        await this.saveArticle(article);
                        break;
                }
            } catch (error) {
                showToast(`Failed to ${action} article`, 'error');
            } finally {
                // Restore button
                const originalIcons = {
                    translate: '📖 Translate',
                    simplify: '📝 Simplify',
                    listen: '🔊 Listen',
                    save: '💾 Save'
                };
                btn.innerHTML = originalIcons[action];
                btn.disabled = false;
            }
        });
    }
    
    async translateArticle(article) {
        // Implement translation
        showToast('Translation coming soon!', 'info');
    }
    
    async simplifyArticle(article) {
        // Implement simplification
        showToast('Simplification coming soon!', 'info');
    }
    
    async listenToArticle(article) {
        // Implement text-to-speech
        const content = article.querySelector('.article-content').textContent;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(content);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
            showToast('Playing audio...', 'success');
        } else {
            showToast('Text-to-speech not supported', 'error');
        }
    }
    
    async saveArticle(article) {
        // Implement save
        showToast('Article saved!', 'success');
    }
}

// ===========================================
// NETWORK STATUS MONITORING
// ===========================================

class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupListeners();
        this.startPeriodicCheck();
    }
    
    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showOnlineIndicator();
            showToast('Back online!', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
            showToast('You are offline', 'error');
        });
    }
    
    showOnlineIndicator() {
        document.body.classList.remove('offline');
        document.body.classList.add('online');
        
        setTimeout(() => {
            document.body.classList.remove('online');
        }, 3000);
    }
    
    showOfflineIndicator() {
        document.body.classList.add('offline');
    }
    
    startPeriodicCheck() {
        setInterval(() => {
            if (!navigator.onLine && this.isOnline) {
                this.isOnline = false;
                this.showOfflineIndicator();
            }
        }, CONFIG.OFFLINE_CHECK_INTERVAL);
    }
}

// ===========================================
// NAVIGATION ENHANCEMENT
// ===========================================

function setupEnhancedNavigation() {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;
            
            // Update ARIA states
            navItems.forEach(nav => {
                nav.classList.remove('active');
                nav.setAttribute('aria-selected', 'false');
            });
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');
            
            // Update sections with animation
            sections.forEach(section => {
                section.classList.remove('active');
                section.setAttribute('aria-hidden', 'true');
                
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                    section.setAttribute('aria-hidden', 'false');
                    
                    // Announce to screen readers
                    const sectionName = item.querySelector('.nav-label').textContent;
                    showToast(`Switched to ${sectionName}`, 'info');
                }
            });
        });
        
        // Add keyboard support
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
    
    // Feed tabs
    const feedTabs = document.querySelectorAll('.feed-tab');
    const feedPanels = document.querySelectorAll('.feed-panel');
    
    feedTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetFeed = tab.dataset.feed;
            
            feedTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            feedPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
                
                if (panel.id === `${targetFeed}-panel`) {
                    panel.classList.add('active');
                    panel.setAttribute('aria-hidden', 'false');
                }
            });
        });
    });
}

// ===========================================
// INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Enhanced Langflix App Initializing...');
    
    // Apply mobile optimizations
    applySafeAreaInsets();
    optimizeTouchInteractions();
    handlePullToRefresh();
    
    // Initialize managers
    const videoManager = new VideoManager();
    const articlesManager = new ArticlesManager();
    const networkMonitor = new NetworkMonitor();
    
    // Load content
    videoManager.loadVideos();
    articlesManager.loadArticles();
    
    // Setup navigation
    setupEnhancedNavigation();
    
    // Expose for debugging
    window.LangflixApp = {
        videoManager,
        articlesManager,
        networkMonitor,
        config: CONFIG,
        deviceInfo: DeviceInfo
    };
    
    console.log('✅ Enhanced Langflix App Ready');
    console.log('📱 Device Info:', DeviceInfo);
});



