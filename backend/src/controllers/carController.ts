import { Request, Response } from 'express';
import Car from '../models/Car.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import mongoose from 'mongoose';

// @desc    Get all cars (public)
// @route   GET /api/cars
// @access  Public
export const getCars = asyncHandler(async (req: Request, res: Response) => {
    const {
        brand,
        carType,
        minPrice,
        maxPrice,
        status = 'published',
        featured,
        search,
        page = 1,
        limit = 12,
        sort = '-createdAt',
    } = req.query;

    // Build query
    const query: Record<string, unknown> = { status };

    if (brand) query.brand = brand;
    if (carType) query.carType = carType;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
        if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    // Execute query
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
        Car.find(query)
            .populate('brand', 'name slug logo')
            .populate('carType', 'name slug')
            .select('-model3D.colorConfigs -model3D.interiorMeshNames -description')
            .sort(sort as string)
            .skip(skip)
            .limit(limitNum),
        Car.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        data: cars,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});

// @desc    Get single car by ID or slug
// @route   GET /api/cars/:idOrSlug
// @access  Public
export const getCar = asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params;

    let car;

    // Check if it's an ObjectId or a slug
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        car = await Car.findById(idOrSlug)
            .populate('brand', 'name slug logo country')
            .populate('carType', 'name slug');
    } else {
        car = await Car.findOne({ slug: idOrSlug, status: 'published' })
            .populate('brand', 'name slug logo country')
            .populate('carType', 'name slug');
    }

    if (!car) {
        throw new ApiError('Car not found', 404);
    }

    // Increment view count
    car.viewCount += 1;
    await car.save();

    res.status(200).json({
        success: true,
        data: car,
    });
});

// =========== ADMIN ROUTES ===========

// @desc    Get single car by ID (admin - no status check)
// @route   GET /api/admin/cars/:id
// @access  Private
export const getAdminCar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const car = await Car.findById(id)
        .populate('brand', 'name slug logo country')
        .populate('carType', 'name slug');

    if (!car) {
        throw new ApiError('Car not found', 404);
    }

    res.status(200).json({
        success: true,
        data: car,
    });
});

// @desc    Get all cars (admin)
// @route   GET /api/admin/cars
// @access  Private
export const getAdminCars = asyncHandler(async (req: Request, res: Response) => {
    const {
        brand,
        carType,
        status,
        page = 1,
        limit = 20,
        sort = '-createdAt',
        search,
    } = req.query;

    // Build query
    const query: Record<string, unknown> = {};

    if (brand) query.brand = brand;
    if (carType) query.carType = carType;
    if (status) query.status = status;
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // Execute query
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
        Car.find(query)
            .populate('brand', 'name slug logo')
            .populate('carType', 'name slug')
            .sort(sort as string)
            .skip(skip)
            .limit(limitNum),
        Car.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        data: cars,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});

// @desc    Create new car
// @route   POST /api/admin/cars
// @access  Private
export const createCar = asyncHandler(async (req: Request, res: Response) => {
    const car = await Car.create(req.body);

    res.status(201).json({
        success: true,
        data: car,
    });
});

// @desc    Update car
// @route   PUT /api/admin/cars/:id
// @access  Private
export const updateCar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const car = await Car.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    })
        .populate('brand', 'name slug logo')
        .populate('carType', 'name slug');

    if (!car) {
        throw new ApiError('Car not found', 404);
    }

    res.status(200).json({
        success: true,
        data: car,
    });
});

// @desc    Delete car
// @route   DELETE /api/admin/cars/:id
// @access  Private
export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const car = await Car.findByIdAndDelete(id);

    if (!car) {
        throw new ApiError('Car not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Car deleted successfully',
    });
});

// @desc    Update 3D config
// @route   PUT /api/admin/cars/:id/3d-config
// @access  Private
export const update3DConfig = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { model3D } = req.body;

    const car = await Car.findByIdAndUpdate(
        id,
        { model3D },
        { new: true, runValidators: true }
    );

    if (!car) {
        throw new ApiError('Car not found', 404);
    }

    res.status(200).json({
        success: true,
        data: car.model3D,
    });
});

// @desc    Upload 3D model file
// @route   POST /api/admin/cars/:id/upload-3d
// @access  Private
export const upload3DModel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.file) {
        throw new ApiError('Please upload a 3D model file', 400);
    }

    const car = await Car.findById(id);
    if (!car) {
        throw new ApiError('Car not found', 404);
    }

    // Update model3D info
    car.model3D.hasModel = true;
    car.model3D.fileUrl = `/uploads/models/${req.file.filename}`;
    car.model3D.fileName = req.file.originalname;
    car.model3D.fileSize = req.file.size;

    await car.save();

    res.status(200).json({
        success: true,
        data: {
            fileUrl: car.model3D.fileUrl,
            fileName: car.model3D.fileName,
            fileSize: car.model3D.fileSize,
        },
    });
});
