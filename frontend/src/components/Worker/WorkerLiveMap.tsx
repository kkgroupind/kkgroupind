'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Navigation,
  Compass,
  Sliders,
  Maximize2,
  LocateFixed,
  Satellite,
  Layers,
} from 'lucide-react';
import { useWorkerLanguage } from '@/context/worker-language-context';
import { useWorkerMap, TILE_PROVIDERS } from '@/context/worker-map-context';
import { useWorker } from '@/context/worker-context';

// Dynamic import with SSR disabled for Leaflet map core
const WorkerLeafletMapCore = dynamic(
  () => import('./WorkerLeafletMapCore'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[140px] bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 text-xs">
        <Compass className="w-5 h-5 animate-spin text-[#2A835F]" />
        <span>Loading Leaflet Map...</span>
      </div>
    ),
  }
);

export interface LiveMapOperative {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  phone?: string | null;
}

interface WorkerLiveMapProps {
  onViewMap?: () => void;
  locationTitle?: string;
  operatives?: LiveMapOperative[];
}

export function WorkerLiveMap({
  onViewMap,
  locationTitle = 'Kerala Operations Hub',
  operatives = [],
}: WorkerLiveMapProps) {
  const { t } = useWorkerLanguage();
  const {
    settings,
    updateSettings,
    setIsMapSettingsOpen,
    setIsFullMapOpen,
    requestGpsLocation,
    isLocating,
    userGpsLocation,
  } = useWorkerMap();

  const { activeJob } = useWorker();

  const handleOpenGoogleMaps = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const query = locationTitle
      ? encodeURIComponent(`${locationTitle}, Kerala`)
      : '9.9816,76.2999';
    window.open(
      `https://maps.google.com/?q=${query}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleExpandMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewMap) {
      onViewMap();
    }
    setIsFullMapOpen(true);
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMapSettingsOpen(true);
  };

  const activeTile = TILE_PROVIDERS[settings.tileLayer] || TILE_PROVIDERS.STREET;

  return (
    <div className="w-full flex flex-col pt-3 border-t border-slate-100 select-none shrink-0">
      {/* Header: Title + Map Settings Button */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#EAF4EE] text-[#2A835F] flex items-center justify-center font-black shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight">
                {t('liveMap')}
              </h3>
              <span className="text-[10px] font-bold text-[#2A835F] bg-[#2A835F]/10 px-1.5 py-0.2 rounded-md">
                Leaflet
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 truncate block max-w-[140px]">
              {locationTitle}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenSettings}
            title="Map Settings (ശൈലി / ക്രമീകരണങ്ങൾ)"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#EAF4EE] text-slate-600 hover:text-[#2A835F] transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleExpandMap}
            title="Expand Fullscreen Map"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#2A835F]/15 text-slate-600 hover:text-[#2A835F] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Thumbnail Container */}
      <div className="relative w-full h-36 sm:h-40 rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs group">
        
        {/* Floating Tile Badge Top Left */}
        <div className="absolute top-2 left-2 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              // Quick cycle tile layers
              const order: ('STREET' | 'SATELLITE' | 'DARK' | 'TERRAIN')[] = ['STREET', 'SATELLITE', 'DARK', 'TERRAIN'];
              const nextIndex = (order.indexOf(settings.tileLayer) + 1) % order.length;
              updateSettings({ tileLayer: order[nextIndex] });
            }}
            title="Click to toggle map style"
            className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1 text-[10px] font-extrabold text-slate-700 hover:text-[#2A835F] transition-colors"
          >
            <Layers className="w-3 h-3 text-[#2A835F]" />
            <span>{activeTile.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Floating GPS Status Pill Top Right */}
        <div className="absolute top-2 right-2 z-10 pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={requestGpsLocation}
            disabled={isLocating}
            title="Recalibrate GPS"
            className="p-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-emerald-600 shadow-xs"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>

        {/* Core Leaflet Map Engine */}
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
          <WorkerLeafletMapCore
            activeJob={activeJob}
            operatives={operatives as any}
            height="100%"
            zoom={13}
            interactive={true}
          />
        </div>

        {/* Hover Expand Overlay */}
        <div
          onClick={handleExpandMap}
          className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center"
        >
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Click to Expand Map</span>
          </span>
        </div>
      </div>

      {/* Action Navigation Pill */}
      <button
        type="button"
        onClick={handleOpenGoogleMaps}
        className="w-full mt-2.5 py-2 px-3 rounded-2xl bg-[#EAF4EE] hover:bg-[#2A835F] text-[#2A835F] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#88B793]/30"
      >
        <Navigation className="w-3.5 h-3.5" />
        <span>Open Navigation Directions</span>
      </button>
    </div>
  );
}
