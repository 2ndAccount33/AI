import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import roadmapRoutes from './routes/roadmap.js';
import assessmentRoutes from './routes/assessment.js';
import aptitudeRoutes from './routes/aptitude.js';
import jobRoutes from './routes/jobs.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupWebSocket } from './websocket/index.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// WebSocket setup
setupWebSocket(io);

// Database connection and server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-platform';

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    });

export { io };
