import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ContentBlockImageUploaderProps {
    url: string;
    caption: string;
    onUrlChange: (url: string) => void;
    onCaptionChange: (caption: string) => void;
}

/**
 * Image uploader for content blocks with both Upload and URL modes.
 */
const ContentBlockImageUploader: React.FC<ContentBlockImageUploaderProps> = ({
    url,
    caption,
    onUrlChange,
    onCaptionChange,
}) => {
    const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File quá lớn. Tối đa 10MB');
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadAPI.uploadImage(file);
            if (response.data.success) {
                onUrlChange(response.data.data.url);
                toast.success('Upload ảnh thành công!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi upload ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onUrlChange(urlInput.trim());
            setUrlInput('');
            toast.success('Đã cập nhật URL ảnh');
        }
    };

    return (
        <div className="space-y-3">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${inputMode === 'upload'
                            ? 'bg-green-600 text-white'
                            : 'dark:bg-slate-700 light:bg-slate-200 dark:text-slate-400 light:text-slate-500'
                        }`}
                >
                    📤 Upload
                </button>
                <button
                    type="button"
                    onClick={() => setInputMode('url')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${inputMode === 'url'
                            ? 'bg-green-600 text-white'
                            : 'dark:bg-slate-700 light:bg-slate-200 dark:text-slate-400 light:text-slate-500'
                        }`}
                >
                    🔗 URL
                </button>
            </div>

            {/* Upload or URL Input */}
            {inputMode === 'upload' ? (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
            dark:border-slate-600 light:border-slate-300 hover:dark:border-green-500 hover:light:border-green-500
            ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="size-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm dark:text-slate-400 light:text-slate-500">Đang upload...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">📷</span>
                            <span className="text-sm dark:text-slate-400 light:text-slate-500">
                                Kéo thả hoặc click để upload ảnh
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                        className="flex-1 dark:bg-slate-800 light:bg-white dark:border-border-dark light:border-border-light border rounded-lg px-3 py-2 text-sm dark:text-white light:text-text-light"
                        placeholder="https://example.com/image.jpg"
                    />
                    <button
                        type="button"
                        onClick={handleUrlSubmit}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                        Thêm
                    </button>
                </div>
            )}

            {/* Preview */}
            {url && (
                <div className="relative">
                    <img
                        src={url}
                        alt="Preview"
                        className="max-h-40 rounded-lg object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Error';
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onUrlChange('')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Caption */}
            <input
                type="text"
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                className="w-full dark:bg-slate-800 light:bg-white dark:border-border-dark light:border-border-light border rounded-lg px-3 py-2 dark:text-white light:text-text-light text-sm focus:ring-primary focus:border-primary"
                placeholder="Chú thích ảnh (không bắt buộc)"
            />
        </div>
    );
};

export default ContentBlockImageUploader;
