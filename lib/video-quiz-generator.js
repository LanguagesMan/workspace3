/**
 * 🎯 VIDEO QUIZ GENERATOR
 * 
 * Auto-generates fun, engaging quizzes from video content
 * 
 * Quiz Types:
 * 1. Instant Replay - Replay 3-sec clip: "What did they say?"
 * 2. Speed Round - 5 rapid questions in 10 seconds
 * 3. Emoji Match - "Which emoji describes this scene?"
 * 4. Finish the Sentence - Complete dialogue from video
 * 5. Spot the Word - "Which word means X?"
 * 6. Context Clues - Guess meaning from context
 * 7. Dialogue Remix - Rearrange scrambled dialogue
 * 
 * Goal: Make quizzes feel like FUN, not work
 */

class VideoQuizGenerator {
    constructor() {
        this.QUIZ_TYPES = {
            INSTANT_REPLAY: 'instant_replay',
            SPEED_ROUND: 'speed_round',
            EMOJI_MATCH: 'emoji_match',
            FINISH_SENTENCE: 'finish_sentence',
            SPOT_WORD: 'spot_word',
            CONTEXT_CLUES: 'context_clues',
            DIALOGUE_REMIX: 'dialogue_remix',
            PRONUNCIATION: 'pronunciation',
            VIDEO_MEME: 'video_meme'
        };
        
        this.EMOJIS = ['😂', '🤔', '😍', '😱', '🎉', '😴', '🤗', '😎', '🥳', '😢'];
    }
    
    /**
     * Generate quiz from video
     */
    async generateQuiz(video, userLevel) {
        // Parse video transcript
        const transcript = await this.getVideoTranscript(video);
        
        if (!transcript || transcript.length === 0) {
            return null; // No transcript, can't generate quiz
        }
        
        // Extract key information
        const words = this.extractWords(transcript);
        const sentences = this.extractSentences(transcript);
        const dialogues = this.extractDialogues(transcript);
        
        // Select quiz type based on content
        const quizType = this.selectQuizType(video, transcript, userLevel);
        
        // Generate questions
        const questions = await this.generateQuestions(
            quizType,
            video,
            transcript,
            words,
            sentences,
            dialogues,
            userLevel
        );
        
        return {
            quizId: this.generateQuizId(),
            videoId: video.id,
            type: quizType,
            questions,
            timeLimit: this.getTimeLimit(quizType),
            skippable: true,
            xpReward: questions.length * 5
        };
    }
    
    /**
     * Select appropriate quiz type based on video content
     */
    selectQuizType(video, transcript, userLevel) {
        // Randomly select for variety
        const types = [
            this.QUIZ_TYPES.INSTANT_REPLAY,
            this.QUIZ_TYPES.SPOT_WORD,
            this.QUIZ_TYPES.FINISH_SENTENCE,
            this.QUIZ_TYPES.EMOJI_MATCH,
            this.QUIZ_TYPES.SPEED_ROUND
        ];
        
        return types[Math.floor(Math.random() * types.length)];
    }
    
    /**
     * Generate questions based on quiz type
     */
    async generateQuestions(quizType, video, transcript, words, sentences, dialogues, userLevel) {
        switch (quizType) {
            case this.QUIZ_TYPES.INSTANT_REPLAY:
                return this.generateInstantReplayQuestions(video, transcript, sentences);
            
            case this.QUIZ_TYPES.SPEED_ROUND:
                return this.generateSpeedRoundQuestions(words, sentences, userLevel);
            
            case this.QUIZ_TYPES.EMOJI_MATCH:
                return this.generateEmojiMatchQuestions(video, sentences);
            
            case this.QUIZ_TYPES.FINISH_SENTENCE:
                return this.generateFinishSentenceQuestions(sentences);
            
            case this.QUIZ_TYPES.SPOT_WORD:
                return this.generateSpotWordQuestions(words, userLevel);
            
            case this.QUIZ_TYPES.CONTEXT_CLUES:
                return this.generateContextCluesQuestions(sentences, words);
            
            case this.QUIZ_TYPES.DIALOGUE_REMIX:
                return this.generateDialogueRemixQuestions(dialogues);
            
            default:
                return this.generateSpotWordQuestions(words, userLevel);
        }
    }
    
