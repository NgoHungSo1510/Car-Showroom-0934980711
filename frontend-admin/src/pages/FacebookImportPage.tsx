import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ContentBlock {
  type: 'text' | 'image';
  content?: string;
  url?: string;
  caption?: string;
}

interface ClassificationResult {
  category: string;
  title: string;
  excerpt: string;
  relatedCarName?: string;
  confidence: number;
  tags: string[];
  eventStartDate?: string;
  eventEndDate?: string;
  discountAmount?: number;
  discountPercent?: number;
  discountDescription?: string;
  contentBlocks?: ContentBlock[];
}

interface ImportResult {
  post: {
    _id: string;
    title: string;
    status: string;
    slug: string;
  };
  classification: ClassificationResult;
}

const FacebookImportPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(
    null,
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const testMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post('/webhook/facebook/test-ai', { content: text });
      return response.data;
    },
    onSuccess: (data) => {
      setClassificationResult(data.data);
      setImportResult(null);
      toast.success('AI đã phân loại xong!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi phân loại');
    },
  });

  const importMutation = useMutation({
    mutationFn: async (payload: { content: string; images?: string[]; autoPublish: boolean }) => {
      const response = await api.post('/webhook/facebook/import', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setImportResult(data.data);
      setClassificationResult(data.data.classification);
      toast.success(`Đã tạo bài: ${data.data.post.title}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi import');
    },
  });

  const handleTestAI = () => {
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }
    testMutation.mutate(content);
  };

  const handleImport = () => {
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }
    const images = imageUrl.trim() ? [imageUrl.trim()] : undefined;
    importMutation.mutate({ content, images, autoPublish });
  };

  const categoryColors: Record<string, string> = {
    news: 'bg-blue-500',
    review: 'bg-purple-500',
    promotion: 'bg-emerald-500',
    event: 'bg-amber-500',
  };

  const categoryLabels: Record<string, string> = {
    news: '📰 Tin tức',
    review: '⭐ Đánh giá',
    promotion: '🏷️ Khuyến mãi',
    event: '📅 Sự kiện',
  };

  const formatPrice = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu`;
    }
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🧪 Test phân loại AI</h2>
          <p className="text-slate-400 mt-1">
            Paste nội dung để test AI phân loại và train chính xác hơn
          </p>
        </div>
        <a
          href="/ai-config"
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          ← Cấu hình AI
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">📝 Nội dung bài đăng Facebook</h3>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary resize-none text-sm"
              placeholder="Paste nội dung từ Facebook tại đây..."
            />

            <div className="mt-4">
              <label className="block text-sm text-slate-300 mb-2">URL ảnh (tùy chọn)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-300">Tự động công khai</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleTestAI}
                disabled={testMutation.isPending || !content.trim()}
                className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {testMutation.isPending ? '🔄 Đang phân tích...' : '🧪 Test AI'}
              </button>
              <button
                onClick={handleImport}
                disabled={importMutation.isPending || !content.trim()}
                className="flex-1 py-3 bg-primary hover:bg-accent-blue text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {importMutation.isPending ? '🔄 Đang import...' : '📥 Import & Tạo bài'}
              </button>
            </div>
          </div>
        </div>

        {/* Result Section - Same order as PostEditorPage */}
        <div className="space-y-4">
          {classificationResult && (
            <div className="bg-card-dark border border-border-dark rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">🤖 Kết quả AI</h3>
                <span className="text-xs text-slate-500">
                  Confidence: {Math.round(classificationResult.confidence * 100)}%
                </span>
              </div>

              {/* 1. Tiêu đề */}
              <div className="bg-background-dark rounded-xl p-4">
                <label className="block text-xs text-slate-400 mb-1">Tiêu đề *</label>
                <p className="text-white font-medium">{classificationResult.title}</p>
              </div>

              {/* 2. Danh mục */}
              <div className="bg-background-dark rounded-xl p-4">
                <label className="block text-xs text-slate-400 mb-2">Danh mục *</label>
                <span
                  className={`inline-block px-4 py-2 ${categoryColors[classificationResult.category] || 'bg-slate-500'} text-white text-sm font-bold rounded-xl`}
                >
                  {categoryLabels[classificationResult.category] || classificationResult.category}
                </span>
              </div>

              {/* 3. Thông tin sự kiện (nếu event) */}
              {classificationResult.category === 'event' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <label className="block text-xs text-amber-400 font-bold mb-3">
                    📅 Thông tin sự kiện
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Bắt đầu</label>
                      <p className="text-white text-sm">
                        {classificationResult.eventStartDate
                          ? new Date(classificationResult.eventStartDate).toLocaleDateString(
                            'vi-VN',
                          )
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kết thúc</label>
                      <p className="text-white text-sm">
                        {classificationResult.eventEndDate
                          ? new Date(classificationResult.eventEndDate).toLocaleDateString('vi-VN')
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Thông tin khuyến mãi (nếu promotion) */}
              {classificationResult.category === 'promotion' && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <label className="block text-xs text-emerald-400 font-bold mb-3">
                    🏷️ Thông tin khuyến mãi
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Số tiền giảm</label>
                      <p className="text-white text-sm font-bold">
                        {classificationResult.discountAmount
                          ? formatPrice(classificationResult.discountAmount)
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">% giảm</label>
                      <p className="text-white text-sm font-bold">
                        {classificationResult.discountPercent
                          ? `${classificationResult.discountPercent}%`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Mô tả ưu đãi</label>
                      <p className="text-white text-sm">
                        {classificationResult.discountDescription || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Gắn xe chính */}
              <div className="bg-background-dark rounded-xl p-4">
                <label className="block text-xs text-slate-400 mb-1">
                  Gắn xe chính (cho nút CTA)
                </label>
                <p className="text-white">
                  {classificationResult.relatedCarName ? (
                    <span className="text-primary font-medium">
                      🚗 {classificationResult.relatedCarName}
                    </span>
                  ) : (
                    <span className="text-slate-500">— Không gắn xe —</span>
                  )}
                </p>
              </div>

              {/* 6. Tóm tắt */}
              <div className="bg-background-dark rounded-xl p-4">
                <label className="block text-xs text-slate-400 mb-1">
                  Tóm tắt (hiển thị trên card)
                </label>
                <p className="text-slate-300 text-sm">{classificationResult.excerpt}</p>
              </div>

              {/* 7. Nội dung bài viết */}
              <div className="bg-background-dark rounded-xl p-4">
                <label className="block text-xs text-slate-400 mb-2">
                  Nội dung bài viết ({classificationResult.contentBlocks?.length || 0} blocks)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {classificationResult.contentBlocks?.map((block, i) => (
                    <div key={i} className="p-2 bg-slate-800 rounded-lg text-sm">
                      {block.type === 'text' && (
                        <div>
                          <span className="text-blue-400 text-xs mr-2">📝 Văn bản</span>
                          <p className="text-slate-300 mt-1 whitespace-pre-wrap text-xs">
                            {block.content}
                          </p>
                        </div>
                      )}
                      {block.type === 'image' && (
                        <div>
                          <span className="text-green-400 text-xs mr-2">🖼️ Ảnh</span>
                          <p className="text-slate-400 text-xs truncate">{block.url}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!classificationResult.contentBlocks ||
                    classificationResult.contentBlocks.length === 0) && (
                    <p className="text-slate-500 text-sm">Chưa có nội dung</p>
                  )}
                </div>
              </div>

              {/* 8. Tags */}
              <div className="bg-background-dark rounded-xl p-4">
                <label className="block text-xs text-slate-400 mb-2">Thẻ (Tags)</label>
                <div className="flex flex-wrap gap-2">
                  {classificationResult.tags?.length > 0 ? (
                    classificationResult.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">Chưa có tags</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-3">✅ Đã tạo bài viết!</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">ID:</span>{' '}
                  <span className="text-white font-mono text-xs">{importResult.post._id}</span>
                </p>
                <p>
                  <span className="text-slate-400">Tiêu đề:</span>{' '}
                  <span className="text-white">{importResult.post.title}</span>
                </p>
                <p>
                  <span className="text-slate-400">Trạng thái:</span>{' '}
                  <span
                    className={
                      importResult.post.status === 'published'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    {importResult.post.status === 'published' ? 'Đã công khai' : 'Bản nháp'}
                  </span>
                </p>
              </div>
              <a
                href={`/posts/${importResult.post._id}`}
                className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-accent-blue transition-colors"
              >
                Xem & Chỉnh sửa →
              </a>
            </div>
          )}

          {/* Empty State */}
          {!classificationResult && !importResult && (
            <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
              <p className="text-5xl mb-4">🤖</p>
              <p className="text-slate-400">
                Nhập nội dung và bấm "Test AI" để xem kết quả phân loại
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Kết quả sẽ hiển thị theo thứ tự của trang tạo bài viết
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookImportPage;
