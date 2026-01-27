import { Request, Response } from 'express';
import Brand from '../models/Brand.js';
import CarType from '../models/CarType.js';
import Setting from '../models/Setting.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

// =========== BRANDS ===========

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await Brand.find({ isActive: true }).sort('name');

  res.status(200).json({
    success: true,
    data: brands,
  });
});

// @desc    Get all brands (admin)
// @route   GET /api/admin/brands
// @access  Private
export const getAdminBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await Brand.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    data: brands,
  });
});

// @desc    Create brand
// @route   POST /api/admin/brands
// @access  Private
export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await Brand.create(req.body);

  res.status(201).json({
    success: true,
    data: brand,
  });
});

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private
export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    throw new ApiError('Brand not found', 404);
  }

  res.status(200).json({
    success: true,
    data: brand,
  });
});

// @desc    Delete brand
// @route   DELETE /api/admin/brands/:id
// @access  Private
export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const brand = await Brand.findByIdAndDelete(id);

  if (!brand) {
    throw new ApiError('Brand not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Brand deleted successfully',
  });
});

// =========== CAR TYPES ===========

// @desc    Get all car types
// @route   GET /api/car-types
// @access  Public
export const getCarTypes = asyncHandler(async (req: Request, res: Response) => {
  const carTypes = await CarType.find({ isActive: true }).sort('name');

  res.status(200).json({
    success: true,
    data: carTypes,
  });
});

// @desc    Get all car types (admin)
// @route   GET /api/admin/car-types
// @access  Private
export const getAdminCarTypes = asyncHandler(async (req: Request, res: Response) => {
  const carTypes = await CarType.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    data: carTypes,
  });
});

// @desc    Create car type
// @route   POST /api/admin/car-types
// @access  Private
export const createCarType = asyncHandler(async (req: Request, res: Response) => {
  const carType = await CarType.create(req.body);

  res.status(201).json({
    success: true,
    data: carType,
  });
});

// @desc    Update car type
// @route   PUT /api/admin/car-types/:id
// @access  Private
export const updateCarType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const carType = await CarType.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!carType) {
    throw new ApiError('Car type not found', 404);
  }

  res.status(200).json({
    success: true,
    data: carType,
  });
});

// @desc    Delete car type
// @route   DELETE /api/admin/car-types/:id
// @access  Private
export const deleteCarType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const carType = await CarType.findByIdAndDelete(id);

  if (!carType) {
    throw new ApiError('Car type not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Car type deleted successfully',
  });
});

// =========== SETTINGS ===========

// @desc    Get Zalo settings (public)
// @route   GET /api/settings/zalo
// @access  Public
export const getZaloSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await Setting.find({
    key: { $in: ['zalo_phone', 'zalo_greeting'] },
  });

  const result: Record<string, string> = {};
  settings.forEach((s) => {
    result[s.key] = s.value;
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Get branding settings (public)
// @route   GET /api/settings/branding
// @access  Public
export const getBrandingSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await Setting.find({
    key: { $in: ['site_name', 'site_logo', 'site_hotline', 'site_address_1', 'site_address_2'] },
  });

  const result: Record<string, string> = {
    site_name: 'VinFast Miền Trung',
    site_logo: '',
    site_hotline: '0934980711',
    site_address_1: '',
    site_address_2: '',
  };

  settings.forEach((s) => {
    result[s.key] = s.value;
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Get all settings (admin)
// @route   GET /api/admin/settings
// @access  Private
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const { group } = req.query;

  const query: Record<string, unknown> = {};
  if (group) query.group = group;

  const settings = await Setting.find(query).sort('key');

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update setting
// @route   PUT /api/admin/settings/:key
// @access  Private
export const updateSetting = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value, description, group } = req.body;

  const setting = await Setting.findOneAndUpdate(
    { key },
    {
      value,
      description,
      group,
      updatedBy: req.admin?._id,
    },
    { new: true, upsert: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    data: setting,
  });
});
