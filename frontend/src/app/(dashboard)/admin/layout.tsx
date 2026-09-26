import React from 'react';
import { RoleGuard } from '@/components/role-guard';
import { AdminLayout } from '@/components/Admin/admin-layout';
import { AdminThemeProvider } from '@/context/admin-theme-context';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRole="SUPER_ADMIN"
      loginRoute="/admin/login"
      roleLabel="Super Admin"
      accentColor="purple"
    >
      <AdminThemeProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminThemeProvider>
    </RoleGuard>
  );
}
