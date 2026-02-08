import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Register
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }),
        body('name').trim().notEmpty(),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password, name, currentRole, targetRole } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists',
                });
            }

            // Create user
            const user = new User({
                email,
                password,
                profile: { name, currentRole, targetRole },
            });
            await user.save();

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        profile: user.profile,
                        xp: user.xp,
                        level: user.level,
                        badges: user.badges,
                    },
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        profile: user.profile,
                        xp: user.xp,
                        level: user.level,
                        badges: user.badges,
                    },
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get profile
router.get('/profile', authenticate, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                xp: user.xp,
                level: user.level,
                badges: user.badges,
                completedModules: user.completedModules,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Update profile
router.patch('/profile', authenticate, async (req, res, next) => {
    try {
        const { name, currentRole, targetRole } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (name) user.profile.name = name;
        if (currentRole) user.profile.currentRole = currentRole;
        if (targetRole) user.profile.targetRole = targetRole;

        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                xp: user.xp,
                level: user.level,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
