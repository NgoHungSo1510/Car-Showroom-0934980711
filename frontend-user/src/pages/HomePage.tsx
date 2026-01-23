import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { postsAPI, carsAPI } from '../services/api';
import { useBranding } from '../context/BrandingContext';

// Category labels
const categoryLabels: Record<string, { label: string; color: string }> = {
    news: { label: 'Tin tức', color: 'bg-blue-500/10 text-blue-400' },
    review: { label: 'Đánh giá', color: 'bg-purple-500/10 text-purple-400' },
    promotion: { label: 'Khuyến mãi', color: 'bg-emerald-500/10 text-emerald-400' },
    event: { label: 'Sự kiện', color: 'bg-amber-500/10 text-amber-400' },
};

const HomePage: React.FC = () => {
    const { branding } = useBranding();

    // Fetch latest posts
    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['community-posts'],
        queryFn: async () => {
            const response = await postsAPI.getAll({ limit: 10 });
            return response.data;
        },
    });

    // Fetch featured cars
    const { data: carsData } = useQuery({
        queryKey: ['featured-cars'],
        queryFn: async () => {
            const response = await carsAPI.getAll({ featured: true, limit: 3 });
            return response.data;
        },
    });

    const posts = postsData?.data || [];
    const featuredCars = carsData?.data || [];

    const formatTimeAgo = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <>
            {/* Page Title */}
            <div className="px-2 mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    {branding.site_name}
                </h1>
                <p className="text-text-secondary text-sm mt-1">Đại lý ủy quyền VinFast tại Đà Nẵng • Hotline: {branding.site_hotline}</p>
            </div>

            {/* Featured Cars Carousel */}
            {featuredCars.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {featuredCars.map((car) => (
                        <Link
                            key={car._id}
                            to={`/cars/${car.slug}`}
                            className="flex-shrink-0 w-[280px] rounded-xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all group"
                        >
                            <div
                                className="h-36 bg-cover bg-center relative"
                                style={{ backgroundImage: `url("${car.thumbnail}")` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                {car.model3D?.hasModel && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded animate-glow">
                                        3D
                                    </span>
                                )}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-xs text-slate-400">{car.brand?.name}</p>
                                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                        {car.name}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Posts Feed */}
            <div className="flex flex-col gap-6">
                {postsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post, index) => (
                        <motion.article
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col items-stretch bg-surface rounded-xl overflow-hidden shadow-2xl border border-white/5 transition-all hover:border-primary/30"
                        >
                            {/* Post Image */}
                            <Link to={`/posts/${post.slug}`}>
                                {post.coverImage && (
                                    <div
                                        className="relative w-full aspect-video bg-cover bg-center cursor-pointer overflow-hidden"
                                        style={{ backgroundImage: `url("${post.coverImage}")` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div className="text-white">
                                                <h2 className="text-xl font-bold leading-tight">{post.title}</h2>
                                                {post.excerpt && (
                                                    <p className="text-sm text-slate-300 line-clamp-1">{post.excerpt}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Link>

                            {/* Post Content (if no image) */}
                            {!post.coverImage && (
                                <Link to={`/posts/${post.slug}`} className="px-5 pt-4 pb-2">
                                    <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                </Link>
                            )}

                            {/* Post Footer */}
                            <div className="p-5 flex flex-col gap-4">
                                {post.excerpt && post.coverImage && (
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                )}

                                {/* Category and Time - moved here */}
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${categoryLabels[post.category]?.color || 'bg-blue-500/10 text-blue-400'}`}>
                                        {categoryLabels[post.category]?.label || post.category}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {formatTimeAgo(post.publishedAt)}
                                    </span>
                                </div>

                                {/* Related Car */}
                                {post.relatedCar && (
                                    <Link
                                        to={`/cars/${post.relatedCar.slug}`}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        {post.relatedCar.thumbnail && (
                                            <img
                                                src={post.relatedCar.thumbnail}
                                                alt={post.relatedCar.name}
                                                className="w-16 h-10 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-500">Xe liên quan</p>
                                            <p className="text-sm font-bold text-white">{post.relatedCar.name}</p>
                                        </div>
                                        <span className="text-primary text-xs font-bold">Xem 3D →</span>
                                    </Link>
                                )}

                                {/* Interactions */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex gap-6">
                                        <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors">
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span className="text-xs font-bold">{post.viewCount || 0}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors">
                                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="text-xs font-bold">Bình luận</span>
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors">
                                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        <span className="text-xs font-bold">Chia sẻ</span>
                                    </button>
                                </div>
                            </div>
                        </motion.article>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        <svg className="size-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p>Chưa có bài viết nào. Hãy quay lại sau!</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default HomePage;
