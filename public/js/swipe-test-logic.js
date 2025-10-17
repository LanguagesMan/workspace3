// 🎯 SWIPE-BASED PLACEMENT TEST LOGIC
// Adaptive, Fast, and Fun - Like Tinder for Words!

// Initialize Supabase
const SUPABASE_URL = 'https://uejiwteujraxczrxbqff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaml3dGV1anJheGN6cnhicWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDMxMzksImV4cCI6MjA3NTUxOTEzOX0.iva8q5bMcLHfqd6niXqB_i-i-VrPmKLNGr9eiiPwZHQ';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Word Database - Organized by Frequency Rank
const wordDatabase = {
    ultraBeginner: [
        { word: 'hola', rank: 1, translation: 'hello' },
        { word: 'sí', rank: 2, translation: 'yes' },
        { word: 'no', rank: 3, translation: 'no' },
        { word: 'qué', rank: 5, translation: 'what' },
        { word: 'yo', rank: 8, translation: 'I' },
        { word: 'gracias', rank: 12, translation: 'thank you' },
        { word: 'adiós', rank: 15, translation: 'goodbye' },
        { word: 'por favor', rank: 20, translation: 'please' }
    ],
    beginner: [
        { word: 'tiempo', rank: 45, translation: 'time/weather' },
        { word: 'día', rank: 52, translation: 'day' },
        { word: 'persona', rank: 68, translation: 'person' },
        { word: 'casa', rank: 75, translation: 'house' },
        { word: 'amigo', rank: 89, translation: 'friend' },
        { word: 'comida', rank: 102, translation: 'food' },
        { word: 'agua', rank: 115, translation: 'water' },
        { word: 'hablar', rank: 128, translation: 'to speak' }
    ],
    intermediate: [
        { word: 'mientras', rank: 245, translation: 'while' },
        { word: 'aunque', rank: 289, translation: 'although' },
        { word: 'siguiente', rank: 312, translation: 'next' },
        { word: 'anterior', rank: 356, translation: 'previous' },
        { word: 'desarrollar', rank: 401, translation: 'to develop' },
        { word: 'necesidad', rank: 445, translation: 'need' },
        { word: 'importancia', rank: 478, translation: 'importance' },
        { word: 'diferencia', rank: 502, translation: 'difference' }
    ],
    advanced: [
        { word: 'perspectiva', rank: 856, translation: 'perspective' },
        { word: 'estrategia', rank: 912, translation: 'strategy' },
        { word: 'concepto', rank: 967, translation: 'concept' },
        { word: 'implementar', rank: 1023, translation: 'to implement' },
        { word: 'mediante', rank: 1089, translation: 'by means of' },
        { word: 'evidencia', rank: 1145, translation: 'evidence' },
        { word: 'análisis', rank: 1201, translation: 'analysis' },
        { word: 'consecuencia', rank: 1267, translation: 'consequence' }
    ],
    expert: [
        { word: 'desenvolvimiento', rank: 2345, translation: 'development/unfolding' },
        { word: 'idiosincrasia', rank: 2678, translation: 'idiosyncrasy' },
        { word: 'paradigma', rank: 2912, translation: 'paradigm' },
        { word: 'metamorfosis', rank: 3156, translation: 'metamorphosis' },
        { word: 'yuxtaposición', rank: 3401, translation: 'juxtaposition' },
        { word: 'epistemología', rank: 3678, translation: 'epistemology' },
        { word: 'hermenéutica', rank: 3945, translation: 'hermeneutics' },
        { word: 'cognoscitivo', rank: 4212, translation: 'cognitive' }
    ]
};

// Encouragement messages
const encouragementMessages = [
    "Nice! 🔥",
    "You got this! 💪",
    "Great job! ⭐",
    "Keep going! 🚀",
    "Amazing! ✨",
    "On fire! 🔥",
    "Excellent! 🌟",
    "Perfect! 💯"
];

// Test State
let testState = {
    currentRound: 1,
    currentWordIndex: 0,
    totalWords: 20,
    results: [],
    startTime: null,
    currentWords: [],
    knownCount: 0,
    unknownCount: 0,
    swipeSpeeds: []
};

// Touch/Mouse State
let dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0
};

// Start the test
function startTest() {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('testContainer').classList.add('active');
    testState.startTime = Date.now();
    loadRound1();
}

// Skip to beginner level (no test)
function skipToBeginner() {
    localStorage.setItem('userLevel', 'A1');
    localStorage.setItem('assessmentCompleted', 'skipped');
    localStorage.setItem('frequencyRange', '1-500');
    window.location.href = '/tiktok-video-feed.html';
}

// Load Round 1: Ultra-Beginner Words
function loadRound1() {
    testState.currentRound = 1;
    testState.currentWords = selectRandomWords(wordDatabase.ultraBeginner, 5);
    initializeCards();
}

