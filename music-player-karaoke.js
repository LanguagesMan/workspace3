/**
 * 🎵 MUSIC PLAYER WITH KARAOKE LYRICS - Spotify 2025 Pattern
 * Pattern: Spotify's synchronized karaoke lyrics + Duolingo dual-language display
 *
 * Research sources:
 * - Spotify 2025: Real-time synchronized lyrics (karaoke-style scrolling)
 * - Apple Music: Time-synced lyrics with word highlighting
 * - Musixmatch: Lyrics timing API with line-by-line sync
 * - LyricsTraining: Language learning through music
 */

class MusicPlayerKaraoke {
    constructor() {
        this.audioElement = null;
        this.currentLyricIndex = -1;
        this.lyrics = [];
        this.activePlayers = new Map();
        this.subtitleRenderer = null; // Reuse WordLevelSubtitles for dual-language
        this.setupStyles();
    }

    /**
     * Attach audio player to music card with synchronized lyrics
     * @param {HTMLAudioElement} audioElement - The audio element
     * @param {Array} lyrics - Array of {start, end, spanish, english}
     * @param {HTMLElement} lyricsContainer - The lyrics display container
     */
    attachToAudio(audioElement, lyrics, lyricsContainer) {
        if (!audioElement || !lyrics || !lyricsContainer) return;

        // Store reference with current lyric index
        this.activePlayers.set(audioElement, {
            lyrics,
            lyricsContainer,
            currentIndex: -1
        });

        // Real-time lyrics sync on timeupdate
        const timeUpdateListener = () => {
            const currentTime = audioElement.currentTime;
            const data = this.activePlayers.get(audioElement);
            if (!data) return;

            // Find active lyric line for current time
            const activeLyricIndex = data.lyrics.findIndex(
                lyric => currentTime >= lyric.start && currentTime < lyric.end
            );

            // Only update if lyric changed (prevents flashing)
            if (activeLyricIndex !== data.currentIndex) {
                data.currentIndex = activeLyricIndex;

                if (activeLyricIndex >= 0) {
                    const activeLyric = data.lyrics[activeLyricIndex];
                    // Render karaoke-style dual-language lyrics
                    this.renderKaraokeLyrics(activeLyric.spanish, activeLyric.english, data.lyricsContainer);
                } else {
                    // Clear lyrics if no active line
                    data.lyricsContainer.innerHTML = '';
                }
            }
        };

        audioElement.addEventListener('timeupdate', timeUpdateListener);

        // Cleanup on audio end
        audioElement.addEventListener('ended', () => {
            this.activePlayers.delete(audioElement);
            lyricsContainer.innerHTML = '';
        }, { once: true });
    }

