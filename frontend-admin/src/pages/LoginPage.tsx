import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
    const { login, isAuthenticated, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
            return;
        }

        setIsSubmitting(true);
        try {
            await login(username, password);
            toast.success('Đăng nhập thành công!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="size-16 text-primary mb-4">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path
                                clipRule="evenodd"
                                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                                fill="currentColor"
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Trang Quản Trị</h1>
                    <p className="text-slate-400 text-sm mt-2">Đăng nhập để quản lý showroom</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-card-dark border border-border-dark rounded-2xl p-8">
                    <div className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500">
                                    person
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    className="w-full bg-background-dark border-border-dark rounded-lg text-sm pl-10 pr-4 py-3 focus:ring-primary focus:border-primary transition-all text-white placeholder-slate-500"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-500">
                                    lock
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full bg-background-dark border-border-dark rounded-lg text-sm pl-10 pr-4 py-3 focus:ring-primary focus:border-primary transition-all text-white placeholder-slate-500"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-primary hover:bg-accent-blue text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">login</span>
                                    <span>Đăng nhập</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    Hệ thống quản trị Showroom Xe 3D v1.0
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
