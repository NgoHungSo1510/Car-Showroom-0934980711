import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, setTheme, resolvedTheme } = useTheme();

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

  // Cycle through themes: system -> light -> dark -> system
  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  // Get theme icon
  const getThemeIcon = () => {
    if (theme === 'system') {
      return 'contrast'; // Auto icon
    } else if (theme === 'light') {
      return 'light_mode'; // Sun icon
    } else {
      return 'dark_mode'; // Moon icon
    }
  };

  // Get theme label for tooltip
  const getThemeLabel = () => {
    if (theme === 'system') {
      return `Tự động (${resolvedTheme === 'dark' ? 'Tối' : 'Sáng'})`;
    } else if (theme === 'light') {
      return 'Sáng';
    } else {
      return 'Tối';
    }
  };

  return (
    <header className="h-14 md:h-16 border-b theme-border flex items-center justify-between px-3 md:px-8 shrink-0 theme-bg backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Hamburger Menu - Mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 touch-target flex items-center justify-center hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 rounded-lg transition-colors"
          aria-label="Mở menu"
        >
          <span className="material-symbols-outlined theme-text-muted">menu</span>
        </button>

        <h1 className="text-base md:text-xl font-bold dark:text-white light:text-text-light truncate max-w-[150px] sm:max-w-none">
          {getPageTitle()}
        </h1>

        {/* Status badge - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
          <span className="size-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
            Hoạt động
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className="size-9 md:size-10 flex items-center justify-center theme-card border rounded-lg hover:bg-primary/10 transition-colors touch-target"
          title={`Theme: ${getThemeLabel()}`}
          aria-label={`Đổi theme: ${getThemeLabel()}`}
        >
          <span className="material-symbols-outlined text-[20px] md:text-[24px] theme-text-muted">
            {getThemeIcon()}
          </span>
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative size-9 md:size-10 flex items-center justify-center theme-card border rounded-lg hover:bg-primary/10 transition-colors touch-target"
          aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
        >
          <span className="material-symbols-outlined text-[20px] md:text-[24px] theme-text-muted">notifications</span>
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

