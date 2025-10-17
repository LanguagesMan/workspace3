/**
 * VOCABULARY REVIEW SYSTEM
 * Patterns stolen from: Anki, Quizlet, Duolingo
 *
 * Features:
 * - Spaced Repetition (SM-2 algorithm like Anki)
 * - Flashcard flip animation (Quizlet style)
 * - Multiple choice quiz (Duolingo style)
 * - Search & filter
 * - localStorage persistence
 */

class VocabularyReviewSystem {
    constructor() {
        this.words = this.loadWords();
        this.currentCardIndex = 0;
        this.reviewMode = 'flashcard'; // 'flashcard' or 'quiz'
        this.initUI();
    }

    // === STORAGE SYSTEM (localStorage) ===
    loadWords() {
        const saved = localStorage.getItem('savedWords');
        return saved ? JSON.parse(saved) : [];
    }

    saveWords() {
        localStorage.setItem('savedWords', JSON.stringify(this.words));
    }

    addWord(spanish, english, context = '', videoId = '') {
        const word = {
            id: Date.now() + Math.random(),
            spanish,
            english,
            context,
            videoId,
            addedAt: new Date().toISOString(),
            // SM-2 Spaced Repetition fields
            easeFactor: 2.5,
            repetition: 0,
            interval: 0,
            nextReview: new Date().toISOString(),
            reviews: 0,
            correctCount: 0,
            incorrectCount: 0
        };
        this.words.push(word);
        this.saveWords();
        return word;
    }

