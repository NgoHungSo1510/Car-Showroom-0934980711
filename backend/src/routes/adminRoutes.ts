import { Router } from 'express';
import {
    getDashboardStats,
    getActivityLogs,
} from '../controllers/dashboardController.js';
import {
    uploadImage,
    uploadMultipleImages,
    uploadModel,
} from '../controllers/uploadController.js';
import { protectAdmin } from '../middleware/auth.js';
import { uploadSingleImage, uploadImages, uploadSingleModel } from '../middleware/upload.js';

const router = Router();

// All routes are protected
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/activity', getActivityLogs);

// Upload
router.post('/upload/image', uploadSingleImage, uploadImage);
router.post('/upload/images', uploadImages, uploadMultipleImages);
router.post('/upload/model', uploadSingleModel, uploadModel);

export default router;
