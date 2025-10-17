/**
 * SRT Parser - Parse SubRip subtitle files
 * Converts .srt format to structured JSON for real-time transcription display
 */

function parseSRT(srtContent) {
    if (!srtContent || typeof srtContent !== 'string') {
        return [];
    }

    // Split into subtitle blocks
    const blocks = srtContent.trim().split(/\n\s*\n/);

    const subtitles = [];

    for (const block of blocks) {
        const lines = block.split('\n').filter(line => line.trim());

        if (lines.length < 2) continue;

        // Line 0: Index number
        // Line 1: Timestamp (00:00:00,000 --> 00:00:02,000)
        // Line 2+: Text content

        const timestampLine = lines[1];
        const textLines = lines.slice(2);

        // Parse timestamp
        const timestampMatch = timestampLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

        if (!timestampMatch) continue;

        const startTime = parseTimeToSeconds(
            parseInt(timestampMatch[1]), // hours
            parseInt(timestampMatch[2]), // minutes
            parseInt(timestampMatch[3]), // seconds
            parseInt(timestampMatch[4])  // milliseconds
        );

        const endTime = parseTimeToSeconds(
            parseInt(timestampMatch[5]), // hours
            parseInt(timestampMatch[6]), // minutes
            parseInt(timestampMatch[7]), // seconds
            parseInt(timestampMatch[8])  // milliseconds
        );

        // Join text lines (some subtitles span multiple lines)
        const text = textLines.join(' ').trim();

        subtitles.push({
            startTime,
            endTime,
            text // Will be separated into English/Spanish later
        });
    }

    // Return subtitles with Spanish text only
    // English translations will be added by translateSubtitlesBatch in server.js
    return subtitles.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        spanish: s.text,
        english: '' // Will be filled by AI translation service
    }));
}

function parseTimeToSeconds(hours, minutes, seconds, milliseconds) {
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

module.exports = { parseSRT };
