import React, { useState, useRef, useCallback } from 'react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Ảnh bìa',
  placeholder = 'Nhập URL hoặc kéo thả ảnh vào đây',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 10MB');
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

  return (
    <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600">{label}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${inputMode === 'upload'
                ? 'bg-primary text-white'
                : 'dark:bg-background-dark light:bg-slate-100 dark:text-slate-400 light:text-slate-500 dark:hover:text-white light:hover:text-text-light'
              }`}
          >
            📤 Upload
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${inputMode === 'url'
                ? 'bg-primary text-white'
                : 'dark:bg-background-dark light:bg-slate-100 dark:text-slate-400 light:text-slate-500 dark:hover:text-white light:hover:text-text-light'
              }`}
          >
            🔗 URL
          </button>
        </div>
      </div>

      {inputMode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging
              ? 'border-primary bg-primary/10'
              : 'dark:border-border-dark light:border-border-light dark:hover:border-primary/50 light:hover:border-primary/50'
            } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm dark:text-slate-400 light:text-slate-500">Đang upload...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl">📷</div>
              <p className="dark:text-slate-400 light:text-slate-500 text-sm">{placeholder}</p>
              <p className="dark:text-slate-500 light:text-slate-400 text-xs">Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB)</p>
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
            className="flex-1 dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent-blue transition-colors"
          >
            Thêm
          </button>
        </div>
      )}

      {/* Preview - Show when image is set */}
      {value ? (
        <div className="mt-4">
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-2xl rounded-xl object-cover dark:border-border-dark light:border-border-light border"
            style={{ maxHeight: '300px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/600x300?text=Image+Error';
            }}
          />
          <p className="mt-3 text-xs dark:text-slate-500 light:text-slate-400 truncate">{value}</p>
          <p className="mt-1 text-xs text-amber-400/80">
            💡 Lưu ý: Chỉ 1 ảnh bìa được hiển thị. Upload ảnh mới sẽ thay thế ảnh hiện tại.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs dark:text-slate-500 light:text-slate-400">
          💡 Ảnh bìa sẽ hiển thị trên card và đầu bài viết. Nên dùng ảnh tỷ lệ 16:9.
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
