import { Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Upload single image to Cloudinary
// @route   POST /api/admin/upload/image
// @access  Private
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError('Please upload an image file', 400);
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'car-showroom/images');

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError('Failed to upload image to Cloudinary', 500);
  }
});

// @desc    Upload multiple images to Cloudinary
// @route   POST /api/admin/upload/images
// @access  Private
export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new ApiError('Please upload at least one image', 400);
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, 'car-showroom/images');
      return {
        url: result.url,
        publicId: result.publicId,
        filename: file.originalname,
        size: file.size,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError('Failed to upload images to Cloudinary', 500);
  }
});

// @desc    Upload 3D model to Cloudinary
// @route   POST /api/admin/upload/model
// @access  Private
export const uploadModel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError('Please upload a 3D model file (.glb or .gltf)', 400);
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'car-showroom/models');

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError('Failed to upload model to Cloudinary', 500);
  }
});
