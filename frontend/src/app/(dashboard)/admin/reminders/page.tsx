'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRemindersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/operations/reminders');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-xs text-slate-400">Redirecting to Service Reminders...</p>
    </div>
  );
}
