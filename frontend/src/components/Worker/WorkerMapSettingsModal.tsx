'use client';

import React from 'react';
import {
  X,
  MapPin,
  Compass,
  Navigation,
  Layers,
  Eye,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Satellite,
  Sun,
  Moon,
  Mountain,
  Users,
  Briefcase,
  Check,
  LocateFixed,
} from 'lucide-react';
import {
  useWorkerMap,
  TILE_PROVIDERS,
  KERALA_DISTRICTS,
  MapTileProvider,
} from '@/context/worker-map-context';

export function WorkerMapSettingsModal() {
  const {
    settings,
    updateSettings,
    resetSettings,
    userGpsLocation,
    gpsAccuracyMeters,
    isLocating,
    gpsError,
    requestGpsLocation,
    isMapSettingsOpen,
    setIsMapSettingsOpen,
  } = useWorkerMap();

  if (!isMapSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-slate-700/80 shadow-2xl p-5 sm:p-7 text-slate-200 space-y-6 custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Field Map Settings
              </h3>
              <span className="text-xs text-slate-400">
                React Leaflet & GPS Telemetry &bull; കേരളം
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMapSettingsOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Map Tile Provider Cards */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2A835F]" />
            <span>Map Tile Imagery (മാപ്പ് ശൈലി)</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.values(TILE_PROVIDERS).map((tile) => {
              const isSelected = settings.tileLayer === tile.id;
              const Icon =
                tile.id === 'SATELLITE'
                  ? Satellite
                  : tile.id === 'TERRAIN'
                  ? Mountain
                  : tile.id === 'DARK'
                  ? Moon
                  : Sun;

              return (
                <div
                  key={tile.id}
                  onClick={() => updateSettings({ tileLayer: tile.id })}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                    isSelected
                      ? 'bg-[#2A835F]/20 border-[#2A835F] text-white shadow-md'
                      : 'bg-slate-800/50 border-slate-750 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#2A835F] text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{tile.name.split(' ')[0]}</div>
                    <div className="text-[10px] opacity-75">{tile.mlName.split(' ')[0]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Base Operating District Hub */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#5E42B4]" />
            <span>Base Operating District (പ്രവർത്തന ജില്ല)</span>
          </label>

          <select
            value={settings.selectedDistrict}
            onChange={(e) => updateSettings({ selectedDistrict: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white font-semibold text-xs sm:text-sm focus:outline-none focus:border-[#2A835F]"
          >
            {Object.values(KERALA_DISTRICTS).map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} &bull; {d.mlName}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Live GPS Geolocation Sensor */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Live Worker GPS Telemetry</span>
            </div>

            <button
              type="button"
              onClick={requestGpsLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Locate Me Now'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Auto-center on Worker GPS:</span>
            <input
              type="checkbox"
              checked={settings.autoCenterOnGps}
              onChange={(e) => updateSettings({ autoCenterOnGps: e.target.checked })}
              className="w-4 h-4 accent-[#2A835F] rounded"
            />
          </div>

          {userGpsLocation ? (
            <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono">
              <span>GPS: {userGpsLocation[0].toFixed(4)}, {userGpsLocation[1].toFixed(4)}</span>
              <span>&plusmn;{gpsAccuracyMeters ? Math.round(gpsAccuracyMeters) : 15}m accuracy</span>
            </div>
          ) : gpsError ? (
            <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              {gpsError}
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              GPS not queried yet. Click &quot;Locate Me Now&quot; to calibrate.
            </div>
          )}
        </div>

        {/* 4. Layer Visibility Toggles */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Map Layers & Overlays (ലെയറുകൾ)</span>
          </label>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Show Field Crew & Teammates Pins</span>
              </span>
              <input
                type="checkbox"
                checked={settings.showCrewPins}
                onChange={(e) => updateSettings({ showCrewPins: e.target.checked })}
                className="w-4 h-4 accent-[#2A835F] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <Briefcase className="w-4 h-4 text-[#2A835F]" />
                <span>Show Active Assigned Work Site</span>
              </span>
              <input
                type="checkbox"
                checked={settings.showActiveJobPin}
                onChange={(e) => updateSettings({ showActiveJobPin: e.target.checked })}
                className="w-4 h-4 accent-[#2A835F] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Show Past Completed Works History</span>
              </span>
              <input
                type="checkbox"
                checked={settings.showCompletedJobPins}
                onChange={(e) => updateSettings({ showCompletedJobPins: e.target.checked })}
                className="w-4 h-4 accent-[#2A835F] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Show Operating Radius ({settings.coverageRadiusKm} km)</span>
              </span>
              <input
                type="checkbox"
                checked={settings.showCoverageRadius}
                onChange={(e) => updateSettings({ showCoverageRadius: e.target.checked })}
                className="w-4 h-4 accent-[#2A835F] rounded"
              />
            </label>

            {settings.showCoverageRadius && (
              <div className="px-3 pt-1">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={settings.coverageRadiusKm}
                  onChange={(e) => updateSettings({ coverageRadiusKm: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#2A835F]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMapSettingsOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Apply Settings
          </button>
        </div>

      </div>
    </div>
  );
}
