/**
 * 🎯 DIFFICULTY BADGE COMPONENT
 * Shows CEFR level, comprehension rate, and difficulty status
 * Color-coded for instant visual feedback
 */

class DifficultyBadge {
    constructor() {
        this.styles = {
            badge: `
                display: inline-flex;
                flex-direction: column;
                gap: 4px;
                padding: 8px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-align: center;
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `,
            level: `
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 0.5px;
            `,
            comprehension: `
                font-size: 11px;
                opacity: 0.9;
            `,
            newWords: `
                font-size: 11px;
                opacity: 0.9;
            `,
            status: `
                font-size: 10px;
                text-transform: uppercase;
                font-weight: 700;
                margin-top: 2px;
            `
        };

        this.colors = {
            'Perfect': {
                bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                text: '#ffffff',
                emoji: '🎯'
            },
            'Easy': {
                bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                text: '#ffffff',
                emoji: '✅'
            },
            'Challenging': {
                bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                text: '#ffffff',
                emoji: '💪'
            },
            'Too Hard': {
                bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                text: '#ffffff',
                emoji: '🔥'
            },
            'Too Easy': {
                bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                text: '#ffffff',
                emoji: '😴'
            },
            'Unknown': {
                bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                text: '#ffffff',
                emoji: '❓'
            }
        };

        this.levelColors = {
            'A1': '#10b981',
            'A2': '#3b82f6',
            'B1': '#f59e0b',
            'B2': '#ef4444',
            'C1': '#8b5cf6',
            'C2': '#ec4899'
        };
    }

    /**
     * Create badge HTML
     * @param {Object} data - Badge data
     * @returns {string} HTML string
     */
    create(data) {
        const {
            level,
            comprehension = 87,
            newWords = 5,
            status = 'Perfect'
        } = data;

        const color = this.colors[status] || this.colors['Unknown'];
        const emoji = color.emoji;

        return `
            <div class="difficulty-badge" 
                 data-level="${level}"
                 data-status="${status}"
                 style="background: ${color.bg}; color: ${color.text}; ${this.styles.badge}">
                <div class="badge-level" style="${this.styles.level}">
                    ${emoji} ${level}
                </div>
                <div class="badge-comprehension" style="${this.styles.comprehension}">
                    ${comprehension}% comprehension
                </div>
                <div class="badge-new-words" style="${this.styles.newWords}">
                    ${newWords} new words
                </div>
                <div class="badge-status" style="${this.styles.status}">
                    ${status}
                </div>
            </div>
        `;
    }

    /**
     * Create compact badge (for smaller spaces)
     * @param {Object} data - Badge data
     * @returns {string} HTML string
     */
    createCompact(data) {
        const {
            level,
            comprehension = 87,
            status = 'Perfect'
        } = data;

        const color = this.colors[status] || this.colors['Unknown'];
        const emoji = color.emoji;

        return `
            <div class="difficulty-badge-compact" 
                 data-level="${level}"
                 data-status="${status}"
                 style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 8px;
                    background: ${color.bg};
                    color: ${color.text};
                    font-size: 11px;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                <span style="font-size: 12px;">${emoji}</span>
                <span>${level}</span>
                <span style="opacity: 0.9;">${comprehension}%</span>
            </div>
        `;
    }

    /**
     * Create level-only badge
     * @param {string} level - CEFR level
     * @returns {string} HTML string
     */
    createLevelBadge(level) {
        const color = this.levelColors[level] || '#6b7280';
        const labels = {
            'A1': 'Beginner',
            'A2': 'Elementary',
            'B1': 'Intermediate',
            'B2': 'Upper-Int',
            'C1': 'Advanced',
            'C2': 'Proficient'
        };

        return `
            <span class="level-badge" 
                  data-level="${level}"
                  style="
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    background: ${color};
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  ">
                ${level} - ${labels[level]}
            </span>
        `;
    }

    /**
     * Create Goldilocks score indicator
     * @param {number} score - Goldilocks score (0-100)
     * @returns {string} HTML string
     */
    createGoldilocksIndicator(score) {
        let emoji, text, color;

        if (score >= 90) {
            emoji = '🎯';
            text = 'Perfect Match!';
            color = '#10b981';
        } else if (score >= 75) {
            emoji = '👍';
            text = 'Good Match';
            color = '#22c55e';
        } else if (score >= 50) {
            emoji = '👌';
            text = 'OK Match';
            color = '#f59e0b';
        } else {
            emoji = '🤔';
            text = 'Not Ideal';
            color = '#ef4444';
        }

        return `
            <div class="goldilocks-indicator"
                 style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    background: ${color}20;
                    border: 2px solid ${color};
                    color: ${color};
                    font-size: 12px;
                    font-weight: 600;
                 ">
                <span style="font-size: 16px;">${emoji}</span>
                <span>${text}</span>
                <span style="
                    background: ${color};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    margin-left: 4px;
                ">${score}%</span>
            </div>
        `;
    }

    /**
     * Inject badge into video element
     * @param {HTMLElement} videoElement - Video container element
     * @param {Object} data - Badge data
     */
    injectIntoVideo(videoElement, data) {
        // Remove existing badge if present
        const existing = videoElement.querySelector('.difficulty-badge');
        if (existing) existing.remove();

        // Create badge element
        const badgeHTML = this.create(data);
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 10;
            pointer-events: none;
        `;
        wrapper.innerHTML = badgeHTML;

        videoElement.style.position = 'relative';
        videoElement.appendChild(wrapper);
    }

    /**
     * Inject compact badge into list item
     * @param {HTMLElement} element - Container element
     * @param {Object} data - Badge data
     */
    injectCompact(element, data) {
        const existing = element.querySelector('.difficulty-badge-compact');
        if (existing) existing.remove();

        const badgeHTML = this.createCompact(data);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = badgeHTML;

        element.appendChild(wrapper.firstElementChild);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DifficultyBadge;
} else {
    window.DifficultyBadge = DifficultyBadge;
}

