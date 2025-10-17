/**
 * 🎓 QUIZ INTEGRATION - Connect quiz system to video feed
 */

class QuizIntegration {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.videoQuizzes = new Map(); // Cache generated quizzes
    }

    /**
     * Generate and show quiz for a video
     */
    async showQuizForVideo(videoElement, transcriptions) {
        if (!transcriptions || transcriptions.length === 0) {
            console.log('No transcriptions available for quiz');
            return;
        }

        const videoId = videoElement.getAttribute('data-video-id') || videoElement.src;

        // Check cache
        if (!this.videoQuizzes.has(videoId)) {
            // Generate quiz
            const quiz = quizGen.generateQuiz(transcriptions, videoId);
            if (quiz.length === 0) {
                console.log('Could not generate quiz');
                return;
            }
            this.videoQuizzes.set(videoId, quiz);
        }

        this.currentQuiz = this.videoQuizzes.get(videoId);
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Show modal
        this.showQuizModal();
        this.renderQuestion();
    }

    /**
     * Show quiz modal
     */
    showQuizModal() {
        const modal = document.getElementById('quiz-modal');
        modal.classList.add('active');
    }

    /**
     * Hide quiz modal
     */
    hideQuizModal() {
        const modal = document.getElementById('quiz-modal');
        modal.classList.remove('active');
    }

    /**
     * Render current question
     */
    renderQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const container = document.getElementById('quiz-content');

        // Update progress
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.currentQuiz.length;

        let html = `
            <div class="question-container">
                <div class="question-text">${question.question}</div>
        `;

        if (question.spanish && question.type !== 'listening') {
            html += `<div class="question-spanish">${question.spanish}</div>`;
        }

        // Render based on question type
        switch (question.type) {
            case 'multiple-choice':
                html += `<div class="quiz-options">`;
                question.options.forEach((option, index) => {
                    html += `
                        <button class="quiz-option" data-answer="${option}">
                            ${option}
                        </button>
                    `;
                });
                html += `</div>`;
                break;

            case 'fill-blank':
                html += `
                    <input type="text" class="quiz-input" id="quiz-input" placeholder="Type your answer...">
                    ${question.hint ? `<div class="quiz-hint">${question.hint}</div>` : ''}
                `;
                break;

            case 'listening':
                html += `
                    <div class="quiz-hint">Listen to the audio and type what you hear</div>
                    <input type="text" class="quiz-input" id="quiz-input" placeholder="Type what you heard...">
                    ${question.hint ? `<div class="quiz-hint">${question.hint}</div>` : ''}
                `;
                break;
        }

        html += `
            </div>
            <div class="quiz-actions">
        `;

        if (question.type === 'multiple-choice') {
            html += `
                <button class="quiz-btn quiz-btn-secondary" onclick="quizIntegration.skipQuestion()">Skip</button>
            `;
        } else {
            html += `
                <button class="quiz-btn quiz-btn-secondary" onclick="quizIntegration.skipQuestion()">Skip</button>
                <button class="quiz-btn quiz-btn-primary" onclick="quizIntegration.submitAnswer()">Submit</button>
            `;
        }

        html += `</div>`;

        container.innerHTML = html;

        // Add event listeners for multiple choice
        if (question.type === 'multiple-choice') {
            container.querySelectorAll('.quiz-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const answer = e.target.getAttribute('data-answer');
                    this.checkAnswer(answer);
                });
            });
        }

        // Add enter key listener for text input
        const input = container.querySelector('#quiz-input');
        if (input) {
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
        }
    }

    /**
     * Submit answer for text input questions
     */
    submitAnswer() {
        const input = document.getElementById('quiz-input');
        if (input) {
            const answer = input.value.trim().toLowerCase();
            this.checkAnswer(answer);
        }
    }

    /**
     * Check if answer is correct
     */
    checkAnswer(userAnswer) {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const correctAnswer = question.correctAnswer.toLowerCase();
        const isCorrect = userAnswer.toLowerCase() === correctAnswer;

        if (isCorrect) {
            this.score++;
            showXPGain(question.points || 20);
            
            // Show correct feedback
            if (question.type === 'multiple-choice') {
                const selectedOption = document.querySelector(`[data-answer="${userAnswer}"]`);
                selectedOption.classList.add('correct');
            }
        } else {
            // Show incorrect feedback
            if (question.type === 'multiple-choice') {
                const selectedOption = document.querySelector(`[data-answer="${userAnswer}"]`);
                selectedOption.classList.add('incorrect');
                
                // Highlight correct answer
                setTimeout(() => {
                    const correctOption = document.querySelector(`[data-answer="${question.correctAnswer}"]`);
                    correctOption.classList.add('correct');
                }, 500);
            }
        }

        // Move to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, isCorrect ? 1000 : 2000);
    }

    /**
     * Skip question
     */
    skipQuestion() {
        this.nextQuestion();
    }

    /**
     * Move to next question
     */
    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex >= this.currentQuiz.length) {
            this.showResults();
        } else {
            this.renderQuestion();
        }
    }

    /**
     * Show quiz results
     */
    showResults() {
        const totalQuestions = this.currentQuiz.length;
        const percentage = Math.round((this.score / totalQuestions) * 100);
        
        // Award XP
        const result = gamification.quizCompleted(this.score, totalQuestions);

        let message = '';
        let emoji = '';
        if (percentage >= 90) {
            message = '¡Excelente! Perfect!';
            emoji = '🌟';
        } else if (percentage >= 70) {
            message = '¡Muy bien! Great job!';
            emoji = '🎉';
        } else if (percentage >= 50) {
            message = '¡Bien! Good effort!';
            emoji = '👍';
        } else {
            message = 'Keep practicing!';
            emoji = '💪';
        }

        const container = document.getElementById('quiz-content');
        container.innerHTML = `
            <div class="quiz-results">
                <div class="results-score">${emoji}<br>${this.score}/${totalQuestions}</div>
                <div class="results-message">${message}</div>
                <div class="results-xp">
                    +${result.xpGained} XP earned!
                </div>
                <div class="quiz-actions">
                    <button class="quiz-btn quiz-btn-primary" onclick="quizIntegration.closeQuiz()">
                        Continue Learning
                    </button>
                </div>
            </div>
        `;

        updateGamificationUI();
    }

    /**
     * Close quiz modal
     */
    closeQuiz() {
        this.hideQuizModal();
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
    }
}

// Create global instance
const quizIntegration = new QuizIntegration();

/**
 * Hook into video completion
 */
function onVideoCompleted(videoElement, transcriptions) {
    // Award XP for watching video
    const result = gamification.videoCompleted(videoElement.src);
    showXPGain(10);
    updateGamificationUI();

    // Show quiz after 1 second
    setTimeout(() => {
        quizIntegration.showQuizForVideo(videoElement, transcriptions);
    }, 1000);
}

// Export functions
window.quizIntegration = quizIntegration;
window.onVideoCompleted = onVideoCompleted;

console.log('✅ Quiz integration loaded');

