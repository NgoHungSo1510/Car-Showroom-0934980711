import express from 'express';
import { verifyWebhook, handleWebhook, manualImport, testAI } from '../controllers/facebookController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Facebook webhook endpoints (public - FB needs to access)
router.get('/', verifyWebhook);
router.post('/', handleWebhook);

// Admin endpoints for manual import and testing
router.post('/import', protectAdmin, manualImport);
router.post('/test-ai', protectAdmin, testAI);

export default router;
