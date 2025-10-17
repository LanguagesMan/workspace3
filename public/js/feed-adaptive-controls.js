    <script src="/js/beginner-mode-integration.js"></script>
    
    <!-- 🧠 GENIUS ADAPTIVE SYSTEM INTEGRATION -->
    <!-- TEMPORARILY DISABLED: MIME type issues - will extract JS in separate fix -->
    <!-- <script src="/components/adaptive-difficulty-controls.html"></script> -->
    <!-- <script src="/components/beginner-mode-helper.html"></script> -->
    <script>
        // Initialize Adaptive Difficulty Controls
        document.addEventListener('DOMContentLoaded', () => {
            // Add adaptive controls container to each video card
            document.querySelectorAll('.video-card').forEach((card, index) => {
                const videoId = card.dataset.videoId || `video_${index}`;
                
                // Create container for adaptive controls
                const controlsContainer = document.createElement('div');
                controlsContainer.id = `adaptive-controls-${index}`;
                controlsContainer.style.position = 'absolute';
                controlsContainer.style.bottom = '120px';
                controlsContainer.style.left = '0';
                controlsContainer.style.right = '0';
                controlsContainer.style.padding = '0 16px';
                controlsContainer.style.zIndex = '100';
                
                card.appendChild(controlsContainer);
                
                // Initialize adaptive controls when card is visible
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Initialize controls for this video
                            if (window.AdaptiveDifficultyControls) {
                                new AdaptiveDifficultyControls(`adaptive-controls-${index}`, {
                                    contentId: videoId,
                                    contentType: 'video',
                                    showLevelIndicator: true,
                                    showProgress: true,
                                    onFeedback: (type, data) => {
                                        console.log('🎯 User feedback:', type, data);
                                        
                                        // If user says "too hard", could show simplified captions
                                        if (type === 'too_hard') {
                                            console.log('User needs easier content - system will adapt');
                                        } else if (type === 'too_easy') {
                                            console.log('User wants challenge - system will adapt');
                                        }
                                    }
                                });
                            }
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(card);
            });
            
            // Initialize beginner mode helper (shows at top if user is beginner)
            const beginnerContainer = document.createElement('div');
            beginnerContainer.id = 'beginner-helper-container';
            beginnerContainer.style.position = 'fixed';
            beginnerContainer.style.top = '60px';
            beginnerContainer.style.left = '0';
            beginnerContainer.style.right = '0';
            beginnerContainer.style.zIndex = '1000';
            beginnerContainer.style.padding = '0 16px';
            
            document.body.appendChild(beginnerContainer);
            
            if (window.BeginnerModeHelper) {
                new BeginnerModeHelper('beginner-helper-container', {
                    showTips: true,
                    showProgress: true,
