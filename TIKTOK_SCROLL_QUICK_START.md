# TikTok Scroll - Quick Start Implementation Guide

**Copy-paste ready code for vertical video scrolling like TikTok**

## 🚀 Quick Implementation (5 Minutes)

### Step 1: Install Dependencies (Optional)
```bash
# Only if you want virtualization for 50+ videos
npm install react-window

# Only if you want pre-built IntersectionObserver hook
npm install react-intersection-observer
```

### Step 2: CSS (Copy-Paste Ready)

```css
/* app/globals.css or styles/video-feed.css */

.tiktok-feed {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch; /* iOS smooth scroll */
  overscroll-behavior-y: contain; /* Disable pull-to-refresh */
  scroll-behavior: smooth;
}

.tiktok-video-item {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always; /* Prevent skipping on fast swipe */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.tiktok-video-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Step 3: Custom Hook (Copy-Paste Ready)

```typescript
// hooks/useVideoAutoplay.ts
import { useRef, useEffect, useState } from 'react';

export const useVideoAutoplay = (threshold = 0.5) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play()
            .then(() => setIsPlaying(true))
            .catch(err => {
              console.log('Autoplay prevented:', err);
              // Fallback: require user interaction
            });
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [threshold]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true));
    }
  };

  return { videoRef, isPlaying, togglePlay };
};
```

### Step 4: Video Component (Copy-Paste Ready)

```typescript
// components/VideoItem.tsx
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';

interface VideoItemProps {
  videoUrl: string;
  thumbnail?: string;
  onLike?: () => void;
  onComment?: () => void;
}

export const VideoItem = ({ videoUrl, thumbnail }: VideoItemProps) => {
  const { videoRef, isPlaying, togglePlay } = useVideoAutoplay(0.5);

  return (
    <div className="tiktok-video-item" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        muted="true" // String to fix React bug
        playsInline // iOS requirement
        loop
        preload="metadata"
      />

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div style={{
          position: 'absolute',
          fontSize: '4rem',
          color: 'white',
          pointerEvents: 'none'
        }}>
          ▶️
        </div>
      )}
    </div>
  );
};
```

### Step 5: Feed Component (Copy-Paste Ready)

```typescript
// components/VideoFeed.tsx
import { VideoItem } from './VideoItem';

interface Video {
  id: string;
  url: string;
  thumbnail?: string;
}

interface VideoFeedProps {
  videos: Video[];
}

export const VideoFeed = ({ videos }: VideoFeedProps) => {
  return (
    <div className="tiktok-feed">
      {videos.map((video) => (
        <VideoItem
          key={video.id}
          videoUrl={video.url}
          thumbnail={video.thumbnail}
        />
      ))}
    </div>
  );
};
```

### Step 6: Use in Your App (Copy-Paste Ready)

```typescript
// app/page.tsx or pages/index.tsx
import { VideoFeed } from '@/components/VideoFeed';

export default function Home() {
  const videos = [
    { id: '1', url: '/videos/video1.mp4', thumbnail: '/thumbs/1.jpg' },
    { id: '2', url: '/videos/video2.mp4', thumbnail: '/thumbs/2.jpg' },
    { id: '3', url: '/videos/video3.mp4', thumbnail: '/thumbs/3.jpg' },
  ];

  return <VideoFeed videos={videos} />;
}
```

---

## 🔥 Advanced: Infinite Scroll (Bonus)

### Add Infinite Scroll Hook

```typescript
// hooks/useInfiniteScroll.ts
import { useRef, useEffect } from 'react';

export const useInfiniteScroll = (
  onLoadMore: () => void,
  hasMore: boolean,
  loading: boolean
) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading]);

  return loaderRef;
};
```

### Use in Feed Component

```typescript
// components/VideoFeed.tsx (with infinite scroll)
import { useState } from 'react';
import { VideoItem } from './VideoItem';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export const VideoFeed = () => {
  const [videos, setVideos] = useState<Video[]>([/* initial videos */]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    // Fetch more videos from API
    const newVideos = await fetchVideos();
    setVideos(prev => [...prev, ...newVideos]);
    setHasMore(newVideos.length > 0);
    setLoading(false);
  };

  const loaderRef = useInfiniteScroll(loadMore, hasMore, loading);

  return (
    <div className="tiktok-feed">
      {videos.map((video) => (
        <VideoItem key={video.id} {...video} />
      ))}

      {/* Infinite Scroll Trigger */}
      <div ref={loaderRef} style={{ height: '10px' }} />

      {loading && (
        <div className="tiktok-video-item">
          <div>Loading...</div>
        </div>
      )}
    </div>
  );
};
```

---

## 🎨 Tailwind CSS Version

```typescript
// components/VideoFeed.tsx (Tailwind)
export const VideoFeed = ({ videos }: VideoFeedProps) => {
  return (
    <div className="h-screen overflow-y-scroll" style={{
      scrollSnapType: 'y mandatory',
      WebkitOverflowScrolling: 'touch',
      overscrollBehaviorY: 'contain'
    }}>
      {videos.map((video) => (
        <div
          key={video.id}
          className="h-screen w-full relative flex items-center justify-center bg-black"
          style={{
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always'
          }}
        >
          <VideoItem {...video} />
        </div>
      ))}
    </div>
  );
};
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Video Won't Autoplay on Mobile

