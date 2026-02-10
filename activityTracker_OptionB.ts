// backend/src/utils/activityTracker.ts
import { User, IUser } from '../models/User';

/**
 * Helper functions to track real user activity
 */

/**
 * Award XP to a user and log the activity
 */
export async function awardXP(
    userId: string, 
    amount: number, 
    description: string
): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.xp += amount;
    
    // Add to activity log
    user.activityLog.push({
        type: 'xp_earned',
        description,
        xp: amount,
        timestamp: new Date(),
    });
    
    // Keep only last 50 activities
    if (user.activityLog.length > 50) {
        user.activityLog = user.activityLog.slice(-50);
    }
    
    await user.save();
    return user;
}

/**
 * Mark a quest as completed
 */
export async function completeQuest(
    userId: string,
    questName: string,
    xpAwarded: number
): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.questsCompleted += 1;
    user.xp += xpAwarded;
    
    user.activityLog.push({
        type: 'quest_completed',
        description: `Completed: ${questName}`,
        xp: xpAwarded,
        timestamp: new Date(),
    });
    
    await user.save();
    return user;
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
    userId: string,
    badgeData: {
        id: string;
        name: string;
        description: string;
        icon: string;
    }
): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Check if badge already exists
    const exists = user.badges.some(b => b.id === badgeData.id);
    if (exists) return user;
    
    user.badges.push({
        ...badgeData,
        earnedAt: new Date(),
    });
    
    user.activityLog.push({
        type: 'badge_earned',
        description: `Earned badge: ${badgeData.name}`,
        timestamp: new Date(),
    });
    
    await user.save();
    return user;
}

/**
 * Track a study session
 */
export async function trackStudySession(
    userId: string,
    durationMinutes: number
): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const now = new Date();
    const startTime = new Date(now.getTime() - durationMinutes * 60000);
    
    user.studyTime.total += durationMinutes;
    user.studyTime.thisWeek += durationMinutes;
    
    user.studyTime.sessions.push({
        startTime,
        endTime: now,
        duration: durationMinutes,
    });
    
    // Keep only last 100 sessions
    if (user.studyTime.sessions.length > 100) {
        user.studyTime.sessions = user.studyTime.sessions.slice(-100);
    }
    
    await user.save();
    return user;
}

/**
 * Update skill progress
 */
export async function updateSkillProgress(
    userId: string,
    skill: string,
    completed: boolean = true
): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const existingSkill = user.skillsProgress.find(s => s.skill === skill);
    
    if (existingSkill) {
        existingSkill.lastPracticed = new Date();
        if (completed) {
            existingSkill.timesCompleted += 1;
            
            // Auto-level up skills
            if (existingSkill.timesCompleted >= 10 && existingSkill.level === 'beginner') {
                existingSkill.level = 'intermediate';
            } else if (existingSkill.timesCompleted >= 25 && existingSkill.level === 'intermediate') {
                existingSkill.level = 'advanced';
            } else if (existingSkill.timesCompleted >= 50 && existingSkill.level === 'advanced') {
                existingSkill.level = 'mastered';
            }
        }
    } else {
        user.skillsProgress.push({
            skill,
            level: 'beginner',
            lastPracticed: new Date(),
            timesCompleted: completed ? 1 : 0,
        });
    }
    
    await user.save();
    return user;
}

/**
 * Get user stats for dashboard
 */
export async function getUserStats(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Calculate skills mastered
    const skillsMastered = user.skillsProgress.filter(
        s => s.level === 'mastered' || s.level === 'advanced'
    ).length;
    
    // Format study time
    const totalHours = Math.floor(user.studyTime.total / 60);
    const studyTimeFormatted = totalHours > 0 ? `${totalHours}h` : `${user.studyTime.total}m`;
    
    // Get recent activity (last 5)
    const recentActivity = user.activityLog
        .slice(-5)
        .reverse()
        .map(activity => ({
            type: activity.type,
            description: activity.description,
            xp: activity.xp,
            time: formatTimeAgo(activity.timestamp),
        }));
    
    return {
        streak: user.streakData.current,
        skillsMastered,
        studyTime: studyTimeFormatted,
        questsCompleted: user.questsCompleted,
        recentActivity,
        badges: user.badges.length,
        totalXP: user.xp,
        level: user.level,
    };
}

/**
 * Format timestamp as "X hours/days ago"
 */
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
}

/**
 * Auto-award badges based on milestones
 */
export async function checkAndAwardMilestoneBadges(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;
    
    const badges = [];
    
    // First Quest Badge
    if (user.questsCompleted === 1) {
        badges.push({
            id: 'first-quest',
            name: 'First Steps',
            description: 'Completed your first quest',
            icon: 'trophy',
        });
    }
    
    // Quest Master Badge
    if (user.questsCompleted === 10) {
        badges.push({
            id: 'quest-master',
            name: 'Quest Master',
            description: 'Completed 10 quests',
            icon: 'star',
        });
    }
    
    // Quick Learner Badge
    if (user.streakData.current === 7) {
        badges.push({
            id: 'quick-learner',
            name: 'Quick Learner',
            description: '7-day learning streak',
            icon: 'flame',
        });
    }
    
    // XP Milestones
    if (user.xp >= 1000 && user.xp < 1100) {
        badges.push({
            id: 'level-up',
            name: 'Level Up!',
            description: 'Reached Level 2',
            icon: 'zap',
        });
    }
    
    // Award any earned badges
    for (const badge of badges) {
        await awardBadge(userId, badge);
    }
}
