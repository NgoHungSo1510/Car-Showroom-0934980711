import { Router, Request, Response } from 'express';
import { Notification, Car, Post } from '../models/index.js';
import { protectAdmin } from '../middleware/auth.js';

const router = Router();

// ============ PUBLIC ROUTES ============
// Create notification when user clicks Zalo (public - no auth needed)
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { type, refId, refTitle, refThumbnail } = req.body;

    if (!type || !refId || !refTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, refId, refTitle',
      });
    }

    if (!['contact_car', 'contact_post'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be contact_car or contact_post',
      });
    }

    const notification = await Notification.create({
      type,
      refId,
      refTitle,
      refThumbnail: refThumbnail || '',
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// ============ ADMIN ROUTES ============
const adminRouter = Router();
adminRouter.use(protectAdmin);

// Get all notifications (with pagination)
adminRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get unread count
adminRouter.get('/unread-count', async (_req: Request, res: Response) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get notification detail with full reference data
adminRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id).lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Get the referenced item details
    let refData = null;
    if (notification.type === 'contact_car') {
      refData = await Car.findById(notification.refId)
        .populate('brand', 'name')
        .populate('carType', 'name')
        .lean();
    } else if (notification.type === 'contact_post') {
      refData = await Post.findById(notification.refId)
        .populate('relatedCar', 'name thumbnail')
        .lean();
    }

    res.json({
      success: true,
      data: {
        ...notification,
        refData,
      },
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Mark as read
adminRouter.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Mark all as read
adminRouter.put('/mark-all-read', async (_req: Request, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Delete notification
adminRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
export { adminRouter as adminNotificationRouter };
