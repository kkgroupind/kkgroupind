'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WorkerDetailView } from '@/components/Admin/WorkerDetailView';

export default function WorkerDetailPage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username || '');

  return (
    <WorkerDetailView
      username={username}
      backHref="/admin/people/workers"
      categoryLabel="Workers"
    />
  );
}
