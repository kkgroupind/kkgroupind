'use client';

import React, { createContext, useContext, useEffect } from 'react';

type AdminTheme = 'dark';

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

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-admin-theme', 'dark');
    root.classList.add('admin-dark');
    root.classList.remove('admin-light');

    // Clean up any stale light theme preference from local storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kk_admin_theme');
      } catch (e) {
        // ignore storage errors
      }
    }
  }, []);

  return (
    <AdminThemeContext.Provider
      value={{
        theme: 'dark',
        toggleTheme: () => {},
        setTheme: () => {},
        isDark: true,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme(): AdminThemeContextType {
  return useContext(AdminThemeContext);
}
