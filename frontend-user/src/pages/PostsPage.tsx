import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';

const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'news', label: 'Tin tức' },
    { value: 'review', label: 'Đánh giá' },
    { value: 'promotion', label: 'Khuyến mãi' },
    { value: 'event', label: 'Sự kiện' },
];

const PostsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || '';
    const [page, setPage] = useState(1);

    // Fetch posts
    const { data: postsData, isLoading } = useQuery({
        queryKey: ['posts', category, page],
        queryFn: async () => {
            const params: Record<string, string | number> = { page, limit: 12 };
            if (category) params.category = category;
            const response = await postsAPI.getAll(params);
            return response.data;
        },
    });

    const posts = postsData?.data || [];
    const pagination = postsData?.pagination;

    const handleCategoryChange = (value: string) => {
        setPage(1);
        if (value) {
            setSearchParams({ category: value });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                        Tin tức & Đánh giá
                    </h1>
                    <p className="text-text-secondary">
                        Cập nhật tin tức mới nhất về xe hơi
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat.value
                                    ? 'bg-primary text-white'
                                    : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-white border border-border'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Posts Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, index) => (
                                <PostCard key={post._id} post={post} index={index} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-surface border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                                >
                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <span className="px-4 py-2 text-sm text-text-secondary">
                                    Trang {page} / {pagination.pages}
                                </span>

                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="p-2 rounded-lg bg-surface border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                                >
                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <svg className="size-16 mx-auto mb-4 text-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <h3 className="text-lg font-bold text-white mb-2">Chưa có bài viết</h3>
                        <p className="text-text-secondary">Hãy quay lại sau để xem tin mới</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostsPage;
