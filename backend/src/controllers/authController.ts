import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

// Generate JWT token
const generateToken = (id: string, role: string): string => {
    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT secret not configured');
    }

    return jwt.sign(
        { id, role },
        secret,
        { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '24h' }
    );
};

// @desc    Admin Login
// @route   POST /api/admin/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        throw new ApiError('Please provide username and password', 400);
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
        $or: [{ username }, { email: username }],
    }).select('+password');

    if (!admin) {
        throw new ApiError('Invalid credentials', 401);
    }

    // Check if account is active
    if (!admin.isActive) {
        throw new ApiError('Account is disabled. Contact super admin.', 403);
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        throw new ApiError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(admin._id.toString(), admin.role);

    res.status(200).json({
        success: true,
        data: {
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                avatar: admin.avatar,
                role: admin.role,
            },
        },
    });
});

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const admin = req.admin;

    res.status(200).json({
        success: true,
        data: {
            id: admin?._id,
            username: admin?.username,
            email: admin?.email,
            fullName: admin?.fullName,
            avatar: admin?.avatar,
            role: admin?.role,
        },
    });
});

// @desc    Logout (just for client-side, invalidate token)
// @route   POST /api/admin/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
    // Token invalidation should be handled client-side
    // Optionally, implement token blacklist here

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, avatar } = req.body;

    const admin = await Admin.findByIdAndUpdate(
        req.admin?._id,
        { fullName, email, avatar },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: admin,
    });
});

// @desc    Change password
// @route   PUT /api/admin/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError('Please provide current and new password', 400);
    }

    const admin = await Admin.findById(req.admin?._id).select('+password');
    if (!admin) {
        throw new ApiError('Admin not found', 404);
    }

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
        throw new ApiError('Current password is incorrect', 400);
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});
