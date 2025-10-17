/**
 * 🎯 PREFERENCE MANAGER - Client-Side Preferences UI
 * 
 * Handles user preference management in the browser:
 * - Fetch user preferences
 * - Update preferences
 * - Add/remove from lists
 * - Track content interactions
 * - UI helpers for preference controls
 */

class PreferenceManager {
    constructor() {
        this.userId = this.getUserId();
        this.preferences = null;
        this.apiBase = '/api';
    }

    /**
     * Get user ID from localStorage or generate anonymous ID
     */
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    /**
     * Fetch user preferences from API
     */
    async fetchPreferences() {
        try {
            const response = await fetch(`${this.apiBase}/preferences`, {
                headers: {
                    'x-user-id': this.userId
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.preferences = data.preferences;
                return data.preferences;
            } else {
                console.error('Failed to fetch preferences:', data);
                return null;
            }

        } catch (error) {
            console.error('Error fetching preferences:', error);
            return null;
        }
    }

    /**
     * Update user preferences (partial update)
     */
    async updatePreferences(updates) {
        try {
            const response = await fetch(`${this.apiBase}/preferences`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();
            
            if (data.success) {
                this.preferences = data.preferences;
                console.log('✅ Preferences updated');
                return data.preferences;
            } else {
                console.error('Failed to update preferences:', data);
                return null;
            }

        } catch (error) {
            console.error('Error updating preferences:', error);
            return null;
        }
    }

    /**
     * Add item to preference list (artist, topic, etc.)
     */
    async addToList(field, value) {
        try {
            const response = await fetch(`${this.apiBase}/preferences/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId
                },
                body: JSON.stringify({ field, value })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ Added ${value} to ${field}`);
                // Update local cache
                if (this.preferences) {
                    this.preferences[field] = data[field];
                }
                return true;
            } else {
                console.error(`Failed to add ${value} to ${field}:`, data);
                return false;
            }

        } catch (error) {
            console.error(`Error adding ${value} to ${field}:`, error);
            return false;
        }
    }

    /**
     * Remove item from preference list
     */
    async removeFromList(field, value) {
        try {
            const response = await fetch(`${this.apiBase}/preferences/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId
                },
                body: JSON.stringify({ field, value })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ Removed ${value} from ${field}`);
                // Update local cache
                if (this.preferences) {
                    this.preferences[field] = data[field];
                }
                return true;
            } else {
                console.error(`Failed to remove ${value} from ${field}:`, data);
                return false;
            }

        } catch (error) {
            console.error(`Error removing ${value} from ${field}:`, error);
            return false;
        }
    }

    /**
     * Track content interaction
     */
    async trackInteraction(contentId, contentType, interactionType, metadata = {}) {
        try {
            const response = await fetch(`${this.apiBase}/personalization/track-interaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId
                },
                body: JSON.stringify({
                    userId: this.userId,
                    contentId,
                    contentType,
                    interactionType,
                    ...metadata
                })
            });

            const data = await response.json();
            return data.success;

        } catch (error) {
            console.error('Error tracking interaction:', error);
            return false;
        }
    }

    /**
     * Like content (adds to favorites, tracks positive signal)
     */
    async likeContent(content) {
        const { id, type, artist, genre, topic, category, difficulty } = content;
        
        // Track like interaction
        await this.trackInteraction(id, type, 'like', {
            artist, genre, topic, category, difficulty
        });

        // Auto-add to favorites
        if (type === 'music' && artist) {
            await this.addToList('favorite_artists', artist);
            if (genre) await this.addToList('favorite_music_genres', genre);
        } else if (type === 'article' && topic) {
            await this.addToList('favorite_topics', topic);
        } else if (type === 'video' && category) {
            await this.addToList('favorite_categories', category);
        }

        console.log('✅ Content liked and preferences updated');
        return true;
    }

    /**
     * Mark content as "not interested" (adds to dislikes)
     */
    async notInterested(content, reason) {
        const { id, type, artist, topic, category } = content;
        
        // Track skip/dislike interaction
        await this.trackInteraction(id, type, 'skip', {
            watchTime: 0,
            completionPercentage: 0,
            artist, topic, category
        });

        // Add to dislike lists based on reason
        if (reason === 'artist' && artist) {
            await this.addToList('disliked_artists', artist);
        } else if (reason === 'topic' && topic) {
            await this.addToList('disliked_topics', topic);
        } else if (reason === 'category' && category) {
            await this.addToList('disliked_categories', category);
        }

        console.log('✅ Marked as not interested');
        return true;
    }

    /**
     * Track video/music watch time
     */
    async trackWatchTime(contentId, contentType, watchTime, duration, metadata = {}) {
        const completionPercentage = (watchTime / duration) * 100;
        
        return await this.trackInteraction(contentId, contentType, 
            completionPercentage >= 90 ? 'complete' : 'view',
            {
                watchTime,
                completionPercentage,
                ...metadata
            }
        );
    }

    /**
     * Get user collections
     */
    async getCollections(type = null) {
        try {
            const url = type ? 
                `${this.apiBase}/collections?type=${type}` :
                `${this.apiBase}/collections`;

            const response = await fetch(url, {
                headers: {
                    'x-user-id': this.userId
                }
            });

            const data = await response.json();
            return data.success ? data.collections : [];

        } catch (error) {
            console.error('Error getting collections:', error);
            return [];
        }
    }

    /**
     * Create a new collection
     */
    async createCollection(name, description, type, contentType) {
        try {
            const response = await fetch(`${this.apiBase}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId
                },
                body: JSON.stringify({ name, description, type, content_type: contentType })
            });

            const data = await response.json();
            return data.success ? data.collection : null;

        } catch (error) {
            console.error('Error creating collection:', error);
            return null;
        }
    }

    /**
     * Generate personalized collections
     */
    async generateCollections() {
        try {
            const response = await fetch(`${this.apiBase}/collections/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId
                },
                body: JSON.stringify({ userId: this.userId })
            });

            const data = await response.json();
            return data.success;

        } catch (error) {
            console.error('Error generating collections:', error);
            return false;
        }
    }

    /**
     * UI Helper: Render favorite artists as chips
     */
    renderArtistChips(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.preferences) return;

        const artists = this.preferences.favorite_artists || [];
        
        container.innerHTML = artists.map(artist => `
            <div class="chip">
                <span>${artist}</span>
                <button class="chip-remove" onclick="prefManager.removeArtist('${artist}')">×</button>
            </div>
        `).join('');
    }

    /**
     * UI Helper: Remove artist and refresh UI
     */
    async removeArtist(artist) {
        await this.removeFromList('favorite_artists', artist);
        this.renderArtistChips('favorite-artists');
    }

    /**
     * UI Helper: Render topic chips
     */
    renderTopicChips(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.preferences) return;

        const topics = this.preferences.favorite_topics || [];
        
        container.innerHTML = topics.map(topic => `
            <div class="chip">
                <span>${topic}</span>
                <button class="chip-remove" onclick="prefManager.removeTopic('${topic}')">×</button>
            </div>
        `).join('');
    }

    /**
     * UI Helper: Remove topic and refresh UI
     */
    async removeTopic(topic) {
        await this.removeFromList('favorite_topics', topic);
        this.renderTopicChips('favorite-topics');
    }
}

// Create global instance
const prefManager = new PreferenceManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreferenceManager;
}

