/**
 * Vocabulary Integration - Universal Word Click Tracking
 * Automatically tracks word clicks and provides save functionality
 * Include this script on any page with clickable Spanish words
 */

(function() {
    const API_BASE = '/api';
    
    // Get or create user ID
    function getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }
    
    /**
     * Track word click
     * @param {string} word - Spanish word
     * @param {string} translation - English translation
     * @param {Object} options - Additional options (context, source, level)
     */
    async function trackWordClick(word, translation, options = {}) {
        const userId = getUserId();
        
        try {
            const response = await fetch(`${API_BASE}/vocabulary/click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    word: word.trim(),
                    translation: translation.trim(),
                    context: options.context || '',
                    source: options.source || 'web',
                    sourceId: options.sourceId || '',
                    level: options.level || 'A2'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ Tracked word: "${word}"`);
                return data.vocabulary;
            }
        } catch (error) {
            console.error('Error tracking word click:', error);
        }
        
        return null;
    }
    
    /**
     * Save word for review
     * @param {string} word - Spanish word
     */
    async function saveWord(word) {
        const userId = getUserId();
        
        try {
            const response = await fetch(`${API_BASE}/vocabulary/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    word: word.trim()
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ Saved word for review: "${word}"`);
                showNotification(`📚 "${word}" saved for review!`);
                return true;
            } else {
                showNotification(`⚠️ ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error saving word:', error);
            showNotification('❌ Error saving word', 'error');
        }
        
        return false;
    }
    
    /**
     * Show notification toast
     */
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.getElementById('vocab-notification');
        if (existing) existing.remove();
        
        const notif = document.createElement('div');
        notif.id = 'vocab-notification';
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#34C759' : '#FF3B30'};
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            font-weight: 600;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }
    
    /**
     * Create word popup with translation and save button
     */
    function showWordPopup(word, translation, element, options = {}) {
        // Remove existing popup
        const existing = document.getElementById('vocab-popup');
        if (existing) existing.remove();
        
        const popup = document.createElement('div');
        popup.id = 'vocab-popup';
        popup.innerHTML = `
            <div class="vocab-popup-content">
                <div class="vocab-popup-word">${word}</div>
                <div class="vocab-popup-translation">${translation}</div>
                <button class="vocab-popup-save" onclick="window.vocabularyIntegration.saveWord('${word}')">
                    📚 Save for Review
                </button>
                <button class="vocab-popup-close" onclick="document.getElementById('vocab-popup').remove()">
                    ×
                </button>
            </div>
        `;
        
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 10000;
            padding: 24px;
            min-width: 280px;
            animation: popIn 0.3s ease-out;
        `;
        
        // Add styles for popup elements
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); }
                to { transform: translateX(-50%) translateY(0); }
            }
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(0); }
                to { transform: translateX(-50%) translateY(-100%); }
            }
            .vocab-popup-word {
                font-size: 28px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 8px;
            }
            .vocab-popup-translation {
                font-size: 18px;
                color: #333;
                margin-bottom: 16px;
            }
            .vocab-popup-save {
                background: #34C759;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                margin-bottom: 8px;
            }
            .vocab-popup-save:hover {
                background: #2fb34c;
            }
            .vocab-popup-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: transparent;
                border: none;
                font-size: 28px;
                color: #999;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .vocab-popup-close:hover {
                color: #333;
            }
        `;
        
        if (!document.getElementById('vocab-popup-styles')) {
            style.id = 'vocab-popup-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(popup);
        
        // Track the click
        trackWordClick(word, translation, options);
    }
    
    /**
     * Auto-enhance Spanish words with click handlers
     * Call this on pages with .spanish-word or [data-word] elements
     */
    function enhanceSpanishWords() {
        // Find all Spanish word elements
        const wordElements = document.querySelectorAll('.spanish-word, [data-word]');
        
        wordElements.forEach(element => {
            if (element.dataset.vocabEnhanced) return; // Skip if already enhanced
            
            const word = element.dataset.word || element.textContent.trim();
            const translation = element.dataset.translation || element.title || '';
            
            if (!word || !translation) return;
            
            element.style.cursor = 'pointer';
            element.style.textDecoration = 'underline';
            element.style.textDecorationStyle = 'dotted';
            
            element.addEventListener('click', () => {
                showWordPopup(word, translation, element, {
                    source: element.dataset.source || 'web',
                    sourceId: element.dataset.sourceId || '',
                    level: element.dataset.level || 'A2',
                    context: element.dataset.context || ''
                });
            });
            
            element.dataset.vocabEnhanced = 'true';
        });
    }
    
    // Export API
    window.vocabularyIntegration = {
        trackWordClick,
        saveWord,
        showWordPopup,
        enhanceSpanishWords,
        getUserId
    };
    
    // Auto-enhance on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceSpanishWords);
    } else {
        enhanceSpanishWords();
    }
    
    console.log('📚 Vocabulary Integration loaded');
})();

