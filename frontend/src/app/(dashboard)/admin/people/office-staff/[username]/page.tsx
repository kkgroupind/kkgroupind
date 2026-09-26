'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OfficeStaffDetailView } from '@/components/Admin/OfficeStaffDetailView';

export default function OfficeStaffDetailPage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username || '');

  return (
    <OfficeStaffDetailView
      username={username}
      backHref="/admin/people/office-staff"
      categoryLabel="Office Staff"
    />
  );
}
