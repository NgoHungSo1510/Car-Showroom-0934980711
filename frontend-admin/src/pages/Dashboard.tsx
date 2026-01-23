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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1: Total Views */}
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">visibility</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            Hoạt động
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Tổng lượt xem</p>
                        <h3 className="text-3xl font-bold mt-1 tracking-tight text-white">
                            {stats?.totalViews?.toLocaleString() || 0}
                        </h3>
                    </div>
                </div>

                {/* Card 2: Total Posts */}
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">post_add</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            {stats?.publishedPosts || 0} đã xuất bản
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Tổng bài viết</p>
                        <h3 className="text-3xl font-bold mt-1 tracking-tight text-white">
                            {stats?.totalPosts || 0}
                        </h3>
                    </div>
                </div>

                {/* Card 3: Total Cars */}
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">directions_car</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            {stats?.publishedCars || 0} công khai
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Tổng số xe</p>
                        <h3 className="text-3xl font-bold mt-1 tracking-tight text-white">
                            {stats?.totalCars || 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
                {/* Left Column (Chart + Table) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Quick Actions */}
                    <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                        <h3 className="text-lg font-bold mb-4">Thao tác nhanh</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <a
                                href="/posts/new"
                                className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-xl hover:bg-border-dark transition-colors group"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                                    add_circle
                                </span>
                                <span className="text-sm font-medium text-slate-300">Tạo bài viết</span>
                            </a>
                            <a
                                href="/cars/new"
                                className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-xl hover:bg-border-dark transition-colors group"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                                    directions_car
                                </span>
                                <span className="text-sm font-medium text-slate-300">Thêm xe</span>
                            </a>
                            <a
                                href="/brands"
                                className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-xl hover:bg-border-dark transition-colors group"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                                    verified
                                </span>
                                <span className="text-sm font-medium text-slate-300">Thương hiệu</span>
                            </a>
                            <a
                                href="/settings"
                                className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-xl hover:bg-border-dark transition-colors group"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">
                                    settings
                                </span>
                                <span className="text-sm font-medium text-slate-300">Cài đặt</span>
                            </a>
                        </div>
                    </div>

                    {/* Table: Recent Cars */}
                    <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-border-dark flex items-center justify-between">
                            <h3 className="font-bold">Xe mới thêm gần đây</h3>
                            <a href="/cars" className="text-primary text-xs font-bold hover:underline">
                                Xem Showroom
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-background-dark/30 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Tên xe</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4">Lượt xem</th>
                                        <th className="px-6 py-4">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark">
                                    {recentCars.length > 0 ? (
                                        recentCars.map((car: { _id: string; name: string; thumbnail?: string; status: string; viewCount: number }) => (
                                            <tr key={car._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="size-10 rounded bg-cover bg-center bg-border-dark flex items-center justify-center"
                                                            style={car.thumbnail ? { backgroundImage: `url("${car.thumbnail}")` } : {}}
                                                        >
                                                            {!car.thumbnail && (
                                                                <span className="material-symbols-outlined text-slate-500">directions_car</span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-bold">{car.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${car.status === 'published'
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : 'bg-amber-500/10 text-amber-400'
                                                            }`}
                                                    >
                                                        {car.status === 'published' ? 'Công khai' : 'Nháp'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {car.viewCount?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href={`/cars/${car._id}`}
                                                        className="text-primary hover:text-white transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined">edit_square</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                Chưa có xe nào. <a href="/cars/new" className="text-primary hover:underline">Thêm xe đầu tiên</a>
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
                    <div className="bg-card-dark border border-border-dark p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold">Hoạt động gần đây</h3>
                            <button className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">refresh</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                            {activityData && activityData.length > 0 ? (
                                activityData.map((activity: { type: string; action: string; title: string; date: string }, index: number) => (
                                    <div key={index} className="flex gap-4 relative">
                                        {index < activityData.length - 1 && (
                                            <div className="absolute top-8 bottom-[-24px] left-4 w-px bg-border-dark"></div>
                                        )}
                                        <div
                                            className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 border ${activity.type === 'car'
                                                ? 'bg-primary/20 border-primary/20'
                                                : 'bg-emerald-500/20 border-emerald-500/20'
                                                }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined text-[16px] ${activity.type === 'car' ? 'text-primary' : 'text-emerald-400'
                                                    }`}
                                            >
                                                {activity.type === 'car' ? 'directions_car' : 'article'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 pb-2">
                                            <p className="text-sm font-medium">
                                                <span className="font-bold text-white capitalize">
                                                    {activity.action === 'created' ? 'Đã tạo' : activity.action === 'updated' ? 'Đã cập nhật' : activity.action}:
                                                </span>{' '}
                                                {activity.title}
                                            </p>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                {formatTimeAgo(activity.date)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center py-8">Chưa có hoạt động nào</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
