import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsAPI } from '../services/api';
import toast from 'react-hot-toast';

const BrandsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<{
    _id: string;
    name: string;
    country?: string;
  } | null>(null);
  const [formData, setFormData] = useState({ name: '', country: '' });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => {
      const response = await brandsAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; country?: string }) => brandsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success('Đã tạo thương hiệu thành công');
      closeModal();
    },
    onError: () => toast.error('Không thể tạo thương hiệu'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; country?: string } }) =>
      brandsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success('Đã cập nhật thương hiệu thành công');
      closeModal();
    },
    onError: () => toast.error('Không thể cập nhật thương hiệu'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.success('Đã xóa thương hiệu thành công');
    },
    onError: () => toast.error('Không thể xóa thương hiệu'),
  });

  const brands = brandsData?.data || [];

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter((brand: { name: string; country?: string }) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [brands, searchTerm]);

  const openModal = (brand?: { _id: string; name: string; country?: string }) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, country: brand.country || '' });
    } else {
      setEditingBrand(null);
      setFormData({ name: '', country: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ name: '', country: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu');
      return;
    }

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Xóa thương hiệu "${name}"?`)) {
      deleteMutation.mutate(id);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý thương hiệu</h2>
          <p className="text-slate-400 text-sm mt-1">Quản lý các hãng xe</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm thương hiệu
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-card-dark border border-border-dark rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc quốc gia..."
            className="w-full bg-background-dark border border-border-dark rounded-lg text-sm pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:ring-primary focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-[20px]">
            search
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {filteredBrands.length} / {brands.length} thương hiệu
        </span>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBrands.map(
          (brand: { _id: string; name: string; country?: string; isActive: boolean }) => (
            <div
              key={brand._id}
              className="bg-card-dark border border-border-dark rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-colors"
            >
              <div>
                <h3 className="font-bold text-white">{brand.name}</h3>
                {brand.country && <p className="text-xs text-slate-400">{brand.country}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(brand)}
                  className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(brand._id, brand.name)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên thương hiệu *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quốc gia</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: Nhật Bản"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {editingBrand ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsPage;
