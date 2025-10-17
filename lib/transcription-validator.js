/**
 * 🔍 TRANSCRIPTION VALIDATOR
 * 
 * Validates .srt files are properly formatted
 */

const fs = require('fs');
const path = require('path');

class TranscriptionValidator {
    /**
     * Validate a single .srt file
     */
    validate(srtPath) {
        const errors = [];
        
        try {
            if (!fs.existsSync(srtPath)) {
                return { valid: false, errors: ['File does not exist'] };
            }

            const content = fs.readFileSync(srtPath, 'utf8');
            
            // Check if file is empty
            if (content.trim().length === 0) {
                errors.push('File is empty');
                return { valid: false, errors };
            }

            // Check SRT format
            const subtitles = this.parseSRT(content);
            
            if (subtitles.length === 0) {
                errors.push('No valid subtitles found');
                return { valid: false, errors };
            }

            // Validate each subtitle
            for (let i = 0; i < subtitles.length; i++) {
                const sub = subtitles[i];
                
                if (!sub.number) {
                    errors.push(`Subtitle ${i + 1}: Missing number`);
                }
                
                if (!sub.start || !sub.end) {
                    errors.push(`Subtitle ${i + 1}: Invalid timestamps`);
                }
                
                if (!sub.text || sub.text.trim().length === 0) {
                    errors.push(`Subtitle ${i + 1}: Empty text`);
                }
            }

            // Check for Spanish content (basic check)
            const allText = subtitles.map(s => s.text).join(' ');
            if (!this.isSpanish(allText)) {
                errors.push('Content does not appear to be Spanish');
            }

            return {
                valid: errors.length === 0,
                errors,
                subtitleCount: subtitles.length,
                totalDuration: this.calculateDuration(subtitles)
            };

        } catch (error) {
            return {
                valid: false,
                errors: [`Parse error: ${error.message}`]
            };
        }
    }

    /**
     * Parse SRT file
     */
    parseSRT(content) {
        const subtitles = [];
        const blocks = content.trim().split(/\n\s*\n/);

        for (const block of blocks) {
            const lines = block.trim().split('\n');
            
            if (lines.length >= 3) {
                const number = parseInt(lines[0]);
                const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
                
                if (timeMatch) {
                    subtitles.push({
                        number,
                        start: timeMatch[1],
                        end: timeMatch[2],
                        text: lines.slice(2).join('\n')
                    });
                }
            }
        }

        return subtitles;
    }

    /**
     * Check if text is Spanish (basic heuristic)
     */
    isSpanish(text) {
        const spanishIndicators = [
            'el ', 'la ', 'los ', 'las ',
            'es ', 'son ', 'está ', 'están ',
            'que ', 'de ', 'en ', 'con ',
            'por ', 'para ', 'un ', 'una ',
            'á', 'é', 'í', 'ó', 'ú', 'ñ'
        ];

        const lowerText = text.toLowerCase();
        let indicatorCount = 0;

        for (const indicator of spanishIndicators) {
            if (lowerText.includes(indicator)) {
                indicatorCount++;
            }
        }

        // If 3+ Spanish indicators found, likely Spanish
        return indicatorCount >= 3;
    }

    /**
     * Calculate total duration
     */
    calculateDuration(subtitles) {
        if (subtitles.length === 0) return 0;

        const lastSubtitle = subtitles[subtitles.length - 1];
        return this.timeToSeconds(lastSubtitle.end);
    }

    /**
     * Convert SRT time to seconds
     */
    timeToSeconds(timeString) {
        const match = timeString.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (!match) return 0;

        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const millis = parseInt(match[4]);

        return hours * 3600 + minutes * 60 + seconds + millis / 1000;
    }

    /**
     * Validate all .srt files in directory
     */
    validateDirectory(dir) {
        const results = {
            total: 0,
            valid: 0,
            invalid: 0,
            files: []
        };

        const scanDirectory = (currentDir) => {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.srt')) {
                    results.total++;
                    const validation = this.validate(fullPath);
                    
                    if (validation.valid) {
                        results.valid++;
                    } else {
                        results.invalid++;
                        results.files.push({
                            path: fullPath,
                            errors: validation.errors
                        });
                    }
                }
            }
        };

        scanDirectory(dir);
        return results;
    }
}

module.exports = new TranscriptionValidator();
