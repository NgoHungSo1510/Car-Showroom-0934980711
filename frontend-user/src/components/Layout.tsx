import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout: React.FC = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            <Navbar />

            {/* Main Container */}
            <main className="flex flex-1 justify-center w-full max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
                {/* Center Content */}
                <div className="w-full max-w-[800px] flex flex-col gap-6 pb-20 lg:pb-0">
                    <Outlet />
                </div>
            </main>

            <Footer />

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-white/5 flex items-center justify-around py-3 z-50 backdrop-blur-md">
                <Link
                    to="/"
                    className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-primary' : 'text-slate-500'}`}
                >
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] font-medium">Trang chủ</span>
                </Link>

                <Link
                    to="/cars"
                    className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/cars') ? 'text-primary' : 'text-slate-500'}`}
                >
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <span className="text-[10px] font-medium">Showroom</span>
                </Link>

                <Link
                    to="/posts"
                    className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/posts') ? 'text-primary' : 'text-slate-500'}`}
                >
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span className="text-[10px] font-medium">Tin tức</span>
                </Link>
            </div>
        </div>
    );
};

export default Layout;
