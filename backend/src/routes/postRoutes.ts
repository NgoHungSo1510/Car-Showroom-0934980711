import { Router } from 'express';
import {
    getPosts,
    getPost,
    getAdminPosts,
    getAdminPost,
    createPost,
    updatePost,
    deletePost,
} from '../controllers/postController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getPosts);
router.get('/:slug', getPost);

export default router;

// Admin routes (separate export)
export const adminPostRouter = Router();
adminPostRouter.use(protectAdmin);

adminPostRouter.get('/', getAdminPosts);
adminPostRouter.get('/:id', getAdminPost);
adminPostRouter.post('/', createPost);
adminPostRouter.put('/:id', updatePost);
adminPostRouter.delete('/:id', deletePost);
