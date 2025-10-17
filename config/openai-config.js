/**
 * 🔐 OPENAI CONFIGURATION
 * Place your OpenAI API key here or in environment variables
 */

require('dotenv').config();

module.exports = {
    // Get API key from environment variable or set directly here
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    
    // Whisper model configuration
    WHISPER_MODEL: 'whisper-1', // OpenAI's Whisper API model
    
    // Language settings
    SOURCE_LANGUAGE: 'es', // Spanish
    TARGET_LANGUAGE: 'en', // English
    
    // Processing settings
    CONCURRENT_TRANSCRIPTIONS: 3, // Process 3 videos at once (API rate limit friendly)
    
    // File size limit (OpenAI Whisper API has 25MB limit)
    MAX_FILE_SIZE_MB: 24,
    
    // Retry settings
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000,
};

