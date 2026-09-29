'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  X,
  Sliders,
  Navigation,
  Compass,
  Phone,
  MapPin,
  ExternalLink,
  LocateFixed,
  Layers,
  Satellite,
  Sun,
  Moon,
  Mountain,
} from 'lucide-react';
import {
  useWorkerMap,
  TILE_PROVIDERS,
  MapTileProvider,
} from '@/context/worker-map-context';
import { ServiceEnquiry } from '@/services';
import { CrewMember } from './WorkerCrewList';

// Dynamic import with SSR disabled for Leaflet
const WorkerLeafletMapCore = dynamic(
  () => import('./WorkerLeafletMapCore'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-xs">
        <Compass className="w-6 h-6 animate-spin text-[#2A835F] mr-2" />
        <span>Loading React Leaflet Kerala Map Engine...</span>
      </div>
    ),
  }
);

interface WorkerFullMapModalProps {
  activeJob?: ServiceEnquiry | null;
  jobs?: ServiceEnquiry[];
  operatives?: CrewMember[];
}

export function WorkerFullMapModal({
  activeJob,
  jobs = [],
  operatives = [],
}: WorkerFullMapModalProps) {
  const {
    settings,
    updateSettings,
    isFullMapOpen,
    setIsFullMapOpen,
    setIsMapSettingsOpen,
    requestGpsLocation,
    isLocating,
    userGpsLocation,
  } = useWorkerMap();

  if (!isFullMapOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in p-2 sm:p-4">
      <div className="relative w-full max-w-6xl h-[92vh] rounded-[32px] overflow-hidden bg-slate-950 border border-slate-700/80 shadow-2xl flex flex-col">
        
        {/* Floating Top Controls Header */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
          {/* Left: District & Status Pill */}
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-xl text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold tracking-tight">
              {settings.selectedDistrict} Ops Hub
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">&bull; Kerala Sector</span>
          </div>

          {/* Right: Map Actions Toolbar */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Quick Tile Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-xl">
              {(['STREET', 'SATELLITE', 'DARK', 'TERRAIN'] as MapTileProvider[]).map((tileKey) => {
                const isSelected = settings.tileLayer === tileKey;
                return (
                  <button
                    key={tileKey}
                    type="button"
                    onClick={() => updateSettings({ tileLayer: tileKey })}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-[#2A835F] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tileKey.charAt(0) + tileKey.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>

            {/* Locate GPS Button */}
            <button
              type="button"
              onClick={requestGpsLocation}
              disabled={isLocating}
              title="Calibrate My GPS"
              className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 shadow-xl transition-all cursor-pointer"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>

            {/* Map Settings Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsMapSettingsOpen(true)}
              title="Map Settings"
              className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-[#88B793] hover:text-[#A3E5C7] border border-slate-700/80 shadow-xl transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Close Full Map Button */}
            <button
              type="button"
              onClick={() => setIsFullMapOpen(false)}
              className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700/80 shadow-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Leaflet Map Full Viewport */}
        <div className="w-full flex-1 relative z-10">
          <WorkerLeafletMapCore
            activeJob={activeJob}
            jobs={jobs}
            operatives={operatives}
            height="100%"
            zoom={13}
            interactive={true}
          />
        </div>

        {/* Bottom Floating Active Job Overlay Card */}
        {activeJob && (
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 z-20 pointer-events-auto max-w-md w-full bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 border border-slate-750 shadow-2xl space-y-2.5 text-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {activeJob.trackingNumber}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-1">
                  {activeJob.serviceName}
                </h4>
              </div>

              {activeJob.customerPhone && (
                <a
                  href={`tel:${activeJob.customerPhone}`}
                  className="p-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#2A835F] shrink-0" />
              <span className="truncate">{activeJob.location || activeJob.district || 'Kerala'}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${activeJob.location || activeJob.district || 'Kerala'}, Kerala`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs font-bold shadow-md transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Turn-by-Turn GPS Navigation</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
