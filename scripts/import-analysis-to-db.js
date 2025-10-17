#!/usr/bin/env node
/**
 * 🔄 IMPORT ANALYSIS TO DATABASE
 * Imports content analysis results into Supabase
 */

const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../lib/supabase-client');

const ANALYSIS_FILE = path.join(__dirname, '../data/content-analysis.json');

async function importAnalysis() {
    console.log('\n🔄 IMPORTING ANALYSIS TO DATABASE');
    console.log('='.repeat(60));

    // Check if Supabase is configured
    if (!isConfigured()) {
        console.error('❌ Supabase not configured!');
        console.log('Please set up your Supabase credentials first.');
        process.exit(1);
    }

    // Check if analysis file exists
    if (!fs.existsSync(ANALYSIS_FILE)) {
        console.error('❌ Analysis file not found!');
        console.log(`Expected: ${ANALYSIS_FILE}`);
        console.log('\nRun this first: node scripts/analyze-all-content.js');
        process.exit(1);
    }

    try {
        // Load analysis data
        const analysisData = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf-8'));
        console.log(`\n📊 Loaded analysis data:`);
        console.log(`  Videos: ${analysisData.videos.length}`);
        console.log(`  Songs: ${analysisData.songs.length}`);
        console.log(`  Articles: ${analysisData.articles.length}`);

        let imported = 0;
        let failed = 0;

        // Import videos
        console.log('\n📹 Importing videos...');
        for (const video of analysisData.videos) {
            try {
                const { error } = await supabase
                    .from('content_analysis')
                    .upsert({
                        content_id: video.contentId,
                        content_type: 'video',
                        cefr_level: video.level,
                        difficulty_label: video.difficulty,
                        total_words: video.totalWords,
                        unique_word_count: video.uniqueWordCount,
                        average_word_rank: video.averageWordRank,
                        vocabulary_density: video.vocabularyDensity,
                        frequency_bands: video.frequencyBands,
                        file_name: video.fileName
                    }, {
                        onConflict: 'content_id'
                    });

                if (error) {
                    console.error(`  ❌ ${video.contentId}: ${error.message}`);
                    failed++;
                } else {
                    imported++;
                    if (imported % 50 === 0) {
                        console.log(`  ✅ Imported ${imported} videos...`);
                    }
                }
            } catch (error) {
                console.error(`  ❌ ${video.contentId}: ${error.message}`);
                failed++;
            }
        }

        console.log(`✅ Videos imported: ${imported}`);

        // Import songs
        if (analysisData.songs.length > 0) {
            console.log('\n🎵 Importing songs...');
            for (const song of analysisData.songs) {
                try {
                    const { error } = await supabase
                        .from('content_analysis')
                        .upsert({
                            content_id: song.contentId,
                            content_type: 'song',
                            title: song.title,
                            cefr_level: song.level,
                            difficulty_label: song.difficulty,
                            total_words: song.totalWords,
                            unique_word_count: song.uniqueWordCount,
                            average_word_rank: song.averageWordRank,
                            vocabulary_density: song.vocabularyDensity,
                            frequency_bands: song.frequencyBands
                        }, {
                            onConflict: 'content_id'
                        });

                    if (error) {
                        console.error(`  ❌ ${song.title}: ${error.message}`);
                        failed++;
                    } else {
                        imported++;
                        console.log(`  ✅ ${song.title}`);
                    }
                } catch (error) {
                    console.error(`  ❌ ${song.title}: ${error.message}`);
                    failed++;
                }
            }

            console.log(`✅ Songs imported: ${analysisData.songs.length}`);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 IMPORT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total imported: ${imported}`);
        console.log(`Total failed: ${failed}`);
        console.log(`Success rate: ${((imported / (imported + failed)) * 100).toFixed(1)}%`);

        // Verify import
        console.log('\n🔍 Verifying import...');
        const { count, error: countError } = await supabase
            .from('content_analysis')
            .select('*', { count: 'exact', head: true });

        if (!countError) {
            console.log(`✅ Database contains ${count} content items`);
        }

        console.log('\n✅ IMPORT COMPLETE!');

    } catch (error) {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    }
}

// Run import
if (require.main === module) {
    importAnalysis().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { importAnalysis };

