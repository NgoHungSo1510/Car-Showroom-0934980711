import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin, { IAdmin } from '../models/Admin.js';

// Extend Express Request type to include admin
declare global {
    namespace Express {
        interface Request {
            admin?: IAdmin;
        }
    }
}

interface JwtPayload {
    id: string;
    role: string;
}

export const protectAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret not configured');
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Find admin
        const admin = await Admin.findById(decoded.id);

        if (!admin || !admin.isActive) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token or account disabled.',
            });
            return;
        }

        // Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

// Check if admin is super_admin
export const requireSuperAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.admin || req.admin.role !== 'super_admin') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super admin required.',
        });
        return;
    }
    next();
};
