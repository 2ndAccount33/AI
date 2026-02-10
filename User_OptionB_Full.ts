import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    profile: {
        name: string;
        currentRole: string;
        targetRole: string;
        avatar?: string;
    };
    xp: number;
    level: number;
    badges: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        earnedAt: Date;
    }>;
    completedModules: mongoose.Types.ObjectId[];
    
    // NEW: Activity tracking
    activityLog: Array<{
        type: 'xp_earned' | 'badge_earned' | 'quest_completed' | 'stage_unlocked' | 'assessment_completed';
        description: string;
        xp?: number;
        timestamp: Date;
    }>;
    
    // NEW: Streak tracking
    streakData: {
        current: number;
        longest: number;
        lastActivityDate: Date;
    };
    
    // NEW: Study time tracking (in minutes)
    studyTime: {
        total: number;
        thisWeek: number;
        sessions: Array<{
            startTime: Date;
            endTime: Date;
            duration: number; // in minutes
        }>;
    };
    
    // NEW: Skills tracking
    skillsProgress: Array<{
        skill: string;
        level: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
        lastPracticed: Date;
        timesCompleted: number;
    }>;
    
    // NEW: Quests tracking
    questsCompleted: number;
    activeQuests: mongoose.Types.ObjectId[];
    
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        profile: {
            name: { type: String, required: true },
            currentRole: { type: String, default: '' },
            targetRole: { type: String, default: '' },
            avatar: { type: String },
        },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [
            {
                id: String,
                name: String,
                description: String,
                icon: String,
                earnedAt: { type: Date, default: Date.now },
            },
        ],
        completedModules: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }],
        
        // NEW FIELDS
        activityLog: [
            {
                type: { 
                    type: String, 
                    enum: ['xp_earned', 'badge_earned', 'quest_completed', 'stage_unlocked', 'assessment_completed'],
                    required: true 
                },
                description: { type: String, required: true },
                xp: { type: Number },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        
        streakData: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            lastActivityDate: { type: Date },
        },
        
        studyTime: {
            total: { type: Number, default: 0 },
            thisWeek: { type: Number, default: 0 },
            sessions: [
                {
                    startTime: { type: Date },
                    endTime: { type: Date },
                    duration: { type: Number }, // minutes
                },
            ],
        },
        
        skillsProgress: [
            {
                skill: { type: String, required: true },
                level: { 
                    type: String, 
                    enum: ['beginner', 'intermediate', 'advanced', 'mastered'],
                    default: 'beginner' 
                },
                lastPracticed: { type: Date, default: Date.now },
                timesCompleted: { type: Number, default: 0 },
            },
        ],
        
        questsCompleted: { type: Number, default: 0 },
        activeQuests: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on XP
userSchema.pre('save', function (next) {
    this.level = Math.floor(this.xp / 1000) + 1;
    next();
});

// Update streak on save
userSchema.pre('save', function (next) {
    if (!this.streakData.lastActivityDate) {
        // First activity
        this.streakData.current = 1;
        this.streakData.longest = 1;
        this.streakData.lastActivityDate = new Date();
    } else {
        const now = new Date();
        const lastActivity = new Date(this.streakData.lastActivityDate);
        
        // Check if it's a new day
        const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
            // Same day, no change to streak
        } else if (daysDiff === 1) {
            // Consecutive day - increment streak
            this.streakData.current += 1;
            if (this.streakData.current > this.streakData.longest) {
                this.streakData.longest = this.streakData.current;
            }
            this.streakData.lastActivityDate = now;
        } else {
            // Streak broken
            this.streakData.current = 1;
            this.streakData.lastActivityDate = now;
        }
    }
    next();
});

export const User = mongoose.model<IUser>('User', userSchema);
