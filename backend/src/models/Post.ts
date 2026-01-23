import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

// Content block types
interface ITextBlock {
    type: 'text';
    content: string;
}

interface IImageBlock {
    type: 'image';
    url: string;
    caption?: string;
}

interface IVideoBlock {
    type: 'video';
    url: string;
    caption?: string;
}

interface ICarBlock {
    type: 'car';
    car: mongoose.Types.ObjectId;
    description?: string;
}

type IContentBlock = ITextBlock | IImageBlock | IVideoBlock | ICarBlock;

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    excerpt?: string;
    content: string; // Legacy - for simple text content
    coverImage?: string;

    // Categorization
    category: 'news' | 'review' | 'promotion' | 'event';
    tags: string[];

    // Related car (for review/CTA button)
    relatedCar?: mongoose.Types.ObjectId;

    // Content blocks for rich content
    contentBlocks: IContentBlock[];

    // Event-specific fields
    eventStartDate?: Date;
    eventEndDate?: Date;

    // Promotion-specific fields
    discountAmount?: number;
    discountPercent?: number;
    discountDescription?: string;

    // Status & Stats
    status: 'draft' | 'published';
    viewCount: number;

    // Dates
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
}

const contentBlockSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'car'],
            required: true,
        },
        content: String, // for text blocks
        url: String, // for image/video blocks
        caption: String, // for image/video blocks
        car: {
            type: Schema.Types.ObjectId,
            ref: 'Car',
        },
        description: String, // for car blocks
    },
    { _id: false }
);

const postSchema = new Schema<IPost>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 200,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        content: {
            type: String,
            default: '',
        },
        coverImage: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: ['news', 'review', 'promotion', 'event'],
            default: 'news',
        },
        tags: {
            type: [String],
            default: [],
        },
        relatedCar: {
            type: Schema.Types.ObjectId,
            ref: 'Car',
            default: null,
        },
        // Content blocks
        contentBlocks: {
            type: [contentBlockSchema],
            default: [],
        },
        // Event fields
        eventStartDate: {
            type: Date,
        },
        eventEndDate: {
            type: Date,
        },
        // Promotion fields
        discountAmount: {
            type: Number,
            min: 0,
        },
        discountPercent: {
            type: Number,
            min: 0,
            max: 100,
        },
        discountDescription: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        publishedAt: {
            type: Date,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Generate slug before saving
postSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        const timestamp = Date.now().toString(36);
        this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + timestamp;
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Indexes
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ relatedCar: 1 });
postSchema.index({ tags: 1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
