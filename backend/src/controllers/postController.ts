import { Request, Response } from 'express';
import Post from '../models/Post.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import mongoose from 'mongoose';

// @desc    Get all posts (public)
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const { category, tag, search, page = 1, limit = 10, sort = '-publishedAt' } = req.query;

  // Build query
  const query: Record<string, unknown> = { status: 'published' };

  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (search) query.title = { $regex: search, $options: 'i' };

  // Execute query
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('relatedCar', 'name slug thumbnail')
      .populate('createdBy', 'fullName avatar')
      .select(
        'title slug excerpt coverImage category tags publishedAt createdAt viewCount relatedCar eventStartDate eventEndDate discountAmount discountPercent discountDescription',
      )
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug, status: 'published' })
    .populate('relatedCar', 'name slug thumbnail model3D.hasModel price')
    .populate('createdBy', 'fullName avatar');

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Increment view count
  post.viewCount += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Get posts related to a car
// @route   GET /api/cars/:carId/related-posts
// @access  Public
export const getRelatedPosts = asyncHandler(async (req: Request, res: Response) => {
  const { carId } = req.params;

  const posts = await Post.find({
    relatedCar: carId,
    status: 'published',
  })
    .select('title slug excerpt coverImage category publishedAt')
    .sort('-publishedAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: posts,
  });
});

// =========== ADMIN ROUTES ===========

// @desc    Get all posts (admin)
// @route   GET /api/admin/posts
// @access  Private
export const getAdminPosts = asyncHandler(async (req: Request, res: Response) => {
  const { category, status, page = 1, limit = 20, search } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build match stage
  const matchStage: any = {};
  if (category) matchStage.category = category;
  if (status) matchStage.status = status;
  if (search) {
    matchStage.title = { $regex: search, $options: 'i' };
  }

  // Aggregation pipeline
  const pipeline: any[] = [
    { $match: matchStage },
    {
      $addFields: {
        sortDate: { $ifNull: ['$publishedAt', '$createdAt'] },
      },
    },
    { $sort: { sortDate: -1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limitNum }],
      },
    },
  ];

  const result = await Post.aggregate(pipeline);

  const metadata = result[0].metadata;
  const total = metadata.length > 0 ? metadata[0].total : 0;
  let posts = result[0].data;

  // Populate references
  posts = await Post.populate(posts, [
    { path: 'relatedCar', select: 'name slug' },
    { path: 'createdBy', select: 'fullName' },
  ]);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single post by ID (admin)
// @route   GET /api/admin/posts/:id
// @access  Private
export const getAdminPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate('relatedCar', 'name slug thumbnail')
    .populate('createdBy', 'fullName avatar');

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Create new post
// @route   POST /api/admin/posts
// @access  Private
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  // Add creator
  req.body.createdBy = req.admin?._id;

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Update post
// @route   PUT /api/admin/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('relatedCar', 'name slug thumbnail')
    .populate('createdBy', 'fullName avatar');

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/admin/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});
