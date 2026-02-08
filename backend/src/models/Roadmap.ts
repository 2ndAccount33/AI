import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillGap {
    skill: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}

export interface IResource {
    title: string;
    url: string;
    type: 'course' | 'tutorial' | 'article' | 'video' | 'documentation';
    duration?: string;
}

export interface ILearningStage {
    id: string;
    stage: number;
    skill: string;
    estimatedHours: number;
    resources: IResource[];
    milestones: string[];
    xpReward: number;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    completedAt?: Date;
}

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    resumeData: {
        skills: string[];
        experience: string[];
        education: string[];
    };
    jobDescription: {
        title: string;
        company?: string;
        requirements: string[];
        preferred: string[];
    };
    analysis: {
        currentSkills: string[];
        requiredSkills: string[];
        gaps: ISkillGap[];
    };
    learningPath: ILearningStage[];
    totalEstimatedHours: number;
    recommendedPace: string;
    status: 'draft' | 'active' | 'completed';
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}

const roadmapSchema = new Schema<IRoadmap>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: { type: String, required: true },
        resumeData: {
            skills: [String],
            experience: [String],
            education: [String],
        },
        jobDescription: {
            title: String,
            company: String,
            requirements: [String],
            preferred: [String],
        },
        analysis: {
            currentSkills: [String],
            requiredSkills: [String],
            gaps: [
                {
                    skill: String,
                    priority: { type: String, enum: ['high', 'medium', 'low'] },
                    reason: String,
                },
            ],
        },
        learningPath: [
            {
                id: String,
                stage: Number,
                skill: String,
                estimatedHours: Number,
                resources: [
                    {
                        title: String,
                        url: String,
                        type: { type: String, enum: ['course', 'tutorial', 'article', 'video', 'documentation'] },
                        duration: String,
                    },
                ],
                milestones: [String],
                xpReward: Number,
                status: {
                    type: String,
                    enum: ['locked', 'available', 'in_progress', 'completed'],
                    default: 'locked'
                },
                completedAt: Date,
            },
        ],
        totalEstimatedHours: Number,
        recommendedPace: String,
        status: {
            type: String,
            enum: ['draft', 'active', 'completed'],
            default: 'draft'
        },
        progress: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Calculate progress before saving
roadmapSchema.pre('save', function (next) {
    if (this.learningPath.length > 0) {
        const completed = this.learningPath.filter((s) => s.status === 'completed').length;
        this.progress = Math.round((completed / this.learningPath.length) * 100);
    }
    next();
});

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
