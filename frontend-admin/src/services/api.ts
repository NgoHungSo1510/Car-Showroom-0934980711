import axios from 'axios';

// Use environment variable in production, fallback to /api for local development
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ============ AUTH API ============
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/admin/auth/login', { username, password }),

  getMe: () => api.get('/admin/auth/me'),

  logout: () => api.post('/admin/auth/logout'),

  updateProfile: (data: { fullName?: string; email?: string; avatar?: string }) =>
    api.put('/admin/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/admin/auth/password', { currentPassword, newPassword }),
};

// ============ DASHBOARD API ============
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard'),
  getActivity: () => api.get('/admin/activity'),
};

// ============ CARS API ============
export interface CarSection {
  title?: string;
  description?: string;
  images: string[];
}

export interface ColorOption {
  name: string;
  hexCode: string;
  image?: string;
}

export interface CarInput {
  name: string;
  brand: string;
  carType: string;
  price: number;
  priceRange?: string;
  year?: number;
  shortDescription?: string;
  description?: string;
  specs?: Record<string, string | number>;
  thumbnail?: string;
  gallery?: string[];
  exterior?: CarSection;
  interior?: CarSection;
  colorOptions?: ColorOption[];
  status?: 'draft' | 'published';
  isFeatured?: boolean;
}

