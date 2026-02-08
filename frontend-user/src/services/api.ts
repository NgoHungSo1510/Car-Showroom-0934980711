import axios from 'axios';

// Use environment variable in production, fallback to /api for local development
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// ============ TYPES ============
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
}

export interface CarType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

// Car section for interior/exterior
export interface CarSection {
  title?: string;
  description?: string;
  images: string[];
}

// Color option with image
export interface ColorOption {
  name: string;
  hexCode: string;
  image?: string;
}

export interface Car {
  _id: string;
  name: string;
  slug: string;
  brand: Brand;
  carType: CarType;
  price: number;
  priceRange?: string;
  year?: number;
  shortDescription?: string;
  description?: string;
  specs: {
    engine?: string;
    power?: string;
    torque?: string;
    acceleration?: string;
    topSpeed?: string;
    range?: string;
    fuelConsumption?: string;
    seats?: number;
    dimensions?: string;
    weight?: string;
    transmission?: string;
  };
  thumbnail?: string;
  gallery: string[];
  // Exterior section
  exterior?: CarSection;
  // Interior section
  interior?: CarSection;
  // Color options with images
  colorOptions?: ColorOption[];
  model3D: {
    hasModel: boolean;
    fileUrl?: string;
    cameraPosition: { x: number; y: number; z: number };
    cameraTarget: { x: number; y: number; z: number };
    ambientLight: number;
    directionalLight: number;
    colorConfigs: {
      name: string;
      hexCode: string;
      meshNames: string[];
      isDefault?: boolean;
    }[];
    hasInterior: boolean;
  };
  status: 'draft' | 'published';
  isFeatured: boolean;
  viewCount: number;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'car';
  content?: string;
  url?: string; // legacy single image
  urls?: string[]; // multiple images
  caption?: string;
  car?: {
    _id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    price?: number;
  };
  description?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category: 'news' | 'review' | 'promotion' | 'event';
  tags: string[];
  relatedCar?: {
    _id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    brand?: {
      name: string;
      logo?: string;
    };
  };
  contentBlocks?: ContentBlock[];
  // Event fields
  eventStartDate?: string;
  eventEndDate?: string;
  // Promotion fields
  discountAmount?: number;
  discountPercent?: number;
  discountDescription?: string;
  status: 'draft' | 'published';
  viewCount: number;
  publishedAt?: string;
  createdBy?: {
    fullName: string;
    avatar?: string;
  };
}

export interface ZaloSettings {
  zalo_phone: string;
  zalo_greeting: string;
}

// ============ PUBLIC APIs ============
export const postsAPI = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get<{
      success: boolean;
      data: Post[];
      pagination: { page: number; total: number; pages: number };
    }>('/posts', { params }),

  getBySlug: (slug: string) => api.get<{ success: boolean; data: Post }>(`/posts/${slug}`),
};

export const carsAPI = {
  getAll: (params?: {
    brand?: string;
    carType?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{
      success: boolean;
      data: Car[];
      pagination: { page: number; total: number; pages: number };
    }>('/cars', { params }),

  getBySlug: (slug: string) => api.get<{ success: boolean; data: Car }>(`/cars/${slug}`),

  getRelatedPosts: (carId: string) =>
    api.get<{ success: boolean; data: Post[] }>(`/cars/${carId}/related-posts`),
};

export const brandsAPI = {
  getAll: () => api.get<{ success: boolean; data: Brand[] }>('/brands'),
};

export const carTypesAPI = {
  getAll: () => api.get<{ success: boolean; data: CarType[] }>('/car-types'),
};

export const settingsAPI = {
  getZalo: () => api.get<{ success: boolean; data: ZaloSettings }>('/settings/zalo'),
  getBranding: () =>
    api.get<{
      success: boolean;
      data: {
        site_name: string;
        site_logo: string;
        site_hotline: string;
        site_address_1: string;
        site_address_2: string;
      };
    }>('/settings/branding'),
};

// ============ NOTIFICATIONS API ============
export const notificationsAPI = {
  contact: (data: {
    type: 'contact_car' | 'contact_post';
    refId: string;
    refTitle: string;
    refThumbnail?: string;
  }) => api.post('/notifications/contact', data),
};
