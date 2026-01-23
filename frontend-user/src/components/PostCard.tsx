import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../services/api';
import { motion } from 'framer-motion';

interface PostCardProps {
    post: Post;
    index?: number;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    news: { label: 'Tin tức', color: 'bg-blue-500/10 text-blue-400' },
    review: { label: 'Đánh giá', color: 'bg-purple-500/10 text-purple-400' },
    promotion: { label: 'Khuyến mãi', color: 'bg-emerald-500/10 text-emerald-400' },
    event: { label: 'Sự kiện', color: 'bg-amber-500/10 text-amber-400' },
};

const PostCard: React.FC<PostCardProps> = ({ post, index = 0 }) => {
    const category = categoryLabels[post.category] || categoryLabels.news;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Calculate days remaining for events
    const getEventBadge = () => {
        if (post.category !== 'event' || !post.eventEndDate) return null;
        const endDate = new Date(post.eventEndDate);
        const now = new Date();
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Đã kết thúc', color: 'bg-gray-500' };
        if (diffDays === 0) return { text: '🔥 Hôm nay', color: 'bg-red-500' };
        if (diffDays <= 3) return { text: `🔥 Còn ${diffDays} ngày`, color: 'bg-red-500' };
        return { text: `⏰ Đến ${formatDate(post.eventEndDate)}`, color: 'bg-amber-500' };
    };

    // Get promotion badge
    const getPromotionBadge = () => {
        if (post.category !== 'promotion') return null;
        if (post.discountAmount) {
            const formatted = post.discountAmount >= 1000000
                ? `${(post.discountAmount / 1000000).toFixed(0)} triệu`
                : `${(post.discountAmount / 1000).toFixed(0)}K`;
            return { text: `💰 Giảm ${formatted}`, color: 'bg-emerald-500' };
        }
        if (post.discountPercent) {
            return { text: `🏷️ -${post.discountPercent}%`, color: 'bg-emerald-500' };
        }
        if (post.discountDescription) {
            return { text: post.discountDescription, color: 'bg-emerald-500' };
        }
        return null;
    };

    const eventBadge = getEventBadge();
    const promotionBadge = getPromotionBadge();

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card group"
        >
            <Link to={`/posts/${post.slug}`} className="block">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    {post.coverImage ? (
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                            <svg className="size-12 text-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                    )}

                    {/* Category Badge */}
                    <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded ${category.color}`}>
                        {category.label}
                    </span>

                    {/* Event/Promotion Special Badge */}
                    {eventBadge && (
                        <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded text-white ${eventBadge.color}`}>
                            {eventBadge.text}
                        </span>
                    )}
                    {promotionBadge && (
                        <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded text-white ${promotionBadge.color}`}>
                            {promotionBadge.text}
                        </span>
                    )}

                    {/* Related Car Badge */}
                    {post.relatedCar && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            {post.relatedCar.name}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{formatDate(post.publishedAt)}</span>
                        <div className="flex items-center gap-1">
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.viewCount || 0}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
};

export default PostCard;
