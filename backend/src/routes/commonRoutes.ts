import { Router } from 'express';
import {
  getBrands,
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getCarTypes,
  getAdminCarTypes,
  createCarType,
  updateCarType,
  deleteCarType,
  getZaloSettings,
  getBrandingSettings,
  getSettings,
  updateSetting,
} from '../controllers/commonController.js';
import { protectAdmin } from '../middleware/auth.js';

// === PUBLIC ROUTES ===
export const brandRouter = Router();
brandRouter.get('/', getBrands);

export const carTypeRouter = Router();
carTypeRouter.get('/', getCarTypes);

export const settingsRouter = Router();
settingsRouter.get('/zalo', getZaloSettings);
settingsRouter.get('/branding', getBrandingSettings);

// === ADMIN ROUTES ===
export const adminBrandRouter = Router();
adminBrandRouter.use(protectAdmin);
adminBrandRouter.get('/', getAdminBrands);
adminBrandRouter.post('/', createBrand);
adminBrandRouter.put('/:id', updateBrand);
adminBrandRouter.delete('/:id', deleteBrand);

export const adminCarTypeRouter = Router();
adminCarTypeRouter.use(protectAdmin);
adminCarTypeRouter.get('/', getAdminCarTypes);
adminCarTypeRouter.post('/', createCarType);
adminCarTypeRouter.put('/:id', updateCarType);
adminCarTypeRouter.delete('/:id', deleteCarType);

export const adminSettingsRouter = Router();
adminSettingsRouter.use(protectAdmin);
adminSettingsRouter.get('/', getSettings);
adminSettingsRouter.put('/:key', updateSetting);
