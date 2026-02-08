import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    points: number;
    explanation: string;
}

export interface IQuest {
    id: string;
    title: string;
    type: 'quiz' | 'challenge' | 'boss_battle';
    questions?: IQuizQuestion[];
    challenge?: {
        description: string;
        starterCode: string;
        testCases: Array<{ input: string; expectedOutput: string }>;
        timeLimit: number;
    };
    bossBattle?: {
        scenario: string;
        requirements: string[];
        evaluationCriteria: string[];
        timeLimitMinutes: number;
    };
    totalPoints: number;
    earnedPoints: number;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
}

export interface IAssessment extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    sourceContent: {
        type: 'pdf' | 'youtube' | 'text' | 'url';
        reference: string;
    }[];
    totalXp: number;
    earnedXp: number;
    quests: IQuest[];
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String },
        sourceContent: [
            {
                type: { type: String, enum: ['pdf', 'youtube', 'text', 'url'] },
                reference: String,
            },
        ],
        totalXp: { type: Number, default: 0 },
        earnedXp: { type: Number, default: 0 },
        quests: [
            {
                id: String,
                title: String,
                type: { type: String, enum: ['quiz', 'challenge', 'boss_battle'] },
                questions: [
                    {
                        id: String,
                        question: String,
                        options: [String],
                        correctIndex: Number,
                        points: Number,
                        explanation: String,
                    },
                ],
                challenge: {
                    description: String,
                    starterCode: String,
                    testCases: [{ input: String, expectedOutput: String }],
                    timeLimit: Number,
                },
                bossBattle: {
                    scenario: String,
                    requirements: [String],
                    evaluationCriteria: [String],
                    timeLimitMinutes: Number,
                },
                totalPoints: Number,
                earnedPoints: { type: Number, default: 0 },
                status: {
                    type: String,
                    enum: ['locked', 'available', 'in_progress', 'completed'],
                    default: 'locked',
                },
            },
        ],
        progress: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed'],
            default: 'not_started',
        },
    },
    {
        timestamps: true,
    }
);

// Calculate progress
assessmentSchema.pre('save', function (next) {
    if (this.quests.length > 0) {
        const completed = this.quests.filter((q) => q.status === 'completed').length;
        this.progress = Math.round((completed / this.quests.length) * 100);
        this.earnedXp = this.quests.reduce((sum, q) => sum + q.earnedPoints, 0);
    }
    next();
});

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
