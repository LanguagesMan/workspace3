# 🎨 UI Component Library
**Agent 2: Frontend Engineer - Reusable Component Documentation**

**Date:** October 16, 2025  
**Platform:** Langflix Spanish Learning App  
**Status:** ✅ PRODUCTION READY

---

## Overview

This document catalogs all reusable UI components in the Langflix app, providing usage examples, accessibility guidelines, and customization options.

**Design System:** TikTok-inspired dark mode with mobile-first approach  
**Framework:** Vanilla JavaScript + CSS3  
**Browser Support:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Navigation Components](#navigation-components)
3. [Video Components](#video-components)
4. [Content Components](#content-components)
5. [Interactive Components](#interactive-components)
6. [Feedback Components](#feedback-components)
7. [Layout Components](#layout-components)
8. [Utility Components](#utility-components)

---

## 1. Design Tokens

### Color Palette

```css
:root {
    /* Primary Colors */
    --primary: #ff0050;              /* Brand red */
    --secondary: #667eea;            /* Brand blue */
    
    /* Background Colors */
    --bg-dark: #000000;              /* Main background */
    --bg-card: #1a1a1a;              /* Card background */
    
    /* Text Colors */
    --text-primary: #ffffff;         /* Primary text */
    --text-secondary: rgba(255, 255, 255, 0.7);  /* Secondary text */
    
    /* Border & Dividers */
    --border: rgba(255, 255, 255, 0.1);
    
    /* Status Colors */
    --success: #00b894;
    --error: #d63031;
    --warning: #fdcb6e;
    --info: #0984e3;
    
    /* Safe Areas (iOS) */
    --safe-area-top: env(safe-area-inset-top, 0);
    --safe-area-bottom: env(safe-area-inset-bottom, 0);
}
```

### Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;

/* Font Sizes */
--font-xs: 11px;    /* Nav labels */
--font-sm: 13px;    /* Captions */
--font-base: 15px;  /* Body text */
--font-lg: 18px;    /* Card titles */
--font-xl: 22px;    /* Section headers */
--font-2xl: 28px;   /* Main titles */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.8;
```

### Spacing Scale

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
--spacing-4xl: 48px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.4);
```

---

## 2. Navigation Components

### Bottom Navigation

**Description:** Instagram-style fixed bottom navigation with 4-5 tabs

**HTML:**
```html
<nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    <button class="nav-item active" 
            data-section="feed" 
            aria-label="Navigate to feed"
            aria-selected="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="nav-label">Feed</span>
    </button>
    <!-- More nav items -->
</nav>
```

**CSS:**
```css
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: rgba(0, 0, 0, 0.98);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
}

.nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    min-height: 44px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-item.active {
    color: var(--primary);
}

.nav-item svg {
    width: 28px;
    height: 28px;
}

.nav-label {
    font-size: 11px;
    font-weight: 600;
}
```

**Accessibility:**
- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Touch targets ≥ 44x44px

**Usage:**
```javascript
setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(nav => {
                nav.classList.remove('active');
                nav.setAttribute('aria-selected', 'false');
            });
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');
            
            // Navigate to section
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });
}
```

### Feed Tabs

**Description:** Horizontal tabs for switching between Videos and News

**HTML:**
```html
<div class="feed-tabs" role="tablist">
    <button class="feed-tab active" 
            data-feed="videos" 
            role="tab"
            aria-selected="true"
            aria-controls="videos-panel">
        Videos
    </button>
    <button class="feed-tab" 
            data-feed="articles" 
            role="tab"
            aria-selected="false"
            aria-controls="articles-panel">
        News
    </button>
</div>
```

**CSS:**
```css
.feed-tabs {
    position: sticky;
    top: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    display: flex;
    border-bottom: 1px solid var(--border);
    z-index: 100;
}

.feed-tab {
    flex: 1;
    padding: 16px 12px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
}

.feed-tab.active {
    color: #ffffff;
}

.feed-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: var(--primary);
}
```

---

## 3. Video Components

### Video Player

**Description:** TikTok-style full-screen video with transcription overlay

**HTML:**
```html
<div class="video-item">
    <video class="video-player" 
           src="/videos/sample.mp4" 
           playsinline 
           loop 
           muted
           preload="metadata"
           aria-label="Learning video 1">
    </video>
    
    <div class="video-overlay">
        <div class="transcription-box" role="region" aria-label="Video transcription">
            <div class="trans-line">
                <div class="trans-es" lang="es">¡Hola! Estoy aprendiendo español.</div>
                <div class="trans-en" lang="en">Hello! I am learning Spanish.</div>
            </div>
        </div>
        
        <button class="video-control-btn mute-btn" aria-label="Unmute video">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            </svg>
        </button>
    </div>
</div>
```

**CSS:**
```css
.video-item {
    width: 100%;
    height: 100vh;
    position: relative;
    background: #000;
    scroll-snap-align: start;
}

.video-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.video-overlay {
    position: absolute;
    bottom: 90px;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
    pointer-events: none;
}

.video-overlay * {
    pointer-events: auto;
}

.transcription-box {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(15px);
    border-radius: 16px;
    padding: 20px;
    max-height: 220px;
    overflow-y: auto;
}

.trans-es {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 6px;
}

.trans-en {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
}

.video-control-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 50%;
    cursor: pointer;
}
```

### Clickable Word

**Description:** Interactive word with translation tooltip

**HTML:**
```html
<span class="word-clickable" 
      data-word="hola" 
      tabindex="0" 
      role="button" 
      aria-label="Click to translate hola">
    hola
    <span class="word-tooltip">hello</span>
</span>
```

**CSS:**
```css
.word-clickable {
    cursor: pointer;
    padding: 3px 6px;
    border-radius: 6px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-block;
    position: relative;
}

.word-clickable:hover,
.word-clickable:focus {
    background: var(--primary);
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 0, 80, 0.4);
}

.word-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    background: var(--primary);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}

.word-clickable:hover .word-tooltip {
    opacity: 1;
}
```

---

## 4. Content Components

### Article Card

**Description:** News article card with actions

**HTML:**
```html
<article class="article-card" role="article">
    <h3 class="article-title">Spanish News Article Title</h3>
    <div class="article-content" lang="es">
        Content goes here...
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
</article>
```

**CSS:**
```css
.article-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid var(--border);
}

.article-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.3;
}

.article-content {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-secondary);
}

.article-footer {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
}

.article-btn {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
}

.article-btn:hover {
    background: var(--primary);
    border-color: var(--primary);
}
```

---

## 5. Interactive Components

### Button - Primary

**HTML:**
```html
<button class="btn btn-primary">
    Click Me
</button>
```

**CSS:**
```css
.btn {
    padding: 14px 32px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    min-height: 44px;
    min-width: 44px;
}

.btn-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 16px rgba(255, 0, 80, 0.3);
}

.btn-primary:hover {
    background: #ff1a5e;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 0, 80, 0.4);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

### Button - Secondary

**HTML:**
```html
<button class="btn btn-secondary">
    Secondary Action
</button>
```

**CSS:**
```css
.btn-secondary {
    background: transparent;
    color: var(--text-primary);
    border: 2px solid var(--border);
}

.btn-secondary:hover {
    border-color: var(--primary);
    color: var(--primary);
}
```

---

## 6. Feedback Components

### Toast Notification

**Description:** Temporary notification message

**JavaScript:**
```javascript
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Usage
showToast('Video saved!', 'success');
showToast('Failed to load', 'error');
showToast('Loading content...', 'info');
```

**CSS:**
```css
.toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    padding: 16px 24px;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.toast-success {
    background: linear-gradient(135deg, #00b894, #00cec9);
}

.toast-error {
    background: linear-gradient(135deg, #d63031, #e17055);
}

.toast-info {
    background: linear-gradient(135deg, #0984e3, #74b9ff);
}
```

### Error State

**HTML:**
```html
<div class="error-state" role="alert">
    <div class="error-icon">⚠️</div>
    <h3>Oops! Something went wrong</h3>
    <p>Failed to load videos. Please check your connection.</p>
    <button class="retry-btn" onclick="retryLoad()">
        🔄 Try Again
    </button>
</div>
```

**CSS:**
```css
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    text-align: center;
    min-height: 400px;
}

.error-icon {
    font-size: 64px;
    margin-bottom: 24px;
}

.error-state h3 {
    font-size: 24px;
    margin-bottom: 12px;
}

.error-state p {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.retry-btn {
    padding: 14px 32px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 24px;
    font-weight: 600;
    cursor: pointer;
}
```

### Skeleton Loader

**HTML:**
```html
<div class="skeleton skeleton-video" role="status" aria-label="Loading content">
    <div class="skeleton-video-player"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text short"></div>
</div>
```

**CSS:**
```css
@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}

.skeleton {
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.05) 75%
    );
    background-size: 2000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 16px;
    padding: 20px;
}

.skeleton-video-player {
    width: 100%;
    height: 500px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    margin-bottom: 16px;
}

.skeleton-text {
    height: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: 12px;
}

.skeleton-text.short {
    width: 60%;
}
```

### Loading Spinner

**HTML:**
```html
<div class="loading-spinner" role="status" aria-label="Loading">
    <span class="sr-only">Loading...</span>
</div>
```

**CSS:**
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
```

---

## 7. Layout Components

### Section Container

**Description:** Full-screen section for different app areas

**HTML:**
```html
<div class="section active" id="feed-section" aria-hidden="false">
    <!-- Section content -->
</div>
```

**CSS:**
```css
.section {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    overflow-y: auto;
}

.section.active {
    opacity: 1;
    pointer-events: all;
}
```

### Card Container

**HTML:**
```html
<div class="card">
    <div class="card-header">
        <h2>Card Title</h2>
    </div>
    <div class="card-body">
        Card content goes here
    </div>
    <div class="card-footer">
        Footer content
    </div>
</div>
```

**CSS:**
```css
.card {
    background: var(--bg-card);
    border-radius: 16px;
    border: 1px solid var(--border);
    overflow: hidden;
}

.card-header {
    padding: 20px;
    border-bottom: 1px solid var(--border);
}

.card-body {
    padding: 20px;
}

.card-footer {
    padding: 20px;
    border-top: 1px solid var(--border);
}
```

---

## 8. Utility Components

### Screen Reader Only

**Description:** Content visible only to screen readers

**HTML:**
```html
<span class="sr-only">Additional context for screen readers</span>
```

**CSS:**
```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

### Skip to Main Content

**HTML:**
```html
<a href="#main-content" class="skip-to-main">
    Skip to main content
</a>
```

**CSS:**
```css
.skip-to-main {
    position: absolute;
    top: -100px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    font-weight: 600;
    z-index: 10000;
}

.skip-to-main:focus {
    top: 0;
}
```

---

## Usage Guidelines

### Accessibility Best Practices

1. **Always include ARIA labels** for interactive elements
2. **Use semantic HTML** (article, nav, button, etc.)
3. **Ensure keyboard navigation** works for all components
4. **Test with screen readers** (VoiceOver, NVDA, TalkBack)
5. **Maintain color contrast** of at least 4.5:1 (WCAG AA)
6. **Add focus indicators** for all interactive elements

### Mobile Optimization

1. **Touch targets** must be ≥ 44x44px
2. **Add touch feedback** with `:active` or `.touch-active` states
3. **Use safe area insets** for notched devices
4. **Test on real devices** (iOS and Android)
5. **Optimize for gestures** (swipe, pinch, tap)

### Performance Guidelines

1. **Use GPU acceleration** with `transform: translateZ(0)`
2. **Add `will-change`** for animated properties
3. **Use `contain`** for layout optimization
4. **Lazy load** images and videos
5. **Minimize reflows** with layout containment

---

## Component Checklist

When creating new components, ensure:

- [ ] Semantic HTML structure
- [ ] Mobile-first responsive design
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Touch targets ≥ 44x44px
- [ ] Focus indicators visible
- [ ] Loading states included
- [ ] Error states handled
- [ ] Touch feedback added
- [ ] GPU acceleration where needed
- [ ] Tested on iOS and Android
- [ ] Screen reader tested
- [ ] Color contrast passes WCAG AA

---

## Conclusion

This component library provides all the building blocks needed to build consistent, accessible, and performant interfaces for the Langflix app. All components follow modern web standards and best practices.

**Status:** ✅ PRODUCTION READY  
**Maintained By:** Frontend Engineering Team

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** October 16, 2025  
**Created By:** Agent 2 (Frontend Engineer)

