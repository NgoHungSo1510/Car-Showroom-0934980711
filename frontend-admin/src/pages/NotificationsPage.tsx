import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: 'contact_car' | 'contact_post';
  refId: string;
  refTitle: string;
  refThumbnail?: string;
  isRead: boolean;
  createdAt: string;
  refData?: {
    _id: string;
    name?: string;
    title?: string;
    slug?: string;
    thumbnail?: string;
    coverImage?: string;
    price?: number;
    brand?: { name: string };
    carType?: { name: string };
    category?: string;
    excerpt?: string;
  };
}

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await notificationsAPI.getAll({ limit: 50 });
      return response.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('Đã đánh dấu tất cả là đã đọc');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('Đã xóa thông báo');
    },
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleViewDetail = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }

    // Fetch detail with refData
    try {
      const response = await notificationsAPI.getById(notification._id);
      setSelectedNotification(response.data.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching notification detail:', error);
      toast.error('Không thể tải chi tiết thông báo');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeDiff = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Thông báo tư vấn</h2>
          <p className="text-slate-400 text-sm mt-1">
            Danh sách yêu cầu tư vấn qua Zalo ({unreadCount} chưa đọc)
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-card-dark border border-border-dark hover:border-primary/30 text-white rounded-xl text-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification: Notification) => (
            <div
              key={notification._id}
              className={`bg-card-dark border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer hover:border-primary/30 ${
                notification.isRead ? 'border-border-dark' : 'border-primary/50 bg-primary/5'
              }`}
              onClick={() => handleViewDetail(notification)}
            >
              {/* Thumbnail */}
              <div className="size-16 rounded-lg bg-border-dark flex-shrink-0 overflow-hidden">
                {notification.refThumbnail ? (
                  <img src={notification.refThumbnail} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-slate-600">
                      {notification.type === 'contact_car' ? 'directions_car' : 'article'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter ${
                      notification.type === 'contact_car'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-purple-500/10 text-purple-400'
                    }`}
                  >
                    {notification.type === 'contact_car' ? 'Xe' : 'Bài viết'}
                  </span>
                  {!notification.isRead && <span className="size-2 rounded-full bg-primary"></span>}
                </div>
                <p className="font-bold text-white truncate">
                  Yêu cầu tư vấn: {notification.refTitle}
                </p>
                <p className="text-sm text-slate-400">
                  User liên hệ qua Zalo lúc {formatDate(notification.createdAt)}
                </p>
              </div>

              {/* Time */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-500">{getTimeDiff(notification.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Xóa thông báo này?')) {
                      deleteMutation.mutate(notification._id);
                    }
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card-dark border border-border-dark rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-4">
              notifications_off
            </span>
            <p className="text-slate-500">Chưa có thông báo nào.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-dark border border-border-dark rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter ${
                    selectedNotification.type === 'contact_car'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {selectedNotification.type === 'contact_car' ? 'Tư vấn xe' : 'Tư vấn bài viết'}
                </span>
                <h3 className="text-lg font-bold mt-2">Chi tiết yêu cầu tư vấn</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-border-dark rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Time Info */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Nhận lúc: {formatDate(selectedNotification.createdAt)}
              </div>

              {/* Referenced Item */}
              {selectedNotification.refData && (
                <div className="bg-background-dark rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">
                    {selectedNotification.type === 'contact_car'
                      ? 'Thông tin xe'
                      : 'Thông tin bài viết'}
                  </p>

                  {selectedNotification.type === 'contact_car' && (
                    <div className="flex gap-4">
                      {selectedNotification.refData.thumbnail && (
                        <img
                          src={selectedNotification.refData.thumbnail}
                          alt=""
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          {selectedNotification.refData.name}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {selectedNotification.refData.brand?.name} •{' '}
                          {selectedNotification.refData.carType?.name}
                        </p>
                        {selectedNotification.refData.price && (
                          <p className="text-primary font-bold mt-2">
                            {formatPrice(selectedNotification.refData.price)}
                          </p>
                        )}
                        <a
                          href={`/cars/${selectedNotification.refData._id}`}
                          className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                        >
                          Xem/Chỉnh sửa xe này →
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedNotification.type === 'contact_post' && (
                    <div className="flex gap-4">
                      {selectedNotification.refData.coverImage && (
                        <img
                          src={selectedNotification.refData.coverImage}
                          alt=""
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter bg-amber-500/10 text-amber-400">
                          {selectedNotification.refData.category}
                        </span>
                        <h4 className="font-bold text-white text-lg mt-1">
                          {selectedNotification.refData.title}
                        </h4>
                        {selectedNotification.refData.excerpt && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {selectedNotification.refData.excerpt}
                          </p>
                        )}
                        <a
                          href={`/posts/${selectedNotification.refData._id}`}
                          className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                        >
                          Xem/Chỉnh sửa bài viết này →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border-dark flex justify-end gap-3">
              <button
                onClick={() => {
                  if (confirm('Xóa thông báo này?')) {
                    deleteMutation.mutate(selectedNotification._id);
                    setIsDetailModalOpen(false);
                  }
                }}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Xóa thông báo
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg font-bold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
