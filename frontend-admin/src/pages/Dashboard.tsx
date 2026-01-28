import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data.data;
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await dashboardAPI.getActivity();
      return response.data.data;
    },
  });

  const stats = dashboardData?.stats;
  const recentCars = dashboardData?.recentCars || [];

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Card 1: Total Views */}
        <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border p-4 md:p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">visibility</span>
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              Hoạt động
            </span>
          </div>
          <div>
            <p className="dark:text-slate-400 light:text-slate-500 text-sm font-medium">Tổng lượt xem</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight dark:text-white light:text-text-light">
              {stats?.totalViews?.toLocaleString() || 0}
            </h3>
          </div>
        </div>

        {/* Card 2: Total Posts */}
        <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border p-4 md:p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">post_add</span>
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              {stats?.publishedPosts || 0} đã xuất bản
            </span>
          </div>
          <div>
            <p className="dark:text-slate-400 light:text-slate-500 text-sm font-medium">Tổng bài viết</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight dark:text-white light:text-text-light">
              {stats?.totalPosts || 0}
            </h3>
          </div>
        </div>

        {/* Card 3: Total Cars */}
        <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border p-4 md:p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">directions_car</span>
            </div>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              {stats?.publishedCars || 0} công khai
            </span>
          </div>
          <div>
            <p className="dark:text-slate-400 light:text-slate-500 text-sm font-medium">Tổng số xe</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight dark:text-white light:text-text-light">
              {stats?.totalCars || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column (Chart + Table) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border p-4 md:p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-4 dark:text-white light:text-text-light">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <a
                href="/posts/new"
                className="flex flex-col items-center gap-2 p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl dark:hover:bg-border-dark light:hover:bg-slate-100 transition-colors group"
              >
                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                  add_circle
                </span>
                <span className="text-sm font-medium dark:text-slate-300 light:text-slate-600">Tạo bài viết</span>
              </a>
              <a
                href="/cars/new"
                className="flex flex-col items-center gap-2 p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl dark:hover:bg-border-dark light:hover:bg-slate-100 transition-colors group"
              >
                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                  directions_car
                </span>
                <span className="text-sm font-medium dark:text-slate-300 light:text-slate-600">Thêm xe</span>
              </a>
              <a
                href="/brands"
                className="flex flex-col items-center gap-2 p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl dark:hover:bg-border-dark light:hover:bg-slate-100 transition-colors group"
              >
                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                  verified
                </span>
                <span className="text-sm font-medium dark:text-slate-300 light:text-slate-600">Thương hiệu</span>
              </a>
              <a
                href="/settings"
                className="flex flex-col items-center gap-2 p-4 dark:bg-background-dark light:bg-slate-50 rounded-xl dark:hover:bg-border-dark light:hover:bg-slate-100 transition-colors group"
              >
                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                  settings
                </span>
                <span className="text-sm font-medium dark:text-slate-300 light:text-slate-600">Cài đặt</span>
              </a>
            </div>
          </div>

          {/* Table: Recent Cars */}
          <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 md:p-6 dark:border-border-dark light:border-border-light border-b flex items-center justify-between">
              <h3 className="font-bold dark:text-white light:text-text-light">Xe mới thêm gần đây</h3>
              <a href="/cars" className="text-primary text-xs font-bold hover:underline">
                Xem Showroom
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="dark:bg-background-dark/30 light:bg-slate-50 dark:text-slate-500 light:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-4 md:px-6 py-4">Tên xe</th>
                    <th className="px-4 md:px-6 py-4">Trạng thái</th>
                    <th className="px-4 md:px-6 py-4">Lượt xem</th>
                    <th className="px-4 md:px-6 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-border-dark light:divide-border-light">
                  {recentCars.length > 0 ? (
                    recentCars.map(
                      (car: {
                        _id: string;
                        name: string;
                        thumbnail?: string;
                        status: string;
                        viewCount: number;
                      }) => (
                        <tr key={car._id} className="dark:hover:bg-white/5 light:hover:bg-slate-50 transition-colors">
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="size-10 rounded bg-cover bg-center dark:bg-border-dark light:bg-slate-100 flex items-center justify-center"
                                style={
                                  car.thumbnail
                                    ? { backgroundImage: `url("${car.thumbnail}")` }
                                    : {}
                                }
                              >
                                {!car.thumbnail && (
                                  <span className="material-symbols-outlined text-slate-400">
                                    directions_car
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-bold dark:text-white light:text-text-light">{car.name}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <span
                              className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${car.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-amber-500/10 text-amber-500'
                                }`}
                            >
                              {car.status === 'published' ? 'Công khai' : 'Nháp'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-sm dark:text-slate-400 light:text-slate-500">
                            {car.viewCount?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <a
                              href={`/cars/${car._id}`}
                              className="text-primary hover:opacity-70 transition-opacity"
                            >
                              <span className="material-symbols-outlined">edit_square</span>
                            </a>
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center dark:text-slate-500 light:text-slate-400">
                        Chưa có xe nào.{' '}
                        <a href="/cars/new" className="text-primary hover:underline">
                          Thêm xe đầu tiên
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Activity Logs) */}
        <div className="flex flex-col gap-6">
          <div className="dark:bg-card-dark light:bg-white dark:border-border-dark light:border-border-light border p-4 md:p-6 rounded-2xl flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold dark:text-white light:text-text-light">Hoạt động gần đây</h3>
              <button className="dark:text-slate-500 light:text-slate-400 dark:hover:text-white light:hover:text-text-light transition-colors">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
              {activityData && activityData.length > 0 ? (
                activityData.map(
                  (
                    activity: { type: string; action: string; title: string; date: string },
                    index: number,
                  ) => (
                    <div key={index} className="flex gap-4 relative">
                      {index < activityData.length - 1 && (
                        <div className="absolute top-8 bottom-[-24px] left-4 w-px dark:bg-border-dark light:bg-border-light"></div>
                      )}
                      <div
                        className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 border ${activity.type === 'car'
                            ? 'bg-primary/20 border-primary/20'
                            : 'bg-emerald-500/20 border-emerald-500/20'
                          }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] ${activity.type === 'car' ? 'text-primary' : 'text-emerald-500'
                            }`}
                        >
                          {activity.type === 'car' ? 'directions_car' : 'article'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 pb-2">
                        <p className="text-sm font-medium dark:text-slate-300 light:text-slate-600">
                          <span className="font-bold dark:text-white light:text-text-light capitalize">
                            {activity.action === 'created'
                              ? 'Đã tạo'
                              : activity.action === 'updated'
                                ? 'Đã cập nhật'
                                : activity.action}
                            :
                          </span>{' '}
                          {activity.title}
                        </p>
                        <span className="text-[10px] dark:text-slate-500 light:text-slate-400 uppercase tracking-widest font-bold">
                          {formatTimeAgo(activity.date)}
                        </span>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <p className="dark:text-slate-500 light:text-slate-400 text-center py-8">Chưa có hoạt động nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