    /**
     * Type 1: Instant Replay Quiz
     * Replay 3-second clip from video: "What did they say?"
     */
    generateInstantReplayQuestions(video, transcript, sentences) {
        const questions = [];
        
        // Select 3 random sentences from video
        const selectedSentences = this.shuffleArray([...sentences]).slice(0, 3);
        
        selectedSentences.forEach((sentence, idx) => {
            const distractors = this.generateSentenceDistractors(sentence, sentences);
            const options = this.shuffleArray([sentence.text, ...distractors]);
            
            questions.push({
                id: `replay_${idx}`,
                type: 'instant_replay',
                prompt: '🎬 What did they say?',
                videoClip: {
                    videoId: video.id,
                    startTime: sentence.startTime,
                    endTime: sentence.endTime
                },
                options: options.map((opt, i) => ({ id: i, text: opt })),
                correctAnswer: options.indexOf(sentence.text),
                timeLimit: 8,
                points: 10
            });
        });
        
        return questions;
    }
    
    /**
     * Type 2: Speed Round
     * 5 rapid-fire questions in 10 seconds total
     */
    generateSpeedRoundQuestions(words, sentences, userLevel) {
        const questions = [];
        
        // Generate 5 quick questions
        for (let i = 0; i < 5; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            const translation = this.getTranslation(word);
            const distractors = this.generateWordDistractors(word, 2);
            const options = this.shuffleArray([translation, ...distractors]);
            
            questions.push({
                id: `speed_${i}`,
                type: 'speed_round',
                prompt: `"${word}" means...`,
                options: options.map((opt, idx) => ({ id: idx, text: opt })),
                correctAnswer: options.indexOf(translation),
                timeLimit: 2, // Only 2 seconds per question!
                points: 5
            });
        }
        
        return questions;
    }
    
    /**
     * Type 3: Emoji Match
     * "Which emoji describes this scene?" 😂 🤔 😍
     */
    generateEmojiMatchQuestions(video, sentences) {
        const questions = [];
        
        // Select 2 sentences with emotional content
        const emotionalSentences = sentences.filter(s => 
            this.hasEmotionalContent(s.text)
        ).slice(0, 2);
        
        emotionalSentences.forEach((sentence, idx) => {
            const correctEmoji = this.matchEmojiToSentence(sentence.text);
            const wrongEmojis = this.EMOJIS
                .filter(e => e !== correctEmoji)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            
            const options = this.shuffleArray([correctEmoji, ...wrongEmojis]);
            
            questions.push({
                id: `emoji_${idx}`,
                type: 'emoji_match',
                prompt: sentence.text,
                promptEnglish: 'Which emoji best describes this?',
                options: options.map((opt, i) => ({ id: i, emoji: opt })),
                correctAnswer: options.indexOf(correctEmoji),
                timeLimit: 5,
                points: 8
            });
        });
        
        return questions.length > 0 ? questions : this.generateSpotWordQuestions(this.extractWords(sentences.map(s => s.text).join(' ')), 'A2');
    }
    
    /**
     * Type 4: Finish the Sentence
     * Show first part of sentence, user completes it
     */
    generateFinishSentenceQuestions(sentences) {
        const questions = [];
        
        // Select 3 suitable sentences (not too short)
        const suitableSentences = sentences.filter(s => 
            s.text.split(' ').length >= 6
        ).slice(0, 3);
        
        suitableSentences.forEach((sentence, idx) => {
            const words = sentence.text.split(' ');
            const splitPoint = Math.floor(words.length / 2);
            const firstPart = words.slice(0, splitPoint).join(' ');
            const secondPart = words.slice(splitPoint).join(' ');
            
            const distractors = this.generateSentenceEndings(firstPart, 3);
            const options = this.shuffleArray([secondPart, ...distractors]);
            
            questions.push({
                id: `finish_${idx}`,
                type: 'finish_sentence',
                prompt: `${firstPart} _____`,
                promptEnglish: 'Complete the sentence',
                options: options.map((opt, i) => ({ id: i, text: opt })),
                correctAnswer: options.indexOf(secondPart),
                timeLimit: 10,
                points: 12
            });
        });
        
        return questions;
    }
    
