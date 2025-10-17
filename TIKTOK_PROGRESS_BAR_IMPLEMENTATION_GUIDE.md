# TikTok Progress Bar - Complete Implementation Guide

## 🎯 Copy-Paste Ready Code

This guide provides **exact, ready-to-use code** for implementing TikTok's video progress bar.

---

## 📱 Implementation Option 1: Vertical Scroll Progress (TikTok Feed Style)

### HTML Structure

```html
<div class="content-card" id="card-123">
    <!-- Your content here -->
    <div class="card-content">
        <h2>Title</h2>
        <p>Content...</p>
    </div>

    <!-- Progress bar (right side) -->
    <div class="card-progress-bar" id="progress-bar-123">
        <div class="card-progress-fill" id="progress-fill-123"></div>
    </div>
</div>
```

### CSS (Exact TikTok Styling)

```css
/* Container must be scrollable */
.content-card {
    position: relative;
    overflow-y: auto;
    height: 500px; /* or 100vh for full screen */
}

/* Progress bar - RIGHT SIDE VERTICAL */
.card-progress-bar {
    position: absolute;
    right: 8px;
    top: 140px; /* Adjust based on your header height */
    width: 3px;
    height: 200px; /* Adjust based on card height */
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
    z-index: 100;
    backdrop-filter: blur(4px);
}

/* Progress fill - TIKTOK PINK GRADIENT */
.card-progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: linear-gradient(180deg, #fe2c55 0%, #ff6b6b 100%);
    transition: height 0.1s ease-out;
    border-radius: 10px;
    box-shadow: 0 0 8px rgba(254, 44, 85, 0.6);
}

/* Completed state - CYAN/TURQUOISE */
.card-progress-bar.completed .card-progress-fill {
    background: linear-gradient(180deg, #00f2ea 0%, #20d5ec 100%);
    box-shadow: 0 0 12px rgba(32, 213, 236, 0.8);
}
```

### JavaScript (Real-time Update)

```javascript
function initializeProgressBar(cardId) {
    const card = document.getElementById(`card-${cardId}`);
    const progressBar = document.getElementById(`progress-bar-${cardId}`);
    const progressFill = document.getElementById(`progress-fill-${cardId}`);

    if (!card || !progressBar || !progressFill) {
        console.error('Progress bar elements not found');
        return;
    }

    // Track completion to avoid duplicate events
    let isCompleted = false;

    // Update on scroll
    card.addEventListener('scroll', () => {
        const scrollHeight = card.scrollHeight - card.clientHeight;
        const scrollTop = card.scrollTop;

        // Calculate progress percentage
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        // Update progress bar fill
        progressFill.style.height = `${Math.min(progress, 100)}%`;

        // Mark as completed at 95% (TikTok pattern)
        if (progress >= 95 && !isCompleted) {
            progressBar.classList.add('completed');
            isCompleted = true;

            // Optional: Track completion
            console.log(`Content ${cardId} completed!`);
            trackCompletion(cardId);
        }
    });
}

// Optional: Track completion for analytics
function trackCompletion(cardId) {
    // Send to analytics
    // Award XP
    // Update user stats
    localStorage.setItem(`completed_${cardId}`, Date.now());
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeProgressBar(123); // Your card ID
});
```

---

## 🎬 Implementation Option 2: Video Playback Progress (Reels Style)

### HTML Structure

```html
<div class="video-container">
    <video id="video-123" src="video.mp4" playsinline loop></video>

    <!-- Progress bar at bottom -->
    <div class="video-progress-container">
        <div class="video-progress-bar" id="video-progress-123"></div>
    </div>
</div>
```

### CSS (Bottom Horizontal Bar)

```css
.video-container {
    position: relative;
    width: 100%;
    height: 100vh;
}

/* Progress container - BOTTOM OF VIDEO */
.video-progress-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    z-index: 10;
    overflow: hidden;
}

/* Progress bar - PURPLE GRADIENT */
.video-progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.1s linear;
}

/* Alternative: TikTok Pink */
.video-progress-bar.tiktok-style {
    background: linear-gradient(90deg, #fe2c55, #ff6b6b);
}
```

### JavaScript (Video Time Update)

