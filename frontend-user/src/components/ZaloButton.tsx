import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI, notificationsAPI } from '../services/api';

interface ZaloButtonProps {
  // For cars
  carId?: string;
  carName?: string;
  carThumbnail?: string;
  // For posts
  postId?: string;
  postTitle?: string;
  postThumbnail?: string;
}

const ZaloButton: React.FC<ZaloButtonProps> = ({
  carId,
  carName,
  carThumbnail,
  postId,
  postTitle,
  postThumbnail,
}) => {
  const { data } = useQuery({
    queryKey: ['zalo-settings'],
    queryFn: async () => {
      const response = await settingsAPI.getZalo();
      return response.data.data;
    },
    staleTime: Infinity, // Cache forever
  });

  const handleClick = async () => {
    if (!data?.zalo_phone) return;

    let message = '';
    let notificationType: 'contact_car' | 'contact_post';
    let refId = '';
    let refTitle = '';
    let refThumbnail = '';

    // Determine the source and create appropriate message
    if (carId && carName) {
      notificationType = 'contact_car';
      refId = carId;
      refTitle = carName;
      refThumbnail = carThumbnail || '';
      message = `Xin chào! Tôi vừa xem xe "${carName}" trên website của bạn và muốn được tư vấn thêm.`;
    } else if (postId && postTitle) {
      notificationType = 'contact_post';
      refId = postId;
      refTitle = postTitle;
      refThumbnail = postThumbnail || '';
      message = `Xin chào! Tôi vừa đọc bài viết "${postTitle}" trên website của bạn và muốn được tư vấn thêm.`;
    } else {
      // Fallback to default message
      message = data.zalo_greeting || 'Xin chào! Tôi cần được tư vấn.';
      notificationType = 'contact_car';
      refId = '';
      refTitle = 'Liên hệ chung';
    }

    // Log notification to backend (fire and forget)
    if (refId) {
      try {
        await notificationsAPI.contact({
          type: notificationType,
          refId,
          refTitle,
          refThumbnail,
        });
      } catch (error) {
        // Silently fail - don't block the Zalo redirect
        console.error('Failed to log notification:', error);
      }
    }

    // Open Zalo
    const encodedMessage = encodeURIComponent(message);
    const zaloUrl = `https://zalo.me/${data.zalo_phone}?text=${encodedMessage}`;
    window.open(zaloUrl, '_blank');
  };

  if (!data?.zalo_phone) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat Zalo"
    >
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25"></span>

      {/* Button */}
      <div className="relative flex items-center justify-center size-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:scale-110">
        <svg viewBox="0 0 48 48" className="size-7 text-text-primary" fill="currentColor">
          <path d="M24 0C10.745 0 0 10.745 0 24c0 13.255 10.745 24 24 24s24-10.745 24-24C48 10.745 37.255 0 24 0zm10.88 32.533c-.746 2.133-3.76 3.894-5.707 4.32-1.947.426-3.413.533-5.36-.534-1.173-.64-2.773-1.493-4.8-2.88-8.427-5.76-12.587-13.653-12.96-14.4-.373-.746-3.093-4-3.093-7.68s1.6-5.44 2.346-6.186c.747-.747 1.6-.96 2.134-.96h1.493c.48 0 1.12-.16 1.707 1.28.586 1.44 2.08 5.013 2.24 5.386.16.374.267.8.054 1.28-.213.48-.32.8-.64 1.227-.32.427-.693.96-1.013 1.28-.32.32-.64.693-.267 1.333.373.64 1.653 2.773 3.573 4.427 2.453 2.133 4.587 2.826 5.227 3.146.64.32 1.013.267 1.387-.16.373-.427 1.6-1.867 2.026-2.507.427-.64.853-.533 1.44-.32.587.213 3.707 1.76 4.347 2.08.64.32 1.067.48 1.227.747.16.267.16 1.493-.587 2.88z" />
        </svg>
      </div>

      {/* Tooltip */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-surface text-text-primary text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Liên hệ tư vấn qua Zalo
      </span>
    </button>
  );
};

export default ZaloButton;
