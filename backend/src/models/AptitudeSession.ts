import mongoose, { Document, Schema } from 'mongoose';

export interface IAptitudeQuestion {
    id: string;
    question: string;
    questionType: 'conceptual' | 'coding' | 'scenario';
    difficulty: number;
    codeTemplate?: string;
}

export interface IAptitudeResponse {
    questionId: string;
    response: string;
    code?: string;
    timeSpent: number;
}

export interface IAptitudeEvaluation {
    questionId: string;
    score: number;
    feedback: string;
    correctAnswer?: string;
}

export interface IAptitudeSession extends Document {
    userId: mongoose.Types.ObjectId;
    targetRole: string;
    questions: Array<{
        question: IAptitudeQuestion;
        response?: IAptitudeResponse;
        evaluation?: IAptitudeEvaluation;
    }>;
    analysis?: {
        overallScore: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        suggestedRoadmapUpdates: string[];
    };
    status: 'active' | 'completed';
    startedAt: Date;
    completedAt?: Date;
}

const aptitudeSessionSchema = new Schema<IAptitudeSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetRole: { type: String, required: true },
        questions: [
            {
                question: {
                    id: String,
                    question: String,
                    questionType: { type: String, enum: ['conceptual', 'coding', 'scenario'] },
                    difficulty: Number,
                    codeTemplate: String,
                },
                response: {
                    questionId: String,
                    response: String,
                    code: String,
                    timeSpent: Number,
                },
                evaluation: {
                    questionId: String,
                    score: Number,
                    feedback: String,
                    correctAnswer: String,
                },
            },
        ],
        analysis: {
            overallScore: Number,
            strengths: [String],
            weaknesses: [String],
            recommendations: [String],
            suggestedRoadmapUpdates: [String],
        },
        status: { type: String, enum: ['active', 'completed'], default: 'active' },
        startedAt: { type: Date, default: Date.now },
        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

export const AptitudeSession = mongoose.model<IAptitudeSession>('AptitudeSession', aptitudeSessionSchema);
