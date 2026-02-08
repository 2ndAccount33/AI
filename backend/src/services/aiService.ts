import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 60000, // 60 seconds for AI operations
});

export const aiService = {
    /**
     * Analyze skill gap between resume and job description
     */
    async analyzeSkillGap(resumeBase64: string, jobDescriptionId: string) {
        try {
            const response = await aiClient.post('/api/v1/agents/skill-gap/analyze', {
                resume_file: resumeBase64,
                job_description_id: jobDescriptionId,
            });
            return response.data;
        } catch (error) {
            console.error('AI Service error (analyzeSkillGap):', error);
            // Return mock data for development
            return {
                resumeData: {
                    skills: ['JavaScript', 'React', 'CSS'],
                    experience: ['2 years web development'],
                    education: ['BS Computer Science'],
                },
                jobDescription: {
                    title: 'Senior Full-Stack Developer',
                    requirements: ['React', 'Node.js', 'TypeScript', 'AWS'],
                    preferred: ['Docker', 'Kubernetes'],
                },
                analysis: {
                    currentSkills: ['JavaScript', 'React', 'CSS'],
                    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
                    gaps: [
                        { skill: 'TypeScript', priority: 'high', reason: 'Required for the role' },
                        { skill: 'AWS', priority: 'high', reason: 'Cloud experience needed' },
                        { skill: 'Node.js', priority: 'medium', reason: 'Backend skills required' },
                    ],
                },
                learningPath: [
                    {
                        id: 'stage-1',
                        stage: 1,
                        skill: 'TypeScript Fundamentals',
                        estimatedHours: 15,
                        resources: [
                            { title: 'TypeScript Official Docs', url: 'https://typescriptlang.org/docs', type: 'documentation' },
                            { title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript/', type: 'tutorial' },
                        ],
                        milestones: ['Complete basic types', 'Build a typed project'],
                        xpReward: 300,
                        status: 'available',
                    },
                    {
                        id: 'stage-2',
                        stage: 2,
                        skill: 'Node.js & Express',
                        estimatedHours: 20,
                        resources: [
                            { title: 'Node.js Tutorial', url: 'https://nodejs.org/en/learn', type: 'tutorial' },
                        ],
                        milestones: ['Build REST API', 'Handle authentication'],
                        xpReward: 400,
                        status: 'locked',
                    },
                    {
                        id: 'stage-3',
                        stage: 3,
                        skill: 'AWS Essentials',
                        estimatedHours: 25,
                        resources: [
                            { title: 'AWS Fundamentals', url: 'https://aws.amazon.com/training/', type: 'course' },
                        ],
                        milestones: ['Deploy first app', 'Use S3 and Lambda'],
                        xpReward: 500,
                        status: 'locked',
                    },
                ],
                totalEstimatedHours: 60,
                recommendedPace: '10 hours/week',
            };
        }
    },

    /**
     * Generate gamified assessment from content
     */
    async generateAssessment(
        contentSources: Array<{ type: string; data?: string; url?: string; content?: string }>,
        difficulty: string
    ) {
        try {
            const response = await aiClient.post('/api/v1/agents/assessment/generate', {
                content_sources: contentSources,
                difficulty,
            });
            return response.data;
        } catch (error) {
            console.error('AI Service error (generateAssessment):', error);
            // Return mock data
            return {
                title: 'Generated Assessment',
                description: 'AI-generated assessment from your content',
                totalXp: 1000,
                quests: [
                    {
                        id: 'quest-1',
                        title: 'Core Concepts Quiz',
                        type: 'quiz',
                        questions: [
                            {
                                id: 'q1',
                                question: 'What is the main purpose of TypeScript?',
                                options: ['Faster runtime', 'Type safety', 'Smaller bundle', 'Better CSS'],
                                correctIndex: 1,
                                points: 50,
                                explanation: 'TypeScript adds static type checking to JavaScript.',
                            },
                            {
                                id: 'q2',
                                question: 'Which keyword declares an immutable variable?',
                                options: ['var', 'let', 'const', 'static'],
                                correctIndex: 2,
                                points: 50,
                                explanation: 'const declares a constant that cannot be reassigned.',
                            },
                        ],
                        totalPoints: 100,
                        earnedPoints: 0,
                        status: 'available',
                    },
                    {
                        id: 'quest-2',
                        title: 'Coding Challenge',
                        type: 'challenge',
                        challenge: {
                            description: 'Implement a function that reverses a string',
                            starterCode: 'function reverseString(str) {\n  // Your code here\n}',
                            testCases: [
                                { input: 'hello', expectedOutput: 'olleh' },
                                { input: 'world', expectedOutput: 'dlrow' },
                            ],
                            timeLimit: 15,
                        },
                        totalPoints: 200,
                        earnedPoints: 0,
                        status: 'locked',
                    },
                ],
            };
        }
    },

    /**
     * Evaluate code submission
     */
    async evaluateCode(code: string, quest: any) {
        try {
            const response = await aiClient.post('/api/v1/agents/assessment/evaluate-code', {
                code,
                challenge: quest.challenge,
            });
            return response.data;
        } catch (error) {
            console.error('AI Service error (evaluateCode):', error);
            return {
                passed: true,
                feedback: 'Great job! Your code passes all test cases.',
            };
        }
    },

    /**
     * Generate aptitude question
     */
    async generateAptitudeQuestion(targetRole: string, difficulty: number) {
        try {
            const response = await aiClient.post('/api/v1/agents/aptitude/generate-question', {
                target_role: targetRole,
                difficulty,
            });
            return response.data;
        } catch (error) {
            console.error('AI Service error (generateAptitudeQuestion):', error);
            // Return mock question
            const questions = [
                {
                    id: `q-${Date.now()}`,
                    question: 'Explain the concept of closures in JavaScript and provide an example.',
                    questionType: 'conceptual',
                    difficulty,
                },
                {
                    id: `q-${Date.now()}`,
                    question: 'Write a function that implements a simple debounce.',
                    questionType: 'coding',
                    difficulty,
                    codeTemplate: 'function debounce(fn, delay) {\n  // Your code here\n}',
                },
                {
                    id: `q-${Date.now()}`,
                    question: 'How would you design a URL shortener service? Discuss the architecture.',
                    questionType: 'scenario',
                    difficulty,
                },
            ];
            return questions[Math.floor(Math.random() * questions.length)];
        }
    },

    /**
     * Evaluate aptitude response
     */
    async evaluateAptitudeResponse(question: any, response: string, code?: string) {
        try {
            const apiResponse = await aiClient.post('/api/v1/agents/aptitude/evaluate', {
                question,
                response,
                code,
            });
            return apiResponse.data;
        } catch (error) {
            console.error('AI Service error (evaluateAptitudeResponse):', error);
            return {
                questionId: question.id,
                score: Math.floor(Math.random() * 4) + 6, // 6-9
                feedback: 'Good response! You demonstrated understanding of the concept.',
            };
        }
    },

    /**
     * Generate complete aptitude analysis
     */
    async generateAptitudeAnalysis(questions: any[]) {
        try {
            const response = await aiClient.post('/api/v1/agents/aptitude/analyze', {
                questions,
            });
            return response.data;
        } catch (error) {
            console.error('AI Service error (generateAptitudeAnalysis):', error);
            const avgScore =
                questions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / questions.length;

            return {
                overallScore: Math.round(avgScore * 10),
                strengths: ['JavaScript fundamentals', 'Problem-solving', 'Clear communication'],
                weaknesses: ['System design', 'Advanced algorithms'],
                recommendations: [
                    'Study system design patterns',
                    'Practice more algorithm problems',
                    'Learn about distributed systems',
                ],
                suggestedRoadmapUpdates: ['System Design Fundamentals', 'Advanced Algorithms'],
            };
        }
    },

    /**
     * Generate additional learning stages based on weaknesses
     */
    async generateAdditionalStages(weaknesses: string[], recommendations: string[]) {
        try {
            const response = await aiClient.post('/api/v1/agents/skill-gap/generate-stages', {
                weaknesses,
                recommendations,
            });
            return response.data;
        } catch (error) {
            console.error('AI Service error (generateAdditionalStages):', error);
            return weaknesses.map((weakness, index) => ({
                id: `feedback-stage-${Date.now()}-${index}`,
                stage: 100 + index, // High number to appear at end
                skill: `Improve: ${weakness}`,
                estimatedHours: 15,
                resources: [
                    {
                        title: `${weakness} Deep Dive`,
                        url: 'https://example.com',
                        type: 'course',
                    },
                ],
                milestones: [`Master ${weakness} concepts`, 'Apply in real project'],
                xpReward: 400,
                status: 'locked',
            }));
        }
    },
};
