import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    zalo_phone: '',
    zalo_greeting: '',
    site_name: '',
    site_logo: '',
    site_hotline: '',
    site_address_1: '',
    site_address_2: '',
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await settingsAPI.getAll();
      return response.data;
    },
  });

  useEffect(() => {
    if (settingsData?.data) {
      const settings = settingsData.data;
      const newFormData: Record<string, string> = {
        zalo_phone: '0934980711',
        zalo_greeting: 'Xin chào! Tôi quan tâm đến xe và muốn được tư vấn.',
        site_name: 'VinFast Miền Trung',
        site_logo: '',
        site_hotline: '0934 98 07 11',
        site_address_1: 'Vincom Đà Nẵng - 910A Ngô Quyền, Sơn Trà',
        site_address_2: 'Showroom 3S - 03 Phạm Hùng, Cẩm Lệ',
      };

      settings.forEach((s: { key: string; value: string }) => {
        if (s.key in newFormData && s.value) {
          newFormData[s.key] = s.value;
        }
      });

      setFormData(newFormData as typeof formData);
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      return settingsAPI.update(data.key, data.value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  const handleSave = async () => {
    try {
      await Promise.all([
        updateMutation.mutateAsync({ key: 'zalo_phone', value: formData.zalo_phone }),
        updateMutation.mutateAsync({ key: 'zalo_greeting', value: formData.zalo_greeting }),
        updateMutation.mutateAsync({ key: 'site_name', value: formData.site_name }),
        updateMutation.mutateAsync({ key: 'site_logo', value: formData.site_logo }),
        updateMutation.mutateAsync({ key: 'site_hotline', value: formData.site_hotline }),
        updateMutation.mutateAsync({ key: 'site_address_1', value: formData.site_address_1 }),
        updateMutation.mutateAsync({ key: 'site_address_2', value: formData.site_address_2 }),
      ]);
      toast.success('Đã lưu cài đặt thành công');
    } catch {
      toast.error('Không thể lưu cài đặt');
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white light:text-text-light">Cài đặt</h2>
        <p className="dark:text-slate-400 light:text-slate-500 text-sm mt-1">Cấu hình showroom của bạn</p>
      </div>

      {/* General Settings */}
      <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white light:text-text-light">
          <span className="material-symbols-outlined text-primary">settings</span>
          Cài đặt chung
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">Tên website</label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
              placeholder="VinFast Miền Trung"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">Logo (URL ảnh)</label>
            <input
              type="text"
              value={formData.site_logo}
              onChange={(e) => setFormData({ ...formData, site_logo: e.target.value })}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
              placeholder="https://example.com/logo.png"
            />
            {formData.site_logo && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={formData.site_logo}
                  alt="Logo preview"
                  className="h-12 w-12 rounded-full object-cover dark:border-border-dark light:border-border-light border"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
                <span className="text-xs dark:text-slate-500 light:text-slate-400">Preview logo</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">Hotline</label>
            <input
              type="text"
              value={formData.site_hotline}
              onChange={(e) => setFormData({ ...formData, site_hotline: e.target.value })}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
              placeholder="0934 98 07 11"
            />
          </div>
        </div>
      </div>

      {/* Showroom Addresses */}
      <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white light:text-text-light">
          <span className="material-symbols-outlined text-primary">location_on</span>
          Địa chỉ Showroom
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">Showroom 1</label>
            <input
              type="text"
              value={formData.site_address_1}
              onChange={(e) => setFormData({ ...formData, site_address_1: e.target.value })}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
              placeholder="Vincom Đà Nẵng - 910A Ngô Quyền, Sơn Trà"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">Showroom 2</label>
            <input
              type="text"
              value={formData.site_address_2}
              onChange={(e) => setFormData({ ...formData, site_address_2: e.target.value })}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
              placeholder="Showroom 3S - 03 Phạm Hùng, Cẩm Lệ"
            />
          </div>
        </div>
      </div>

      {/* Zalo Settings */}
      <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white light:text-text-light">
          <span className="material-symbols-outlined text-primary">chat</span>
          Liên hệ Zalo
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">
              Số điện thoại Zalo
            </label>
            <input
              type="text"
              value={formData.zalo_phone}
              onChange={(e) => setFormData({ ...formData, zalo_phone: e.target.value })}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary"
              placeholder="0901234567"
            />
            <p className="text-xs dark:text-slate-500 light:text-slate-400 mt-1">
              Số này sẽ được dùng cho nút liên hệ Zalo thông minh
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 light:text-slate-600 mb-2">
              Lời chào mặc định
            </label>
            <textarea
              value={formData.zalo_greeting}
              onChange={(e) => setFormData({ ...formData, zalo_greeting: e.target.value })}
              rows={3}
              className="w-full dark:bg-background-dark light:bg-slate-50 dark:border-border-dark light:border-border-light border rounded-lg px-4 py-3 dark:text-white light:text-text-light focus:ring-primary focus:border-primary resize-none"
              placeholder="Xin chào! Tôi quan tâm đến xe {car_name}..."
            />
            <p className="text-xs dark:text-slate-500 light:text-slate-400 mt-1">
              Sử dụng {'{car_name}'} làm placeholder cho tên xe
            </p>
          </div>
        </div>
      </div>



      {/* Save Button */}
      <div className="flex justify-end pb-10">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-accent-blue text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 touch-target"
        >
          {updateMutation.isPending ? (
            <>
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Lưu cài đặt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
