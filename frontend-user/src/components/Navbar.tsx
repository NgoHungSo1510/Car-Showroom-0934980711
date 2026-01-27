import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useBranding } from '../context/BrandingContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { branding } = useBranding();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-border bg-background/90 backdrop-blur-md px-6 md:px-10 py-3">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {branding.site_logo ? (
            <img
              src={branding.site_logo}
              alt={branding.site_name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-text-primary font-bold">
              V
            </div>
          )}
          <h2 className="text-lg font-bold leading-tight tracking-tight hidden sm:block gold-text-gradient">
            {branding.site_name}
          </h2>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavLink
            to="/cars"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`
            }
          >
            Showroom
          </NavLink>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`
            }
          >
            Cộng đồng
          </NavLink>
          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`
            }
          >
            Tin tức
          </NavLink>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
        {/* Search */}
        <form onSubmit={handleSubmit} className="hidden md:block w-64">
          <div className="flex w-full h-10 items-stretch rounded-lg bg-surface-hover border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex items-center justify-center pl-4 text-primary">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 focus:outline-none placeholder:text-text-secondary text-sm text-text-primary px-3"
              placeholder="Tìm xe, tin tức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm"
            />
          </div>
        </form>

        {/* Mobile Search Button */}
        <button
          onClick={() => navigate('/search')}
          className="md:hidden p-2 text-text-secondary hover:text-primary transition-colors"
        >
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* User Avatar */}
        <div className="size-10 rounded-full bg-primary/20 ring-2 ring-primary/50 flex items-center justify-center">
          <svg
            className="size-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
