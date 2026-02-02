import React, { useState, useRef, useCallback } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

interface MiniImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    /** Size variant: 'sm' for small icons/avatars, 'md' for medium logos */
    size?: 'sm' | 'md';
    /** Shape variant: 'square' for logos, 'circle' for avatars */
    shape?: 'square' | 'circle';
}

/**
 * Compact image uploader with both Upload and URL input modes.
 * Suitable for small images like logos, avatars, favicons.
 */
const MiniImageUploader: React.FC<MiniImageUploaderProps> = ({
    value,
    onChange,
    label = 'Ảnh',
    placeholder = 'https://example.com/image.png',
    size = 'md',
    shape = 'square',
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'size-16',
        md: 'size-20',
    };

    const shapeClasses = {
        square: 'rounded-xl',
        circle: 'rounded-full',
    };

    const handleFileUpload = async (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP, SVG, ICO)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File quá lớn. Tối đa 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadAPI.uploadImage(file);
            if (response.data.success) {
                onChange(response.data.data.url);
                toast.success('Upload ảnh thành công!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi upload ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput('');
            toast.success('Đã cập nhật URL ảnh');
        }
    };

    const handleClear = () => {
        onChange('');
        toast.success('Đã xóa ảnh');
    };

    return (
        <div className="space-y-3">
            {/* Label + Mode Toggle */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600">
                    {label}
                </label>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setInputMode('upload')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${inputMode === 'upload'
                                ? 'bg-primary text-white'
                                : 'dark:bg-background-dark light:bg-slate-100 dark:text-slate-400 light:text-slate-500 hover:dark:text-white hover:light:text-text-light'
                            }`}
                    >
                        📤 Upload
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode('url')}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${inputMode === 'url'
                                ? 'bg-primary text-white'
                                : 'dark:bg-background-dark light:bg-slate-100 dark:text-slate-400 light:text-slate-500 hover:dark:text-white hover:light:text-text-light'
                            }`}
                    >
                        🔗 URL
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex items-center gap-4">
                {/* Preview Box / Upload Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputMode === 'upload' && fileInputRef.current?.click()}
                    className={`relative ${sizeClasses[size]} ${shapeClasses[shape]} border-2 border-dashed 
            ${isDragging ? 'border-primary bg-primary/10' : 'dark:border-border-dark light:border-border-light'} 
            flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group
            ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                    {value ? (
                        <>
                            <img
                                src={value}
                                alt="Preview"
                                className="size-full object-contain p-1"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                            </div>
                        </>
                    ) : isUploading ? (
                        <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <div className="text-center">
                            <span className="material-symbols-outlined text-slate-400 text-[24px]">cloud_upload</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* URL Input or Info */}
                <div className="flex-1 space-y-2">
                    {inputMode === 'url' ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                                className="flex-1 dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-3 py-2 text-sm dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
                                placeholder={placeholder}
                            />
                            <button
                                type="button"
                                onClick={handleUrlSubmit}
                                className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-accent-blue transition-colors"
                            >
                                Thêm
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs dark:text-slate-500 light:text-slate-400">
                            Kéo thả hoặc click để upload ảnh
                        </p>
                    )}

                    {value && (
                        <div className="flex items-center gap-2">
                            <p className="text-xs dark:text-slate-500 light:text-slate-400 truncate flex-1 max-w-[200px]">
                                {value}
                            </p>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiniImageUploader;
