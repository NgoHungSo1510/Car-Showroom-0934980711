import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Store scroll positions for each route
const scrollPositions = new Map<string, number>();

export const useScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // Save scroll position of previous page before navigating
    if (prevPath !== currentPath) {
      scrollPositions.set(prevPath, window.scrollY);
    }

    // Handle scroll based on navigation type
    if (navigationType === 'POP') {
      // Going back - restore previous scroll position
      const savedPosition = scrollPositions.get(currentPath) || 0;
      setTimeout(() => {
        window.scrollTo({ top: savedPosition, behavior: 'instant' });
      }, 0);
    } else {
      // New navigation - scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    prevPathRef.current = currentPath;
  }, [location.pathname, navigationType]);
};

// Component wrapper for scroll restoration
const ScrollRestoration: React.FC = () => {
  useScrollRestoration();
  return null;
};

export default ScrollRestoration;
