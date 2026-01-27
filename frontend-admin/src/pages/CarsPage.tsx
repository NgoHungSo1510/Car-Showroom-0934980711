import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsAPI, brandsAPI, carTypesAPI } from '../services/api';
import toast from 'react-hot-toast';

const CarsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: carsData, isLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: async () => {
      const response = await carsAPI.getAll();
      return response.data;
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const response = await brandsAPI.getAll();
      return response.data;
    },
  });

  const { data: carTypesData } = useQuery({
    queryKey: ['admin-car-types'],
    queryFn: async () => {
      const response = await carTypesAPI.getAll();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      toast.success('Đã xóa xe thành công');
    },
    onError: () => {
      toast.error('Không thể xóa xe');
    },
  });

  const cars = carsData?.data || [];
  const brands = brandsData?.data || [];
  const carTypes = carTypesData?.data || [];

  // Filtered cars
  const filteredCars = useMemo(() => {
    return cars.filter(
      (car: {
        name: string;
        brand?: { _id: string };
        carType?: { _id: string };
        status: string;
      }) => {
        const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = !brandFilter || car.brand?._id === brandFilter;
        const matchesType = !typeFilter || car.carType?._id === typeFilter;
        const matchesStatus = !statusFilter || car.status === statusFilter;
        return matchesSearch && matchesBrand && matchesType && matchesStatus;
      },
    );
  }, [cars, searchTerm, brandFilter, typeFilter, statusFilter]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Xóa xe "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
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
          <h2 className="text-xl md:text-2xl font-bold">Quản lý Showroom</h2>
          <p className="text-slate-400 text-sm mt-1">Quản lý danh sách xe trong showroom</p>
        </div>
        <a
          href="/cars/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Thêm xe</span>
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
            placeholder="Tìm kiếm theo tên xe..."
            className="w-full bg-background-dark border border-border-dark rounded-lg text-sm pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:ring-primary focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-[20px]">
            search
          </span>
        </div>

        {/* Brand Filter */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand: { _id: string; name: string }) => (
            <option key={brand._id} value={brand._id}>
              {brand.name}
            </option>
          ))}
        </select>

        {/* Car Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Tất cả loại xe</option>
          {carTypes.map((type: { _id: string; name: string }) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-background-dark border border-border-dark rounded-lg text-sm px-4 py-2 text-white focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Công khai</option>
          <option value="draft">Nháp</option>
        </select>

        {/* Results count */}
        <span className="text-xs text-slate-500">
          {filteredCars.length} / {cars.length} xe
        </span>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCars.length > 0 ? (
          filteredCars.map(
            (car: {
              _id: string;
              name: string;
              thumbnail?: string;
              brand?: { name: string };
              price: number;
              status: string;
              viewCount: number;
              model3D?: { hasModel: boolean };
            }) => (
              <div
                key={car._id}
                className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden group hover:border-primary/30 transition-colors"
              >
                {/* Image */}
                <div
                  className="h-40 bg-cover bg-center bg-border-dark flex items-center justify-center relative"
                  style={car.thumbnail ? { backgroundImage: `url("${car.thumbnail}")` } : {}}
                >
                  {!car.thumbnail && (
                    <span className="material-symbols-outlined text-4xl text-slate-600">
                      directions_car
                    </span>
                  )}
                  {car.model3D?.hasModel && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 rounded text-[10px] font-bold uppercase">
                      3D
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white">{car.name}</h3>
                      <p className="text-xs text-slate-400">{car.brand?.name || 'Chưa xác định'}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                        car.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {car.status === 'published' ? 'Công khai' : 'Nháp'}
                    </span>
                  </div>

                  <p className="text-primary font-bold">{formatPrice(car.price)}</p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-dark">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {car.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/cars/${car._id}`}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </a>
                      <button
                        onClick={() => handleDelete(car._id, car.name)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )
        ) : (
          <div className="col-span-full bg-card-dark border border-border-dark rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-4">
              directions_car
            </span>
            <p className="text-slate-500">
              {cars.length === 0 ? 'Chưa có xe nào.' : 'Không tìm thấy xe phù hợp.'}
            </p>
            {cars.length === 0 && (
              <a href="/cars/new" className="text-primary hover:underline text-sm">
                Thêm xe đầu tiên
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarsPage;