export const carsAPI = {
  getAll: (params?: Record<string, string | number>) => api.get('/admin/cars', { params }),

  getById: (id: string) => api.get(`/admin/cars/${id}`),

  create: (data: CarInput) => api.post('/admin/cars', data),

  update: (id: string, data: Partial<CarInput>) => api.put(`/admin/cars/${id}`, data),

  delete: (id: string) => api.delete(`/admin/cars/${id}`),

  update3DConfig: (id: string, model3D: Record<string, unknown>) =>
    api.put(`/admin/cars/${id}/3d-config`, { model3D }),

  upload3DModel: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('model', file);
    return api.post(`/admin/cars/${id}/upload-3d`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ POSTS API ============
export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'car';
  content?: string; // for text blocks
  url?: string; // for image/video blocks
  caption?: string; // for image/video blocks
  car?: string; // car ID for car blocks
  description?: string; // for car blocks
}

export interface PostInput {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: 'news' | 'review' | 'promotion' | 'event';
  tags?: string[];
  relatedCar?: string | null;
  status?: 'draft' | 'published';
  // Content blocks
  contentBlocks?: ContentBlock[];
  // Event fields
  eventStartDate?: string;
  eventEndDate?: string;
  // Promotion fields
  discountAmount?: number;
  discountPercent?: number;
  discountDescription?: string;
}

export const postsAPI = {
  getAll: (params?: Record<string, string | number>) => api.get('/admin/posts', { params }),

  getById: (id: string) => api.get(`/admin/posts/${id}`),

  create: (data: PostInput) => api.post('/admin/posts', data),

  update: (id: string, data: Partial<PostInput>) => api.put(`/admin/posts/${id}`, data),

  delete: (id: string) => api.delete(`/admin/posts/${id}`),

  getAllTags: () => api.get('/admin/posts/tags'),
};

// ============ BRANDS API ============
export const brandsAPI = {
  getAll: () => api.get('/admin/brands'),
  create: (data: { name: string; country?: string; logo?: string }) =>
    api.post('/admin/brands', data),
  update: (
    id: string,
    data: { name?: string; country?: string; logo?: string; isActive?: boolean },
  ) => api.put(`/admin/brands/${id}`, data),
  delete: (id: string) => api.delete(`/admin/brands/${id}`),
};

// ============ CAR TYPES API ============
export const carTypesAPI = {
  getAll: () => api.get('/admin/car-types'),
  create: (data: { name: string; description?: string }) => api.post('/admin/car-types', data),
  update: (id: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    api.put(`/admin/car-types/${id}`, data),
  delete: (id: string) => api.delete(`/admin/car-types/${id}`),
};

// ============ SETTINGS API ============
export const settingsAPI = {
  getAll: (group?: string) => api.get('/admin/settings', { params: { group } }),
  update: (key: string, value: string, description?: string, group?: string) =>
    api.put(`/admin/settings/${key}`, { value, description, group }),
};

// ============ UPLOAD API ============
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/admin/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadModel: (file: File) => {
    const formData = new FormData();
    formData.append('model', file);
    return api.post('/admin/upload/model', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ NOTIFICATIONS API ============
export const notificationsAPI = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/notifications', { params }),

  getUnreadCount: () =>
    api.get<{ success: boolean; count: number }>('/admin/notifications/unread-count'),

  getById: (id: string) => api.get(`/admin/notifications/${id}`),

  markAsRead: (id: string) => api.put(`/admin/notifications/${id}/read`),

  markAllAsRead: () => api.put('/admin/notifications/mark-all-read'),

  delete: (id: string) => api.delete(`/admin/notifications/${id}`),
};

// ============ FACEBOOK SYNC API ============
export interface FacebookSyncStatus {
  isConfigured: boolean;
  connectionStatus: 'not_configured' | 'connected' | 'error';
  pageInfo?: {
    id: string;
    name: string;
    fan_count?: number;
    picture?: { data: { url: string } };
  };
  syncedPostsCount: number;
  history: Array<{
    syncedAt: string;
    postsFound: number;
    postsCreated: number;
    postsSkipped: number;
    errors: string[];
  }>;
  autoSync?: {
    enabled: boolean;
    intervalMinutes: number;
    autoPublish: boolean;
    lastSync?: string;
  };
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  images: string[];
  synced: boolean;
}

export interface SyncedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
}

export interface FacebookSyncResult {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
  posts: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    fbPostId: string;
  }>;
}

export const facebookAPI = {
  // Get sync status and connection info
  getStatus: () =>
    api.get<{ success: boolean; data: FacebookSyncStatus }>('/webhook/facebook/status'),

  // Get list of Facebook posts with sync status
  getPosts: (limit: number = 50) =>
    api.get<{
      success: boolean;
      data: { posts: FacebookPost[]; total: number; synced: number; unsynced: number };
    }>('/webhook/facebook/posts', { params: { limit } }),

  // Sync a single post
  syncSingle: (fbPostId: string, message: string, images: string[], autoPublish: boolean = false) =>
    api.post<{ success: boolean; message: string; data: { post: SyncedPost } }>(
      '/webhook/facebook/sync-single',
      { fbPostId, message, images, autoPublish },
    ),

  // Sync multiple posts
  syncMultiple: (
    posts: Array<{ id: string; message: string; images: string[]; full_picture?: string }>,
    autoPublish: boolean = false,
  ) =>
    api.post<{
      success: boolean;
      message: string;
      data: { total: number; created: number; errors: string[]; createdPosts: any[] };
    }>('/webhook/facebook/sync-multiple', { posts, autoPublish }),

  // Get synced posts
  getSyncedPosts: (page: number = 1, limit: number = 20) =>
    api.get<{
      success: boolean;
      data: {
        posts: SyncedPost[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    }>('/webhook/facebook/synced-posts', { params: { page, limit } }),

  // Configure auto sync
  setAutoSync: (enabled: boolean, intervalMinutes: number = 30, autoPublish: boolean = false) =>
    api.post<{
      success: boolean;
      message: string;
      data: { enabled: boolean; intervalMinutes: number; autoPublish: boolean };
    }>('/webhook/facebook/auto-sync', { enabled, intervalMinutes, autoPublish }),

  // Legacy: Sync posts from Facebook Page (batch)
  syncPosts: (limit: number = 10, autoPublish: boolean = false) =>
    api.post<{ success: boolean; message: string; data: FacebookSyncResult }>(
      '/webhook/facebook/sync',
      { limit, autoPublish },
    ),

  // Manual import a single post
  importPost: (content: string, images?: string[], autoPublish?: boolean) =>
    api.post('/webhook/facebook/import', { content, images, autoPublish }),

  // Test AI classification
  testAI: (content: string, images?: string[]) =>
    api.post('/webhook/facebook/test-ai', { content, images }),

  // Publish a post from website to Facebook
  publishToFacebook: (postId: string) =>
    api.post<{
      success: boolean;
      message: string;
      data: { postId: string; facebookPostId: string; facebookUrl: string };
    }>('/webhook/facebook/publish', { postId }),

  // Publish multiple posts to Facebook
  publishBatch: (postIds: string[]) =>
    api.post<{
      success: boolean;
      message: string;
      data: { total: number; published: number; skipped: number; errors: string[] };
    }>('/webhook/facebook/publish-batch', { postIds }),
};
