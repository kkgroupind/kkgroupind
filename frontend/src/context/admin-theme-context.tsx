'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type AdminTheme = 'dark' | 'light';

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
  isDark: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'kk_admin_theme';

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('dark');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AdminTheme | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved);
      applyThemeToDom(saved);
    } else {
      // Default to dark mode for cinematic KK Group styling
      setThemeState('dark');
      applyThemeToDom('dark');
    }
  }, []);

  const applyThemeToDom = (newTheme: AdminTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-admin-theme', newTheme);
    if (newTheme === 'light') {
      root.classList.add('admin-light');
      root.classList.remove('admin-dark');
    } else {
      root.classList.add('admin-dark');
      root.classList.remove('admin-light');
    }
  };

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
    applyThemeToDom(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <AdminThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme(): AdminThemeContextType {
  const context = useContext(AdminThemeContext);
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      theme: 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
      isDark: true,
    };
  }
  return context;
}
