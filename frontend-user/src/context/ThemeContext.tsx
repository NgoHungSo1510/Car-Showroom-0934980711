import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isAutoMode: boolean;
  setAutoMode: (auto: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isAutoMode: true,
  setAutoMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Determine theme based on time (6h-18h = light, 18h-6h = dark)
const getThemeByTime = (): Theme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAutoMode, setIsAutoMode] = useState(() => {
    const saved = localStorage.getItem('theme-auto-mode');
    return saved !== 'false'; // Default to auto
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (isAutoMode) {
      return getThemeByTime();
    }
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  // Update theme based on time if auto mode is enabled
  useEffect(() => {
    if (!isAutoMode) return;

    const updateTheme = () => {
      setTheme(getThemeByTime());
    };

    // Update immediately
    updateTheme();

    // Check every minute
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [isAutoMode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save auto mode preference
  useEffect(() => {
    localStorage.setItem('theme-auto-mode', String(isAutoMode));
  }, [isAutoMode]);

  const toggleTheme = () => {
    setIsAutoMode(false);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSetAutoMode = (auto: boolean) => {
    setIsAutoMode(auto);
    if (auto) {
      setTheme(getThemeByTime());
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isAutoMode, setAutoMode: handleSetAutoMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
