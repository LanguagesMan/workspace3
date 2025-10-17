
.level-up-animation {
    animation: levelUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>

<script>
// Initialize pull-to-refresh
(function() {
    // Wait for DOM to be ready to avoid null appendChild error
    function initPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        const threshold = 80;
        let isPulling = false;

        const indicator = document.createElement('div');
        indicator.className = 'pull-to-refresh-indicator';
        indicator.textContent = '↓ Pull to refresh';
        if (document.body) {
            document.body.appendChild(indicator);
        } else {
            console.warn('document.body not ready for pull-to-refresh');
            return;
        }

        document.addEventListener('touchstart', (e) => {
            const scrollTop = document.querySelector('.feed-container')?.scrollTop || 0;
            if (scrollTop === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            pullDistance = e.touches[0].pageY - startY;

            if (pullDistance > 0) {
                indicator.style.opacity = Math.min(pullDistance / threshold, 1);
                if (pullDistance > threshold) {
                    indicator.textContent = '↑ Release to refresh';
                    indicator.style.color = '#00AACC';
                } else {
                    indicator.textContent = '↓ Pull to refresh';
                    indicator.style.color = '#00F5FF';
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (pullDistance > threshold) {
                indicator.textContent = '⟳ Refreshing...';
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                indicator.style.opacity = 0;
            }
            isPulling = false;
            pullDistance = 0;
        });
    }

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
