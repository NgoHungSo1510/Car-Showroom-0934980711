import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsAPI, brandsAPI, carTypesAPI, CarInput, ColorOption, uploadAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';

const CarEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id && id !== 'new';

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [formData, setFormData] = useState<CarInput>({
    name: '',
    brand: '',
    carType: '',
    price: 0,
    priceRange: '',
    year: new Date().getFullYear(),
    shortDescription: '',
    description: '',
    specs: {},
    thumbnail: '',
    gallery: [],
    exterior: { images: [] },
    interior: { images: [] },
    colorOptions: [],
    status: 'draft',
    isFeatured: false,
  });

  // Refs for section image uploads
  const exteriorFileInputRef = useRef<HTMLInputElement>(null);
  const interiorFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingExterior, setIsUploadingExterior] = useState(false);
  const [isUploadingInterior, setIsUploadingInterior] = useState(false);

  // Fetch car if editing
  const { data: carData, isLoading } = useQuery({
    queryKey: ['admin-car', id],
    queryFn: async () => {
      const response = await carsAPI.getById(id!);
      return response.data.data;
    },
    enabled: isEditing,
  });

  // Fetch brands and types
  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const response = await brandsAPI.getAll();
      return response.data.data;
    },
  });

  const { data: carTypesData } = useQuery({
    queryKey: ['admin-car-types'],
    queryFn: async () => {
      const response = await carTypesAPI.getAll();
      return response.data.data;
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (carData) {
      setFormData({
        name: carData.name,
        brand: carData.brand?._id || '',
        carType: carData.carType?._id || '',
        price: carData.price,
        priceRange: carData.priceRange || '',
        year: carData.year || new Date().getFullYear(),
        shortDescription: carData.shortDescription || '',
        description: carData.description || '',
        specs: carData.specs || {},
        thumbnail: carData.thumbnail || '',
        gallery: carData.gallery || [],
        exterior: carData.exterior || { images: [] },
        interior: carData.interior || { images: [] },
        colorOptions: carData.colorOptions || [],
        status: carData.status,
        isFeatured: carData.isFeatured,
      });
    }
  }, [carData]);

  // Create/Update mutations
  const saveMutation = useMutation({
    mutationFn: async (data: CarInput) => {
      if (isEditing) {
        return carsAPI.update(id!, data);
      }
      return carsAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast.success(isEditing ? 'Đã cập nhật xe' : 'Đã thêm xe mới');
      navigate('/cars');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên xe');
      return;
    }
    if (!formData.brand) {
      toast.error('Vui lòng chọn hãng xe');
      return;
    }
    if (!formData.carType) {
      toast.error('Vui lòng chọn loại xe');
      return;
    }
    saveMutation.mutate({ ...formData, status });
  };

  const updateSpecs = (key: string, value: string | number) => {
    setFormData({
      ...formData,
      specs: { ...formData.specs, [key]: value },
    });
  };

  const brands = brandsData || [];
  const carTypes = carTypesData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{isEditing ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h2>
        <button
          onClick={() => navigate('/cars')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Thông tin cơ bản</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Tên xe *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: VinFast VF8 Plus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Hãng xe *</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
              >
                <option value="">-- Chọn hãng --</option>
                {brands.map((brand: { _id: string; name: string }) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Loại xe *</label>
              <select
                value={formData.carType}
                onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
              >
                <option value="">-- Chọn loại --</option>
                {carTypes.map((type: { _id: string; name: string }) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Giá (VNĐ) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                placeholder="500000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Khoảng giá</label>
              <input
                type="text"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: 500 - 700 triệu"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-300">Đánh dấu là xe nổi bật (Featured)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Thumbnail Image - Using ImageUploader */}
        <ImageUploader
          value={formData.thumbnail || ''}
          onChange={(url) => setFormData({ ...formData, thumbnail: url })}
          label="Ảnh đại diện (Thumbnail)"
          placeholder="Kéo thả ảnh vào đây hoặc click để chọn file"
        />

        {/* Gallery Images */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Thư viện ảnh thực tế</h3>
            <span className="text-sm text-slate-400">{formData.gallery?.length || 0} ảnh</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Thêm các ảnh chụp thực tế của xe từ nhiều góc độ. Ảnh sẽ hiển thị trong gallery cho
            người dùng xem.
          </p>

          {/* Add Image - Two options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Option 1: Upload file */}
            <div className="relative">
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  setIsUploadingGallery(true);
                  const newUrls: string[] = [];

                  for (const file of Array.from(files)) {
                    try {
                      const response = await uploadAPI.uploadImage(file);
                      if (response.data.success) {
                        newUrls.push(response.data.data.url);
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      toast.error(`Lỗi upload: ${file.name}`);
                    }
                  }

                  if (newUrls.length > 0) {
                    setFormData({
                      ...formData,
                      gallery: [...(formData.gallery || []), ...newUrls],
                    });
                    toast.success(`Đã upload ${newUrls.length} ảnh`);
                  }
                  setIsUploadingGallery(false);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={isUploadingGallery}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploadingGallery ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang upload...
                  </>
                ) : (
                  <>📤 Upload ảnh (chọn nhiều)</>
                )}
              </button>
            </div>

            {/* Option 2: URL input */}
            <div className="flex gap-2">
              <input
                type="text"
                id="gallery-url-input"
                className="flex-1 bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary text-sm"
                placeholder="Hoặc nhập URL ảnh..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const url = input.value.trim();
                    if (url) {
                      setFormData({
                        ...formData,
                        gallery: [...(formData.gallery || []), url],
                      });
                      input.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('gallery-url-input') as HTMLInputElement;
                  const url = input.value.trim();
                  if (url) {
                    setFormData({
                      ...formData,
                      gallery: [...(formData.gallery || []), url],
                    });
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-primary hover:bg-accent-blue text-white text-sm rounded-lg transition-colors"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {formData.gallery && formData.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {formData.gallery.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-video bg-background-dark rounded-lg overflow-hidden border border-border-dark"
                >
                  <img
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/300x200?text=Error';
                    }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Move up
                        if (index > 0) {
                          const newGallery = [...formData.gallery!];
                          [newGallery[index - 1], newGallery[index]] = [
                            newGallery[index],
                            newGallery[index - 1],
                          ];
                          setFormData({ ...formData, gallery: newGallery });
                        }
                      }}
                      disabled={index === 0}
                      className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg disabled:opacity-30"
                      title="Di chuyển lên"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Move down
                        if (index < formData.gallery!.length - 1) {
                          const newGallery = [...formData.gallery!];
                          [newGallery[index], newGallery[index + 1]] = [
                            newGallery[index + 1],
                            newGallery[index],
                          ];
                          setFormData({ ...formData, gallery: newGallery });
                        }
                      }}
                      disabled={index === formData.gallery!.length - 1}
                      className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newGallery = formData.gallery!.filter((_, i) => i !== index);
                        setFormData({ ...formData, gallery: newGallery });
                      }}
                      className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Index badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="text-4xl mb-2">🖼️</p>
              <p>Chưa có ảnh nào trong thư viện</p>
            </div>
          )}
        </div>

        {/* ==================== EXTERIOR SECTION ==================== */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">🚗 Ngoại thất</h3>
            <span className="text-sm text-slate-400">
              {formData.exterior?.images?.length || 0} ảnh
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Thêm ảnh và mô tả về ngoại thất xe (thiết kế, đèn, mâm, gương...).
          </p>

          {/* Exterior Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mô tả ngoại thất
            </label>
            <textarea
              value={formData.exterior?.description || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  exterior: { ...formData.exterior!, description: e.target.value },
                })
              }
              rows={3}
              className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none"
              placeholder="Mô tả thiết kế ngoại thất..."
            />
          </div>

          {/* Exterior Images Upload */}
          <div className="flex gap-2 mb-4">
            <input
              ref={exteriorFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setIsUploadingExterior(true);
                const newUrls: string[] = [];
                for (const file of Array.from(files)) {
                  try {
                    const response = await uploadAPI.uploadImage(file);
                    if (response.data.success) {
                      newUrls.push(response.data.data.url);
                    }
                  } catch (error) {
                    toast.error(`Lỗi upload: ${file.name}`);
                  }
                }
                if (newUrls.length > 0) {
                  setFormData({
                    ...formData,
                    exterior: {
                      ...formData.exterior!,
                      images: [...(formData.exterior?.images || []), ...newUrls],
                    },
                  });
                  toast.success(`Đã upload ${newUrls.length} ảnh ngoại thất`);
                }
                setIsUploadingExterior(false);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => exteriorFileInputRef.current?.click()}
              disabled={isUploadingExterior}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploadingExterior ? '⏳ Đang upload...' : '📤 Upload ảnh ngoại thất'}
            </button>
          </div>

          {/* Exterior Images Grid */}
          {formData.exterior?.images && formData.exterior.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.exterior.images.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-video bg-background-dark rounded-lg overflow-hidden border border-border-dark"
                >
                  <img
                    src={url}
                    alt={`Ngoại thất ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.exterior!.images.filter((_, i) => i !== index);
                      setFormData({
                        ...formData,
                        exterior: { ...formData.exterior!, images: newImages },
                      });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 text-sm">Chưa có ảnh ngoại thất</div>
          )}
        </div>

        {/* ==================== INTERIOR SECTION ==================== */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">🛋️ Nội thất</h3>
            <span className="text-sm text-slate-400">
              {formData.interior?.images?.length || 0} ảnh
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Thêm ảnh và mô tả về nội thất xe (ghế, vô lăng, màn hình, không gian...).
          </p>

          {/* Interior Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả nội thất</label>
            <textarea
              value={formData.interior?.description || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interior: { ...formData.interior!, description: e.target.value },
                })
              }
              rows={3}
              className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none"
              placeholder="Mô tả nội thất, tiện nghi..."
            />
          </div>

          {/* Interior Images Upload */}
          <div className="flex gap-2 mb-4">
            <input
              ref={interiorFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setIsUploadingInterior(true);
                const newUrls: string[] = [];
                for (const file of Array.from(files)) {
                  try {
                    const response = await uploadAPI.uploadImage(file);
                    if (response.data.success) {
                      newUrls.push(response.data.data.url);
                    }
                  } catch (error) {
                    toast.error(`Lỗi upload: ${file.name}`);
                  }
                }
                if (newUrls.length > 0) {
                  setFormData({
                    ...formData,
                    interior: {
                      ...formData.interior!,
                      images: [...(formData.interior?.images || []), ...newUrls],
                    },
                  });
                  toast.success(`Đã upload ${newUrls.length} ảnh nội thất`);
                }
                setIsUploadingInterior(false);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => interiorFileInputRef.current?.click()}
              disabled={isUploadingInterior}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploadingInterior ? '⏳ Đang upload...' : '📤 Upload ảnh nội thất'}
            </button>
          </div>

          {/* Interior Images Grid */}
          {formData.interior?.images && formData.interior.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.interior.images.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-video bg-background-dark rounded-lg overflow-hidden border border-border-dark"
                >
                  <img
                    src={url}
                    alt={`Nội thất ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.interior!.images.filter((_, i) => i !== index);
                      setFormData({
                        ...formData,
                        interior: { ...formData.interior!, images: newImages },
                      });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 text-sm">Chưa có ảnh nội thất</div>
          )}
        </div>

        {/* ==================== COLOR OPTIONS SECTION ==================== */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">🎨 Tùy chọn màu sắc</h3>
            <span className="text-sm text-slate-400">{formData.colorOptions?.length || 0} màu</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Thêm các tùy chọn màu xe với ảnh minh họa tương ứng.
          </p>

          {/* Add New Color */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-4 bg-background-dark rounded-lg">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tên màu</label>
              <input
                type="text"
                id="new-color-name"
                className="w-full bg-card-dark border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                placeholder="VD: Trắng Ngọc Trai"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Mã màu</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="new-color-hex"
                  className="w-12 h-10 rounded cursor-pointer"
                  defaultValue="#FFFFFF"
                />
                <input
                  type="text"
                  id="new-color-hex-text"
                  className="flex-1 bg-card-dark border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="#FFFFFF"
                  onChange={(e) => {
                    const colorInput = document.getElementById('new-color-hex') as HTMLInputElement;
                    if (colorInput && e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                      colorInput.value = e.target.value;
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">URL ảnh (tùy chọn)</label>
              <input
                type="text"
                id="new-color-image"
                className="w-full bg-card-dark border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  const nameInput = document.getElementById('new-color-name') as HTMLInputElement;
                  const hexInput = document.getElementById('new-color-hex') as HTMLInputElement;
                  const imageInput = document.getElementById('new-color-image') as HTMLInputElement;

                  if (!nameInput.value.trim()) {
                    toast.error('Vui lòng nhập tên màu');
                    return;
                  }

                  const newColor: ColorOption = {
                    name: nameInput.value.trim(),
                    hexCode: hexInput.value || '#FFFFFF',
                    image: imageInput.value.trim() || undefined,
                  };

                  setFormData({
                    ...formData,
                    colorOptions: [...(formData.colorOptions || []), newColor],
                  });

                  nameInput.value = '';
                  hexInput.value = '#FFFFFF';
                  imageInput.value = '';
                  toast.success('Đã thêm màu');
                }}
                className="w-full px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg text-sm font-bold transition-colors"
              >
                + Thêm màu
              </button>
            </div>
          </div>

          {/* Color Options List */}
          {formData.colorOptions && formData.colorOptions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.colorOptions.map((color, index) => (
                <div
                  key={index}
                  className="relative group bg-background-dark rounded-lg overflow-hidden border border-border-dark"
                >
                  {color.image ? (
                    <img
                      src={color.image}
                      alt={color.name}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div
                      className="w-full aspect-video flex items-center justify-center"
                      style={{ backgroundColor: color.hexCode }}
                    >
                      <span className="text-2xl">🚗</span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/30"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="text-sm font-medium text-white">{color.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{color.hexCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newColors = formData.colorOptions!.filter((_, i) => i !== index);
                      setFormData({ ...formData, colorOptions: newColors });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 text-sm">Chưa có tùy chọn màu nào</div>
          )}
        </div>

        {/* Specs */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Thông số kỹ thuật</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Động cơ</label>
              <input
                type="text"
                value={formData.specs?.engine || ''}
                onChange={(e) => updateSpecs('engine', e.target.value)}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: Điện, Xăng 2.0L"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Công suất</label>
              <input
                type="text"
                value={formData.specs?.power || ''}
                onChange={(e) => updateSpecs('power', e.target.value)}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: 402 HP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mô-men xoắn</label>
              <input
                type="text"
                value={formData.specs?.torque || ''}
                onChange={(e) => updateSpecs('torque', e.target.value)}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: 640 Nm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tăng tốc 0-100
              </label>
              <input
                type="text"
                value={formData.specs?.acceleration || ''}
                onChange={(e) => updateSpecs('acceleration', e.target.value)}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: 5.5s"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tốc độ tối đa</label>
              <input
                type="text"
                value={formData.specs?.topSpeed || ''}
                onChange={(e) => updateSpecs('topSpeed', e.target.value)}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="VD: 200 km/h"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Số chỗ ngồi</label>
              <input
                type="number"
                value={formData.specs?.seats || ''}
                onChange={(e) => updateSpecs('seats', Number(e.target.value))}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Mô tả</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mô tả ngắn (hiển thị trên card)
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none"
                placeholder="Mô tả ngắn gọn về xe..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mô tả chi tiết
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Nhập mô tả dạng văn bản thuần. Xuống dòng bằng Enter, hệ thống sẽ tự động format khi
                hiển thị.
              </p>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={10}
                className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none leading-relaxed"
                placeholder={`Ví dụ:
VinFast VF 8 là mẫu SUV điện thông minh đầu tiên của VinFast.

🔋 CÔNG NGHỆ PIN TIÊN TIẾN
- Pin LFP dung lượng 87.7 kWh
- Quãng đường di chuyển: 471 km/lần sạc
- Sạc nhanh DC: 35 phút từ 10-70%

🚗 ĐỘNG CƠ MẠNH MẼ
- 2 động cơ điện AWD
- Công suất: 402 HP
- Tăng tốc 0-100: 5.5 giây

✨ TRANG BỊ TIỆN NGHI
- Màn hình trung tâm 15.6 inch
- Hệ thống lái tự động cấp độ 2+
- 11 túi khí an toàn`}
              />
              <p className="text-xs text-slate-500 mt-2">
                {formData.description?.length || 0} ký tự
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saveMutation.isPending}
            className="flex-1 py-3 bg-primary hover:bg-accent-blue text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Đang lưu...' : 'Công khai xe'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saveMutation.isPending}
            className="py-3 px-6 border border-border-dark text-slate-400 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            Lưu nháp
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarEditorPage;
