// Debug why transcriptions aren't showing
const { test } = require('@playwright/test');

test('Debug Transcriptions', async ({ page }) => {
    // Listen to console logs
    page.on('console', msg => {
        if (msg.text().includes('transcription') || msg.text().includes('Transcription') || msg.text().includes('video')) {
            console.log('🔍 Browser log:', msg.text());
        }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    // Check if videos have transcription data
    const transcriptionData = await page.evaluate(() => {
        // Check global videos array
        if (typeof videos !== 'undefined' && videos.length > 0) {
            const firstVideo = videos[0];
            return {
                hasVideo: true,
                videoTitle: firstVideo.title,
                hasTranscription: !!firstVideo.transcription,
                transcriptionLines: firstVideo.transcription?.lines?.length || 0,
                firstLine: firstVideo.transcription?.lines?.[0] || null
            };
        }
        return { hasVideo: false };
    });

    console.log('📊 Video data:', JSON.stringify(transcriptionData, null, 2));

    // Check DOM
    const overlays = await page.locator('.transcription-overlay').count();
    console.log(`📦 Transcription overlay elements: ${overlays}`);

    // Try to manually trigger transcription
    await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = 0.5;
            video.play();
            console.log('▶️ Video playing at:', video.currentTime);
        }
    });

    await page.waitForTimeout(3000);

    const activeOverlays = await page.locator('.transcription-overlay.active').count();
    console.log(`✅ Active overlays after playing: ${activeOverlays}`);

    // Check if timeupdate event is firing
    const eventCheck = await page.evaluate(() => {
        return new Promise((resolve) => {
            const video = document.querySelector('video');
            if (!video) {
                resolve({ hasVideo: false });
                return;
            }

            let eventsFired = 0;
            const handler = () => {
                eventsFired++;
                if (eventsFired >= 5) {
                    video.removeEventListener('timeupdate', handler);
                    resolve({
                        hasVideo: true,
                        eventsFired,
                        currentTime: video.currentTime
                    });
                }
            };
            video.addEventListener('timeupdate', handler);

            setTimeout(() => {
                video.removeEventListener('timeupdate', handler);
                resolve({
                    hasVideo: true,
                    eventsFired,
                    currentTime: video.currentTime,
                    timeout: true
                });
            }, 5000);
        });
    });

    console.log('⏱️ Timeupdate events:', JSON.stringify(eventCheck, null, 2));
});
