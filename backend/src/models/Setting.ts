import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
    _id: mongoose.Types.ObjectId;
    key: string;
    value: string;
    description?: string;
    group?: string;
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
}

const settingSchema = new Schema<ISetting>(
    {
        key: {
            type: String,
            required: [true, 'Setting key is required'],
            unique: true,
            trim: true,
        },
        value: {
            type: String,
            required: [true, 'Setting value is required'],
        },
        description: {
            type: String,
            trim: true,
        },
        group: {
            type: String,
            default: 'general',
            enum: ['general', 'contact', 'social', 'seo', 'branding'],
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
        },
    },
    {
        timestamps: true,
    }
);

settingSchema.index({ group: 1 });

const Setting = mongoose.model<ISetting>('Setting', settingSchema);

export default Setting;
