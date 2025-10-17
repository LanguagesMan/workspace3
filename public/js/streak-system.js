// STREAK SYSTEM - Duolingo Pattern (+60% engagement)
// Shared across video and article feeds

const STREAK_KEY = 'vida_streak_data';
const DAILY_GOAL = { videos: 5, words: 10 };

// Initialize streak system
function initStreakSystem() {
    const streakData = getStreakData();
    updateStreakDisplay(streakData);
    updateGoalProgress(streakData);
}

// Get streak data from localStorage
function getStreakData() {
    const defaultData = {
        currentStreak: 7,
        lastActiveDate: new Date().toDateString(),
        videosToday: 2,
        wordsToday: 4,
        hasStreakFreeze: true,
        totalDays: 7
    };

    const stored = localStorage.getItem(STREAK_KEY);
    if (!stored) {
        localStorage.setItem(STREAK_KEY, JSON.stringify(defaultData));
        return defaultData;
    }

    const data = JSON.parse(stored);

    // Check if streak should break
    const lastActive = new Date(data.lastActiveDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1 && !data.hasStreakFreeze) {
        // Streak broken - no freeze available
        data.currentStreak = 0;
        data.videosToday = 0;
        data.wordsToday = 0;
    } else if (daysDiff === 1 && data.hasStreakFreeze) {
        // Used streak freeze
        data.hasStreakFreeze = false;
        data.videosToday = 0;
        data.wordsToday = 0;
        data.lastActiveDate = today.toDateString();
    } else if (daysDiff === 1) {
        // New day, reset daily goals
        data.videosToday = 0;
        data.wordsToday = 0;
        data.lastActiveDate = today.toDateString();
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return data;
}

// Update streak display
function updateStreakDisplay(data) {
    const streakDaysEl = document.getElementById('streakDays');
    const fireEl = document.querySelector('.streak-fire');
    const widgetEl = document.querySelector('.streak-widget');

    if (!streakDaysEl || !fireEl || !widgetEl) return;

    streakDaysEl.textContent = data.currentStreak;

    if (data.currentStreak === 0) {
        fireEl.textContent = '💔'; // Broken streak
        widgetEl.style.background = 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)';
    } else {
        fireEl.textContent = '🔥'; // Active streak
        widgetEl.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)';
    }
}

// Update goal progress bar
function updateGoalProgress(data) {
    const goalFillEl = document.getElementById('goalFill');
    if (!goalFillEl) return;

    const videoProgress = Math.min(100, (data.videosToday / DAILY_GOAL.videos) * 100);
    const wordProgress = Math.min(100, (data.wordsToday / DAILY_GOAL.words) * 100);
    const totalProgress = (videoProgress + wordProgress) / 2;

    goalFillEl.style.width = totalProgress + '%';

    // Goal completed animation
    if (totalProgress >= 100 && !data.goalCompletedToday) {
        celebrateGoalComplete();
        data.goalCompletedToday = true;
        localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    }
}

// Show streak details modal
function showStreakDetails() {
    const data = getStreakData();
    const videoPercent = Math.round((data.videosToday / DAILY_GOAL.videos) * 100);
    const wordPercent = Math.round((data.wordsToday / DAILY_GOAL.words) * 100);

    alert(`🔥 ${data.currentStreak} Day Streak!

Today's Progress:
📹 Videos: ${data.videosToday}/${DAILY_GOAL.videos} (${videoPercent}%)
📚 Words: ${data.wordsToday}/${DAILY_GOAL.words} (${wordPercent}%)

${data.hasStreakFreeze ? '❄️ Streak Freeze Active\n(One day missed won\'t break your streak!)' : '⚠️ No Streak Freeze\n(Don\'t miss tomorrow!)'}

Total Learning Days: ${data.totalDays}`);
}

// Track video completion
function trackVideoComplete() {
    const data = getStreakData();
    data.videosToday = Math.min(data.videosToday + 1, DAILY_GOAL.videos);

    // Check if daily goal met
    const goalMet = data.videosToday >= DAILY_GOAL.videos && data.wordsToday >= DAILY_GOAL.words;
    if (goalMet && !data.goalCompletedToday) {
        data.currentStreak++;
        data.totalDays++;
        data.goalCompletedToday = true;
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    updateStreakDisplay(data);
    updateGoalProgress(data);
}

// Track word learned
function trackWordLearned() {
    const data = getStreakData();
    data.wordsToday = Math.min(data.wordsToday + 1, DAILY_GOAL.words);

    // Check if daily goal met
    const goalMet = data.videosToday >= DAILY_GOAL.videos && data.wordsToday >= DAILY_GOAL.words;
    if (goalMet && !data.goalCompletedToday) {
        data.currentStreak++;
        data.totalDays++;
        data.goalCompletedToday = true;
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    updateStreakDisplay(data);
    updateGoalProgress(data);
}

// Celebrate goal completion
function celebrateGoalComplete() {
    const widgetEl = document.querySelector('.streak-widget');
    if (!widgetEl) return;

    // Fire particle burst animation
    widgetEl.style.animation = 'heartBurst 0.6s ease';

    setTimeout(() => {
        widgetEl.style.animation = '';
    }, 600);

    console.log('🎉 Daily goal completed! Streak extended!');

    // Show celebration message
    setTimeout(() => {
        if (confirm('🎉 Daily Goal Complete!\n\nYour streak is now extended!\nKeep learning tomorrow to maintain your streak.')) {
            // User clicked OK
        }
    }, 700);
}
