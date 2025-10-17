/**
 * 🎨 UNIFIED DESIGN LOADER
 * Automatically loads design system and unified navigation on all pages
 */

(function() {
    'use strict';
    
    // Load Design System CSS
    function loadDesignSystem() {
        if (document.getElementById('unified-design-system')) return;
        
        const link = document.createElement('link');
        link.id = 'unified-design-system';
        link.rel = 'stylesheet';
        link.href = '/design-system.css';
        document.head.appendChild(link);
    }
    
    // Load Unified Bottom Navigation
    function loadBottomNav() {
        if (document.getElementById('bottomNav')) return;
        if (window.innerWidth >= 1024) return; // Desktop doesn't need bottom nav
        
        fetch('/components/unified-bottom-nav.html')
            .then(response => response.text())
            .then(html => {
                // Create a container for the nav
                const navContainer = document.createElement('div');
                navContainer.innerHTML = html;
                document.body.appendChild(navContainer);
                
                // Highlight current page
                highlightCurrentPage();
            })
            .catch(error => console.warn('Could not load bottom navigation:', error));
    }
    
    // Highlight the current page in navigation
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navMapping = {
            '/': 'nav-videos',
            '/index.html': 'nav-videos',
            '/tiktok-video-feed.html': 'nav-videos',
            '/discover-ai.html': 'nav-discover',
            '/discover-feed.html': 'nav-discover',
            '/discover-articles.html': 'nav-discover',
            '/spanish-articles.html': 'nav-discover',
            '/music-player.html': 'nav-music',
            '/stories.html': 'nav-stories',
            '/profile.html': 'nav-profile',
            '/dashboard.html': 'nav-profile',
            '/saved-words.html': 'nav-profile',
            '/review-queue.html': 'nav-profile',
            '/games-hub.html': 'nav-profile'
        };
        
        const navId = navMapping[currentPath];
        if (navId) {
            const navItem = document.getElementById(navId);
            if (navItem) {
                navItem.classList.add('active');
            }
        }
    }
    
    // Add Meta Tags for PWA
    function addPWAMetaTags() {
        if (document.querySelector('meta[name="apple-mobile-web-app-capable"]')) return;
        
        const metaTags = [
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'theme-color', content: '#000000' }
        ];
        
        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
        });
    }
    
    // Optimize for touch devices
    function optimizeTouch() {
        // Disable double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Add touch-action for better scrolling
        document.body.style.touchAction = 'manipulation';
    }
    
    // Add smooth scroll behavior
    function addSmoothScroll() {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Performance: Preconnect to external domains
    function addPreconnects() {
        const domains = [
            'https://cdn.jsdelivr.net',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        loadDesignSystem();
        loadBottomNav();
        addPWAMetaTags();
        optimizeTouch();
        addSmoothScroll();
        addPreconnects();
        
        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('unifiedDesignLoaded'));
    }
})();

