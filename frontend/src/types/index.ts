// User types
export interface User {
    id: string;
    email: string;
    profile: {
        name: string;
        currentRole: string;
        targetRole: string;
        avatar?: string;
    };
    xp: number;
    level: number;
    badges: Badge[];
    completedModules: string[];
    activityLog?: ActivityLogEntry[];
    streakData?: {
        current: number;
        longest: number;
        lastActivityDate?: string;
    };
    studyTime?: {
        total: number;
        thisWeek: number;
    };
    skillsProgress?: SkillProgress[];
    questsCompleted?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ActivityLogEntry {
    type: string;
    description: string;
    xp?: number;
    timestamp: string;
}

export interface SkillProgress {
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
    lastPracticed: string;
    timesCompleted: number;
}

export interface DashboardStats {
    streak: number;
    longestStreak: number;
    skillsMastered: number;
    studyTime: string;
    questsCompleted: number;
    recentActivity: Array<{
        type: string;
        description: string;
        xp?: number;
        time: string;
    }>;
    badges: number;
    totalXP: number;
    level: number;
    skillsProgress: SkillProgress[];
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    currentRole?: string;
    targetRole?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Roadmap types
export interface SkillGap {
    skill: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}

export interface Resource {
    title: string;
    url: string;
    type: 'course' | 'tutorial' | 'article' | 'video' | 'documentation';
    duration?: string;
}

export interface LearningStage {
    id: string;
    stage: number;
    skill: string;
    estimatedHours: number;
    resources: Resource[];
    milestones: string[];
    xpReward: number;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    completedAt?: string;
}

export interface Roadmap {
    id: string;
    userId: string;
    title: string;
    analysis: {
        currentSkills: string[];
        requiredSkills: string[];
        gaps: SkillGap[];
    };
    learningPath: LearningStage[];
    totalEstimatedHours: number;
    recommendedPace: string;
    status: 'draft' | 'active' | 'completed';
    progress: number;
    createdAt: string;
    updatedAt: string;
}

// Assessment types
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    points: number;
    explanation: string;
}

export interface CodingChallenge {
    id: string;
    title: string;
    description: string;
    starterCode: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
    points: number;
    timeLimit: number;
}

export interface BossBattle {
    id: string;
    title: string;
    scenario: string;
    requirements: string[];
    evaluationCriteria: string[];
    points: number;
    timeLimitMinutes: number;
}

export interface Quest {
    id: string;
    title: string;
    type: 'quiz' | 'challenge' | 'boss_battle';
    questions?: QuizQuestion[];
    challenge?: CodingChallenge;
    bossBattle?: BossBattle;
    totalPoints: number;
    earnedPoints?: number;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
}

export interface Assessment {
    id: string;
    title: string;
    description: string;
    totalXp: number;
    quests: Quest[];
    earnedXp: number;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    createdAt: string;
}

// Aptitude types
export interface AptitudeQuestion {
    id: string;
    question: string;
    questionType: 'conceptual' | 'coding' | 'scenario';
    difficulty: number;
    codeTemplate?: string;
}

export interface AptitudeResponse {
    questionId: string;
    response: string;
    code?: string;
    timeSpent: number;
}

export interface AptitudeEvaluation {
    questionId: string;
    score: number;
    feedback: string;
    correctAnswer?: string;
}

export interface AptitudeSession {
    id: string;
    userId: string;
    targetRole: string;
    questions: Array<{
        question: AptitudeQuestion;
        response?: AptitudeResponse;
        evaluation?: AptitudeEvaluation;
    }>;
    analysis?: {
        overallScore: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        suggestedRoadmapUpdates?: string[];
    };
    status: 'active' | 'completed';
    startedAt: string;
    completedAt?: string;
}

// Job types
export interface JobDescription {
    id: string;
    title: string;
    company: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'remote';
    requirements: string[];
    preferred: string[];
    description: string;
    salary?: string;
    postedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
