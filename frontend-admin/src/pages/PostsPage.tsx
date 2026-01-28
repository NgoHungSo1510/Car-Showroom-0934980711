import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category: string;
  relatedCar?: { name: string; slug: string };
  status: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  facebookPostId?: string;
  facebookSyncedAt?: string;
  tags?: string[];
  coverImage?: string;
}

const PostsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const response = await postsAPI.getAll();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Đã xóa bài viết thành công');
    },
    onError: () => {
      toast.error('Không thể xóa bài viết');
    },
  });

  // Copy to clipboard and open Meta Business Suite
  const handleCopyAndOpenFB = async (post: Post) => {
    const baseUrl = import.meta.env.VITE_CLIENT_URL || 'https://maihieu.vercel.app';
    const categoryEmoji =
      post.category === 'news'
        ? '📰'
        : post.category === 'promotion'
          ? '🎉'
          : post.category === 'event'
            ? '📅'
            : '⭐';

    let content = `${categoryEmoji} ${post.title}\n\n`;
    if (post.excerpt) content += `${post.excerpt}\n\n`;
    content += `👉 Xem chi tiết: ${baseUrl}/posts/${post.slug}\n`;
    if (post.relatedCar) {
      content += `🚗 Xem xe ${post.relatedCar.name}: ${baseUrl}/cars/${post.relatedCar.slug}\n`;
    }
    if (post.tags && post.tags.length > 0) {
      const hashtags = post.tags
        .filter((t) => !t.includes('facebook'))
        .map((tag) => `#${tag.replace(/\s+/g, '')}`)
        .join(' ');
      if (hashtags) content += `\n${hashtags}`;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success('Đã copy nội dung! Đang mở Facebook...');
      window.open('https://business.facebook.com/latest/composer', '_blank');
    } catch (err) {
      toast.error('Không thể copy. Vui lòng thử lại.');
    }
  };

  const posts: Post[] = postsData?.data || [];

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || post.category === categoryFilter;
      const matchesStatus = !statusFilter || post.status === statusFilter;
      const postDate = post.publishedAt || post.createdAt;
      let matchesDateFrom = true;
      let matchesDateTo = true;

      if (dateFrom && postDate) {
        matchesDateFrom = new Date(postDate) >= new Date(dateFrom);
      }
      if (dateTo && postDate) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        matchesDateTo = new Date(postDate) < endDate;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [posts, searchTerm, categoryFilter, statusFilter, dateFrom, dateTo]);

  const publishablePosts = filteredPosts.filter(
    (p) => p.status === 'published' && !p.facebookPostId,
  );

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Xóa bài viết "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllPublishable = () => {
    if (selectedIds.size === publishablePosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(publishablePosts.map((p) => p._id)));
    }
  };

  const handleCopySelectedAndOpenFB = async () => {
    const selectedPosts = publishablePosts.filter((p) => selectedIds.has(p._id));
    if (selectedPosts.length === 0) {
      toast.error('Vui lòng chọn các bài đã xuất bản');
      return;
    }
    if (selectedPosts.length === 1) {
      handleCopyAndOpenFB(selectedPosts[0]);
    } else {
      toast('Chỉ có thể copy 1 bài mỗi lần. Đã copy bài đầu tiên.');
      handleCopyAndOpenFB(selectedPosts[0]);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      news: 'Tin tức',
      review: 'Đánh giá',
      promotion: 'Khuyến mãi',
      event: 'Sự kiện',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      news: 'bg-blue-500/10 text-blue-500',
      review: 'bg-purple-500/10 text-purple-500',
      promotion: 'bg-emerald-500/10 text-emerald-500',
      event: 'bg-amber-500/10 text-amber-500',
    };
    return colors[category] || 'bg-slate-500/10 text-slate-500';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold dark:text-white light:text-text-light">Quản lý tin tức</h2>
          <p className="dark:text-slate-400 light:text-slate-500 text-sm mt-1">Quản lý bài viết và tin tức</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/posts/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 touch-target"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tạo bài viết</span>
          </a>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề..."
            className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm pl-10 pr-4 py-2.5 dark:text-white light:text-text-light placeholder-slate-400 focus:ring-primary focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
            search
          </span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2.5 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Tất cả danh mục</option>
          <option value="news">Tin tức</option>
          <option value="review">Đánh giá</option>
          <option value="promotion">Khuyến mãi</option>
          <option value="event">Sự kiện</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2.5 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Nháp</option>
        </select>

        <span className="text-xs dark:text-slate-500 light:text-slate-400">
          {filteredPosts.length} / {posts.length} bài viết
        </span>
      </div>

      {/* Date Filter Row */}
      <div className="flex flex-wrap items-center gap-4 dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-xl p-4 shadow-sm">
        <span className="text-sm dark:text-slate-400 light:text-slate-500 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Lọc theo ngày:
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
          />
          <span className="dark:text-slate-500 light:text-slate-400">đến</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={clearDateFilter}
            className="text-xs text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            Xóa bộ lọc ngày
          </button>
        )}
      </div>

      {/* Facebook Publish Bar */}
      {publishablePosts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === publishablePosts.length && publishablePosts.length > 0}
                onChange={handleSelectAllPublishable}
                className="rounded dark:border-border-dark light:border-border-light dark:bg-background-dark light:bg-white text-primary focus:ring-primary w-5 h-5"
              />
              <span className="dark:text-white light:text-text-light text-sm">
                Chọn tất cả ({publishablePosts.length} bài có thể đăng FB)
              </span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="dark:text-slate-400 light:text-slate-500 text-sm">Đã chọn: {selectedIds.size}</span>
            <button
              onClick={handleCopySelectedAndOpenFB}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 touch-target"
            >
              📋 Copy + Mở Facebook
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="dark:bg-background-dark/30 light:bg-slate-50 dark:text-slate-500 light:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-4 py-4 w-10"></th>
                <th className="px-4 py-4">Tiêu đề</th>
                <th className="px-4 py-4">Danh mục</th>
                <th className="px-4 py-4">Ngày đăng</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Facebook</th>
                <th className="px-4 py-4">Lượt xem</th>
                <th className="px-4 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-border-dark light:divide-border-light">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post._id} className="dark:hover:bg-white/5 light:hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      {post.status === 'published' && !post.facebookPostId && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(post._id)}
                          onChange={() => handleToggleSelect(post._id)}
                          className="rounded dark:border-border-dark light:border-border-light dark:bg-background-dark light:bg-white text-primary focus:ring-primary w-4 h-4"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium dark:text-white light:text-text-light">{post.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm dark:text-slate-400 light:text-slate-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {post.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {post.facebookPostId ? (
                        <a
                          href={`https://facebook.com/${post.facebookPostId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-500 rounded font-bold hover:bg-blue-500/30 transition-colors"
                        >
                          ✅ Đã đăng
                        </a>
                      ) : post.status === 'published' ? (
                        <button
                          onClick={() => handleCopyAndOpenFB(post)}
                          className="text-[10px] px-2 py-1 dark:bg-slate-500/20 light:bg-slate-100 dark:text-slate-400 light:text-slate-500 rounded font-bold hover:bg-blue-500/20 hover:text-blue-500 transition-colors"
                        >
                          📋 Copy FB
                        </button>
                      ) : (
                        <span className="text-[10px] dark:text-slate-600 light:text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm dark:text-slate-400 light:text-slate-500">
                      {post.viewCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a href={`/posts/${post._id}`} className="text-primary hover:opacity-70 transition-opacity">
                          <span className="material-symbols-outlined">edit</span>
                        </a>
                        <button
                          onClick={() => handleDelete(post._id, post.title)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center dark:text-slate-500 light:text-slate-400">
                    {posts.length === 0 ? (
                      <>
                        Chưa có bài viết nào.{' '}
                        <a href="/posts/new" className="text-primary hover:underline">
                          Tạo bài viết đầu tiên
                        </a>
                      </>
                    ) : (
                      'Không tìm thấy bài viết phù hợp với bộ lọc.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;
