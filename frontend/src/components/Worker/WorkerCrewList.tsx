'use client';

import React, { useState } from 'react';
import { Users, Mail, Phone, MessageSquare } from 'lucide-react';

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  activity: string;
  avatar?: string | null;
  isOnline: boolean;
  phone?: string;
}

interface WorkerCrewListProps {
  members?: CrewMember[];
  onMessageCrew?: (member: CrewMember) => void;
}

export function WorkerCrewList({ members = [], onMessageCrew }: WorkerCrewListProps) {
  const [activeTab, setActiveTab] = useState<'activities' | 'online'>('activities');

  const displayedMembers =
    activeTab === 'online' ? members.filter((m) => m.isOnline) : members;

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col select-none">
      {/* Header: Friends / Squad + Online Count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#5E42B4] flex items-center justify-center font-black">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
            Field Squad
          </h3>
        </div>
        <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
          {members.filter((m) => m.isOnline).length} Active
        </span>
      </div>

      {/* Pill Filter Toggle: Activities / Online */}
      <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-[#5E42B4] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Squad
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'online'
              ? 'bg-[#5E42B4] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Online Only
        </button>
      </div>

      {/* Members List (Smooth Scrollable with ZERO Visible Scrollbars for Clean View) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 max-h-[220px] sm:max-h-[250px] scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {displayedMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {activeTab === 'online' ? 'No squad members currently online' : 'No squad members registered'}
          </div>
        ) : (
          displayedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-2.5 p-1.5 rounded-2xl hover:bg-slate-50/80 transition-colors group"
            >
              {/* Left: Avatar + Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 shadow-xs bg-purple-50 flex items-center justify-center font-bold text-xs text-[#5E42B4]">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!member.avatar && (
                    <span>{(member.name || 'W').charAt(0).toUpperCase()}</span>
                  )}
                  {member.isOnline ? (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  ) : (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-white" />
                  )}
                </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-[#5E42B4] transition-colors">
                  {member.name}
                </span>
                <span
                  className="text-[10px] font-medium text-slate-400 truncate mt-0.5"
                  dangerouslySetInnerHTML={{ __html: member.role }}
                />
              </div>
            </div>

            {/* Right: Quick Action Buttons (Call + Message) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  aria-label={`Call ${member.name}`}
                  className="w-8 h-8 rounded-xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => onMessageCrew?.(member)}
                aria-label={`Message ${member.name}`}
                className="w-8 h-8 rounded-xl border border-purple-100 bg-purple-50/60 hover:bg-[#5E42B4] hover:text-white text-[#5E42B4] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
