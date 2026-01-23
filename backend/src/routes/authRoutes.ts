import { Router } from 'express';
import {
    login,
    getMe,
    logout,
    updateProfile,
    changePassword,
} from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.use(protectAdmin);
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

export default router;
