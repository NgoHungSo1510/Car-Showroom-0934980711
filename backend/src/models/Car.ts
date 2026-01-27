import mongoose, { Schema, Document } from 'mongoose';

// Color configuration for 3D model
interface IColorConfig {
  name: string;
  hexCode: string;
  meshNames: string[];
  isDefault?: boolean;
}

// 3D Model configuration
interface IModel3D {
  hasModel: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;

  // Camera settings
  cameraPosition: {
    x: number;
    y: number;
    z: number;
  };
  cameraTarget: {
    x: number;
    y: number;
    z: number;
  };

  // Lighting
  ambientLight: number;
  directionalLight: number;

  // Color options
  colorConfigs: IColorConfig[];

  // Interior support
  hasInterior: boolean;
  interiorMeshNames: string[];
}

// Car specifications
interface ISpecs {
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
}

// Section content (for interior/exterior)
interface ICarSection {
  title?: string;
  description?: string;
  images: string[];
}

// Color option with image
interface IColorOption {
  name: string;
  hexCode: string;
  image?: string;
}

export interface ICar extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  brand: mongoose.Types.ObjectId;
  carType: mongoose.Types.ObjectId;
  price: number;
  priceRange?: string;
  year?: number;

  // Description
  shortDescription?: string;
  description?: string;

  // Specifications
  specs: ISpecs;

  // Images (fallback when no 3D model)
  thumbnail?: string;
  gallery: string[];

  // NEW: Exterior section
  exterior: ICarSection;

  // NEW: Interior section
  interior: ICarSection;

  // NEW: Color options with images
  colorOptions: IColorOption[];

  // 3D Model Configuration
  model3D: IModel3D;

  // Status & Stats
  status: 'draft' | 'published';
  isFeatured: boolean;
  viewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const carSectionSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    images: { type: [String], default: [] },
  },
  { _id: false },
);

const colorOptionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    hexCode: { type: String, required: true },
    image: { type: String },
  },
  { _id: false },
);

const carSchema = new Schema<ICar>(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand is required'],
    },
    carType: {
      type: Schema.Types.ObjectId,
      ref: 'CarType',
      required: [true, 'Car type is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    priceRange: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
    },
    specs: {
      engine: String,
      power: String,
      torque: String,
      acceleration: String,
      topSpeed: String,
      range: String,
      fuelConsumption: String,
      seats: Number,
      dimensions: String,
      weight: String,
      transmission: String,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    gallery: {
      type: [String],
      default: [],
    },
    // NEW: Exterior section
    exterior: {
      type: carSectionSchema,
      default: { images: [] },
    },
    // NEW: Interior section
    interior: {
      type: carSectionSchema,
      default: { images: [] },
    },
    // NEW: Color options
    colorOptions: {
      type: [colorOptionSchema],
      default: [],
    },
    model3D: {
      hasModel: {
        type: Boolean,
        default: false,
      },
      fileUrl: String,
      fileName: String,
      fileSize: Number,
      cameraPosition: {
        x: { type: Number, default: 5 },
        y: { type: Number, default: 2 },
        z: { type: Number, default: 5 },
      },
      cameraTarget: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
      },
      ambientLight: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1,
      },
      directionalLight: {
        type: Number,
        default: 0.8,
        min: 0,
        max: 1,
      },
      colorConfigs: [
        {
          name: String,
          hexCode: String,
          meshNames: [String],
          isDefault: { type: Boolean, default: false },
        },
      ],
      hasInterior: {
        type: Boolean,
        default: false,
      },
      interiorMeshNames: {
        type: [String],
        default: [],
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Generate slug before saving
carSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const timestamp = Date.now().toString(36);
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      timestamp;
  }
  next();
});

// Indexes for better query performance
carSchema.index({ brand: 1, status: 1 });
carSchema.index({ carType: 1, status: 1 });
carSchema.index({ price: 1 });
carSchema.index({ status: 1, createdAt: -1 });

const Car = mongoose.model<ICar>('Car', carSchema);

export default Car;
