#!/usr/bin/env node
/**
 * 🎯 BATCH CONTENT ANALYZER
 * Analyzes all 730 videos, articles, and songs
 * Saves results to JSON for database import
 */

const fs = require('fs');
const path = require('path');
const analyzer = require('../lib/content-difficulty-analyzer');

// Paths
const VIDEOS_DIR = path.join(__dirname, '../public/videos/langfeed');
const SONGS_FILE = path.join(__dirname, '../public/content/songs.json');
const OUTPUT_FILE = path.join(__dirname, '../data/content-analysis.json');

class BatchAnalyzer {
    constructor() {
        this.results = {
            videos: [],
            articles: [],
            songs: [],
            summary: {
                totalAnalyzed: 0,
                byLevel: {
                    A1: 0,
                    A2: 0,
                    B1: 0,
                    B2: 0,
                    C1: 0,
                    C2: 0
                },
                byType: {
                    video: 0,
                    article: 0,
                    song: 0
                },
                analyzedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Analyze all videos in langfeed directory
     */
    async analyzeVideos() {
        console.log('\n📹 ANALYZING VIDEOS...');
        console.log('='.repeat(60));

        try {
            const files = fs.readdirSync(VIDEOS_DIR);
            
            // Find all Spanish SRT files
            const srtFiles = files.filter(f => f.endsWith('.es.srt') || (f.endsWith('.srt') && !f.endsWith('.en.srt')));
            
            console.log(`Found ${srtFiles.length} video transcriptions`);

            let processed = 0;
            let failed = 0;

            for (const srtFile of srtFiles) {
                const videoId = srtFile
                    .replace('.es.srt', '')
                    .replace('.srt', '');
                
                const srtPath = path.join(VIDEOS_DIR, srtFile);
                
                try {
                    const analysis = analyzer.analyzeVideoFile(srtPath);
                    
                    if (analysis) {
                        this.results.videos.push({
                            contentId: videoId,
                            contentType: 'video',
                            fileName: srtFile,
                            ...analysis
                        });

                        // Update summary
                        this.results.summary.byLevel[analysis.level]++;
                        this.results.summary.byType.video++;
                        this.results.summary.totalAnalyzed++;
                        
                        processed++;

                        if (processed % 50 === 0) {
                            console.log(`  ✅ Processed ${processed}/${srtFiles.length} videos...`);
                        }
                    } else {
                        failed++;
                    }
                } catch (error) {
                    console.error(`  ❌ Error analyzing ${videoId}:`, error.message);
                    failed++;
                }
            }

            console.log(`\n✅ Videos analyzed: ${processed}`);
            console.log(`❌ Failed: ${failed}`);
            
            // Show level distribution
            console.log('\n📊 Level Distribution:');
            Object.entries(this.results.summary.byLevel).forEach(([level, count]) => {
                if (count > 0) {
                    const percentage = ((count / processed) * 100).toFixed(1);
                    console.log(`  ${level}: ${count} videos (${percentage}%)`);
                }
            });

        } catch (error) {
            console.error('Error analyzing videos:', error);
        }
    }

    /**
     * Analyze all songs
     */
    async analyzeSongs() {
        console.log('\n🎵 ANALYZING SONGS...');
        console.log('='.repeat(60));

        try {
            if (!fs.existsSync(SONGS_FILE)) {
                console.log('No songs file found, skipping...');
                return;
            }

            const songsData = JSON.parse(fs.readFileSync(SONGS_FILE, 'utf-8'));
            const songs = songsData.songs || [];

            console.log(`Found ${songs.length} songs`);

            for (const song of songs) {
                try {
                    const analysis = analyzer.analyzeSong(song.lyrics || [], song.id);
                    
                    this.results.songs.push({
                        contentId: song.id,
                        contentType: 'song',
                        title: song.title,
                        artist: song.artist,
                        ...analysis
                    });

                    // Update summary
                    this.results.summary.byLevel[analysis.level]++;
                    this.results.summary.byType.song++;
                    this.results.summary.totalAnalyzed++;

                    console.log(`  ✅ ${song.title} by ${song.artist}: ${analysis.level}`);
                } catch (error) {
                    console.error(`  ❌ Error analyzing ${song.title}:`, error.message);
                }
            }

            console.log(`\n✅ Songs analyzed: ${songs.length}`);

        } catch (error) {
            console.error('Error analyzing songs:', error);
        }
    }

    /**
     * Analyze articles (placeholder - would integrate with article feed)
     */
    async analyzeArticles() {
        console.log('\n📰 ANALYZING ARTICLES...');
        console.log('='.repeat(60));
        console.log('Articles will be analyzed dynamically from feed sources');
        console.log('(NewsAPI, Guardian, RSS feeds)');
    }

    /**
     * Save results to file
     */
    saveResults() {
        console.log('\n💾 SAVING RESULTS...');
        console.log('='.repeat(60));

        try {
            // Create data directory if it doesn't exist
            const dataDir = path.dirname(OUTPUT_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Save full results
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(this.results, null, 2));
            console.log(`✅ Results saved to: ${OUTPUT_FILE}`);

            // Save summary report
            const summaryFile = path.join(dataDir, 'content-analysis-summary.txt');
            const summaryText = this.generateSummaryReport();
            fs.writeFileSync(summaryFile, summaryText);
            console.log(`✅ Summary saved to: ${summaryFile}`);

            // Save CSV for easy viewing
            const csvFile = path.join(dataDir, 'content-analysis.csv');
            const csvText = this.generateCSV();
            fs.writeFileSync(csvFile, csvText);
            console.log(`✅ CSV saved to: ${csvFile}`);

        } catch (error) {
            console.error('Error saving results:', error);
        }
    }

    /**
     * Generate summary report
     */
    generateSummaryReport() {
        const { summary } = this.results;
        
        return `
========================================
CONTENT ANALYSIS REPORT
========================================
Generated: ${summary.analyzedAt}

TOTAL CONTENT ANALYZED: ${summary.totalAnalyzed}

BY TYPE:
- Videos: ${summary.byType.video}
- Songs: ${summary.byType.song}
- Articles: ${summary.byType.article}

BY DIFFICULTY LEVEL:
- A1 (Beginner): ${summary.byLevel.A1} (${((summary.byLevel.A1/summary.totalAnalyzed)*100).toFixed(1)}%)
- A2 (Elementary): ${summary.byLevel.A2} (${((summary.byLevel.A2/summary.totalAnalyzed)*100).toFixed(1)}%)
- B1 (Intermediate): ${summary.byLevel.B1} (${((summary.byLevel.B1/summary.totalAnalyzed)*100).toFixed(1)}%)
- B2 (Upper-Int): ${summary.byLevel.B2} (${((summary.byLevel.B2/summary.totalAnalyzed)*100).toFixed(1)}%)
- C1 (Advanced): ${summary.byLevel.C1} (${((summary.byLevel.C1/summary.totalAnalyzed)*100).toFixed(1)}%)
- C2 (Proficient): ${summary.byLevel.C2} (${((summary.byLevel.C2/summary.totalAnalyzed)*100).toFixed(1)}%)

TOP 5 EASIEST VIDEOS:
${this.getTop5Easiest()}

TOP 5 HARDEST VIDEOS:
${this.getTop5Hardest()}

========================================
        `.trim();
    }

    /**
     * Get top 5 easiest videos
     */
    getTop5Easiest() {
        const sorted = [...this.results.videos]
            .sort((a, b) => a.averageWordRank - b.averageWordRank)
            .slice(0, 5);

        return sorted.map((v, i) => 
            `${i+1}. ${v.contentId} (${v.level}) - ${v.uniqueWordCount} unique words`
        ).join('\n');
    }

    /**
     * Get top 5 hardest videos
     */
    getTop5Hardest() {
        const sorted = [...this.results.videos]
            .sort((a, b) => b.averageWordRank - a.averageWordRank)
            .slice(0, 5);

        return sorted.map((v, i) => 
            `${i+1}. ${v.contentId} (${v.level}) - ${v.uniqueWordCount} unique words`
        ).join('\n');
    }

    /**
     * Generate CSV export
     */
    generateCSV() {
        const headers = [
            'contentId',
            'contentType',
            'level',
            'totalWords',
            'uniqueWords',
            'avgWordRank',
            'vocabularyDensity',
            'top100',
            'top500',
            'top1000',
            'rare'
        ];

        const rows = [headers.join(',')];

        // Add all content
        const allContent = [
            ...this.results.videos,
            ...this.results.songs,
            ...this.results.articles
        ];

        allContent.forEach(item => {
            const row = [
                item.contentId || '',
                item.contentType || '',
                item.level || '',
                item.totalWords || 0,
                item.uniqueWordCount || 0,
                item.averageWordRank || 0,
                item.vocabularyDensity || 0,
                item.frequencyBands?.top100 || 0,
                item.frequencyBands?.top500 || 0,
                item.frequencyBands?.top1000 || 0,
                item.frequencyBands?.rare || 0
            ];
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    /**
     * Run full analysis
     */
    async run() {
        console.log('\n🚀 STARTING BATCH CONTENT ANALYSIS');
        console.log('='.repeat(60));
        console.log(`Start time: ${new Date().toLocaleString()}`);

        const startTime = Date.now();

        // Analyze all content types
        await this.analyzeVideos();
        await this.analyzeSongs();
        await this.analyzeArticles();

        // Save results
        this.saveResults();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('\n✅ ANALYSIS COMPLETE!');
        console.log('='.repeat(60));
        console.log(`Total time: ${duration} seconds`);
        console.log(`Content analyzed: ${this.results.summary.totalAnalyzed}`);
        console.log(`Average time per item: ${(duration / this.results.summary.totalAnalyzed).toFixed(2)}s`);
        console.log('\n📊 Results saved to data/ directory');
    }
}

// Run if called directly
if (require.main === module) {
    const batchAnalyzer = new BatchAnalyzer();
    batchAnalyzer.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = BatchAnalyzer;

