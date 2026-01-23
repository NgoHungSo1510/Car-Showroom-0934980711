import React, { createContext, useContext, ReactNode } from 'react';
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

    return (
        <BrandingContext.Provider value={{ branding, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
};
