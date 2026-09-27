import React from 'react';
import { RoleGuard } from '@/components/role-guard';
import { WorkerProvider } from '@/context/worker-context';
import { WorkerLanguageProvider } from '@/context/worker-language-context';
import { WorkerMapProvider } from '@/context/worker-map-context';

export default function WorkerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRole="WORKER"
      loginRoute="/worker/login"
      roleLabel="Worker"
      accentColor="amber"
    >
      <WorkerLanguageProvider>
        <WorkerProvider>
          <WorkerMapProvider>{children}</WorkerMapProvider>
        </WorkerProvider>
      </WorkerLanguageProvider>
    </RoleGuard>
  );
}


