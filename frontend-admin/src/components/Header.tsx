import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';

interface HeaderProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Tổng quan',
  '/posts': 'Quản lý tin tức',
  '/posts/new': 'Tạo bài viết',
  '/cars': 'Quản lý Showroom',
  '/cars/new': 'Thêm xe mới',
  '/brands': 'Quản lý thương hiệu',
  '/car-types': 'Quản lý loại xe',
  '/notifications': 'Thông báo',
  '/settings': 'Cài đặt',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const response = await notificationsAPI.getUnreadCount();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData?.count || 0;

  // Get page title based on route
  const getPageTitle = () => {
    // Check for dynamic routes
    if (location.pathname.startsWith('/posts/') && location.pathname !== '/posts/new') {
      return 'Chỉnh sửa bài viết';
    }
    if (location.pathname.startsWith('/cars/') && location.pathname !== '/cars/new') {
      return 'Chỉnh sửa thông tin xe';
    }
    return pageTitles[location.pathname] || 'Quản trị';
  };

  return (
    <header className="h-16 border-b border-border-dark flex items-center justify-between px-4 md:px-8 shrink-0 bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Hamburger Menu - Mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-slate-300">menu</span>
        </button>

        <h1 className="text-lg md:text-xl font-bold text-white">{getPageTitle()}</h1>

        {/* Status badge - hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
          <span className="size-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
            Hệ thống hoạt động
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/notifications"
          className="relative size-10 flex items-center justify-center bg-card-dark border border-border-dark rounded-lg hover:bg-border-dark transition-colors"
        >
          <span className="material-symbols-outlined text-slate-300">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
