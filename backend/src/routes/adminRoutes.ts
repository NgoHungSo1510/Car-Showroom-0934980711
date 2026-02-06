import { Router } from 'express';
import { getDashboardStats, getActivityLogs } from '../controllers/dashboardController.js';
import { uploadImage, uploadMultipleImages, uploadModel } from '../controllers/uploadController.js';
import { downloadCarTemplate, importCarsFromExcel } from '../controllers/importController.js';
import { protectAdmin } from '../middleware/auth.js';
import { uploadSingleImage, uploadImages, uploadSingleModel, uploadSingleExcel } from '../middleware/upload.js';

const router = Router();

// Public route - Template download (no auth required)
router.get('/import/car-template', downloadCarTemplate);

// All routes below are protected
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/activity', getActivityLogs);

// Upload
router.post('/upload/image', uploadSingleImage, uploadImage);
router.post('/upload/images', uploadImages, uploadMultipleImages);
router.post('/upload/model', uploadSingleModel, uploadModel);

// Import (POST requires auth)
router.post('/import/cars', uploadSingleExcel, importCarsFromExcel);

export default router;

