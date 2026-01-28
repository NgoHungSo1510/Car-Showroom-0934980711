import React, { useState, useRef } from 'react';
import { uploadAPI, ColorOption } from '../services/api';
import toast from 'react-hot-toast';

// Danh sách màu phổ biến cho xe hơi
const PRESET_COLORS = [
    { name: 'Trắng Ngọc Trai', hexCode: '#F5F5F5' },
    { name: 'Trắng Tinh Khiết', hexCode: '#FFFFFF' },
    { name: 'Đen Huyền Bí', hexCode: '#1A1A1A' },
    { name: 'Đen Bóng', hexCode: '#000000' },
    { name: 'Xám Bạc', hexCode: '#C0C0C0' },
    { name: 'Xám Titan', hexCode: '#808080' },
    { name: 'Xám Kim Loại', hexCode: '#6B7280' },
    { name: 'Đỏ Đô', hexCode: '#8B0000' },
    { name: 'Đỏ Ruby', hexCode: '#DC2626' },
    { name: 'Đỏ Cam', hexCode: '#EA580C' },
    { name: 'Xanh Dương', hexCode: '#2563EB' },
    { name: 'Xanh Navy', hexCode: '#1E3A8A' },
    { name: 'Xanh Đại Dương', hexCode: '#0284C7' },
    { name: 'Xanh Lá', hexCode: '#16A34A' },
    { name: 'Xanh Olive', hexCode: '#4D7C0F' },
    { name: 'Nâu Đồng', hexCode: '#92400E' },
    { name: 'Nâu Cafe', hexCode: '#78350F' },
    { name: 'Vàng Champagne', hexCode: '#F59E0B' },
    { name: 'Vàng Kim', hexCode: '#EAB308' },
    { name: 'Cam Sunset', hexCode: '#F97316' },
    { name: 'Tím Violet', hexCode: '#7C3AED' },
    { name: 'Hồng', hexCode: '#EC4899' },
];

// VinFast specific colors
const VINFAST_COLORS = [
    { name: 'Xanh Lục Bảo (Emerald Green)', hexCode: '#064E3B' },
    { name: 'Đỏ Crimson (Crimson Red)', hexCode: '#991B1B' },
    { name: 'Xám Neptune (Neptune Grey)', hexCode: '#4B5563' },
    { name: 'Trắng Brahminy (Brahminy White)', hexCode: '#F9FAFB' },
    { name: 'Đen Cosmos (Cosmos Black)', hexCode: '#111827' },
    { name: 'Xanh Deepsea (Deepsea Blue)', hexCode: '#1E40AF' },
    { name: 'Xanh Venus (Venus Blue)', hexCode: '#3B82F6' },
];

interface ColorSuggestionsProps {
    colorOptions: ColorOption[];
    onAddColor: (color: ColorOption) => void;
    onRemoveColor: (index: number) => void;
    onUpdateColorImage: (index: number, imageUrl: string) => void;
    carName?: string;
}

