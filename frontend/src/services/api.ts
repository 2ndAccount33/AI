import axios from 'axios';
import type {
    AuthResponse,
    LoginCredentials,
    RegisterData,
    User,
    DashboardStats,
    Roadmap,
    Assessment,
    AptitudeSession,
    JobDescription,
    ApiResponse,
    PaginatedResponse,
} from '@/types';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
        }
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth Service
export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        return data.data;
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
        return data.data;
    },

    getProfile: async (): Promise<User> => {
        const { data } = await api.get<ApiResponse<User>>('/auth/profile');
        return data.data;
    },

    updateProfile: async (updates: Partial<User['profile']>): Promise<User> => {
        const { data } = await api.patch<ApiResponse<User>>('/auth/profile', updates);
        return data.data;
    },

    getStats: async (): Promise<DashboardStats> => {
        const { data } = await api.get<ApiResponse<DashboardStats>>('/auth/stats');
        return data.data;
    },
};

// Roadmap Service
export const roadmapService = {
    analyzeSkillGap: async (resumeFile: File, jobDescriptionId: string): Promise<Roadmap> => {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescriptionId', jobDescriptionId);

        const { data } = await api.post<ApiResponse<Roadmap>>('/roadmap/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    },

    getRoadmaps: async (): Promise<Roadmap[]> => {
        const { data } = await api.get<ApiResponse<Roadmap[]>>('/roadmap');
        return data.data;
    },

    getRoadmap: async (id: string): Promise<Roadmap> => {
        const { data } = await api.get<ApiResponse<Roadmap>>(`/roadmap/${id}`);
        return data.data;
    },

    updateStageStatus: async (
        roadmapId: string,
        stageId: string,
        status: 'in_progress' | 'completed'
    ): Promise<Roadmap> => {
        const { data } = await api.patch<ApiResponse<Roadmap>>(
            `/roadmap/${roadmapId}/stage/${stageId}`,
            { status }
        );
        return data.data;
    },
};

// Assessment Service
export const assessmentService = {
    generateAssessment: async (
        contentSources: Array<{ type: string; data?: string; url?: string; content?: string }>,
        difficulty: 'beginner' | 'intermediate' | 'advanced'
    ): Promise<Assessment> => {
        const { data } = await api.post<ApiResponse<Assessment>>('/assessment/generate', {
            contentSources,
            difficulty,
        });
        return data.data;
    },

    getAssessments: async (): Promise<Assessment[]> => {
        const { data } = await api.get<ApiResponse<Assessment[]>>('/assessment');
        return data.data;
    },

    getAssessment: async (id: string): Promise<Assessment> => {
        const { data } = await api.get<ApiResponse<Assessment>>(`/assessment/${id}`);
        return data.data;
    },

    submitQuizAnswer: async (
        assessmentId: string,
        questId: string,
        questionId: string,
        answerIndex: number
    ): Promise<{ correct: boolean; points: number; explanation: string }> => {
        const { data } = await api.post<
            ApiResponse<{ correct: boolean; points: number; explanation: string }>
        >(`/assessment/${assessmentId}/quest/${questId}/answer`, {
            questionId,
            answerIndex,
        });
        return data.data;
    },

    submitChallenge: async (
        assessmentId: string,
        questId: string,
        code: string
    ): Promise<{ passed: boolean; points: number; feedback: string }> => {
        const { data } = await api.post<ApiResponse<{ passed: boolean; points: number; feedback: string }>>(
            `/assessment/${assessmentId}/quest/${questId}/submit`,
            { code }
        );
        return data.data;
    },
};

// Aptitude Service
export const aptitudeService = {
    startSession: async (targetRole: string): Promise<AptitudeSession> => {
        const { data } = await api.post<ApiResponse<AptitudeSession>>('/aptitude/start', {
            targetRole,
        });
        return data.data;
    },

    submitResponse: async (
        sessionId: string,
        questionId: string,
        response: string,
        code?: string
    ): Promise<{
        evaluation: { score: number; feedback: string };
        nextQuestion?: { question: string; questionType: string; difficulty: number };
    }> => {
        const { data } = await api.post<
            ApiResponse<{
                evaluation: { score: number; feedback: string };
                nextQuestion?: { question: string; questionType: string; difficulty: number };
            }>
        >(`/aptitude/${sessionId}/respond`, {
            questionId,
            response,
            code,
        });
        return data.data;
    },

    getSession: async (sessionId: string): Promise<AptitudeSession> => {
        const { data } = await api.get<ApiResponse<AptitudeSession>>(`/aptitude/${sessionId}`);
        return data.data;
    },

    completeSession: async (sessionId: string): Promise<AptitudeSession> => {
        const { data } = await api.post<ApiResponse<AptitudeSession>>(`/aptitude/${sessionId}/complete`);
        return data.data;
    },
};

// Job Service
export const jobService = {
    getJobs: async (
        page = 1,
        pageSize = 10,
        filters?: { search?: string; type?: string; location?: string }
    ): Promise<PaginatedResponse<JobDescription>> => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            ...filters,
        });
        const { data } = await api.get<ApiResponse<PaginatedResponse<JobDescription>>>(
            `/jobs?${params}`
        );
        return data.data;
    },

    getJob: async (id: string): Promise<JobDescription> => {
        const { data } = await api.get<ApiResponse<JobDescription>>(`/jobs/${id}`);
        return data.data;
    },
};

export default api;
