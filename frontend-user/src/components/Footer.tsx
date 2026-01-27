import React from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '../context/BrandingContext';

const Footer: React.FC = () => {
  const { branding } = useBranding();

  return (
    <>
      {/* Mobile Compact Footer - show above bottom nav */}
      <footer className="lg:hidden bg-surface border-t border-border py-4 px-4 mb-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            {branding.site_logo ? (
              <img
                src={branding.site_logo}
                alt={branding.site_name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-text-primary font-bold text-xs">
                V
              </div>
            )}
            <span className="text-sm font-bold gold-text-gradient">{branding.site_name}</span>
          </div>
          <a
            href={`tel:${branding.site_hotline?.replace(/\s/g, '')}`}
            className="text-primary font-bold text-sm hover:underline"
          >
            📞 {branding.site_hotline}
          </a>
          <p className="text-text-secondary text-[10px]">
            © 2026 {branding.site_name}
          </p>
        </div>
      </footer>

      {/* Desktop Full Footer */}
      <footer className="hidden lg:block bg-surface border-t border-border mt-10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Info */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                {branding.site_logo ? (
                  <img
                    src={branding.site_logo}
                    alt={branding.site_name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-text-primary font-bold text-xl">
                    V
                  </div>
                )}
                <span className="text-xl font-bold gold-text-gradient">{branding.site_name}</span>
              </Link>
              <p className="text-text-secondary text-sm max-w-md">
                Đại lý ủy quyền chính hãng VinFast tại Đà Nẵng. Chuyên cung cấp các dòng xe điện
                VinFast với chính sách ưu đãi tốt nhất.
              </p>
              <a
                href={`tel:${branding.site_hotline?.replace(/\s/g, '')}`}
                className="inline-block text-primary font-bold text-lg mt-3 hover:underline"
              >
                📞 Hotline: {branding.site_hotline}
              </a>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-text-primary font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/cars"
                    className="text-text-secondary text-sm hover:text-primary transition-colors"
                  >
                    Showroom xe
                  </Link>
                </li>
                <li>
                  <Link
                    to="/posts"
                    className="text-text-secondary text-sm hover:text-primary transition-colors"
                  >
                    Tin tức & Khuyến mãi
                  </Link>
                </li>
                <li>
                  <a
                    href={`tel:${branding.site_hotline?.replace(/\s/g, '')}`}
                    className="text-text-secondary text-sm hover:text-primary transition-colors"
                  >
                    Đặt lịch lái thử
                  </a>
                </li>
              </ul>
            </div>

            {/* Showroom */}
            <div>
              <h3 className="text-text-primary font-semibold mb-4">Showroom</h3>
              <ul className="space-y-3 text-text-secondary text-sm">
                {branding.site_address_1 && (
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-4 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{branding.site_address_1}</span>
                  </li>
                )}
                {branding.site_address_2 && (
                  <li className="flex items-start gap-2">
                    <svg
                      className="size-4 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{branding.site_address_2}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border mt-8 pt-8 text-center text-text-secondary text-sm">
            © 2026 {branding.site_name} - Đại lý ủy quyền VinFast Đà Nẵng. Hotline:{' '}
            {branding.site_hotline}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
