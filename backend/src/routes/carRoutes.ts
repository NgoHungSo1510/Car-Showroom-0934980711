import { Router } from 'express';
import {
  getCars,
  getCar,
  getAdminCars,
  getAdminCar,
  createCar,
  updateCar,
  deleteCar,
  update3DConfig,
  upload3DModel,
} from '../controllers/carController.js';
import { getRelatedPosts } from '../controllers/postController.js';
import { protectAdmin } from '../middleware/auth.js';
import { uploadSingleModel } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', getCars);
router.get('/:idOrSlug', getCar);
router.get('/:carId/related-posts', getRelatedPosts);

export default router;

// Admin routes (separate export)
export const adminCarRouter = Router();
adminCarRouter.use(protectAdmin);

adminCarRouter.get('/', getAdminCars);
adminCarRouter.get('/:id', getAdminCar); // Admin can get any car by ID
adminCarRouter.post('/', createCar);
adminCarRouter.put('/:id', updateCar);
adminCarRouter.delete('/:id', deleteCar);
adminCarRouter.put('/:id/3d-config', update3DConfig);
adminCarRouter.post('/:id/upload-3d', uploadSingleModel, upload3DModel);
