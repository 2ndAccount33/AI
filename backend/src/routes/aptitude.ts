import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { AptitudeSession } from '../models/AptitudeSession.js';
import { Roadmap } from '../models/Roadmap.js';
import { aiService } from '../services/aiService.js';

const router = Router();

// Start aptitude session
router.post('/start', authenticate, async (req, res, next) => {
    try {
        const { targetRole } = req.body;

        // Generate initial question
        const firstQuestion = await aiService.generateAptitudeQuestion(targetRole, 5);

        const session = new AptitudeSession({
            userId: req.userId,
            targetRole,
            questions: [{ question: firstQuestion }],
            status: 'active',
        });

        await session.save();

        res.status(201).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
});

// Get session
router.get('/:sessionId', authenticate, async (req, res, next) => {
    try {
        const session = await AptitudeSession.findOne({
            _id: req.params.sessionId,
            userId: req.userId,
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }

        res.json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
});

// Submit response to current question
router.post('/:sessionId/respond', authenticate, async (req, res, next) => {
    try {
        const { questionId, response, code } = req.body;
        const session = await AptitudeSession.findOne({
            _id: req.params.sessionId,
            userId: req.userId,
            status: 'active',
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Active session not found',
            });
        }

        // Find current question
        const questionEntry = session.questions.find(
            (q) => q.question.id === questionId
        );

        if (!questionEntry) {
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        // Evaluate response with AI
        const evaluation = await aiService.evaluateAptitudeResponse(
            questionEntry.question,
            response,
            code
        );

        // Store response and evaluation
        questionEntry.response = {
            questionId,
            response,
            code,
            timeSpent: 0, // Can calculate from timestamps
        };
        questionEntry.evaluation = evaluation;

        // Determine next question difficulty based on score
        let nextDifficulty = questionEntry.question.difficulty;
        if (evaluation.score >= 8) {
            nextDifficulty = Math.min(10, nextDifficulty + 1);
        } else if (evaluation.score <= 4) {
            nextDifficulty = Math.max(1, nextDifficulty - 1);
        }

        // Generate next question (if we haven't reached max questions)
        let nextQuestion = null;
        if (session.questions.length < 10) {
            nextQuestion = await aiService.generateAptitudeQuestion(
                session.targetRole,
                nextDifficulty
            );
            session.questions.push({ question: nextQuestion });
        }

        await session.save();

        res.json({
            success: true,
            data: {
                evaluation: {
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                },
                nextQuestion: nextQuestion
                    ? {
                        question: nextQuestion.question,
                        questionType: nextQuestion.questionType,
                        difficulty: nextQuestion.difficulty,
                        codeTemplate: nextQuestion.codeTemplate,
                    }
                    : null,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Complete session and get analysis
router.post('/:sessionId/complete', authenticate, async (req, res, next) => {
    try {
        const session = await AptitudeSession.findOne({
            _id: req.params.sessionId,
            userId: req.userId,
            status: 'active',
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Active session not found',
            });
        }

        // Generate analysis from all evaluations
        const analysis = await aiService.generateAptitudeAnalysis(session.questions);

        session.analysis = analysis;
        session.status = 'completed';
        session.completedAt = new Date();

        await session.save();

        // FEEDBACK LOOP: Update user's roadmap with identified weaknesses
        if (analysis.suggestedRoadmapUpdates.length > 0) {
            const activeRoadmap = await Roadmap.findOne({
                userId: req.userId,
                status: 'active',
            }).sort({ createdAt: -1 });

            if (activeRoadmap) {
                // Generate new stages based on weaknesses
                const newStages = await aiService.generateAdditionalStages(
                    analysis.weaknesses,
                    analysis.recommendations
                );

                activeRoadmap.learningPath.push(...newStages);
                activeRoadmap.totalEstimatedHours += newStages.reduce(
                    (sum, s) => sum + s.estimatedHours,
                    0
                );
                await activeRoadmap.save();
            }
        }

        res.json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
});

export default router;
