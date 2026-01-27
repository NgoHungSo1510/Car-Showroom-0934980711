import express from 'express';
import {
  verifyWebhook,
  handleWebhook,
  manualImport,
  testAI,
  syncFromFacebookPage,
  getSyncStatus,
  getFacebookPosts,
  syncSinglePost,
  syncMultiplePosts,
  getSyncedPosts,
  setAutoSync,
  publishToFacebook,
  publishBatchToFacebook,
} from '../controllers/facebookController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Facebook webhook endpoints (public - FB needs to access)
router.get('/', verifyWebhook);
router.post('/', handleWebhook);

// Admin endpoints for manual import and testing
router.post('/import', protectAdmin, manualImport);
router.post('/test-ai', protectAdmin, testAI);

// Facebook Page sync endpoints
router.get('/status', protectAdmin, getSyncStatus);
router.post('/sync', protectAdmin, syncFromFacebookPage);

// New endpoints for improved sync UI
router.get('/posts', protectAdmin, getFacebookPosts);
router.post('/sync-single', protectAdmin, syncSinglePost);
router.post('/sync-multiple', protectAdmin, syncMultiplePosts);
router.get('/synced-posts', protectAdmin, getSyncedPosts);
router.post('/auto-sync', protectAdmin, setAutoSync);

// Publish from website to Facebook
router.post('/publish', protectAdmin, publishToFacebook);
router.post('/publish-batch', protectAdmin, publishBatchToFacebook);

export default router;
