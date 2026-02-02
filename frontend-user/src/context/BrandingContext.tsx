import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '../services/api';

interface BrandingData {
  site_name: string;
  site_logo: string;
  site_hotline: string;
  site_address_1: string;
  site_address_2: string;
}

interface BrandingContextType {
  branding: BrandingData;
  isLoading: boolean;
}

// Default values
const defaultBranding: BrandingData = {
  site_name: 'VinFast Miền Trung',
  site_logo: '',
  site_hotline: '0934 98 07 11',
  site_address_1: 'Vincom Đà Nẵng - 910A Ngô Quyền, Sơn Trà',
  site_address_2: 'Showroom 3S - 03 Phạm Hùng, Cẩm Lệ',
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  isLoading: true,
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['branding-settings'],
    queryFn: async () => {
      const response = await settingsAPI.getBranding();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    retry: 1,
  });

  const branding: BrandingData = {
    ...defaultBranding,
    ...data,
  };

  // Dynamically update favicon to sync with admin avatar/logo setting
  useEffect(() => {
    if (branding.site_logo) {
      // Find existing favicon link or create new one
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/x-icon';
      link.href = branding.site_logo;

      // Also update Apple touch icon for mobile bookmarks
      let appleTouchIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }
      appleTouchIcon.href = branding.site_logo;
    }
  }, [branding.site_logo]);

  // Dynamically update page title with site name
  useEffect(() => {
    if (branding.site_name) {
      document.title = `${branding.site_name} | Đại lý VinFast Đà Nẵng`;
    }
  }, [branding.site_name]);

  return (
    <BrandingContext.Provider value={{ branding, isLoading }}>{children}</BrandingContext.Provider>
  );
};
