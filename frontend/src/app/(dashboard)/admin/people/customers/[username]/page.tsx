'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CustomerDetailView } from '@/components/Admin/CustomerDetailView';

export default function CustomerDetailPage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username || '');

  return (
    <CustomerDetailView
      username={username}
      backHref="/admin/people/customers"
    />
  );
}

