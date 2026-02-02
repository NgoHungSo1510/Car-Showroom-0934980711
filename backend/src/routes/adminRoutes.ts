import { Router } from 'express';
import { getDashboardStats, getActivityLogs } from '../controllers/dashboardController.js';
import { uploadImage, uploadMultipleImages, uploadModel } from '../controllers/uploadController.js';
import { downloadCarTemplate, importCarsFromExcel } from '../controllers/importController.js';
import { protectAdmin } from '../middleware/auth.js';
import { uploadSingleImage, uploadImages, uploadSingleModel, uploadSingleExcel } from '../middleware/upload.js';

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

// Import
router.get('/import/car-template', downloadCarTemplate);
router.post('/import/cars', uploadSingleExcel, importCarsFromExcel);

export default router;
