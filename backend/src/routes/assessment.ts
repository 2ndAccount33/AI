import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { Assessment } from '../models/Assessment.js';
import { User } from '../models/User.js';
import { aiService } from '../services/aiService.js';
import { awardXP, completeQuest, checkAndAwardMilestoneBadges } from '../utils/activityTracker.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Generate assessment from content
router.post(
    '/generate',
    authenticate,
    upload.single('content'),
    async (req, res, next) => {
        try {
            const { contentSources, difficulty } = req.body;

            // Parse content sources if string
            const sources = typeof contentSources === 'string'
                ? JSON.parse(contentSources)
                : contentSources;

            // Call AI service to generate assessment
            const generatedAssessment = await aiService.generateAssessment(sources, difficulty);

            // Create assessment
            const assessment = new Assessment({
                userId: req.userId,
                title: generatedAssessment.title,
                description: generatedAssessment.description,
                sourceContent: sources.map((s: any) => ({
                    type: s.type,
                    reference: s.url || s.content || 'uploaded',
                })),
                totalXp: generatedAssessment.totalXp,
                quests: generatedAssessment.quests,
                status: 'not_started',
            });

            // Unlock first quest
            if (assessment.quests.length > 0) {
                assessment.quests[0].status = 'available';
            }

            await assessment.save();

            res.status(201).json({ success: true, data: assessment });
        } catch (error) {
            next(error);
        }
    }
);

// Get all assessments
router.get('/', authenticate, async (req, res, next) => {
    try {
        const assessments = await Assessment.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: assessments });
    } catch (error) {
        next(error);
    }
});

// Get single assessment
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const assessment = await Assessment.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found',
            });
        }

        res.json({ success: true, data: assessment });
    } catch (error) {
        next(error);
    }
});

// Submit quiz answer
router.post('/:id/quest/:questId/answer', authenticate, async (req, res, next) => {
    try {
        const { questionId, answerIndex } = req.body;
        const assessment = await Assessment.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found',
            });
        }

        const quest = assessment.quests.find((q) => q.id === req.params.questId);
        if (!quest || !quest.questions) {
            return res.status(404).json({
                success: false,
                message: 'Quest not found',
            });
        }

        const question = quest.questions.find((q) => q.id === questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found',
            });
        }

        const correct = answerIndex === question.correctIndex;
        if (correct) {
            quest.earnedPoints = (quest.earnedPoints || 0) + question.points;

            // Award XP with activity tracking
            await awardXP(
                req.userId!,
                question.points,
                `Correct answer in ${assessment.title}`
            );
            await checkAndAwardMilestoneBadges(req.userId!);
        }

        quest.status = 'in_progress';
        assessment.status = 'in_progress';
        await assessment.save();

        res.json({
            success: true,
            data: {
                correct,
                points: correct ? question.points : 0,
                explanation: question.explanation,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Submit challenge code
router.post('/:id/quest/:questId/submit', authenticate, async (req, res, next) => {
    try {
        const { code } = req.body;
        const assessment = await Assessment.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found',
            });
        }

        const quest = assessment.quests.find((q) => q.id === req.params.questId);
        if (!quest) {
            return res.status(404).json({
                success: false,
                message: 'Quest not found',
            });
        }

        // Evaluate code with AI
        const result = await aiService.evaluateCode(code, quest);

        if (result.passed) {
            quest.earnedPoints = quest.totalPoints;
            quest.status = 'completed';

            // Unlock next quest
            const questIndex = assessment.quests.findIndex((q) => q.id === quest.id);
            if (questIndex + 1 < assessment.quests.length) {
                assessment.quests[questIndex + 1].status = 'available';
            }

            // Track quest completion with activity tracking
            await completeQuest(
                req.userId!,
                quest.title || assessment.title,
                quest.totalPoints
            );
            await checkAndAwardMilestoneBadges(req.userId!);
        }

        await assessment.save();

        res.json({
            success: true,
            data: {
                passed: result.passed,
                points: result.passed ? quest.totalPoints : 0,
                feedback: result.feedback,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