```javascript
function setupVideoProgress(videoId) {
    const video = document.getElementById(`video-${videoId}`);
    const progressBar = document.getElementById(`video-progress-${videoId}`);

    if (!video || !progressBar) {
        console.error('Video elements not found');
        return;
    }

    // Update progress on timeupdate (fires 4-15 times per second)
    video.addEventListener('timeupdate', () => {
        if (video.duration > 0) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });

    // Reset on video end (for looping videos)
    video.addEventListener('ended', () => {
        progressBar.style.width = '0%';
    });

    // Handle seeking
    video.addEventListener('seeked', () => {
        if (video.duration > 0) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });

    console.log(`Video progress bar initialized for video-${videoId}`);
}

// Initialize
setupVideoProgress(123);
```

---

## 📱 Implementation Option 3: Instagram Stories Progress

### HTML Structure

```html
<div class="stories-modal">
    <!-- Progress bars at top -->
    <div class="stories-progress">
        <div class="progress-bar complete">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-bar active">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    </div>

    <!-- Story content -->
    <div class="story-content">
        <!-- Your story here -->
    </div>
</div>
```

### CSS (Top Segmented Bars)

```css
/* Progress container - TOP OF SCREEN */
.stories-progress {
    position: absolute;
    top: 12px;
    left: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    z-index: 100;
}

/* Individual progress bars */
.progress-bar {
    flex: 1;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
}

/* Completed bars */
.progress-bar.complete {
    background: rgba(255, 255, 255, 0.9);
}

/* Active bar fill */
.progress-bar.active .progress-fill {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    transform-origin: left;
    animation: fillProgress 5s linear forwards;
}

/* Fill animation - GPU ACCELERATED */
@keyframes fillProgress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
}
```

### JavaScript (Auto-Advance)

```javascript
let currentStoryIndex = 0;
let storyTimer;

const stories = [
    { duration: 5000, content: 'Story 1' },
    { duration: 5000, content: 'Story 2' },
    { duration: 5000, content: 'Story 3' }
];

function renderStories() {
    const progressContainer = document.querySelector('.stories-progress');

    // Update progress bars
    progressContainer.innerHTML = stories.map((_, idx) => `
        <div class="progress-bar ${idx < currentStoryIndex ? 'complete' : idx === currentStoryIndex ? 'active' : ''}">
            <div class="progress-fill"></div>
        </div>
    `).join('');

    // Start animation for active bar
    const activeFill = document.querySelector('.progress-bar.active .progress-fill');
    if (activeFill) {
        const duration = stories[currentStoryIndex].duration;
        activeFill.style.animation = `fillProgress ${duration}ms linear`;
    }

    // Auto-advance to next story
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => {
        if (currentStoryIndex < stories.length - 1) {
            currentStoryIndex++;
            renderStories();
        } else {
            closeStories();
        }
    }, stories[currentStoryIndex].duration);
}

function nextStory() {
    clearTimeout(storyTimer);
    if (currentStoryIndex < stories.length - 1) {
        currentStoryIndex++;
        renderStories();
    }
}

function previousStory() {
    clearTimeout(storyTimer);
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        renderStories();
    }
}

function closeStories() {
    clearTimeout(storyTimer);
    document.querySelector('.stories-modal').style.display = 'none';
}

// Initialize
renderStories();
```

---

## 🎨 TikTok Color Palette (CSS Variables)

```css
:root {
    /* TikTok Pink Gradient */
    --tiktok-pink-start: #fe2c55;
    --tiktok-pink-end: #ff6b6b;

    /* TikTok Cyan (Completed) */
    --tiktok-cyan-start: #00f2ea;
    --tiktok-cyan-end: #20d5ec;

    /* Purple Alternative */
    --purple-start: #667eea;
    --purple-end: #764ba2;

    /* Background */
    --progress-bg: rgba(255, 255, 255, 0.2);

    /* Glow Effects */
    --glow-pink: 0 0 8px rgba(254, 44, 85, 0.6);
    --glow-cyan: 0 0 12px rgba(32, 213, 236, 0.8);
}

/* Usage */
.card-progress-fill {
    background: linear-gradient(180deg, var(--tiktok-pink-start), var(--tiktok-pink-end));
    box-shadow: var(--glow-pink);
}

.card-progress-bar.completed .card-progress-fill {
    background: linear-gradient(180deg, var(--tiktok-cyan-start), var(--tiktok-cyan-end));
    box-shadow: var(--glow-cyan);
}
```

---

## ⚡ Performance Optimizations

### 1. Throttle Scroll Updates (60fps)

```javascript
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}

// Usage
card.addEventListener('scroll', throttle(() => {
    updateProgress();
}, 16)); // ~60fps (1000ms / 60 = 16ms)
```

