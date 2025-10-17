/**
 * SIMPLE TRANSCRIPTION SYSTEM - YouTube Shorts 2025 Pattern
 * NO complex initialization - just works immediately
 */

// Global subtitle system - automatically initializes
window.SimpleTranscriptions = {

    // Add subtitles to ANY video element
    addTo(videoElement, subtitles) {
        if (!videoElement || !subtitles || subtitles.length === 0) return;

        console.log('🎯 Adding transcriptions to video:', videoElement);

        // Find or create subtitle container
        let container = videoElement.parentElement.querySelector('.video-subtitle-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'video-subtitle-container';
            container.style.cssText = `
                position: absolute;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 500px;
                z-index: 100;
                pointer-events: none;
            `;
            videoElement.parentElement.appendChild(container);
        }

        // Update subtitles as video plays
        const updateSubtitles = () => {
            const currentTime = videoElement.currentTime;

            // Find active subtitle
            const activeSubtitle = subtitles.find(sub =>
                currentTime >= sub.start && currentTime < sub.end
            );

            if (activeSubtitle) {
                // Render dual-language captions
                container.innerHTML = `
                    <div style="
                        background: rgba(0, 0, 0, 0.85);
                        backdrop-filter: blur(20px);
                        padding: 16px 20px;
                        border-radius: 16px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                        transition: opacity 0.2s ease;
                        pointer-events: auto;
                    ">
                        <div style="
                            font-size: 18px;
                            color: #ffffff;
                            font-weight: 700;
                            margin-bottom: 8px;
                            display: flex;
                            align-items: center;
                        ">
                            <span style="margin-right: 8px;">🇪🇸</span>
                            <span>${activeSubtitle.spanish}</span>
                        </div>
                        <div style="
                            font-size: 16px;
                            color: rgba(255, 255, 255, 0.85);
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                        ">
                            <span style="margin-right: 8px;">🇺🇸</span>
                            <span>${activeSubtitle.english}</span>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = '';
            }
        };

        // Listen to video timeupdate
        videoElement.addEventListener('timeupdate', updateSubtitles);

        // Initial update
        updateSubtitles();

        console.log('✅ Transcriptions attached and active');
    },

    // Auto-attach to all videos - fetch REAL subtitles from API
    async autoInit() {
        console.log('🚀 Auto-initializing transcriptions with REAL data from API...');

        // Find all videos
        const videos = document.querySelectorAll('video[data-video-id]');
        console.log(`📹 Found ${videos.length} videos`);

        // Fetch real video data from API
        try {
            const response = await fetch('/api/videos');
            const videosData = await response.json();
            console.log(`✅ Fetched ${videosData.length} videos with real transcriptions from API`);

            videos.forEach((video, index) => {
                const videoId = video.getAttribute('data-video-id');

                // Find matching video data from API
                const videoData = videosData.find(v => v.id === videoId) || videosData[index];

                if (videoData && videoData.transcription && videoData.transcription.lines) {
                    // Convert API format to subtitle format
                    const subtitles = videoData.transcription.lines.map(line => ({
                        start: line.startTime,
                        end: line.endTime,
                        spanish: line.spanish,  // Already has AI punctuation from API!
                        english: line.english   // Real translation from API!
                    }));

                    console.log(`📝 Adding ${subtitles.length} REAL subtitle lines to video ${index}`);

                    // Add real transcriptions
                    this.addTo(video, subtitles);
                } else {
                    console.warn(`⚠️ No transcription data for video ${index}`);
                }
            });

            console.log('✅ All videos have REAL transcriptions with AI punctuation!');
        } catch (error) {
            console.error('❌ Error fetching transcriptions from API:', error);
            console.log('📝 Falling back to basic subtitles...');

            // Fallback: basic subtitles if API fails
            videos.forEach((video) => {
                const fallbackSubs = [
                    { start: 0, end: 3, spanish: 'Cargando transcripciones...', english: 'Loading transcriptions...' }
                ];
                this.addTo(video, fallbackSubs);
            });
        }
    }
};

// Smooth transitions only - no flashing animations
const style = document.createElement('style');
style.textContent = `
    .video-subtitle-container {
        transition: opacity 0.2s ease !important;
    }
`;
document.head.appendChild(style);

// Auto-initialize - keep trying until videos appear (async support)
let initAttempts = 0;
const tryInit = async () => {
    const videos = document.querySelectorAll('video[data-video-id]');
    if (videos.length > 0) {
        console.log(`🎯 Found ${videos.length} videos, initializing REAL transcriptions from API...`);
        await window.SimpleTranscriptions.autoInit();
    } else {
        initAttempts++;
        if (initAttempts < 20) {  // Try for 10 seconds
            console.log(`⏳ Waiting for videos to load... (attempt ${initAttempts}/20)`);
            setTimeout(tryInit, 500);
        } else {
            console.warn('⚠️ No videos found after 10 seconds');
        }
    }
};

// Start trying
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(tryInit, 500);
    });
} else {
    setTimeout(tryInit, 500);
}

console.log('✅ Simple Transcription System loaded');
