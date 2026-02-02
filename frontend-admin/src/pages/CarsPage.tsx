import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carsAPI, brandsAPI, carTypesAPI } from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CarsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

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

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/import/car-template`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'car_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải file mẫu');
    } catch (error) {
      toast.error('Không thể tải file mẫu');
    }
  };

  // Import from Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/admin/import/cars`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data.data);
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });

      if (response.data.data.success > 0) {
        toast.success(response.data.message);
      }
      if (response.data.data.failed > 0) {
        toast.error(`${response.data.data.failed} xe import thất bại`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import thất bại');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
          <h2 className="text-xl md:text-2xl font-bold dark:text-white light:text-text-light">Quản lý Showroom</h2>
          <p className="dark:text-slate-400 light:text-slate-500 text-sm mt-1">Quản lý danh sách xe trong showroom</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import Excel Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 touch-target"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span className="hidden sm:inline">Import Excel</span>
          </button>
          <a
            href="/cars/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 touch-target"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Thêm xe</span>
          </a>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="dark:bg-card-dark light:bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold dark:text-white light:text-text-light">Import xe từ Excel</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="p-2 hover:bg-slate-500/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined dark:text-slate-400 light:text-slate-500">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Step 1: Download template */}
              <div className="p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl">
                <p className="text-sm font-medium dark:text-white light:text-text-light mb-2">Bước 1: Tải file mẫu</p>
                <p className="text-xs dark:text-slate-400 light:text-slate-500 mb-3">
                  Tải file Excel mẫu, điền thông tin xe và upload lại.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Tải file mẫu (.xlsx)
                </button>
              </div>

              {/* Step 2: Upload */}
              <div className="p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl">
                <p className="text-sm font-medium dark:text-white light:text-text-light mb-2">Bước 2: Upload file Excel</p>
                <p className="text-xs dark:text-slate-400 light:text-slate-500 mb-3">
                  Upload file Excel đã điền thông tin xe.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang import...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Chọn file để import
                    </>
                  )}
                </button>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className="p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl">
                  <p className="text-sm font-medium dark:text-white light:text-text-light mb-2">Kết quả import</p>
                  <div className="flex gap-4 mb-2">
                    <span className="text-emerald-500 text-sm">✓ Thành công: {importResult.success}</span>
                    {importResult.failed > 0 && (
                      <span className="text-red-500 text-sm">✗ Thất bại: {importResult.failed}</span>
                    )}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto text-xs dark:text-red-400 light:text-red-600 space-y-1">
                      {importResult.errors.map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên xe..."
            className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm pl-10 pr-4 py-2.5 dark:text-white light:text-text-light placeholder-slate-400 focus:ring-primary focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
            search
          </span>
        </div>

        {/* Brand Filter */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2.5 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
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
          className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2.5 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
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
          className="dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg text-sm px-4 py-2.5 dark:text-white light:text-text-light focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Công khai</option>
          <option value="draft">Nháp</option>
        </select>

        {/* Results count */}
        <span className="text-xs dark:text-slate-500 light:text-slate-400">
          {filteredCars.length} / {cars.length} xe
        </span>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl overflow-hidden group hover:border-primary/30 transition-colors shadow-sm"
              >
                {/* Image */}
                <div
                  className="h-40 bg-cover bg-center dark:bg-border-dark light:bg-slate-100 flex items-center justify-center relative"
                  style={car.thumbnail ? { backgroundImage: `url("${car.thumbnail}")` } : {}}
                >
                  {!car.thumbnail && (
                    <span className="material-symbols-outlined text-4xl dark:text-slate-600 light:text-slate-300">
                      directions_car
                    </span>
                  )}
                  {car.model3D?.hasModel && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 rounded text-[10px] font-bold uppercase text-white">
                      3D
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold dark:text-white light:text-text-light">{car.name}</h3>
                      <p className="text-xs dark:text-slate-400 light:text-slate-500">{car.brand?.name || 'Chưa xác định'}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${car.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                      {car.status === 'published' ? 'Công khai' : 'Nháp'}
                    </span>
                  </div>

                  <p className="text-primary font-bold">{formatPrice(car.price)}</p>

                  <div className="flex items-center justify-between mt-4 pt-4 dark:border-border-dark light:border-border-light border-t">
                    <div className="flex items-center gap-1 text-xs dark:text-slate-400 light:text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {car.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/cars/${car._id}`}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors touch-target"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </a>
                      <button
                        onClick={() => handleDelete(car._id, car.name)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors touch-target"
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
          <div className="col-span-full dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl dark:text-slate-600 light:text-slate-300 mb-4">
              directions_car
            </span>
            <p className="dark:text-slate-500 light:text-slate-400">
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

