import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ContentBlockImageUploaderProps {
    urls: string[]; // Changed from single url to array
    caption: string;
    onUrlsChange: (urls: string[]) => void; // Changed from onUrlChange
    onCaptionChange: (caption: string) => void;
}

/**
 * Multi-image uploader for content blocks with both Upload and URL modes.
 */
const ContentBlockImageUploader: React.FC<ContentBlockImageUploaderProps> = ({
    urls,
    caption,
    onUrlsChange,
    onCaptionChange,
}) => {
    const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesUpload = async (files: FileList) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validFiles = Array.from(files).filter(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name}: Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name}: File quá lớn. Tối đa 10MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setIsUploading(true);
        const newUrls: string[] = [];

        for (const file of validFiles) {
            try {
                const response = await uploadAPI.uploadImage(file);
                if (response.data.success) {
                    newUrls.push(response.data.data.url);
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Lỗi upload ${file.name}`);
            }
        }

        if (newUrls.length > 0) {
            onUrlsChange([...urls, ...newUrls]);
            toast.success(`Đã upload ${newUrls.length} ảnh`);
        }
        setIsUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFilesUpload(files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFilesUpload(files);
        }
        e.target.value = ''; // Reset input
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onUrlsChange([...urls, urlInput.trim()]);
            setUrlInput('');
            toast.success('Đã thêm URL ảnh');
        }
    };

    const removeImage = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        onUrlsChange(newUrls);
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        const newUrls = [...urls];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newUrls.length) return;
        [newUrls[index], newUrls[newIndex]] = [newUrls[newIndex], newUrls[index]];
        onUrlsChange(newUrls);
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
                <span className="text-xs dark:text-slate-500 light:text-slate-400 ml-2">
                    {urls.length} ảnh
                </span>
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
                        multiple
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
                                Kéo thả hoặc click để upload ảnh (chọn nhiều)
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

            {/* Images Grid */}
            {urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {urls.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-video dark:bg-background-dark light:bg-slate-100 rounded-lg overflow-hidden dark:border-border-dark light:border-border-light border"
                        >
                            <img
                                src={url}
                                alt={`Ảnh ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error';
                                }}
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveImage(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 bg-white/20 hover:bg-white/30 text-white rounded disabled:opacity-30"
                                    title="Di chuyển trước"
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveImage(index, 'down')}
                                    disabled={index === urls.length - 1}
                                    className="p-1 bg-white/20 hover:bg-white/30 text-white rounded disabled:opacity-30"
                                    title="Di chuyển sau"
                                >
                                    →
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-1 bg-red-500/80 hover:bg-red-500 text-white rounded"
                                    title="Xóa ảnh"
                                >
                                    ✕
                                </button>
                            </div>
                            {/* Index badge */}
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                                {index + 1}
                            </div>
                        </div>
                    ))}
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
