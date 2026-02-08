import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AptitudeSession } from '../models/AptitudeSession.js';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

export function setupWebSocket(io: Server) {
    // Aptitude namespace for real-time assessments
    io.on('connection', (socket: Socket) => {
        const sessionId = socket.handshake.query.sessionId as string;
        logger.info(`Client connected: ${socket.id}, Session: ${sessionId}`);

        // Join session room
        if (sessionId) {
            socket.join(sessionId);
        }

        // Handle response submission
        socket.on('submit_response', async (data) => {
            try {
                const { questionId, response, code } = data;

                // Get session
                const session = await AptitudeSession.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Find current question
                const questionEntry = session.questions.find(
                    (q) => q.question.id === questionId
                );

                if (!questionEntry) {
                    socket.emit('error', { message: 'Question not found' });
                    return;
                }

                // Evaluate response
                const evaluation = await aiService.evaluateAptitudeResponse(
                    questionEntry.question,
                    response,
                    code
                );

                // Store response
                questionEntry.response = {
                    questionId,
                    response,
                    code,
                    timeSpent: 0,
                };
                questionEntry.evaluation = evaluation;

                // Emit evaluation
                socket.emit('evaluation', evaluation);

                // Calculate next difficulty
                let nextDifficulty = questionEntry.question.difficulty;
                if (evaluation.score >= 8) {
                    nextDifficulty = Math.min(10, nextDifficulty + 1);
                } else if (evaluation.score <= 4) {
                    nextDifficulty = Math.max(1, nextDifficulty - 1);
                }

                // Generate next question if not at limit
                if (session.questions.length < 10) {
                    const nextQuestion = await aiService.generateAptitudeQuestion(
                        session.targetRole,
                        nextDifficulty
                    );
                    session.questions.push({ question: nextQuestion });

                    await session.save();

                    // Emit next question
                    socket.emit('question', nextQuestion);
                }

                await session.save();
            } catch (error) {
                logger.error('WebSocket submit_response error:', error);
                socket.emit('error', { message: 'Failed to process response' });
            }
        });

        // Handle hint request
        socket.on('request_hint', async (data) => {
            try {
                const { questionId } = data;

                // Could call AI for hints
                socket.emit('hint', {
                    questionId,
                    hint: 'Think about the core concepts and break down the problem step by step.',
                });
            } catch (error) {
                logger.error('WebSocket request_hint error:', error);
            }
        });

        // Handle session end
        socket.on('end_session', async () => {
            try {
                const session = await AptitudeSession.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Generate analysis
                const analysis = await aiService.generateAptitudeAnalysis(session.questions);

                session.analysis = analysis;
                session.status = 'completed';
                session.completedAt = new Date();
                await session.save();

                // Emit analysis
                socket.emit('analysis', analysis);
            } catch (error) {
                logger.error('WebSocket end_session error:', error);
                socket.emit('error', { message: 'Failed to complete session' });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

    // User updates namespace for XP and badge notifications
    io.of('/user').on('connection', (socket: Socket) => {
        const userId = socket.handshake.query.userId as string;

        if (userId) {
            socket.join(userId);
            logger.info(`User connected for updates: ${userId}`);
        }

        socket.on('disconnect', () => {
            logger.info(`User disconnected from updates: ${userId}`);
        });
    });
}

// Helper to emit XP gain to specific user
export function emitXpGain(io: Server, userId: string, amount: number, total: number) {
    io.of('/user').to(userId).emit('xp_gained', { amount, total });
}

// Helper to emit badge earned to specific user
export function emitBadgeEarned(io: Server, userId: string, badge: any) {
    io.of('/user').to(userId).emit('badge_earned', badge);
}