    /**
     * Type 5: Spot the Word
     * "Which word means 'cat'?" - show 4 words from video
     */
    generateSpotWordQuestions(words, userLevel) {
        const questions = [];
        
        // Select 3 random words
        const selectedWords = this.shuffleArray([...words]).slice(0, 3);
        
        selectedWords.forEach((word, idx) => {
            const translation = this.getTranslation(word);
            const otherWords = words.filter(w => w !== word).slice(0, 3);
            const options = this.shuffleArray([word, ...otherWords]);
            
            questions.push({
                id: `spot_${idx}`,
                type: 'spot_word',
                prompt: `Which word means "${translation}"?`,
                options: options.map((opt, i) => ({ id: i, text: opt })),
                correctAnswer: options.indexOf(word),
                timeLimit: 6,
                points: 8
            });
        });
        
        return questions;
    }
    
    /**
     * Type 6: Context Clues
     * Guess the meaning of a word from context (no translation shown)
     */
    generateContextCluesQuestions(sentences, words) {
        const questions = [];
        
        // Find sentences with useful context
        const contextSentences = sentences.filter(s => s.text.split(' ').length >= 8).slice(0, 3);
        
        contextSentences.forEach((sentence, idx) => {
            const sentenceWords = sentence.text.split(' ').filter(w => w.length > 3);
            const targetWord = sentenceWords[Math.floor(sentenceWords.length / 2)];
            const translation = this.getTranslation(targetWord);
            const distractors = this.generateWordDistractors(targetWord, 3);
            const options = this.shuffleArray([translation, ...distractors]);
            
            questions.push({
                id: `context_${idx}`,
                type: 'context_clues',
                prompt: sentence.text,
                question: `What does "${targetWord}" probably mean?`,
                options: options.map((opt, i) => ({ id: i, text: opt })),
                correctAnswer: options.indexOf(translation),
                timeLimit: 12,
                points: 15 // Harder question, more points!
            });
        });
        
        return questions;
    }
    
    /**
     * Type 7: Dialogue Remix
     * Rearrange scrambled dialogue into correct order
     */
    generateDialogueRemixQuestions(dialogues) {
        if (!dialogues || dialogues.length < 3) {
            return [];
        }
        
        const questions = [];
        
        // Select a 3-4 line dialogue
        const dialogue = dialogues[0].lines.slice(0, 4);
        const scrambled = this.shuffleArray([...dialogue]);
        
        questions.push({
            id: 'remix_1',
            type: 'dialogue_remix',
            prompt: 'Put these lines in the correct order:',
            lines: scrambled.map((line, idx) => ({
                id: idx,
                text: line.text,
                speaker: line.speaker
            })),
            correctOrder: dialogue.map(line => scrambled.indexOf(line)),
            timeLimit: 20,
            points: 20
        });
        
        return questions;
    }
    
    // ===== Helper Functions =====
    
    async getVideoTranscript(video) {
        // In production, parse actual SRT file or fetch from database
        // For now, return mock transcript
        return [
            { text: 'Hola, ¿cómo estás?', startTime: 0, endTime: 2 },
            { text: 'Muy bien, gracias.', startTime: 2, endTime: 4 },
            { text: '¿Te gusta la comida mexicana?', startTime: 4, endTime: 7 },
            { text: 'Sí, me encanta el guacamole.', startTime: 7, endTime: 10 }
        ];
    }
    
