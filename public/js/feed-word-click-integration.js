    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPullToRefresh);
    } else {
        initPullToRefresh();
    }
})();

// Dispatch custom events for video completions
// Hook into existing video event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Observe video ended events
    setInterval(() => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.dataset.endListenerAdded) {
                video.addEventListener('ended', () => {
                    const event = new CustomEvent('video-completed', {
                        detail: { videoId: video.dataset.videoId || video.src }
                    });
                    document.dispatchEvent(event);
                });
                video.dataset.endListenerAdded = 'true';
            }

            // Track when video reaches 80% (considered "viewed")
            if (!video.dataset.viewListenerAdded) {
                video.addEventListener('timeupdate', function() {
                    if (this.currentTime / this.duration > 0.8 && !this.dataset.viewedTriggered) {
                        const event = new CustomEvent('video-viewed', {
                            detail: { videoId: this.dataset.videoId || this.src }
                        });
                        document.dispatchEvent(event);
                        this.dataset.viewedTriggered = 'true';
                    }
                });
                video.dataset.viewListenerAdded = 'true';
            }
        });
    }, 2000); // Check every 2 seconds for new videos
});

// Listen for word clicks (hook into existing translation popups)
document.addEventListener('click', (e) => {
    // Check if clicked on a Spanish word
    if (e.target.classList.contains('spanish-word') ||
        e.target.classList.contains('word') ||
        e.target.closest('.word-translation')) {

        const word = e.target.textContent || e.target.dataset.word;
        if (word) {
            const event = new CustomEvent('word-clicked', {
                detail: { word: word.trim() }
            });
            document.dispatchEvent(event);
        }
    }
}, true);

console.log('✅ Complete app integration snippet loaded');
