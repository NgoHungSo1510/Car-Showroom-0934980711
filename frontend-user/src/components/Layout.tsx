import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollRestoration from './ScrollRestoration';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme, isAutoMode, setAutoMode } = useTheme();

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <ScrollRestoration />
      <Navbar />

      {/* Main Container - Wider for better 3D viewing */}
      <main className="flex flex-1 justify-center w-full max-w-[1200px] mx-auto px-4 lg:px-8 py-6">
        {/* Center Content - Responsive width */}
        <div className="w-full max-w-[900px] flex flex-col gap-6 pb-24 lg:pb-0">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* Theme Controls - Higher on mobile to avoid overlap with Zalo (which is at bottom-6) */}
      <div className="fixed bottom-36 lg:bottom-20 right-4 z-40 flex flex-col items-end gap-2">
        {/* Auto mode indicator */}
        {isAutoMode && (
          <button
            onClick={() => setAutoMode(false)}
            className="px-2 py-1 text-[10px] rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
            title="Click để tắt chế độ tự động"
          >
            🕐 Tự động
          </button>
        )}

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-surface border border-border shadow-lg hover:bg-surface-hover hover:scale-105 transition-all"
          title={
            isAutoMode
              ? `Chế độ tự động (${theme === 'light' ? 'Sáng' : 'Tối'})`
              : `Chế độ ${theme === 'light' ? 'Sáng' : 'Tối'}`
          }
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around py-3 z-50 backdrop-blur-md">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-primary' : 'text-text-secondary'}`}
        >
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[10px] font-medium">Trang chủ</span>
        </Link>

        <Link
          to="/cars"
          className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/cars') ? 'text-primary' : 'text-text-secondary'}`}
        >
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
          <span className="text-[10px] font-medium">Showroom</span>
        </Link>

        <Link
          to="/posts"
          className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/posts') ? 'text-primary' : 'text-text-secondary'}`}
        >
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <span className="text-[10px] font-medium">Tin tức</span>
        </Link>
      </div>
    </div>
  );
};

export default Layout;
