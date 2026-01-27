import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import Car from '../models/Car.js';
import Post from '../models/Post.js';
import Admin from '../models/Admin.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Get counts
  const [totalCars, publishedCars, draftCars, totalPosts, publishedPosts, totalViews] =
    await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ status: 'published' }),
      Car.countDocuments({ status: 'draft' }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Car.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
    ]);

  // Get recent cars
  const recentCars = await Car.find()
    .populate('brand', 'name')
    .select('name thumbnail status viewCount createdAt')
    .sort('-createdAt')
    .limit(5);

  // Get recent posts
  const recentPosts = await Post.find()
    .populate('createdBy', 'fullName')
    .select('title status category createdAt')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalCars,
        publishedCars,
        draftCars,
        totalPosts,
        publishedPosts,
        totalViews: totalViews[0]?.total || 0,
      },
      recentCars,
      recentPosts,
    },
  });
});

// @desc    Get activity logs (recent actions)
// @route   GET /api/admin/activity
// @access  Private
export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  // Get recent cars and posts with timestamps
  const [recentCars, recentPosts] = await Promise.all([
    Car.find().select('name status createdAt updatedAt').sort('-updatedAt').limit(10),
    Post.find()
      .populate('createdBy', 'fullName')
      .select('title status createdAt updatedAt')
      .sort('-updatedAt')
      .limit(10),
  ]);

  // Combine and sort by date
  const activities = [
    ...recentCars.map((car) => ({
      type: 'car',
      action: car.createdAt.getTime() === car.updatedAt.getTime() ? 'created' : 'updated',
      title: car.name,
      status: car.status,
      date: car.updatedAt,
    })),
    ...recentPosts.map((post) => ({
      type: 'post',
      action: post.createdAt.getTime() === post.updatedAt.getTime() ? 'created' : 'updated',
      title: post.title,
      status: post.status,
      date: post.updatedAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  res.status(200).json({
    success: true,
    data: activities,
  });
});
