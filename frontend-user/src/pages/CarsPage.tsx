import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { carsAPI, brandsAPI, carTypesAPI } from '../services/api';
import CarCard from '../components/CarCard';

const CarsPage: React.FC = () => {
    const [filters, setFilters] = useState({
        brand: '',
        carType: '',
        minPrice: '',
        maxPrice: '',
    });

    // Fetch cars
    const { data: carsData, isLoading } = useQuery({
        queryKey: ['cars', filters],
        queryFn: async () => {
            const params: Record<string, string | number> = {};
            if (filters.brand) params.brand = filters.brand;
            if (filters.carType) params.carType = filters.carType;
            if (filters.minPrice) params.minPrice = Number(filters.minPrice);
            if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);

            const response = await carsAPI.getAll(params);
            return response.data;
        },
    });

    // Fetch filter options
    const { data: brandsData } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const response = await brandsAPI.getAll();
            return response.data.data;
        },
    });

    const { data: carTypesData } = useQuery({
        queryKey: ['car-types'],
        queryFn: async () => {
            const response = await carTypesAPI.getAll();
            return response.data.data;
        },
    });

    const cars = carsData?.data || [];
    const brands = brandsData || [];
    const carTypes = carTypesData || [];

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ brand: '', carType: '', minPrice: '', maxPrice: '' });
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '');

    return (
        <div className="pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                        Showroom 3D
                    </h1>
                    <p className="text-text-secondary">
                        Khám phá {carsData?.pagination?.total || 0} mẫu xe với công nghệ 3D
                    </p>
                </div>

                {/* Filters */}
                <div className="glass rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Brand */}
                        <div>
                            <label className="block text-xs text-text-secondary mb-2">Hãng xe</label>
                            <select
                                value={filters.brand}
                                onChange={(e) => handleFilterChange('brand', e.target.value)}
                                className="w-full bg-surface border-border rounded-lg text-sm py-2.5 px-3 text-white focus:ring-primary focus:border-primary"
                            >
                                <option value="">Tất cả hãng</option>
                                {brands.map((brand) => (
                                    <option key={brand._id} value={brand._id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Car Type */}
                        <div>
                            <label className="block text-xs text-text-secondary mb-2">Loại xe</label>
                            <select
                                value={filters.carType}
                                onChange={(e) => handleFilterChange('carType', e.target.value)}
                                className="w-full bg-surface border-border rounded-lg text-sm py-2.5 px-3 text-white focus:ring-primary focus:border-primary"
                            >
                                <option value="">Tất cả loại</option>
                                {carTypes.map((type) => (
                                    <option key={type._id} value={type._id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Price */}
                        <div>
                            <label className="block text-xs text-text-secondary mb-2">Giá từ</label>
                            <select
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full bg-surface border-border rounded-lg text-sm py-2.5 px-3 text-white focus:ring-primary focus:border-primary"
                            >
                                <option value="">Không giới hạn</option>
                                <option value="300000000">300 triệu</option>
                                <option value="500000000">500 triệu</option>
                                <option value="800000000">800 triệu</option>
                                <option value="1000000000">1 tỷ</option>
                                <option value="2000000000">2 tỷ</option>
                            </select>
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className="block text-xs text-text-secondary mb-2">Giá đến</label>
                            <select
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full bg-surface border-border rounded-lg text-sm py-2.5 px-3 text-white focus:ring-primary focus:border-primary"
                            >
                                <option value="">Không giới hạn</option>
                                <option value="500000000">500 triệu</option>
                                <option value="800000000">800 triệu</option>
                                <option value="1000000000">1 tỷ</option>
                                <option value="2000000000">2 tỷ</option>
                                <option value="5000000000">5 tỷ</option>
                            </select>
                        </div>

                        {/* Clear Button */}
                        <div className="flex items-end">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2.5 text-sm font-medium text-text-secondary hover:text-white border border-border hover:border-primary rounded-lg transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cars.map((car, index) => (
                            <CarCard key={car._id} car={car} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <svg className="size-16 mx-auto mb-4 text-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-bold text-white mb-2">Không tìm thấy xe</h3>
                        <p className="text-text-secondary mb-4">Thử thay đổi bộ lọc để xem nhiều kết quả hơn</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="btn-secondary"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarsPage;