    // === SPACED REPETITION (SM-2 Algorithm from Anki) ===
    reviewWord(wordId, quality) {
        // quality: 0-5 (0=total blackout, 5=perfect recall)
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;

        word.reviews++;
        if (quality >= 3) word.correctCount++;
        else word.incorrectCount++;

        // SM-2 Algorithm
        if (quality >= 3) {
            if (word.repetition === 0) {
                word.interval = 1;
            } else if (word.repetition === 1) {
                word.interval = 6;
            } else {
                word.interval = Math.round(word.interval * word.easeFactor);
            }
            word.repetition++;
        } else {
            word.repetition = 0;
            word.interval = 1;
        }

        // Update ease factor
        word.easeFactor = Math.max(1.3, word.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        // Set next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + word.interval);
        word.nextReview = nextDate.toISOString();

        this.saveWords();
    }

    // Get words due for review (Anki pattern)
    getDueWords() {
        const now = new Date();
        return this.words.filter(w => new Date(w.nextReview) <= now);
    }

    // === UI INITIALIZATION ===
    initUI() {
        // HTML structure is already in unified-infinite-feed.html
        // Script is loaded at the end of HTML, so DOM is ready
        // Use setTimeout to ensure browser has fully parsed all elements
        setTimeout(() => {
            this.attachEventListeners();
        }, 0);
    }

    attachEventListeners() {
        // Back button
        document.querySelectorAll('.vocab-back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeReview());
        });

        // Flashcard flip (Quizlet tap-to-flip pattern)
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('flipped');
            });
        }

        // Review buttons with data-quality
        document.querySelectorAll('.review-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = parseInt(btn.dataset.quality);
                this.answerFlashcard(quality);
            });
        });

        // Mode switcher
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchMode(btn.dataset.mode);
            });
        });

        // Search
        const searchInput = document.getElementById('vocabSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchWords(e.target.value));
        }

        // Filter
        const filterSelect = document.getElementById('vocabFilterSelect');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.filterWords(e.target.value));
        }

        // Quiz options (use data-answer instead of data-index)
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.answer);
                this.answerQuiz(index);
            });
        });

        // Quiz next button
        const quizNextBtn = document.getElementById('quizNextBtn');
        if (quizNextBtn) {
            quizNextBtn.addEventListener('click', () => this.nextQuizQuestion());
        }
    }

    // === FLASHCARD MODE ===
    showFlashcard(word) {
        document.getElementById('flashcardSpanish').textContent = word.spanish;
        document.getElementById('flashcardEnglish').textContent = word.english;
        document.getElementById('flashcardContext').textContent = word.context || '';

        const accuracy = word.reviews > 0 ? Math.round((word.correctCount / word.reviews) * 100) : 0;
        const nextDate = new Date(word.nextReview);
        const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));

        document.getElementById('flashcardReviews').textContent = `Reviews: ${word.reviews}`;
        document.getElementById('flashcardAccuracy').textContent = `Accuracy: ${accuracy}%`;
        document.getElementById('flashcardNext').textContent = `Next: ${daysUntil > 0 ? daysUntil + ' days' : 'Today'}`;

        // Reset flip
        document.getElementById('flashcard').classList.remove('flipped');
    }

    answerFlashcard(quality) {
        const currentWord = this.getDueWords()[this.currentCardIndex];
        if (!currentWord) return;

        this.reviewWord(currentWord.id, quality);
        this.nextCard();
    }

    nextCard() {
        const dueWords = this.getDueWords();
        this.currentCardIndex++;

        if (this.currentCardIndex >= dueWords.length) {
            // Review complete!
            this.showReviewComplete();
        } else {
            this.showFlashcard(dueWords[this.currentCardIndex]);
            this.updateProgress();
        }
    }

    updateProgress() {
        const dueWords = this.getDueWords();
        const progress = ((this.currentCardIndex + 1) / dueWords.length) * 100;
        const progressBar = document.getElementById('reviewProgressBar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        document.getElementById('reviewProgressText').textContent =
            `${this.currentCardIndex + 1} / ${dueWords.length}`;
    }

    // === QUIZ MODE ===
    switchMode(mode) {
        this.reviewMode = mode;
        if (mode === 'flashcard') {
            document.getElementById('flashcardMode').style.display = 'block';
            document.getElementById('quizMode').style.display = 'none';
            if (this.getDueWords().length > 0) {
                this.showFlashcard(this.getDueWords()[0]);
            }
        } else {
            document.getElementById('flashcardMode').style.display = 'none';
            document.getElementById('quizMode').style.display = 'block';
            this.startQuiz();
        }
    }

    startQuiz() {
        const dueWords = this.getDueWords();
        if (dueWords.length === 0) return;

        this.currentQuizWord = dueWords[this.currentCardIndex];
        this.showQuizQuestion();
    }

    showQuizQuestion() {
        const word = this.currentQuizWord;
        document.getElementById('quizWord').textContent = word.spanish;

        // Generate 4 options (1 correct + 3 wrong from other words)
        const options = [word.english];
        const otherWords = this.words.filter(w => w.id !== word.id);

        while (options.length < 4 && otherWords.length > 0) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            if (!options.includes(randomWord.english)) {
                options.push(randomWord.english);
            }
            otherWords.splice(otherWords.indexOf(randomWord), 1);
        }

        // Fill remaining options if we don't have enough words
        while (options.length < 4) {
            options.push(`Option ${options.length + 1}`);
        }

        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        this.correctQuizIndex = options.indexOf(word.english);

        // Update UI
        document.querySelectorAll('.quiz-option').forEach((btn, i) => {
            const optionText = btn.querySelector('span:last-child');
            if (optionText) {
                optionText.textContent = options[i] || '';
            }
            btn.classList.remove('correct', 'incorrect', 'disabled');
            btn.disabled = false;
        });

        document.getElementById('quizFeedback').innerHTML = '';
        document.getElementById('quizNextBtn').style.display = 'none';
    }

    answerQuiz(selectedIndex) {
        const correct = selectedIndex === this.correctQuizIndex;

        // Visual feedback
        document.querySelectorAll('.quiz-option').forEach((btn, i) => {
            btn.disabled = true;
            if (i === this.correctQuizIndex) {
                btn.classList.add('correct');
            } else if (i === selectedIndex && !correct) {
                btn.classList.add('incorrect');
            }
        });

        // Feedback message
        const feedback = document.getElementById('quizFeedback');
        if (correct) {
            feedback.innerHTML = `<span style="color: #58cc02;">✓ Correct!</span>`;
            this.reviewWord(this.currentQuizWord.id, 5);
        } else {
            feedback.innerHTML = `<span style="color: #ff4b4b;">✗ Incorrect. The answer is: ${this.currentQuizWord.english}</span>`;
            this.reviewWord(this.currentQuizWord.id, 1);
        }

        document.getElementById('quizNextBtn').style.display = 'block';
    }

    nextQuizQuestion() {
        this.currentCardIndex++;
        const dueWords = this.getDueWords();

        if (this.currentCardIndex >= dueWords.length) {
            this.showReviewComplete();
        } else {
            this.currentQuizWord = dueWords[this.currentCardIndex];
            this.showQuizQuestion();
        }
    }

    // === SEARCH & FILTER ===
    searchWords(query) {
        const filtered = this.words.filter(w =>
            w.spanish.toLowerCase().includes(query.toLowerCase()) ||
            w.english.toLowerCase().includes(query.toLowerCase())
        );
        this.renderWordList(filtered);
    }

    filterWords(filter) {
        let filtered = this.words;
        const now = new Date();

        switch(filter) {
            case 'due':
                filtered = this.words.filter(w => new Date(w.nextReview) <= now);
                break;
            case 'learned':
                filtered = this.words.filter(w => w.repetition >= 3);
                break;
            case 'recent':
                filtered = this.words.slice().sort((a, b) =>
                    new Date(b.addedAt) - new Date(a.addedAt)
                ).slice(0, 20);
                break;
        }

        this.renderWordList(filtered);
    }

    renderWordList(words = this.words) {
        const listEl = document.getElementById('vocabList');
        listEl.innerHTML = words.map(word => `
            <div class="vocab-card">
                <div class="vocab-card-front">
                    <div class="vocab-spanish">${word.spanish}</div>
                    <div class="vocab-english">${word.english}</div>
                </div>
                <div class="vocab-card-stats">
                    <span>${word.reviews} reviews</span>
                    <span>${word.repetition} streak</span>
                </div>
            </div>
        `).join('');
    }

    // === UI ACTIONS ===
    openReview() {
        const vocabSection = document.getElementById('vocabReviewSection');
        if (!vocabSection) return;

        vocabSection.style.display = 'block';
        const feedContainer = document.getElementById('feedContainer');
        if (feedContainer) feedContainer.style.display = 'none';

        // Update stats
        const vocabCount = document.getElementById('vocabCount');
        const vocabDue = document.getElementById('vocabDue');
        if (vocabCount) vocabCount.textContent = `${this.words.length} words`;
        if (vocabDue) vocabDue.textContent = `${this.getDueWords().length} due`;

        // Show/hide empty state
        const vocabEmpty = document.getElementById('vocabEmpty');
        const vocabSearch = document.querySelector('.vocab-search');
        const modeSelector = document.querySelector('.review-mode-selector');
        const flashcardMode = document.getElementById('flashcardMode');
        const vocabList = document.getElementById('vocabList');

        if (this.words.length === 0) {
            if (vocabEmpty) vocabEmpty.style.display = 'flex';
            if (vocabSearch) vocabSearch.style.display = 'none';
            if (modeSelector) modeSelector.style.display = 'none';
            if (flashcardMode) flashcardMode.style.display = 'none';
            if (vocabList) vocabList.style.display = 'none';
        } else {
            if (vocabEmpty) vocabEmpty.style.display = 'none';
            if (vocabSearch) vocabSearch.style.display = 'flex';
            if (modeSelector) modeSelector.style.display = 'flex';

            const dueWords = this.getDueWords();
            if (dueWords.length > 0) {
                this.currentCardIndex = 0;
                if (flashcardMode) flashcardMode.style.display = 'block';
                if (vocabList) vocabList.style.display = 'none';
                this.showFlashcard(dueWords[0]);
                this.updateProgress();
            } else {
                // No words due, show the full list
                if (flashcardMode) flashcardMode.style.display = 'none';
                if (vocabList) vocabList.style.display = 'grid';
                this.renderWordList();
            }
        }
    }

    closeReview() {
        const vocabSection = document.getElementById('vocabReviewSection');
        if (vocabSection) vocabSection.style.display = 'none';
        const feedContainer = document.getElementById('feedContainer');
        if (feedContainer) feedContainer.style.display = 'block';
    }

    showReviewComplete() {
        alert('🎉 Review complete! Great work!');
        this.currentCardIndex = 0;
        this.renderWordList();
    }
}

// Note: Global instance is created in unified-infinite-feed.html after DOM is ready
