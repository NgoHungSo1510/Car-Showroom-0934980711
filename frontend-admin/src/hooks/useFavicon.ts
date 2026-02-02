import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '../services/api';

/**
 * Hook to dynamically update the browser tab favicon based on admin_favicon setting
 */
export const useFavicon = () => {
    const { data: settingsData } = useQuery({
        queryKey: ['admin-settings-favicon'],
        queryFn: async () => {
            const response = await settingsAPI.getAll();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // Cache 5 minutes
        retry: 1,
    });

    useEffect(() => {
        if (!settingsData?.data) return;

        // Find admin_favicon setting
        const faviconSetting = settingsData.data.find(
            (s: { key: string; value: string }) => s.key === 'admin_favicon'
        );

        if (faviconSetting?.value) {
            // Find existing favicon link or create new one
            let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.type = 'image/x-icon';
            link.href = faviconSetting.value;

            // Also update Apple touch icon for mobile bookmarks
            let appleTouchIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
            if (!appleTouchIcon) {
                appleTouchIcon = document.createElement('link');
                appleTouchIcon.rel = 'apple-touch-icon';
                document.head.appendChild(appleTouchIcon);
            }
            appleTouchIcon.href = faviconSetting.value;
        }
    }, [settingsData]);
};
