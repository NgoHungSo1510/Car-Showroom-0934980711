import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';

// Routes imports
import authRoutes from './routes/authRoutes.js';
import carRoutes, { adminCarRouter } from './routes/carRoutes.js';
import postRoutes, { adminPostRouter } from './routes/postRoutes.js';
import {
    brandRouter,
    carTypeRouter,
    settingsRouter,
    adminBrandRouter,
    adminCarTypeRouter,
    adminSettingsRouter,
} from './routes/commonRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes, { adminNotificationRouter } from './routes/notificationRoutes.js';
import facebookRoutes from './routes/facebookRoutes.js';

// Load env vars
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

// Initialize express
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
    cors({
        origin: [
            'http://localhost:5173', // Vite default
            'http://localhost:5174', // Second Vite app
            'http://localhost:3000',
            process.env.FRONTEND_USER_URL || '',
            process.env.FRONTEND_ADMIN_URL || '',
        ].filter(Boolean),
        credentials: true,
    })
);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// === PUBLIC API ROUTES ===
app.use('/api/posts', postRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/brands', brandRouter);
app.use('/api/car-types', carTypeRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/webhook/facebook', facebookRoutes);

// === ADMIN API ROUTES ===
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/posts', adminPostRouter);
app.use('/api/admin/cars', adminCarRouter);
app.use('/api/admin/brands', adminBrandRouter);
app.use('/api/admin/car-types', adminCarTypeRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/notifications', adminNotificationRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
🚀 Server is running!
📡 API: http://localhost:${PORT}/api
🔧 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
