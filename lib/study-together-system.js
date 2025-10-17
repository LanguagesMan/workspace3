/**
 * 👥 STUDY TOGETHER SESSIONS
 * 
 * Collaborative learning sessions with friends
 * Learn together in real-time or async
 * 
 * Inspired by: Discord Study Servers, Zoom Study Rooms, Notion Collaboration
 * 
 * Key Features:
 * - Create study rooms
 * - Invite friends
 * - Real-time progress sharing
 * - Shared goals
 * - Group challenges
 * - Study streaks together
 */

class StudyTogetherSystem {
    constructor() {
        this.studyRooms = new Map(); // roomId -> room data
        this.userSessions = new Map(); // userId -> active session
        this.groupChallenges = new Map(); // challengeId -> challenge data
    }

    /**
     * Create a study room
     */
    createStudyRoom(hostUserId, roomConfig = {}) {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const room = {
            id: roomId,
            name: roomConfig.name || `${hostUserId}'s Study Room`,
            description: roomConfig.description || 'Let\'s learn Spanish together!',
            host: hostUserId,
            members: [hostUserId],
            maxMembers: roomConfig.maxMembers || 10,
            isPublic: roomConfig.isPublic !== false, // Default public
            password: roomConfig.password || null,
            createdAt: new Date().toISOString(),
            status: 'active', // active, paused, ended
            settings: {
                sharedGoal: roomConfig.sharedGoal || null, // e.g., "Learn 50 words together"
                duration: roomConfig.duration || 60, // minutes
                muteNotifications: roomConfig.muteNotifications || false,
                showProgress: roomConfig.showProgress !== false // Default show
            },
            activity: {
                totalVideosWatched: 0,
                totalWordsLearned: 0,
                totalXPEarned: 0,
                totalTimeSpent: 0 // minutes
            },
            memberActivity: new Map(), // userId -> activity
            chat: [],
            milestones: []
        };

        // Initialize host activity
        room.memberActivity.set(hostUserId, {
            joinedAt: new Date().toISOString(),
            videosWatched: 0,
            wordsLearned: 0,
            xpEarned: 0,
            timeSpent: 0,
            lastActive: new Date().toISOString()
        });

        this.studyRooms.set(roomId, room);

        return {
            success: true,
            room: this.getRoomInfo(roomId),
            inviteLink: this.generateInviteLink(roomId),
            message: '🎉 Study room created! Invite your friends!'
        };
    }

