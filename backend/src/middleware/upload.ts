import multer from 'multer';
import path from 'path';

// Use memory storage for Cloudinary uploads
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for 3D models
const modelFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /glb|gltf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only 3D model files are allowed (.glb, .gltf)'));
  }
};

// Upload configurations with memory storage
export const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadModel = multer({
  storage: memoryStorage,
  fileFilter: modelFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for 3D models
  },
});

export const uploadImages = uploadImage.array('images', 10);
export const uploadSingleImage = uploadImage.single('image');
export const uploadSingleModel = uploadModel.single('model');
