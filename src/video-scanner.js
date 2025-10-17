// 🎬 VIDEO LIBRARY SCANNER - Index videos with SRT subtitles
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export class VideoScanner {
  constructor(videosPath) {
    this.videosPath = videosPath;
    this.videoLibrary = [];
  }

  // Parse SRT file
  parseSRT(srtContent) {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\n+/);

    blocks.forEach(block => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
          subtitles.push({
            start: this.parseTime(timeMatch[1]),
            end: this.parseTime(timeMatch[2]),
            text: lines.slice(2).join(' ')
          });
        }
      }
    });

    return subtitles;
  }

  // Parse SRT timestamp to seconds
  parseTime(timeString) {
    const [hours, minutes, seconds] = timeString.split(':');
    const [secs, millis] = seconds.split(',');
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis) / 1000;
  }

  // Extract words from subtitles for vocabulary
  extractWords(subtitles) {
    const words = new Set();
    subtitles.forEach(sub => {
      const cleaned = sub.text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
      cleaned.forEach(w => words.add(w));
    });
    return Array.from(words);
  }

  // Scan directory recursively
  scanDirectory(dir) {
    const items = readdirSync(dir);

    items.forEach(item => {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (item.endsWith('.mp4')) {
        const srtPath = fullPath.replace('.mp4', '.srt');
        const videoId = fullPath.replace(this.videosPath, '').replace(/^\//, '');

        try {
          const srtContent = readFileSync(srtPath, 'utf8');
          const subtitles = this.parseSRT(srtContent);
          const words = this.extractWords(subtitles);

          this.videoLibrary.push({
            id: videoId,
            path: `/videos/${videoId}`,
            srtPath: `/videos/${videoId.replace('.mp4', '.srt')}`,
            title: item.replace('.mp4', '').replace(/_/g, ' '),
            subtitles: subtitles,
            words: words,
            duration: subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 0
          });
        } catch (e) {
          // No SRT file, add video without subtitles
          this.videoLibrary.push({
            id: videoId,
            path: `/videos/${videoId}`,
            srtPath: null,
            title: item.replace('.mp4', '').replace(/_/g, ' '),
            subtitles: [],
            words: [],
            duration: 0
          });
        }
      }
    });
  }

  // Get all videos
  scan() {
    this.videoLibrary = [];
    this.scanDirectory(this.videosPath);
    return this.videoLibrary;
  }

  // Search videos by word
  searchByWord(word) {
    return this.videoLibrary.filter(video =>
      video.words.some(w => w.includes(word.toLowerCase()))
    );
  }

  // Get video by ID
  getVideo(id) {
    return this.videoLibrary.find(v => v.id === id);
  }
}
