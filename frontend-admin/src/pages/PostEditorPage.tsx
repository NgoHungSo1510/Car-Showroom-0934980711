import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI, carsAPI, PostInput, ContentBlock } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';

const PostEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id && id !== 'new';

  const [formData, setFormData] = useState<PostInput>({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'news',
    tags: [],
    relatedCar: null,
    status: 'draft',
    contentBlocks: [],
    eventStartDate: '',
    eventEndDate: '',
    discountAmount: undefined,
    discountPercent: undefined,
    discountDescription: '',
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch post if editing
  const { data: postData, isLoading } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: async () => {
      const response = await postsAPI.getById(id!);
      return response.data.data;
    },
    enabled: isEditing,
  });

  // Fetch cars for dropdown
  const { data: carsData } = useQuery({
    queryKey: ['admin-cars-select'],
    queryFn: async () => {
      const response = await carsAPI.getAll({ limit: 100 });
      return response.data.data;
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (postData) {
      setFormData({
        title: postData.title,
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        coverImage: postData.coverImage || '',
        category: postData.category,
        tags: postData.tags || [],
        relatedCar: postData.relatedCar?._id || null,
        status: postData.status,
        contentBlocks: postData.contentBlocks || [],
        eventStartDate: postData.eventStartDate
          ? new Date(postData.eventStartDate).toISOString().slice(0, 16)
          : '',
        eventEndDate: postData.eventEndDate
          ? new Date(postData.eventEndDate).toISOString().slice(0, 16)
          : '',
        discountAmount: postData.discountAmount,
        discountPercent: postData.discountPercent,
        discountDescription: postData.discountDescription || '',
      });
    }
  }, [postData]);

  // Create/Update mutations
  const saveMutation = useMutation({
    mutationFn: async (data: PostInput) => {
      if (isEditing) {
        return postsAPI.update(id!, data);
      }
      return postsAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success(isEditing ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết mới');
      navigate('/posts');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  // Content block handlers
  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = { type };
    if (type === 'text') newBlock.content = '';
    if (type === 'image' || type === 'video') newBlock.url = '';
    if (type === 'car') newBlock.car = '';
    setFormData({
      ...formData,
      contentBlocks: [...(formData.contentBlocks || []), newBlock],
    });
  };

  const updateContentBlock = (index: number, updates: Partial<ContentBlock>) => {
    const blocks = [...(formData.contentBlocks || [])];
    blocks[index] = { ...blocks[index], ...updates };
    setFormData({ ...formData, contentBlocks: blocks });
  };

  const removeContentBlock = (index: number) => {
    const blocks = [...(formData.contentBlocks || [])];
    blocks.splice(index, 1);
    setFormData({ ...formData, contentBlocks: blocks });
  };

  const moveContentBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...(formData.contentBlocks || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setFormData({ ...formData, contentBlocks: blocks });
  };

  const cars = carsData || [];

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
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </h2>
        <button
          onClick={() => navigate('/posts')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary text-lg"
            placeholder="Nhập tiêu đề bài viết..."
          />
        </div>

        {/* Category */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'news', label: '📰 Tin tức', desc: 'Tin tức, bài viết thông thường' },
              { value: 'review', label: '⭐ Đánh giá', desc: 'Review xe, so sánh' },
              { value: 'promotion', label: '🏷️ Khuyến mãi', desc: 'Giảm giá, ưu đãi' },
              { value: 'event', label: '📅 Sự kiện', desc: 'Lái thử, triển lãm' },
            ].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, category: cat.value as PostInput['category'] })
                }
                className={`p-4 rounded-xl text-left transition-all ${
                  formData.category === cat.value
                    ? 'bg-primary text-white ring-2 ring-primary'
                    : 'bg-background-dark text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="font-bold">{cat.label}</div>
                <div className="text-xs opacity-70 mt-1">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Category-specific fields */}
        {formData.category === 'event' && (
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📅 Thông tin sự kiện</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bắt đầu</label>
                <input
                  type="datetime-local"
                  value={formData.eventStartDate}
                  onChange={(e) => setFormData({ ...formData, eventStartDate: e.target.value })}
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kết thúc</label>
                <input
                  type="datetime-local"
                  value={formData.eventEndDate}
                  onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {formData.category === 'promotion' && (
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🏷️ Thông tin khuyến mãi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Số tiền giảm (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.discountAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountAmount: Number(e.target.value) || undefined,
                    })
                  }
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: 100000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hoặc % giảm</label>
                <input
                  type="number"
                  value={formData.discountPercent || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercent: Number(e.target.value) || undefined,
                    })
                  }
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: 15"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mô tả ưu đãi
                </label>
                <input
                  type="text"
                  value={formData.discountDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, discountDescription: e.target.value })
                  }
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: Giảm 100tr + Tặng PK"
                />
              </div>
            </div>
          </div>
        )}

        {/* Related Car - for review category */}
        {(formData.category === 'review' || formData.category === 'news') && (
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gắn xe chính (cho nút CTA)
            </label>
            <select
              value={formData.relatedCar || ''}
              onChange={(e) => setFormData({ ...formData, relatedCar: e.target.value || null })}
              className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
            >
              <option value="">-- Không gắn xe --</option>
              {cars.map((car: { _id: string; name: string }) => (
                <option key={car._id} value={car._id}>
                  {car.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cover Image */}
        <ImageUploader
          value={formData.coverImage || ''}
          onChange={(url) => setFormData({ ...formData, coverImage: url })}
          label="Ảnh bìa"
          placeholder="Kéo thả ảnh vào đây hoặc click để chọn file"
        />

        {/* Excerpt */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tóm tắt (hiển thị trên card)
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={2}
            className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none"
            placeholder="Tóm tắt ngắn gọn về bài viết..."
          />
        </div>

        {/* Content Blocks */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-bold text-white">Nội dung bài viết</label>
          </div>

          {/* Add Block Buttons - Sticky */}
          <div className="sticky top-0 z-10 flex flex-wrap gap-2 mb-6 p-4 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-border-dark shadow-lg">
            <span className="text-sm text-slate-400 flex items-center mr-2">Thêm:</span>
            <button
              type="button"
              onClick={() => addContentBlock('text')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              📝 Văn bản
            </button>
            <button
              type="button"
              onClick={() => addContentBlock('image')}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              🖼️ Ảnh
            </button>
            <button
              type="button"
              onClick={() => addContentBlock('video')}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              🎬 Video
            </button>
            <button
              type="button"
              onClick={() => addContentBlock('car')}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              🚗 Xe
            </button>
          </div>

          {/* Content Block List */}
          <div className="space-y-4">
            {formData.contentBlocks?.map((block, index) => (
              <div
                key={index}
                className="bg-background-dark rounded-xl p-4 border border-border-dark"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium px-2 py-1 rounded bg-slate-700">
                    {block.type === 'text' && '📝 Văn bản'}
                    {block.type === 'image' && '🖼️ Hình ảnh'}
                    {block.type === 'video' && '🎬 Video'}
                    {block.type === 'car' && '🚗 Xe liên quan'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveContentBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveContentBlock(index, 'down')}
                      disabled={index === (formData.contentBlocks?.length || 0) - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeContentBlock(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {block.type === 'text' && (
                  <textarea
                    value={block.content || ''}
                    onChange={(e) => updateContentBlock(index, { content: e.target.value })}
                    rows={5}
                    className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none"
                    placeholder="Nhập nội dung văn bản..."
                  />
                )}

                {block.type === 'image' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={block.url || ''}
                      onChange={(e) => updateContentBlock(index, { url: e.target.value })}
                      className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                      placeholder="URL ảnh (hoặc upload qua Cloudinary)"
                    />
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={(e) => updateContentBlock(index, { caption: e.target.value })}
                      className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-2 text-white text-sm focus:ring-primary focus:border-primary"
                      placeholder="Chú thích ảnh (không bắt buộc)"
                    />
                    {block.url && <img src={block.url} alt="" className="max-h-32 rounded-lg" />}
                  </div>
                )}

                {block.type === 'video' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={block.url || ''}
                      onChange={(e) => updateContentBlock(index, { url: e.target.value })}
                      className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                      placeholder="URL video (YouTube, Vimeo...)"
                    />
                    <input
                      type="text"
                      value={block.caption || ''}
                      onChange={(e) => updateContentBlock(index, { caption: e.target.value })}
                      className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-2 text-white text-sm focus:ring-primary focus:border-primary"
                      placeholder="Tiêu đề video (không bắt buộc)"
                    />
                  </div>
                )}

                {block.type === 'car' && (
                  <div className="space-y-3">
                    <select
                      value={block.car || ''}
                      onChange={(e) => updateContentBlock(index, { car: e.target.value })}
                      className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary"
                    >
                      <option value="">-- Chọn xe --</option>
                      {cars.map((car: { _id: string; name: string }) => (
                        <option key={car._id} value={car._id}>
                          {car.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={block.description || ''}
                      onChange={(e) => updateContentBlock(index, { description: e.target.value })}
                      className="w-full bg-slate-800 border-border-dark rounded-lg px-4 py-2 text-white text-sm focus:ring-primary focus:border-primary"
                      placeholder="Mô tả ngắn về xe trong bài (VD: Top 1 - Xe điện đáng mua nhất)"
                    />
                  </div>
                )}
              </div>
            ))}

            {(!formData.contentBlocks || formData.contentBlocks.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-lg mb-2">Chưa có nội dung</p>
                <p className="text-sm">
                  Nhấn các nút phía trên để thêm văn bản, ảnh, video hoặc gắn xe
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Thẻ (Tags)</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
              placeholder="Nhập tag và nhấn Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Thêm
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-background-dark rounded text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            onClick={() => setFormData({ ...formData, status: 'published' })}
            className="flex-1 py-3 bg-primary hover:bg-accent-blue text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Đang lưu...' : 'Đăng bài'}
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            onClick={() => setFormData({ ...formData, status: 'draft' })}
            className="py-3 px-6 border border-border-dark text-slate-400 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            Lưu nháp
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditorPage;