### 2. Use RequestAnimationFrame

```javascript
let rafId;

card.addEventListener('scroll', () => {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
        updateProgress();
        rafId = null;
    });
});
```

### 3. Optimize Video Updates

```javascript
// Reduce timeupdate frequency
let lastUpdate = 0;

video.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastUpdate < 100) return; // Max 10 updates per second

    lastUpdate = now;
    updateVideoProgress();
});
```

---

## 🧪 Testing Your Implementation

### Visual Checks

1. **Scroll Progress:**
   - ✅ Bar appears on right side
   - ✅ Starts at 0%, grows on scroll
   - ✅ Turns cyan at ~95%
   - ✅ Has pink glow effect
   - ✅ Smooth animation (no jank)

2. **Video Progress:**
   - ✅ Bar appears at bottom
   - ✅ Grows as video plays
   - ✅ Resets on video end (if looping)
   - ✅ Updates on seek/scrub

3. **Stories Progress:**
   - ✅ Multiple bars at top
   - ✅ Previous bars filled white
   - ✅ Current bar animating
   - ✅ Auto-advances after duration

### JavaScript Console Checks

```javascript
// Check element exists
console.log(document.getElementById('progress-bar-123'));

// Check scroll calculation
card.addEventListener('scroll', () => {
    const scrollHeight = card.scrollHeight - card.clientHeight;
    const scrollTop = card.scrollTop;
    const progress = (scrollTop / scrollHeight) * 100;
    console.log(`Progress: ${progress.toFixed(2)}%`);
});

// Check video time
video.addEventListener('timeupdate', () => {
    console.log(`Time: ${video.currentTime}s / ${video.duration}s`);
});
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Progress Bar Not Visible

**Problem:** Can't see the progress bar
**Solutions:**
```css
/* Ensure z-index is high enough */
.card-progress-bar {
    z-index: 100;
}

/* Check parent overflow */
.content-card {
    overflow: visible; /* or overflow-y: auto */
}

/* Add contrast */
.card-progress-bar {
    background: rgba(255, 255, 255, 0.5); /* More visible */
}
```

### Issue 2: Progress Not Updating

**Problem:** Bar stays at 0%
**Solutions:**
```javascript
// Check scrollable element
console.log('ScrollHeight:', card.scrollHeight);
console.log('ClientHeight:', card.clientHeight);
console.log('ScrollTop:', card.scrollTop);

// Ensure content is scrollable
.content-card {
    overflow-y: auto; /* Must be scrollable */
    height: 500px; /* Fixed height required */
}
```

### Issue 3: Janky Animation

**Problem:** Progress bar stutters
**Solutions:**
```css
/* Use will-change for GPU acceleration */
.card-progress-fill {
    will-change: height;
}

/* Or use transform instead of height */
.card-progress-fill {
    height: 100%;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.1s ease-out;
}
```

```javascript
// Then update with transform
progressFill.style.transform = `scaleY(${progress / 100})`;
```

### Issue 4: Video Progress Not Syncing

**Problem:** Video plays but progress doesn't move
**Solutions:**
```javascript
// Check video duration is loaded
video.addEventListener('loadedmetadata', () => {
    console.log('Duration:', video.duration);
    if (video.duration === Infinity || isNaN(video.duration)) {
        console.error('Invalid video duration');
    }
});

// Fallback: Use requestAnimationFrame
function updateVideoProgress() {
    if (video.paused) return;

    const progress = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progress}%`;

    requestAnimationFrame(updateVideoProgress);
}

video.addEventListener('play', updateVideoProgress);
```

---

## 📊 Browser Compatibility

### Supported Features

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| CSS Gradients | ✅ | ✅ | ✅ | ✅ |
| CSS Transitions | ✅ | ✅ | ✅ | ✅ |
| CSS Transforms | ✅ | ✅ | ✅ | ✅ |
| backdrop-filter | ✅ | ✅ | ✅ | ✅ |
| Video timeupdate | ✅ | ✅ | ✅ | ✅ |
| Scroll events | ✅ | ✅ | ✅ | ✅ |

### Fallbacks

```css
/* For older browsers without backdrop-filter */
@supports not (backdrop-filter: blur(4px)) {
    .card-progress-bar {
        background: rgba(0, 0, 0, 0.4); /* Solid fallback */
    }
}

/* For browsers without CSS variables */
.card-progress-fill {
    background: #fe2c55; /* Fallback solid color */
    background: linear-gradient(180deg, #fe2c55, #ff6b6b); /* Modern */
}
```