    extractWords(transcript) {
        const text = Array.isArray(transcript) 
            ? transcript.map(t => t.text).join(' ')
            : transcript;
        
        const words = text
            .toLowerCase()
            .replace(/[¿?¡!.,]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2);
        
        return [...new Set(words)]; // Unique words only
    }
    
    extractSentences(transcript) {
        if (Array.isArray(transcript)) {
            return transcript.map((item, idx) => ({
                text: item.text,
                startTime: item.startTime || idx * 3,
                endTime: item.endTime || (idx + 1) * 3
            }));
        }
        
        return transcript.split(/[.!?]+/).map((text, idx) => ({
            text: text.trim(),
            startTime: idx * 5,
            endTime: (idx + 1) * 5
        }));
    }
    
    extractDialogues(transcript) {
        // Simplified: group sentences into dialogues
        if (!Array.isArray(transcript) || transcript.length < 2) {
            return [];
        }
        
        return [{
            lines: transcript.map((item, idx) => ({
                text: item.text,
                speaker: idx % 2 === 0 ? 'A' : 'B'
            }))
        }];
    }
    
    getTranslation(spanishWord) {
        const translations = {
            'hola': 'hello',
            'cómo': 'how',
            'estás': 'are (you)',
            'muy': 'very',
            'bien': 'well/good',
            'gracias': 'thank you',
            'gusta': 'like',
            'comida': 'food',
            'mexicana': 'mexican',
            'encanta': 'love',
            'guacamole': 'guacamole',
            'restaurante': 'restaurant',
            'casa': 'house',
            'perro': 'dog',
            'gato': 'cat'
        };
        
        return translations[spanishWord.toLowerCase()] || 'unknown';
    }
    
    generateWordDistractors(targetWord, count) {
        const allWords = ['water', 'house', 'car', 'book', 'table', 'chair', 'happy', 'sad', 'big', 'small'];
        return allWords
            .filter(w => w !== this.getTranslation(targetWord))
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }
    
    generateSentenceDistractors(targetSentence, allSentences) {
        return allSentences
            .filter(s => s.text !== targetSentence.text)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(s => s.text);
    }
    
    generateSentenceEndings(firstPart, count) {
        const endings = [
            'todos los días.',
            'en la mañana.',
            'con mis amigos.',
            'porque es divertido.',
            'en el restaurante.',
            'después del trabajo.'
        ];
        
        return endings
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }
    
    hasEmotionalContent(text) {
        const emotionalWords = ['amor', 'feliz', 'triste', 'enojado', 'sorprendido', 'miedo', 'alegre'];
        return emotionalWords.some(word => text.toLowerCase().includes(word));
    }
    
    matchEmojiToSentence(text) {
        const lower = text.toLowerCase();
        
        if (lower.includes('feliz') || lower.includes('alegre') || lower.includes('contento')) return '😊';
        if (lower.includes('triste')) return '😢';
        if (lower.includes('enojado')) return '😠';
        if (lower.includes('sorprendido')) return '😱';
        if (lower.includes('amor') || lower.includes('encantar')) return '😍';
        if (lower.includes('gracioso') || lower.includes('risa')) return '😂';
        if (lower.includes('aburrido') || lower.includes('cansado')) return '😴';
        if (lower.includes('pensar') || lower.includes('interesante')) return '🤔';
        
        return '😊'; // Default happy emoji
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    getTimeLimit(quizType) {
        const timeLimits = {
            [this.QUIZ_TYPES.INSTANT_REPLAY]: 30,
            [this.QUIZ_TYPES.SPEED_ROUND]: 10,
            [this.QUIZ_TYPES.EMOJI_MATCH]: 15,
            [this.QUIZ_TYPES.FINISH_SENTENCE]: 30,
            [this.QUIZ_TYPES.SPOT_WORD]: 20,
            [this.QUIZ_TYPES.CONTEXT_CLUES]: 40,
            [this.QUIZ_TYPES.DIALOGUE_REMIX]: 45
        };
        
        return timeLimits[quizType] || 30;
    }
    
    generateQuizId() {
        return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = VideoQuizGenerator;