// Select random words from a category
function selectRandomWords(category, count) {
    const shuffled = [...category].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, category.length));
}

// Initialize card stack
function initializeCards() {
    const cardStack = document.getElementById('cardStack');
    cardStack.innerHTML = '';
    
    // Create cards (show only top 3 for performance)
    const visibleCards = Math.min(3, testState.currentWords.length - testState.currentWordIndex);
    for (let i = 0; i < visibleCards; i++) {
        const wordIndex = testState.currentWordIndex + i;
        if (wordIndex < testState.currentWords.length) {
            const word = testState.currentWords[wordIndex];
            const card = createCard(word, i);
            cardStack.appendChild(card);
        }
    }
    
    updateProgressDots();
}

// Create a word card
function createCard(word, stackPosition) {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.style.zIndex = 100 - stackPosition;
    
    card.innerHTML = `
        <div class="word-frequency">Top ${word.rank} most common</div>
        <div class="word-spanish">${word.word}</div>
        <div class="swipe-hint">
            Do you know what this means?<br>
            <strong>Swipe to answer</strong>
        </div>
    `;
    
    // Only make the top card interactive
    if (stackPosition === 0) {
        setupCardInteraction(card, word);
    }
    
    return card;
}

// Setup card interaction (touch + mouse)
function setupCardInteraction(card, word) {
    // Touch events
    card.addEventListener('touchstart', (e) => handleDragStart(e, word), { passive: false });
    card.addEventListener('touchmove', handleDragMove, { passive: false });
    card.addEventListener('touchend', (e) => handleDragEnd(e, word));
    
    // Mouse events
    card.addEventListener('mousedown', (e) => handleDragStart(e, word));
    card.addEventListener('mousemove', handleDragMove);
    card.addEventListener('mouseup', (e) => handleDragEnd(e, word));
    card.addEventListener('mouseleave', (e) => handleDragEnd(e, word));
}

// Handle drag start
function handleDragStart(e, word) {
    e.preventDefault();
    dragState.isDragging = true;
    dragState.startTime = Date.now();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    dragState.startX = clientX;
    dragState.startY = clientY;
    dragState.currentX = clientX;
    dragState.currentY = clientY;
    
    const card = e.currentTarget;
    card.classList.add('dragging');
}

// Handle drag move
function handleDragMove(e) {
    if (!dragState.isDragging) return;
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    dragState.currentX = clientX;
    dragState.currentY = clientY;
    
    const deltaX = dragState.currentX - dragState.startX;
    const deltaY = dragState.currentY - dragState.startY;
    
    // Update card position
    const card = document.querySelector('.word-card.dragging');
    if (card) {
        const rotation = deltaX * 0.1;
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
        
        // Show indicators
        const leftIndicator = document.getElementById('leftIndicator');
        const rightIndicator = document.getElementById('rightIndicator');
        
        if (deltaX < -50) {
            leftIndicator.classList.add('visible');
            rightIndicator.classList.remove('visible');
        } else if (deltaX > 50) {
            rightIndicator.classList.add('visible');
            leftIndicator.classList.remove('visible');
        } else {
            leftIndicator.classList.remove('visible');
            rightIndicator.classList.remove('visible');
        }
    }
}

// Handle drag end
function handleDragEnd(e, word) {
    if (!dragState.isDragging) return;
    
    dragState.isDragging = false;
    const deltaX = dragState.currentX - dragState.startX;
    const swipeSpeed = Date.now() - dragState.startTime;
    
    const card = document.querySelector('.word-card.dragging');
    if (card) {
        card.classList.remove('dragging');
        
        // Determine swipe direction
        if (Math.abs(deltaX) > 100) {
            if (deltaX < 0) {
                processSwipe(word, false, swipeSpeed);
                card.classList.add('swiped-left');
            } else {
                processSwipe(word, true, swipeSpeed);
                card.classList.add('swiped-right');
            }
            
            // Remove card after animation
            setTimeout(() => {
                card.remove();
                nextCard();
            }, 400);
        } else {
            // Snap back
            card.style.transform = '';
        }
        
        // Hide indicators
        document.getElementById('leftIndicator').classList.remove('visible');
        document.getElementById('rightIndicator').classList.remove('visible');
    }
}

// Swipe card programmatically (button click)
function swipeCard(direction) {
    const card = document.querySelector('.word-card');
    if (!card) return;
    
    const word = testState.currentWords[testState.currentWordIndex];
    const known = direction === 'right';
    const swipeSpeed = 0; // Instant for button clicks
    
    processSwipe(word, known, swipeSpeed);
    
    if (direction === 'left') {
        card.classList.add('swiped-left');
    } else {
        card.classList.add('swiped-right');
    }
    
    setTimeout(() => {
        card.remove();
        nextCard();
    }, 400);
}

