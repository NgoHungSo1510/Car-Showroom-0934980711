import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    type: 'contact_car' | 'contact_post';
    refId: mongoose.Types.ObjectId;
    refTitle: string;
    refThumbnail?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        type: {
            type: String,
            enum: ['contact_car', 'contact_post'],
            required: true,
        },
        refId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'type',
        },
        refTitle: {
            type: String,
            required: true,
            trim: true,
        },
        refThumbnail: {
            type: String,
            default: '',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
