import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Stored mode can be: 'system', 'light', 'dark' (default: 'system')
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('snns_theme') || 'system';
    } catch (e) {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('snns_theme');
      if (stored === 'dark') return 'dark';
      if (stored === 'light') return 'light';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  const applyTheme = (effectiveTheme) => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setResolvedTheme(effectiveTheme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateEffectiveTheme = () => {
      if (theme === 'dark') {
        applyTheme('dark');
      } else if (theme === 'light') {
        applyTheme('light');
      } else {
        // 'system'
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    updateEffectiveTheme();

    const handleChange = (e) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    try {
      localStorage.setItem('snns_theme', newTheme);
    } catch (e) {}
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, isDark: resolvedTheme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
