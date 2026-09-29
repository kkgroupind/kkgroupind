'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Megaphone, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { announcementService, type Announcement } from '@/services/announcement.service';
import { useToast } from '@/context/toast-context';

export function AnnouncementsList() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    const fetchAnnouncements = async () => {
      try {
        const data = await announcementService.getAllForUser(token);
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements', err);
        toast.error('Failed to load announcements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[#14151A] rounded-2xl border border-gray-800">
        <Megaphone className="w-12 h-12 text-gray-700 mb-4" />
        <h3 className="text-gray-400 font-medium text-lg">No Announcements</h3>
        <p className="text-gray-600 text-sm mt-1">There are no new announcements from the admin at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((item) => (
        <div
          key={item.id}
          className={`p-6 rounded-2xl border ${
            item.priority === 'High' 
              ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]' 
              : item.priority === 'Low'
              ? 'bg-[#14151A] border-gray-800'
              : 'bg-blue-500/5 border-blue-500/20'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl mt-1 ${
               item.priority === 'High' 
                ? 'bg-rose-500/10 text-rose-500' 
                : item.priority === 'Low'
                ? 'bg-gray-800 text-gray-400'
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              {item.priority === 'High' ? <AlertCircle className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-200">{item.title}</h3>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    item.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-400'
                      : item.priority === 'Low'
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {item.priority} Priority
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="text-gray-400 text-sm leading-relaxed bg-[#0D0E12] p-4 rounded-xl border border-gray-800/50 whitespace-pre-wrap">
                {item.content}
              </div>
              
              <div className="text-xs text-gray-500 flex justify-between">
                <span>From: {item.creator?.name || item.creator?.username || 'Admin'}</span>
                <span>KK Group Internal Notice</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
