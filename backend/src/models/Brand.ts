import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Generate slug before saving
brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Brand = mongoose.model<IBrand>('Brand', brandSchema);

export default Brand;
