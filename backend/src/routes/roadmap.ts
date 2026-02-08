import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { Roadmap } from '../models/Roadmap.js';
import { aiService } from '../services/aiService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Analyze skill gap and generate roadmap
router.post(
    '/analyze',
    authenticate,
    upload.single('resume'),
    async (req, res, next) => {
        try {
            const { jobDescriptionId } = req.body;
            const resumeFile = req.file;

            if (!resumeFile) {
                return res.status(400).json({
                    success: false,
                    message: 'Resume file is required',
                });
            }

            // Call AI service
            const result = await aiService.analyzeSkillGap(
                resumeFile.buffer.toString('base64'),
                jobDescriptionId
            );

            // Create roadmap
            const roadmap = new Roadmap({
                userId: req.userId,
                title: `Roadmap for ${result.jobDescription.title}`,
                resumeData: result.resumeData,
                jobDescription: result.jobDescription,
                analysis: result.analysis,
                learningPath: result.learningPath,
                totalEstimatedHours: result.totalEstimatedHours,
                recommendedPace: result.recommendedPace,
                status: 'active',
            });

            // Unlock first stage
            if (roadmap.learningPath.length > 0) {
                roadmap.learningPath[0].status = 'available';
            }

            await roadmap.save();

            res.status(201).json({
                success: true,
                data: roadmap,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get all roadmaps for user
router.get('/', authenticate, async (req, res, next) => {
    try {
        const roadmaps = await Roadmap.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: roadmaps });
    } catch (error) {
        next(error);
    }
});

// Get single roadmap
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found',
            });
        }

        res.json({ success: true, data: roadmap });
    } catch (error) {
        next(error);
    }
});

// Update stage status
router.patch('/:id/stage/:stageId', authenticate, async (req, res, next) => {
    try {
        const { status } = req.body;
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found',
            });
        }

        const stageIndex = roadmap.learningPath.findIndex(
            (s) => s.id === req.params.stageId
        );

        if (stageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Stage not found',
            });
        }

        roadmap.learningPath[stageIndex].status = status;

        if (status === 'completed') {
            roadmap.learningPath[stageIndex].completedAt = new Date();

            // Unlock next stage
            if (stageIndex + 1 < roadmap.learningPath.length) {
                roadmap.learningPath[stageIndex + 1].status = 'available';
            }
        }

        await roadmap.save();

        res.json({ success: true, data: roadmap });
    } catch (error) {
        next(error);
    }
});

// Update roadmap from aptitude feedback
router.post('/:id/feedback-update', authenticate, async (req, res, next) => {
    try {
        const { weaknesses, recommendations } = req.body;
        const roadmap = await Roadmap.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found',
            });
        }

        // Call AI service to get updated stages for weaknesses
        const newStages = await aiService.generateAdditionalStages(weaknesses, recommendations);

        // Add new stages to learning path
        roadmap.learningPath.push(...newStages);
        roadmap.totalEstimatedHours += newStages.reduce((sum, s) => sum + s.estimatedHours, 0);

        await roadmap.save();

        res.json({ success: true, data: roadmap });
    } catch (error) {
        next(error);
    }
});

export default router;
