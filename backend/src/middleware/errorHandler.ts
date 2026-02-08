import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.message,
        });
    }

    // Mongoose duplicate key error
    if ((err as any).code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
};
