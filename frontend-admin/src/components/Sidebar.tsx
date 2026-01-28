import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { path: '/', icon: 'dashboard', label: 'Tổng quan' },
  { path: '/posts', icon: 'newspaper', label: 'Tin tức' },
  { path: '/cars', icon: 'directions_car', label: 'Showroom' },
  { path: '/brands', icon: 'verified', label: 'Thương hiệu' },
  { path: '/car-types', icon: 'category', label: 'Loại xe' },
  { path: '/facebook-sync', icon: 'sync', label: 'Đồng bộ FB' },
  { path: '/ai-config', icon: 'tune', label: 'Cấu hình AI' },
  { path: '/notifications', icon: 'notifications', label: 'Thông báo' },
  { path: '/settings', icon: 'settings', label: 'Cài đặt' },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 theme-border border-r flex flex-col shrink-0 theme-bg h-full">
      {/* Header with close button on mobile */}
      <div className="p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight dark:text-white light:text-text-light">Quản trị</h2>
        </div>
        {/* Close button - only on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 touch-target flex items-center justify-center dark:hover:bg-white/5 light:hover:bg-black/5 rounded-lg transition-colors"
          aria-label="Đóng menu"
        >
          <span className="material-symbols-outlined theme-text-muted">close</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 md:px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-colors touch-target ${isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'theme-text-muted dark:hover:bg-white/5 light:hover:bg-black/5 dark:hover:text-white light:hover:text-text-light'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px] md:text-[24px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-3 md:p-4 theme-border border-t">
        <div className="dark:bg-white/5 light:bg-black/5 rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="size-10 rounded-full bg-cover bg-center ring-2 ring-primary/20 bg-primary/20 flex items-center justify-center"
              style={admin?.avatar ? { backgroundImage: `url("${admin.avatar}")` } : {}}
            >
              {!admin?.avatar && (
                <span className="material-symbols-outlined text-primary">person</span>
              )}
            </div>
            <div className="flex flex-col dark:text-white light:text-text-light min-w-0">
              <span className="text-sm font-bold truncate">{admin?.fullName || 'Quản trị viên'}</span>
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest truncate">
                {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold theme-text-muted dark:border-white/10 light:border-black/10 border rounded-lg dark:hover:bg-white/5 light:hover:bg-black/5 dark:hover:text-white light:hover:text-text-light transition-all touch-target"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