// Process swipe result
function processSwipe(word, known, swipeSpeed) {
    // Record result
    testState.results.push({
        word: word.word,
        rank: word.rank,
        known: known,
        speed: swipeSpeed,
        round: testState.currentRound
    });
    
    if (known) {
        testState.knownCount++;
    } else {
        testState.unknownCount++;
    }
    
    testState.swipeSpeeds.push(swipeSpeed);
    
    // Show encouragement
    showEncouragement();
    
    // Add haptic feedback (if supported)
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

// Show encouragement message
function showEncouragement() {
    const encouragement = document.getElementById('encouragement');
    const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    encouragement.textContent = message;
    encouragement.style.animation = 'none';
    setTimeout(() => {
        encouragement.style.animation = 'fadeInOut 1s ease';
    }, 10);
}

// Move to next card
function nextCard() {
    testState.currentWordIndex++;
    
    // Check if round is complete
    if (testState.currentWordIndex >= testState.currentWords.length) {
        handleRoundComplete();
    } else {
        // Load next card
        const cardStack = document.getElementById('cardStack');
        const remainingCards = testState.currentWords.length - testState.currentWordIndex;
        
        // Add a new card to the bottom if needed
        if (remainingCards > cardStack.children.length) {
            const word = testState.currentWords[testState.currentWordIndex + cardStack.children.length];
            const card = createCard(word, cardStack.children.length);
            cardStack.appendChild(card);
        }
        
        // Update z-index and make top card interactive
        Array.from(cardStack.children).forEach((card, index) => {
            card.style.zIndex = 100 - index;
            if (index === 0) {
                const word = testState.currentWords[testState.currentWordIndex];
                setupCardInteraction(card, word);
            }
        });
        
        updateProgressDots();
    }
}

// Handle round completion
function handleRoundComplete() {
    // Calculate performance for this round
    const roundResults = testState.results.filter(r => r.round === testState.currentRound);
    const knownInRound = roundResults.filter(r => r.known).length;
    const accuracy = knownInRound / roundResults.length;
    
    // Determine next round based on adaptive logic
    if (testState.currentRound === 1) {
        // Round 1 complete: Ultra-beginner words
        if (knownInRound >= 4) {
            // User knows basics, go to intermediate
            testState.currentRound = 2;
            testState.currentWords = selectRandomWords(wordDatabase.intermediate, 5);
        } else if (knownInRound >= 2) {
            // User knows some basics, go to beginner
            testState.currentRound = 2;
            testState.currentWords = selectRandomWords(wordDatabase.beginner, 5);
        } else {
            // User is total beginner, show more beginner words
            testState.currentRound = 2;
            testState.currentWords = selectRandomWords(wordDatabase.ultraBeginner.concat(wordDatabase.beginner), 5);
        }
    } else if (testState.currentRound === 2) {
        // Round 2 complete
        if (accuracy >= 0.8) {
            // High accuracy, move up
            testState.currentRound = 3;
            testState.currentWords = selectRandomWords(wordDatabase.advanced, 5);
        } else if (accuracy >= 0.4) {
            // Medium accuracy, stay or slight up
            testState.currentRound = 3;
            testState.currentWords = selectRandomWords(wordDatabase.intermediate, 5);
        } else {
            // Low accuracy, go to beginner
            testState.currentRound = 3;
            testState.currentWords = selectRandomWords(wordDatabase.beginner, 5);
        }
    } else if (testState.currentRound === 3) {
        // Round 3 complete
        if (accuracy >= 0.8) {
            // Expert level, test expert words
            testState.currentRound = 4;
            testState.currentWords = selectRandomWords(wordDatabase.expert, 5);
        } else {
            // Final confirmation round
            testState.currentRound = 4;
            testState.currentWords = selectRandomWords(
                accuracy >= 0.6 ? wordDatabase.advanced : wordDatabase.intermediate, 
                5
            );
        }
    } else {
        // Test complete!
        showResults();
        return;
    }
    
    // Reset for next round
    testState.currentWordIndex = 0;
    initializeCards();
}

// Update progress dots
function updateProgressDots() {
    const dotsContainer = document.getElementById('progressDots');
    const totalCompleted = testState.results.length;
    const currentInRound = testState.currentWordIndex;
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < testState.totalWords; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        if (i < totalCompleted) {
            dot.classList.add('completed');
        } else if (i === totalCompleted) {
            dot.classList.add('active');
        }
        
        dotsContainer.appendChild(dot);
    }
}

