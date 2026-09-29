'use client';

import React from 'react';
import { AnnouncementsList } from '@/components/AnnouncementsList';
import { Megaphone } from 'lucide-react';
import { WorkerShell } from '@/components/Worker/WorkerShell';

export default function WorkerAnnouncementsPage() {
  return (
    <WorkerShell activeTab="announcements">
      <div className="space-y-6 max-w-5xl mx-auto pb-10 mt-6 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2A835F]/20 text-[#2A835F] flex items-center justify-center">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Announcements</h1>
          <p className="text-sm text-gray-400">Important notices and updates from the administration</p>
        </div>
      </div>
      
      <AnnouncementsList />
      </div>
    </WorkerShell>
  );
}