    /**
     * Join a study room
     */
    joinStudyRoom(userId, roomId, password = null) {
        const room = this.studyRooms.get(roomId);

        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        // Check if room is full
        if (room.members.length >= room.maxMembers) {
            return { success: false, error: 'Room is full' };
        }

        // Check password
        if (room.password && room.password !== password) {
            return { success: false, error: 'Incorrect password' };
        }

        // Check if already in room
        if (room.members.includes(userId)) {
            return { success: false, error: 'Already in room' };
        }

        // Add member
        room.members.push(userId);
        room.memberActivity.set(userId, {
            joinedAt: new Date().toISOString(),
            videosWatched: 0,
            wordsLearned: 0,
            xpEarned: 0,
            timeSpent: 0,
            lastActive: new Date().toISOString()
        });

        // Add to chat
        this.addChatMessage(roomId, {
            type: 'system',
            message: `${userId} joined the study room! 👋`,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            room: this.getRoomInfo(roomId),
            message: `✅ Joined ${room.name}!`
        };
    }

    /**
     * Leave study room
     */
    leaveStudyRoom(userId, roomId) {
        const room = this.studyRooms.get(roomId);

        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        // Remove member
        const memberIndex = room.members.indexOf(userId);
        if (memberIndex === -1) {
            return { success: false, error: 'Not in room' };
        }

        room.members.splice(memberIndex, 1);

        // Add to chat
        this.addChatMessage(roomId, {
            type: 'system',
            message: `${userId} left the study room`,
            timestamp: new Date().toISOString()
        });

        // If host left and there are members, transfer host
        if (room.host === userId && room.members.length > 0) {
            room.host = room.members[0];
            this.addChatMessage(roomId, {
                type: 'system',
                message: `${room.host} is now the host`,
                timestamp: new Date().toISOString()
            });
        }

        // If no members, end room
        if (room.members.length === 0) {
            room.status = 'ended';
        }

        return {
            success: true,
            message: 'Left study room'
        };
    }

    /**
     * Track member activity
     */
    trackActivity(userId, roomId, activityType, data = {}) {
        const room = this.studyRooms.get(roomId);

        if (!room || !room.members.includes(userId)) {
            return { success: false, error: 'Not in room' };
        }

        const memberActivity = room.memberActivity.get(userId);
        
        // Update member activity
        switch (activityType) {
            case 'watch_video':
                memberActivity.videosWatched++;
                room.activity.totalVideosWatched++;
                break;
            case 'learn_word':
                memberActivity.wordsLearned++;
                room.activity.totalWordsLearned++;
                break;
            case 'earn_xp':
                const xp = data.xp || 0;
                memberActivity.xpEarned += xp;
                room.activity.totalXPEarned += xp;
                break;
            case 'time_spent':
                const time = data.minutes || 0;
                memberActivity.timeSpent += time;
                room.activity.totalTimeSpent += time;
                break;
        }

        memberActivity.lastActive = new Date().toISOString();

        // Check for group milestones
        const milestone = this.checkGroupMilestone(room);
        if (milestone) {
            room.milestones.push(milestone);
            this.addChatMessage(roomId, {
                type: 'milestone',
                message: milestone.message,
                timestamp: new Date().toISOString()
            });
        }

        return {
            success: true,
            memberActivity,
            roomActivity: room.activity,
            milestone: milestone
        };
    }

    /**
     * Check for group milestones
     */
    checkGroupMilestone(room) {
        const { totalVideosWatched, totalWordsLearned, totalXPEarned } = room.activity;

        const milestones = {
            10: { videos: 10, message: '🎉 10 videos watched together!' },
            50: { videos: 50, message: '🔥 50 videos watched! Keep it up!' },
            100: { videos: 100, message: '💯 100 videos! Amazing teamwork!' },
            50: { words: 50, message: '📚 50 words learned together!' },
            100: { words: 100, message: '🌟 100 words learned! Vocabulary masters!' },
            500: { words: 500, message: '👑 500 words! Legendary progress!' },
            1000: { xp: 1000, message: '⚡ 1000 XP earned together!' },
            5000: { xp: 5000, message: '💎 5000 XP! Unstoppable team!' }
        };

        // Check each milestone
        for (const [key, milestone] of Object.entries(milestones)) {
            if (milestone.videos && totalVideosWatched === milestone.videos) {
                return { type: 'videos', count: milestone.videos, message: milestone.message };
            }
            if (milestone.words && totalWordsLearned === milestone.words) {
                return { type: 'words', count: milestone.words, message: milestone.message };
            }
            if (milestone.xp && totalXPEarned >= milestone.xp) {
                return { type: 'xp', count: milestone.xp, message: milestone.message };
            }
        }

        return null;
    }

    /**
     * Send chat message
     */
    sendChatMessage(userId, roomId, message) {
        const room = this.studyRooms.get(roomId);

        if (!room || !room.members.includes(userId)) {
            return { success: false, error: 'Not in room' };
        }

        const chatMessage = {
            id: `msg_${Date.now()}`,
            userId,
            message,
            timestamp: new Date().toISOString(),
            type: 'user'
        };

        room.chat.push(chatMessage);

        // Keep only last 100 messages
        if (room.chat.length > 100) {
            room.chat = room.chat.slice(-100);
        }

        return {
            success: true,
            message: chatMessage
        };
    }

    /**
     * Add system chat message
     */
    addChatMessage(roomId, message) {
        const room = this.studyRooms.get(roomId);
        if (!room) return;

        room.chat.push({
            id: `msg_${Date.now()}`,
            ...message
        });

        // Keep only last 100 messages
        if (room.chat.length > 100) {
            room.chat = room.chat.slice(-100);
        }
    }

    /**
     * Get chat history
     */
    getChatHistory(roomId, limit = 50) {
        const room = this.studyRooms.get(roomId);
        if (!room) return { success: false, error: 'Room not found' };

        return {
            success: true,
            messages: room.chat.slice(-limit)
        };
    }

    /**
     * Create group challenge
     */
    createGroupChallenge(roomId, hostUserId, challengeConfig) {
        const room = this.studyRooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        if (room.host !== hostUserId) {
            return { success: false, error: 'Only host can create challenges' };
        }

        const challengeId = `challenge_${Date.now()}`;
        
        const challenge = {
            id: challengeId,
            roomId,
            name: challengeConfig.name,
            description: challengeConfig.description,
            type: challengeConfig.type, // videos, words, xp
            target: challengeConfig.target,
            duration: challengeConfig.duration || 24, // hours
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (challengeConfig.duration || 24) * 60 * 60 * 1000).toISOString(),
            participants: room.members.map(userId => ({
                userId,
                progress: 0,
                contributed: false
            })),
            status: 'active',
            reward: challengeConfig.reward || { xp: 100 }
        };

        this.groupChallenges.set(challengeId, challenge);

        this.addChatMessage(roomId, {
            type: 'challenge',
            message: `🎯 New challenge: ${challenge.name}!`,
            challengeId,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            challenge
        };
    }

    /**
     * Update challenge progress
     */
    updateChallengeProgress(userId, challengeId, progress) {
        const challenge = this.groupChallenges.get(challengeId);
        
        if (!challenge) {
            return { success: false, error: 'Challenge not found' };
        }

        const participant = challenge.participants.find(p => p.userId === userId);
        if (!participant) {
            return { success: false, error: 'Not a participant' };
        }

        participant.progress += progress;
        participant.contributed = true;

        // Check if challenge completed
        const totalProgress = challenge.participants.reduce((sum, p) => sum + p.progress, 0);
        
        if (totalProgress >= challenge.target) {
            challenge.status = 'completed';
            challenge.completedAt = new Date().toISOString();

            this.addChatMessage(challenge.roomId, {
                type: 'challenge_complete',
                message: `🏆 Challenge completed! ${challenge.name}`,
                timestamp: new Date().toISOString()
            });
        }

        return {
            success: true,
            progress: totalProgress,
            target: challenge.target,
            completed: challenge.status === 'completed'
        };
    }

    /**
     * Get room info
     */
    getRoomInfo(roomId) {
        const room = this.studyRooms.get(roomId);
        
        if (!room) {
            return null;
        }

        return {
            id: room.id,
            name: room.name,
            description: room.description,
            host: room.host,
            members: room.members,
            memberCount: room.members.length,
            maxMembers: room.maxMembers,
            isPublic: room.isPublic,
            hasPassword: !!room.password,
            status: room.status,
            activity: room.activity,
            settings: room.settings,
            milestones: room.milestones,
            createdAt: room.createdAt
        };
    }

    /**
     * Get active member list with stats
     */
    getActiveMembersList(roomId) {
        const room = this.studyRooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        const members = room.members.map(userId => {
            const activity = room.memberActivity.get(userId);
            return {
                userId,
                isHost: userId === room.host,
                ...activity
            };
        });

        // Sort by XP earned
        members.sort((a, b) => b.xpEarned - a.xpEarned);

        return {
            success: true,
            members,
            totalMembers: members.length
        };
    }

    /**
     * Get public study rooms
     */
    getPublicRooms(limit = 20) {
        const publicRooms = Array.from(this.studyRooms.values())
            .filter(room => room.isPublic && room.status === 'active' && room.members.length < room.maxMembers)
            .map(room => this.getRoomInfo(room.id))
            .sort((a, b) => b.memberCount - a.memberCount);

        return publicRooms.slice(0, limit);
    }

    /**
     * Search study rooms
     */
    searchRooms(query) {
        const allRooms = Array.from(this.studyRooms.values())
            .filter(room => room.isPublic && room.status === 'active');

        const searchTerm = query.toLowerCase();
        
        const results = allRooms.filter(room => 
            room.name.toLowerCase().includes(searchTerm) ||
            room.description.toLowerCase().includes(searchTerm)
        );

        return results.map(room => this.getRoomInfo(room.id));
    }

    /**
     * Generate invite link
     */
    generateInviteLink(roomId) {
        return `https://langflix.app/join-room/${roomId}`;
    }

    /**
     * Get user's active session
     */
    getUserActiveSession(userId) {
        for (const [roomId, room] of this.studyRooms.entries()) {
            if (room.members.includes(userId) && room.status === 'active') {
                return {
                    roomId,
                    room: this.getRoomInfo(roomId)
                };
            }
        }
        return null;
    }

    /**
     * Get study stats for user
     */
    getUserStudyStats(userId) {
        let totalRoomsJoined = 0;
        let totalTimeInRooms = 0;
        let totalXPInRooms = 0;
        let totalWordsInRooms = 0;

        for (const room of this.studyRooms.values()) {
            const activity = room.memberActivity.get(userId);
            if (activity) {
                totalRoomsJoined++;
                totalTimeInRooms += activity.timeSpent;
                totalXPInRooms += activity.xpEarned;
                totalWordsInRooms += activity.wordsLearned;
            }
        }

        return {
            totalRoomsJoined,
            totalTimeInRooms, // minutes
            totalXPInRooms,
            totalWordsInRooms,
            currentRoom: this.getUserActiveSession(userId)
        };
    }

    /**
     * End study room
     */
    endStudyRoom(userId, roomId) {
        const room = this.studyRooms.get(roomId);

        if (!room) {
            return { success: false, error: 'Room not found' };
        }

        if (room.host !== userId) {
            return { success: false, error: 'Only host can end room' };
        }

        room.status = 'ended';
        room.endedAt = new Date().toISOString();

        // Calculate final stats
        const stats = {
            duration: Math.round((new Date(room.endedAt) - new Date(room.createdAt)) / 1000 / 60), // minutes
            totalMembers: room.members.length,
            activity: room.activity,
            milestones: room.milestones.length
        };

        this.addChatMessage(roomId, {
            type: 'system',
            message: '👋 Study room ended. Thanks for learning together!',
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            message: 'Study room ended',
            stats
        };
    }
}

// Export singleton
const studyTogetherSystem = new StudyTogetherSystem();
module.exports = studyTogetherSystem;


