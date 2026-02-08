import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret'
        ) as { userId: string };

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