// Show results
function showResults() {
    document.getElementById('testContainer').classList.remove('active');
    const resultsScreen = document.getElementById('resultsScreen');
    resultsScreen.classList.add('active');
    
    // Calculate final level
    const levelData = calculateLevel();
    
    // Show confetti
    createConfetti();
    
    // Update results display
    document.getElementById('levelBadge').textContent = levelData.level;
    document.getElementById('wordCount').textContent = `~${levelData.wordCount} words`;
    document.getElementById('percentile').textContent = `${levelData.percentile}% of learners`;
    document.getElementById('confidence').textContent = levelData.confidence;
    
    const duration = Math.round((Date.now() - testState.startTime) / 1000);
    document.getElementById('duration').textContent = `${duration}s`;
    
    document.getElementById('resultsDescription').textContent = levelData.description;
    
    // Save to localStorage
    localStorage.setItem('userLevel', levelData.level);
    localStorage.setItem('frequencyRange', levelData.frequencyRange);
    localStorage.setItem('assessmentCompleted', 'true');
    localStorage.setItem('assessmentScore', JSON.stringify(testState.results));
    
    // Save to Supabase
    saveToSupabase(levelData, duration);
}

// Calculate user level based on results
function calculateLevel() {
    // Analyze results
    const allWords = testState.results;
    const knownWords = allWords.filter(r => r.known);
    const totalKnown = knownWords.length;
    const accuracy = totalKnown / allWords.length;
    
    // Calculate average rank of known words
    const avgKnownRank = knownWords.length > 0 
        ? knownWords.reduce((sum, r) => sum + r.rank, 0) / knownWords.length 
        : 0;
    
    // Calculate average swipe speed (faster = more confident)
    const avgSpeed = testState.swipeSpeeds.reduce((sum, s) => sum + s, 0) / testState.swipeSpeeds.length;
    const fastSwipes = testState.swipeSpeeds.filter(s => s < 1000 && s > 0).length;
    const speedConfidence = fastSwipes / testState.swipeSpeeds.filter(s => s > 0).length;
    
    // Determine level
    let level, wordCount, frequencyRange, description, percentile, confidence;
    
    if (totalKnown <= 5 || avgKnownRank <= 20) {
        level = 'A1';
        wordCount = 100;
        frequencyRange = '1-500';
        description = "You're just starting! Perfect - we'll build your foundation with the most common everyday words.";
        percentile = 25;
    } else if (totalKnown <= 8 || avgKnownRank <= 100) {
        level = 'A2';
        wordCount = 300;
        frequencyRange = '1-1000';
        description = "You know the basics! You can handle simple conversations and understand common phrases.";
        percentile = 40;
    } else if (totalKnown <= 12 || avgKnownRank <= 400) {
        level = 'B1';
        wordCount = 800;
        frequencyRange = '1-2000';
        description = "You're comfortable with Spanish! You can handle most everyday situations and understand native content.";
        percentile = 65;
    } else if (totalKnown <= 16 || avgKnownRank <= 1000) {
        level = 'B2';
        wordCount = 2000;
        frequencyRange = '1-4000';
        description = "You're fluent! You understand complex topics, nuances, and can express yourself naturally.";
        percentile = 82;
    } else {
        level = 'C1';
        wordCount = 5000;
        frequencyRange = '1-8000';
        description = "You're advanced! You understand sophisticated Spanish and can handle academic or professional contexts.";
        percentile = 95;
    }
    
    // Determine confidence based on speed
    if (speedConfidence > 0.7) {
        confidence = 'Very High';
    } else if (speedConfidence > 0.5) {
        confidence = 'High';
    } else if (speedConfidence > 0.3) {
        confidence = 'Medium';
    } else {
        confidence = 'Growing';
    }
    
    return { level, wordCount, frequencyRange, description, percentile, confidence };
}

// Create confetti animation
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }
}

// Save results to Supabase
async function saveToSupabase(levelData, duration) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // Update user metadata
            await supabase.auth.updateUser({
                data: {
                    level: levelData.level,
                    frequency_range: levelData.frequencyRange,
                    assessment_completed: true,
                    assessment_date: new Date().toISOString(),
                    assessment_duration: duration,
                    word_count: levelData.wordCount
                }
            });
            
            // Update user profile
            await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.id,
                    email: user.email,
                    level: levelData.level,
                    frequency_range: levelData.frequencyRange,
                    assessment_completed: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            
            console.log('✅ Assessment saved to Supabase');
        }
    } catch (error) {
        console.error('Error saving to Supabase:', error);
    }
}

// Start learning (go to main app)
function startLearning() {
    window.location.href = '/tiktok-video-feed.html';
}

// Prevent accidental page navigation during test
window.addEventListener('beforeunload', (e) => {
    if (testState.results.length > 0 && testState.results.length < 20) {
        e.preventDefault();
        e.returnValue = '';
    }
});