    /**
     * Render karaoke-style dual-language lyrics (Spanish + English)
     * Spotify 2025 pattern: Highlighted current line + scroll to center
     */
    renderKaraokeLyrics(spanishText, englishText, container) {
        if (!spanishText || !container) return;

        // Clear container
        container.innerHTML = '';

        // Create karaoke lyric block
        const lyricBlock = document.createElement('div');
        lyricBlock.className = 'karaoke-lyric-block';

        // Spanish line (primary, larger, highlighted)
        const spanishLine = document.createElement('div');
        spanishLine.className = 'karaoke-spanish';

        const spanishTextContainer = document.createElement('div');
        spanishTextContainer.className = 'lyric-text';

        // Make words clickable for translation (reuse word-level-subtitles pattern)
        if (window.WordLevelSubtitles) {
            if (!this.subtitleRenderer) {
                this.subtitleRenderer = new WordLevelSubtitles();
            }
            this.subtitleRenderer.makeWordsClickable(spanishText, spanishTextContainer);
        } else {
            spanishTextContainer.textContent = spanishText;
        }

        spanishLine.appendChild(spanishTextContainer);

        // English translation (secondary, smaller, subtle)
        const englishLine = document.createElement('div');
        englishLine.className = 'karaoke-english';
        const englishTextContainer = document.createElement('div');
        englishTextContainer.className = 'lyric-text';
        englishTextContainer.textContent = englishText || '(Translation loading...)';
        englishLine.appendChild(englishTextContainer);

        // Assemble
        lyricBlock.appendChild(spanishLine);
        lyricBlock.appendChild(englishLine);
        container.appendChild(lyricBlock);

        // Scroll animation (Spotify pattern)
        lyricBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* KARAOKE LYRICS CONTAINER - Spotify 2025 Pattern */
            .lyrics-karaoke-container {
                position: absolute;
                bottom: 100px; /* Above controls */
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 500px;
                max-height: 40vh;
                overflow-y: auto;
                scroll-behavior: smooth;
                z-index: 10;
                pointer-events: none;
                /* Hide scrollbar */
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .lyrics-karaoke-container::-webkit-scrollbar {
                display: none;
            }

            /* Karaoke lyric block - Active line highlighted */
            .karaoke-lyric-block {
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 20px 24px;
                border-radius: 16px;
                margin-bottom: 12px;
                pointer-events: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                animation: lyricSlideIn 0.4s ease;
                border-left: 4px solid var(--primary, #ff0050);
            }

            @keyframes lyricSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            /* Spanish lyrics - Primary, larger, highlighted */
            .karaoke-spanish {
                font-size: 22px;
                line-height: 1.6;
                color: #ffffff;
                font-weight: 700;
                margin-bottom: 12px;
                text-align: center;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
                animation: lyricGlow 0.3s ease;
            }

            @keyframes lyricGlow {
                0% { opacity: 0.7; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
            }

            /* English translation - Secondary, subtle */
            .karaoke-english {
                font-size: 16px;
                line-height: 1.5;
                color: rgba(255, 255, 255, 0.75);
                font-weight: 500;
                text-align: center;
            }

            .lyric-text {
                width: 100%;
            }

            /* MUSIC CARD IN FEED - TikTok-style full-screen */
            .music-card-feed {
                position: relative;
                width: 100%;
                height: 100vh;
                background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                scroll-snap-align: start;
            }

            /* Album art / Visual background */
            .music-visual {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-size: cover;
                background-position: center;
                filter: blur(40px);
                opacity: 0.3;
                z-index: 0;
            }

            /* Music info overlay */
            .music-info-overlay {
                position: absolute;
                top: 60px;
                left: 20px;
                right: 20px;
                z-index: 5;
                text-align: center;
            }

            .music-title {
                font-size: 32px;
                font-weight: 800;
                margin-bottom: 8px;
                color: white;
                text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
            }

            .music-artist {
                font-size: 18px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 16px;
            }

            .music-genre-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                padding: 6px 14px;
                border-radius: 16px;
                font-size: 13px;
                font-weight: 600;
                color: white;
            }

            /* Playback controls */
            .music-controls {
                position: absolute;
                bottom: 140px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 24px;
                z-index: 10;
            }

            .play-pause-btn {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary, #ff0050), var(--secondary, #667eea));
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 24px rgba(255, 0, 80, 0.4);
                transition: all 0.2s ease;
            }

            .play-pause-btn:active {
                transform: scale(0.9);
            }

            .skip-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .skip-btn:active {
                transform: scale(0.9);
            }

            /* Progress bar */
            .progress-bar-container {
                position: absolute;
                bottom: 220px;
                left: 20px;
                right: 20px;
                z-index: 10;
            }

            .progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary, #ff0050), var(--secondary, #667eea));
                border-radius: 2px;
                transition: width 0.1s linear;
            }

            .progress-time {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 6px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create full-screen music card for unified feed
     * @param {Object} musicData - {title, artist, genre, audioUrl, lyrics: [{start, end, spanish, english}]}
     */
    createMusicCard(musicData) {
        const card = document.createElement('div');
        card.className = 'reel music-card-feed';
        card.dataset.type = 'music';

        // Visual background (could be album art)
        const visual = document.createElement('div');
        visual.className = 'music-visual';
        if (musicData.albumArt) {
            visual.style.backgroundImage = `url(${musicData.albumArt})`;
        }

        // Music info overlay
        const infoOverlay = document.createElement('div');
        infoOverlay.className = 'music-info-overlay';
        infoOverlay.innerHTML = `
            <div class="music-title">${musicData.title}</div>
            <div class="music-artist">${musicData.artist}</div>
            <div class="music-genre-badge">${musicData.genre || 'Spanish Music'}</div>
        `;

        // Lyrics container (karaoke-style)
        const lyricsContainer = document.createElement('div');
        lyricsContainer.className = 'lyrics-karaoke-container';

        // Progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-time">
                <span class="current-time">0:00</span>
                <span class="total-time">0:00</span>
            </div>
        `;

        // Playback controls
        const controls = document.createElement('div');
        controls.className = 'music-controls';
        controls.innerHTML = `
            <button class="skip-btn" aria-label="Previous">⏮</button>
            <button class="play-pause-btn" aria-label="Play">▶️</button>
            <button class="skip-btn" aria-label="Next">⏭</button>
        `;

        // Audio element (hidden)
        const audio = document.createElement('audio');
        audio.src = musicData.audioUrl || '';
        audio.preload = 'metadata';

        // Assemble card
        card.appendChild(visual);
        card.appendChild(infoOverlay);
        card.appendChild(lyricsContainer);
        card.appendChild(progressContainer);
        card.appendChild(controls);
        card.appendChild(audio);

        // Attach karaoke lyrics sync
        if (musicData.lyrics && musicData.lyrics.length > 0) {
            this.attachToAudio(audio, musicData.lyrics, lyricsContainer);
        }

        // Play/pause button
        const playPauseBtn = controls.querySelector('.play-pause-btn');
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playPauseBtn.textContent = '⏸';
            } else {
                audio.pause();
                playPauseBtn.textContent = '▶️';
            }
        });

        // Update progress bar
        const progressFill = progressContainer.querySelector('.progress-fill');
        const currentTimeEl = progressContainer.querySelector('.current-time');
        const totalTimeEl = progressContainer.querySelector('.total-time');

        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = this.formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${progress}%`;
            currentTimeEl.textContent = this.formatTime(audio.currentTime);
        });

        return card;
    }

    /**
     * Format time in MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Export for use in unified-infinite-feed.html
if (typeof window !== 'undefined') {
    window.MusicPlayerKaraoke = MusicPlayerKaraoke;
}
