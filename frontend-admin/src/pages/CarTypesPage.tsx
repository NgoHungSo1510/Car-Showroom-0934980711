import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carTypesAPI } from '../services/api';
import toast from 'react-hot-toast';

const CarTypesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<{
    _id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const { data: typesData, isLoading } = useQuery({
    queryKey: ['admin-car-types'],
    queryFn: async () => {
      const response = await carTypesAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => carTypesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-car-types'] });
      toast.success('Đã tạo loại xe thành công');
      closeModal();
    },
    onError: () => toast.error('Không thể tạo loại xe'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      carTypesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-car-types'] });
      toast.success('Đã cập nhật loại xe thành công');
      closeModal();
    },
    onError: () => toast.error('Không thể cập nhật loại xe'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carTypesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-car-types'] });
      toast.success('Đã xóa loại xe thành công');
    },
    onError: () => toast.error('Không thể xóa loại xe'),
  });

  const carTypes = typesData?.data || [];

  // Filtered car types
  const filteredCarTypes = useMemo(() => {
    return carTypes.filter((type: { name: string; description?: string }) => {
      const matchesSearch =
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [carTypes, searchTerm]);

  const openModal = (type?: { _id: string; name: string; description?: string }) => {
    if (type) {
      setEditingType(type);
      setFormData({ name: type.name, description: type.description || '' });
    } else {
      setEditingType(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên loại xe');
      return;
    }

    if (editingType) {
      updateMutation.mutate({ id: editingType._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Xóa loại xe "${name}"?`)) {
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
          <h2 className="text-2xl font-bold">Quản lý loại xe</h2>
          <p className="text-slate-400 text-sm mt-1">Quản lý các phân loại xe</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm loại xe
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-card-dark border border-border-dark rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            className="w-full bg-background-dark border border-border-dark rounded-lg text-sm pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:ring-primary focus:border-primary transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-500 text-[20px]">
            search
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {filteredCarTypes.length} / {carTypes.length} loại xe
        </span>
      </div>

      {/* Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCarTypes.map((type: { _id: string; name: string; description?: string }) => (
          <div
            key={type._id}
            className="bg-card-dark border border-border-dark rounded-xl p-4 group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white">{type.name}</h3>
                {type.description && (
                  <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(type)}
                  className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(type._id, type.name)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-dark border border-border-dark rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingType ? 'Chỉnh sửa loại xe' : 'Thêm loại xe'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên loại xe *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: SUV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background-dark border-border-dark rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary"
                  placeholder="VD: Xe thể thao đa dụng"
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
                  {editingType ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarTypesPage;
