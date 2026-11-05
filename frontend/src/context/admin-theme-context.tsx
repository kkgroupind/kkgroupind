'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type AdminTheme = 'dark' | 'light';

interface AdminThemeContextType {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
  isDark: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

const THEME_STORAGE_KEY = 'kk_admin_theme';

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('dark');
  const [mounted, setMounted] = useState(false);

  const applyThemeToDocument = useCallback((t: AdminTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-admin-theme', t);
    if (t === 'light') {
      root.classList.add('admin-light');
      root.classList.remove('admin-dark');
    } else {
      root.classList.add('admin-dark');
      root.classList.remove('admin-light');
    }
  }, []);

  useEffect(() => {
    let savedTheme: AdminTheme = 'dark';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        savedTheme = stored;
      }
    } catch {
      // ignore localStorage errors
    }
    setThemeState(savedTheme);
    applyThemeToDocument(savedTheme);
    setMounted(true);
  }, [applyThemeToDocument]);

  const setTheme = useCallback(
    (newTheme: AdminTheme) => {
      setThemeState(newTheme);
      applyThemeToDocument(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // ignore storage errors
      }
    },
    [applyThemeToDocument]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

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
  return useContext(AdminThemeContext);
}