const ColorSuggestions: React.FC<ColorSuggestionsProps> = ({
    colorOptions,
    onAddColor,
    onRemoveColor,
    onUpdateColorImage,
    carName = '',
}) => {
    const [showPresets, setShowPresets] = useState(false);
    const [customColorName, setCustomColorName] = useState('');
    const [customHexCode, setCustomHexCode] = useState('#FFFFFF');
    const [customImageUrl, setCustomImageUrl] = useState('');
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    // Detect if VinFast car
    const isVinFast = carName.toLowerCase().includes('vinfast') || carName.toLowerCase().includes('vf');

    const handleAddPresetColor = (preset: { name: string; hexCode: string }) => {
        // Check if color already exists
        const exists = colorOptions.some(
            (c) => c.name.toLowerCase() === preset.name.toLowerCase() || c.hexCode === preset.hexCode
        );
        if (exists) {
            toast.error('Màu này đã tồn tại');
            return;
        }
        onAddColor({ name: preset.name, hexCode: preset.hexCode });
        toast.success(`Đã thêm màu "${preset.name}"`);
    };

    const handleAddCustomColor = () => {
        if (!customColorName.trim()) {
            toast.error('Vui lòng nhập tên màu');
            return;
        }
        onAddColor({
            name: customColorName.trim(),
            hexCode: customHexCode,
            image: customImageUrl.trim() || undefined,
        });
        setCustomColorName('');
        setCustomHexCode('#FFFFFF');
        setCustomImageUrl('');
        toast.success('Đã thêm màu tùy chỉnh');
    };

    const handleUploadImage = async (index: number, file: File) => {
        setUploadingIndex(index);
        try {
            const response = await uploadAPI.uploadImage(file);
            if (response.data.success) {
                onUpdateColorImage(index, response.data.data.url);
                toast.success('Đã upload ảnh cho màu');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi upload ảnh');
        }
        setUploadingIndex(null);
    };

    return (
        <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold dark:text-white light:text-text-light">🎨 Tùy chọn màu sắc</h3>
                <span className="text-sm dark:text-slate-400 light:text-slate-500">
                    {colorOptions.length} màu
                </span>
            </div>
            <p className="text-xs dark:text-slate-500 light:text-slate-400 mb-4">
                Chọn màu từ danh sách gợi ý hoặc tự thêm màu tùy chỉnh. Sau đó thêm ảnh xe với màu tương ứng.
            </p>

            {/* Quick add preset colors */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {showPresets ? 'expand_less' : 'expand_more'}
                    </span>
                    {showPresets ? 'Ẩn bảng màu gợi ý' : 'Xem màu gợi ý phổ biến'}
                </button>

                {showPresets && (
                    <div className="mt-4 space-y-4">
                        {/* VinFast specific colors if applicable */}
                        {isVinFast && (
                            <div>
                                <p className="text-xs font-bold text-primary mb-2">🚗 Màu VinFast chính hãng:</p>
                                <div className="flex flex-wrap gap-2">
                                    {VINFAST_COLORS.map((color) => (
                                        <button
                                            key={color.hexCode}
                                            type="button"
                                            onClick={() => handleAddPresetColor(color)}
                                            className="flex items-center gap-2 px-3 py-1.5 dark:bg-background-dark light:bg-slate-100 dark:hover:bg-slate-700 light:hover:bg-slate-200 rounded-full text-xs transition-colors border dark:border-border-dark light:border-border-light"
                                            title={color.name}
                                        >
                                            <span
                                                className="w-4 h-4 rounded-full border dark:border-white/30 light:border-black/20"
                                                style={{ backgroundColor: color.hexCode }}
                                            />
                                            <span className="dark:text-white light:text-text-light">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular colors */}
                        <div>
                            <p className="text-xs font-bold dark:text-slate-300 light:text-slate-600 mb-2">
                                🌈 Màu phổ biến:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color.hexCode}
                                        type="button"
                                        onClick={() => handleAddPresetColor(color)}
                                        className="flex items-center gap-2 px-3 py-1.5 dark:bg-background-dark light:bg-slate-100 dark:hover:bg-slate-700 light:hover:bg-slate-200 rounded-full text-xs transition-colors border dark:border-border-dark light:border-border-light"
                                        title={color.name}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full border dark:border-white/30 light:border-black/20"
                                            style={{ backgroundColor: color.hexCode }}
                                        />
                                        <span className="dark:text-white light:text-text-light max-w-[100px] truncate">
                                            {color.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom color input */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 p-4 dark:bg-background-dark light:bg-slate-50 rounded-lg border dark:border-border-dark light:border-border-light">
                <div>
                    <label className="block text-xs dark:text-slate-400 light:text-slate-500 mb-1">
                        Tên màu tùy chỉnh
                    </label>
                    <input
                        type="text"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        className="w-full dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-lg px-3 py-2 dark:text-white light:text-text-light text-sm"
                        placeholder="VD: Xanh Ngọc Bích"
                    />
                </div>
                <div>
                    <label className="block text-xs dark:text-slate-400 light:text-slate-500 mb-1">
                        Mã màu
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={customHexCode}
                            onChange={(e) => setCustomHexCode(e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer border-0"
                        />
                        <input
                            type="text"
                            value={customHexCode}
                            onChange={(e) => {
                                if (e.target.value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                                    setCustomHexCode(e.target.value);
                                }
                            }}
                            className="flex-1 dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-lg px-3 py-2 dark:text-white light:text-text-light text-sm font-mono"
                            placeholder="#FFFFFF"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs dark:text-slate-400 light:text-slate-500 mb-1">
                        URL ảnh (tùy chọn)
                    </label>
                    <input
                        type="text"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="w-full dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-lg px-3 py-2 dark:text-white light:text-text-light text-sm"
                        placeholder="https://..."
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={handleAddCustomColor}
                        className="w-full px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        + Thêm màu
                    </button>
                </div>
            </div>

            {/* Color options list */}
            {colorOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colorOptions.map((color, index) => (
                        <div
                            key={index}
                            className="relative group dark:bg-background-dark light:bg-slate-50 rounded-xl overflow-hidden border dark:border-border-dark light:border-border-light"
                        >
                            {/* Color image or placeholder */}
                            <div className="relative aspect-video">
                                {color.image ? (
                                    <img
                                        src={color.image}
                                        alt={color.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center"
                                        style={{ backgroundColor: color.hexCode }}
                                    >
                                        <span className="text-3xl drop-shadow-lg">🚗</span>
                                    </div>
                                )}

                                {/* Upload overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <input
                                        ref={(el) => (fileInputRefs.current[index] = el)}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadImage(index, file);
                                            e.target.value = '';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                        disabled={uploadingIndex === index}
                                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        {uploadingIndex === index ? '⏳ Uploading...' : '📤 Upload ảnh'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveColor(index)}
                                        className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors"
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>

                                {/* Loading overlay */}
                                {uploadingIndex === index && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <div className="size-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Color info */}
                            <div className="p-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-5 h-5 rounded-full border dark:border-white/30 light:border-black/20 flex-shrink-0"
                                        style={{ backgroundColor: color.hexCode }}
                                    />
                                    <span className="text-sm font-medium dark:text-white light:text-text-light truncate">
                                        {color.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs dark:text-slate-500 light:text-slate-400 font-mono">
                                        {color.hexCode}
                                    </span>
                                    {color.image && (
                                        <span className="text-xs text-green-500">✓ Có ảnh</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 dark:text-slate-500 light:text-slate-400">
                    <p className="text-4xl mb-2">🎨</p>
                    <p className="text-sm">Chưa có tùy chọn màu nào</p>
                    <p className="text-xs mt-1">Chọn từ danh sách gợi ý hoặc thêm màu tùy chỉnh</p>
                </div>
            )}
        </div>
    );
};

export default ColorSuggestions;