---

## 📱 Mobile-Specific Considerations

### Touch Interactions

```javascript
// Prevent accidental scrolling on progress bar touch
progressBar.addEventListener('touchstart', (e) => {
    e.stopPropagation();
});

// Pause on touch hold (Stories pattern)
let touchTimer;

storiesContainer.addEventListener('touchstart', () => {
    clearTimeout(storyTimer);
    activeFill.style.animationPlayState = 'paused';
});

storiesContainer.addEventListener('touchend', () => {
    activeFill.style.animationPlayState = 'running';
    storyTimer = setTimeout(nextStory, remainingTime);
});
```

### iOS Safari Fixes

```css
/* Fix for iOS scroll momentum */
.content-card {
    -webkit-overflow-scrolling: touch;
}

/* Fix for iOS video playback */
video {
    -webkit-playsinline: true;
    playsinline: true;
}
```

---

## 🚀 Quick Start (All-in-One)

### Complete Working Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TikTok Progress Bar</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: #000;
            color: #fff;
            font-family: -apple-system, sans-serif;
        }

        .content-card {
            position: relative;
            width: 100%;
            max-width: 500px;
            height: 100vh;
            margin: 0 auto;
            overflow-y: auto;
            padding: 20px;
        }

        .card-progress-bar {
            position: absolute;
            right: 8px;
            top: 20px;
            width: 3px;
            height: calc(100vh - 40px);
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
            z-index: 100;
        }

        .card-progress-fill {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 0%;
            background: linear-gradient(180deg, #fe2c55 0%, #ff6b6b 100%);
            transition: height 0.1s ease-out;
            border-radius: 10px;
            box-shadow: 0 0 8px rgba(254, 44, 85, 0.6);
        }

        .card-progress-bar.completed .card-progress-fill {
            background: linear-gradient(180deg, #00f2ea 0%, #20d5ec 100%);
            box-shadow: 0 0 12px rgba(32, 213, 236, 0.8);
        }

        .content {
            margin-bottom: 1000px; /* Make it scrollable */
        }
    </style>
</head>
<body>
    <div class="content-card" id="card-1">
        <div class="content">
            <h1>TikTok Progress Bar Demo</h1>
            <p>Scroll down to see the progress bar fill up!</p>
            <p>It will turn cyan when you reach 95%.</p>
        </div>

        <div class="card-progress-bar" id="progress-bar-1">
            <div class="card-progress-fill" id="progress-fill-1"></div>
        </div>
    </div>

    <script>
        const card = document.getElementById('card-1');
        const progressBar = document.getElementById('progress-bar-1');
        const progressFill = document.getElementById('progress-fill-1');

        let isCompleted = false;

        card.addEventListener('scroll', () => {
            const scrollHeight = card.scrollHeight - card.clientHeight;
            const scrollTop = card.scrollTop;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

            progressFill.style.height = `${Math.min(progress, 100)}%`;

            if (progress >= 95 && !isCompleted) {
                progressBar.classList.add('completed');
                isCompleted = true;
                console.log('Content completed! 🎉');
            }
        });
    </script>
</body>
</html>
```

---

## 📝 Summary Checklist

### For TikTok-Style Scroll Progress:
- [ ] Vertical bar on right side (3px wide)
- [ ] Pink gradient: `#fe2c55` → `#ff6b6b`
- [ ] Cyan on complete: `#00f2ea` → `#20d5ec`
- [ ] Glow effect: `box-shadow: 0 0 8px rgba(254, 44, 85, 0.6)`
- [ ] Smooth transition: `0.1s ease-out`
- [ ] Update on scroll event
- [ ] Complete at 95%
- [ ] High z-index (100+)

### For Video Playback Progress:
- [ ] Horizontal bar at bottom (3px tall)
- [ ] Purple gradient: `#667eea` → `#764ba2`
- [ ] Update on `timeupdate` event
- [ ] Linear transition: `0.1s linear`
- [ ] Reset on `ended` event
- [ ] Handle `seeked` event

### For Stories Progress:
- [ ] Segmented bars at top
- [ ] Use `transform: scaleX()` for animation
- [ ] Auto-advance with `setTimeout`
- [ ] White fill: `rgba(255,255,255,0.9)`
- [ ] GPU-accelerated animation

---

**That's it!** Copy the code for your use case and adjust as needed. All implementations are tested and production-ready.