**Problem:** Video doesn't autoplay on iOS/Android

**Fix:**
```tsx
// ❌ Wrong
<video autoPlay muted loop />

// ✅ Correct
<video
  autoPlay
  muted="true"  // String, not boolean!
  playsInline   // Required for iOS
  loop
/>
```

### Issue 2: Fast Swipe Skips Videos

**Problem:** Swiping fast skips multiple videos

**Fix:**
```css
.video-item {
  scroll-snap-stop: always; /* Force stop at each video */
}
```

### Issue 3: Scroll Position Resets

**Problem:** Scroll jumps when videos load

**Fix:**
```tsx
// Use stable keys
{videos.map(video => (
  <VideoItem key={video.id} /> // ✅ Stable ID
  // NOT: <VideoItem key={index} /> ❌
))}
```

### Issue 4: Memory Leak

**Problem:** App slows down after scrolling

**Fix:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(/* ... */);
  observer.observe(element);

  // ✅ Always cleanup
  return () => observer.disconnect();
}, []);
```

### Issue 5: Horizontal Scroll Interference

**Problem:** Horizontal swipe interferes with vertical scroll

**Fix:**
```css
.tiktok-feed {
  touch-action: pan-y; /* Only allow vertical pan */
}
```

---

## 📊 Performance Optimization

### Lazy Load Videos (For 50+ Videos)

```typescript
// components/VideoItem.tsx (Lazy Load Version)
export const VideoItem = ({ videoUrl, thumbnail }: VideoItemProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load video when near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load 100px before visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="tiktok-video-item">
      {shouldLoad ? (
        <video src={videoUrl} /* ... */ />
      ) : (
        <img src={thumbnail} alt="" /> // Show thumbnail while loading
      )}
    </div>
  );
};
```

### React-Window for 100+ Videos

```bash
npm install react-window
```

```typescript
// components/VideoFeed.tsx (Virtualized)
import { FixedSizeList } from 'react-window';

export const VideoFeed = ({ videos }: VideoFeedProps) => {
  return (
    <FixedSizeList
      height={window.innerHeight}
      itemCount={videos.length}
      itemSize={window.innerHeight}
      width="100%"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitScrollSnapType: 'y mandatory'
      }}
    >
      {({ index, style }) => (
        <div
          style={{
            ...style,
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always'
          }}
        >
          <VideoItem video={videos[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

---

## ✅ Testing Checklist

### Desktop Testing
- [ ] Scroll snap works smoothly in Chrome
- [ ] Scroll snap works in Safari
- [ ] Scroll snap works in Firefox
- [ ] Videos autoplay when 50% visible
- [ ] Videos pause when out of view
- [ ] Click to play/pause works

### Mobile Testing (Real Devices)
- [ ] Autoplay works on iOS Safari
- [ ] Autoplay works on Chrome Android
- [ ] Fast swipe doesn't skip videos
- [ ] No horizontal scroll interference
- [ ] No pull-to-refresh conflict
- [ ] Smooth 60 FPS scrolling

### Performance Testing
- [ ] Lighthouse Performance > 90
- [ ] No memory leaks (check DevTools)
- [ ] Smooth on low-end devices
- [ ] Network tab shows lazy loading

---

## 🔗 Quick Reference Links

- **Full Research Report:** `/GITHUB_TIKTOK_PATTERNS_RESEARCH.md`
- **Live Demo:** https://xpx6cv.csb.app/
- **CSS Scroll Snap:** https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap
- **IntersectionObserver:** https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- **Autoplay Policy:** https://developer.chrome.com/blog/autoplay

---

## 🎯 Next Steps

1. ✅ Copy-paste CSS from Step 2
2. ✅ Copy-paste hook from Step 3
3. ✅ Copy-paste components from Steps 4-5
4. ✅ Test on mobile device
5. ✅ Add infinite scroll if needed
6. ✅ Performance test with Lighthouse
7. ✅ Compare with TikTok screenshots

**Estimated Time:** 15-30 minutes for basic implementation

---

**Pro Tip:** Start with the basic version (Steps 1-6), test thoroughly, then add infinite scroll and virtualization only if needed.
