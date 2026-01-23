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
        <aside className="w-64 border-r border-border-dark flex flex-col shrink-0 bg-background-dark h-full">
            {/* Header with close button on mobile */}
            <div className="p-6 flex items-center justify-between">
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
                    <h2 className="text-lg font-bold tracking-tight text-white">Quản trị</h2>
                </div>
                {/* Close button - only on mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-border-dark">
                <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="size-10 rounded-full bg-cover bg-center ring-2 ring-primary/20 bg-primary/20 flex items-center justify-center"
                            style={admin?.avatar ? { backgroundImage: `url("${admin.avatar}")` } : {}}
                        >
                            {!admin?.avatar && (
                                <span className="material-symbols-outlined text-primary">person</span>
                            )}
                        </div>
                        <div className="flex flex-col text-white">
                            <span className="text-sm font-bold">{admin?.fullName || 'Quản trị viên'}</span>
                            <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
                                {admin?.role === 'super_admin' ? 'Quản trị viên cao cấp' : 'Quản trị viên'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
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
