import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PostsPage: React.FC = () => {
    const queryClient = useQueryClient();

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

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

    const posts = postsData?.data || [];

    // Filtered posts
    const filteredPosts = useMemo(() => {
        return posts.filter((post: { title: string; category: string; status: string; publishedAt?: string; createdAt: string }) => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !categoryFilter || post.category === categoryFilter;
            const matchesStatus = !statusFilter || post.status === statusFilter;

            // Date filter
            const postDate = post.publishedAt || post.createdAt;
            let matchesDateFrom = true;
            let matchesDateTo = true;

            if (dateFrom && postDate) {
                matchesDateFrom = new Date(postDate) >= new Date(dateFrom);
            }
            if (dateTo && postDate) {
                // Add 1 day to include the end date
                const endDate = new Date(dateTo);
                endDate.setDate(endDate.getDate() + 1);
                matchesDateTo = new Date(postDate) < endDate;
            }

            return matchesSearch && matchesCategory && matchesStatus && matchesDateFrom && matchesDateTo;
        });
    }, [posts, searchTerm, categoryFilter, statusFilter, dateFrom, dateTo]);

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Xóa bài viết "${title}"?`)) {
            deleteMutation.mutate(id);
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
            news: 'bg-blue-500/10 text-blue-400',
            review: 'bg-purple-500/10 text-purple-400',
            promotion: 'bg-emerald-500/10 text-emerald-400',
            event: 'bg-amber-500/10 text-amber-400',
        };
        return colors[category] || 'bg-slate-500/10 text-slate-400';
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
                    <h2 className="text-xl md:text-2xl font-bold">Quản lý tin tức</h2>
                    <p className="text-slate-400 text-sm mt-1">Quản lý bài viết và tin tức</p>
                </div>
                <a
                    href="/posts/new"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="sm:inline">Tạo bài viết</span>
                </a>
            </div>

            {/* Search and Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-4 bg-card-dark border border-border-dark rounded-xl p-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo tiêu đề..."
                        className="w-full bg-background-dark border border-border-dark rounded-lg text-sm pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:ring-primary focus:border-primary transition-all"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-[20px]">
                        search
                    </span>
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
                >
                    <option value="">Tất cả danh mục</option>
                    <option value="news">Tin tức</option>
                    <option value="review">Đánh giá</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="event">Sự kiện</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Nháp</option>
                </select>

                {/* Results count */}
                <span className="text-xs text-slate-500">
                    {filteredPosts.length} / {posts.length} bài viết
                </span>
            </div>

            {/* Date Filter Row */}
            <div className="flex flex-wrap items-center gap-4 bg-card-dark border border-border-dark rounded-xl p-4">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Lọc theo ngày:
                </span>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
                    />
                    <span className="text-slate-500">đến</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
                {(dateFrom || dateTo) && (
                    <button
                        onClick={clearDateFilter}
                        className="text-xs text-primary hover:text-white transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        Xóa bộ lọc ngày
                    </button>
                )}
            </div>

            {/* Posts Table */}
            <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background-dark/30 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Tiêu đề</th>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4">Ngày đăng</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Lượt xem</th>
                                <th className="px-6 py-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post: { _id: string; title: string; category: string; relatedCar?: { name: string }; status: string; viewCount: number; publishedAt?: string; createdAt: string }) => (
                                    <tr key={post._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-white">{post.title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${getCategoryColor(post.category)}`}>
                                                {getCategoryLabel(post.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {formatDate(post.publishedAt || post.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${post.status === 'published'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {post.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {post.viewCount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <a href={`/posts/${post._id}`} className="text-primary hover:text-white transition-colors">
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        {posts.length === 0
                                            ? <>Chưa có bài viết nào. <a href="/posts/new" className="text-primary hover:underline">Tạo bài viết đầu tiên</a></>
                                            : 'Không tìm thấy bài viết phù hợp với bộ lọc.'
                                        }
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
