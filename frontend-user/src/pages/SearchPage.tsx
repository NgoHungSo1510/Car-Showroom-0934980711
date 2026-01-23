import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { carsAPI, postsAPI, Car, Post } from '../services/api';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [activeTab, setActiveTab] = useState<'all' | 'cars' | 'posts'>('all');
    const [searchInput, setSearchInput] = useState(query);

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [query]);

    // Update search input when URL changes
    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    // Search cars
    const { data: carsData, isLoading: carsLoading } = useQuery({
        queryKey: ['search-cars', query],
        queryFn: async () => {
            const response = await carsAPI.getAll({ search: query, limit: 20 });
            return response.data.data;
        },
        enabled: !!query,
    });

    // Search posts
    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['search-posts', query],
        queryFn: async () => {
            const response = await postsAPI.getAll({ search: query, limit: 20 });
            return response.data.data;
        },
        enabled: !!query,
    });

    const cars = carsData || [];
    const posts = postsData || [];
    const isLoading = carsLoading || postsLoading;

    const formatPrice = (price: number) => {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(2)} tỷ`;
        }
        return `${(price / 1000000).toFixed(0)} triệu`;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Search Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4"
                    >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-4">Tìm kiếm</h1>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="max-w-2xl">
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center bg-surface border border-border rounded-xl px-4 focus-within:border-primary transition-colors">
                                <svg className="size-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Tìm xe, tin tức, khuyến mãi..."
                                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white px-3 py-3"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary px-6"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>

                {/* No Query */}
                {!query && (
                    <div className="text-center py-16">
                        <p className="text-6xl mb-4">🔍</p>
                        <p className="text-text-secondary text-lg">Nhập từ khóa để bắt đầu tìm kiếm</p>
                    </div>
                )}

                {/* Results */}
                {query && (
                    <>
                        {/* Results Summary */}
                        <div className="mb-6">
                            {isLoading ? (
                                <p className="text-text-secondary">Đang tìm kiếm...</p>
                            ) : (
                                <p className="text-text-secondary">
                                    Tìm thấy <span className="text-white font-bold">{cars.length}</span> xe và{' '}
                                    <span className="text-white font-bold">{posts.length}</span> bài viết cho "{query}"
                                </p>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-8 border-b border-border">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'all'
                                    ? 'text-primary border-primary'
                                    : 'text-text-secondary border-transparent hover:text-white'
                                    }`}
                            >
                                Tất cả ({cars.length + posts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('cars')}
                                className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'cars'
                                    ? 'text-primary border-primary'
                                    : 'text-text-secondary border-transparent hover:text-white'
                                    }`}
                            >
                                Xe ({cars.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'posts'
                                    ? 'text-primary border-primary'
                                    : 'text-text-secondary border-transparent hover:text-white'
                                    }`}
                            >
                                Bài viết ({posts.length})
                            </button>
                        </div>

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex justify-center py-12">
                                <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && cars.length === 0 && posts.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-6xl mb-4">😕</p>
                                <p className="text-text-secondary text-lg mb-2">Không tìm thấy kết quả nào</p>
                                <p className="text-text-secondary text-sm">Thử tìm với từ khóa khác</p>
                            </div>
                        )}

                        {/* Cars Section */}
                        {!isLoading && (activeTab === 'all' || activeTab === 'cars') && cars.length > 0 && (
                            <section className="mb-12">
                                {activeTab === 'all' && (
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        Xe ({cars.length})
                                    </h2>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {cars.map((car: Car, index: number) => (
                                        <motion.div
                                            key={car._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={`/cars/${car.slug}`}
                                                className="block card group overflow-hidden"
                                            >
                                                <div className="aspect-video bg-surface overflow-hidden">
                                                    {car.thumbnail ? (
                                                        <img
                                                            src={car.thumbnail}
                                                            alt={car.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                                            🚗
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {car.brand?.logo && (
                                                            <img src={car.brand.logo} alt={car.brand.name} className="h-4" />
                                                        )}
                                                        <span className="text-xs text-text-secondary">{car.brand?.name}</span>
                                                    </div>
                                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                                        {car.name}
                                                    </h3>
                                                    <p className="text-primary font-bold mt-2">
                                                        {formatPrice(car.price)}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Posts Section */}
                        {!isLoading && (activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
                            <section>
                                {activeTab === 'all' && (
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        Bài viết ({posts.length})
                                    </h2>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {posts.map((post: Post, index: number) => (
                                        <PostCard key={post._id} post={post} index={index} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
