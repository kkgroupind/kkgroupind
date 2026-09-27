'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type MapTileProvider = 'STREET' | 'SATELLITE' | 'TERRAIN' | 'DARK';

export interface KeralaDistrictCoord {
  name: string;
  mlName: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const KERALA_DISTRICTS: Record<string, KeralaDistrictCoord> = {
  Kasaragod: { name: 'Kasaragod', mlName: 'കാസർഗോഡ്', lat: 12.5102, lng: 74.9852, zoom: 13 },
  Kannur: { name: 'Kannur', mlName: 'കണ്ണൂർ', lat: 11.8745, lng: 75.3704, zoom: 13 },
  Wayanad: { name: 'Wayanad', mlName: 'വയനാട്', lat: 11.6854, lng: 76.1320, zoom: 12 },
  Kozhikode: { name: 'Kozhikode', mlName: 'കോഴിക്കോട്', lat: 11.2588, lng: 75.7804, zoom: 13 },
  Malappuram: { name: 'Malappuram', mlName: 'മലപ്പുറം', lat: 11.0510, lng: 76.0711, zoom: 12 },
  Palakkad: { name: 'Palakkad', mlName: 'പാലക്കാട്', lat: 10.7867, lng: 76.6548, zoom: 12 },
  Thrissur: { name: 'Thrissur', mlName: 'തൃശ്ശൂർ', lat: 10.5276, lng: 76.2144, zoom: 13 },
  Ernakulam: { name: 'Ernakulam', mlName: 'എറണാകുളം', lat: 9.9816, lng: 76.2999, zoom: 13 },
  Idukki: { name: 'Idukki', mlName: 'ഇടുക്കി', lat: 9.8494, lng: 76.9804, zoom: 11 },
  Kottayam: { name: 'Kottayam', mlName: 'കോട്ടയം', lat: 9.5916, lng: 76.5222, zoom: 13 },
  Alappuzha: { name: 'Alappuzha', mlName: 'ആലപ്പുഴ', lat: 9.4981, lng: 76.3388, zoom: 13 },
  Pathanamthitta: { name: 'Pathanamthitta', mlName: 'പത്തനംതിട്ട', lat: 9.2648, lng: 76.7870, zoom: 12 },
  Kollam: { name: 'Kollam', mlName: 'കൊല്ലം', lat: 8.8932, lng: 76.6141, zoom: 13 },
  Thiruvananthapuram: { name: 'Thiruvananthapuram', mlName: 'തിരുവനന്തപുരം', lat: 8.5241, lng: 76.9366, zoom: 13 },
};

export interface MapTileOption {
  id: MapTileProvider;
  name: string;
  mlName: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const TILE_PROVIDERS: Record<MapTileProvider, MapTileOption> = {
  STREET: {
    id: 'STREET',
    name: 'OpenStreetMap Streets',
    mlName: 'സ്ട്രീറ്റ് മാപ്പ് (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  SATELLITE: {
    id: 'SATELLITE',
    name: 'Esri Satellite Imagery',
    mlName: 'ഉപഗ്രഹ ദൃശ്യം (Esri Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
  TERRAIN: {
    id: 'TERRAIN',
    name: 'OpenTopoMap Terrain',
    mlName: 'ഭൂപ്രകൃതി (Topographic)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap &copy; OpenStreetMap',
    maxZoom: 17,
  },
  DARK: {
    id: 'DARK',
    name: 'CartoDB Dark Matter',
    mlName: 'നൈറ്റ് മോഡ് (Night Ops)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    maxZoom: 19,
  },
};

export interface WorkerMapSettings {
  tileLayer: MapTileProvider;
  selectedDistrict: string;
  autoCenterOnGps: boolean;
  showCrewPins: boolean;
  showActiveJobPin: boolean;
  showCompletedJobPins: boolean;
  showCoverageRadius: boolean;
  coverageRadiusKm: number;
  mapZoom: number;
}

const DEFAULT_MAP_SETTINGS: WorkerMapSettings = {
  tileLayer: 'STREET',
  selectedDistrict: 'Kasaragod',
  autoCenterOnGps: true,
  showCrewPins: false,
  showActiveJobPin: true,
  showCompletedJobPins: false,
  showCoverageRadius: true,
  coverageRadiusKm: 15,
  mapZoom: 13,
};

const STORAGE_KEY = 'kk_worker_leaflet_map_settings';

interface WorkerMapContextType {
  settings: WorkerMapSettings;
  updateSettings: (partial: Partial<WorkerMapSettings>) => void;
  resetSettings: () => void;
  userGpsLocation: [number, number] | null;
  gpsAccuracyMeters: number | null;
  isLocating: boolean;
  gpsError: string | null;
  requestGpsLocation: () => void;
  isMapSettingsOpen: boolean;
  setIsMapSettingsOpen: (open: boolean) => void;
  isFullMapOpen: boolean;
  setIsFullMapOpen: (open: boolean) => void;
  getCenterCoordinates: () => [number, number];
}

const WorkerMapContext = createContext<WorkerMapContextType | undefined>(undefined);

export function WorkerMapProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkerMapSettings>(DEFAULT_MAP_SETTINGS);
  const [userGpsLocation, setUserGpsLocation] = useState<[number, number] | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);

  // Load persisted settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateSettings = useCallback((partial: Partial<WorkerMapSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_MAP_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MAP_SETTINGS));
    } catch {
      // ignore
    }
  }, []);

  // Request browser GPS Geolocation
  const requestGpsLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserGpsLocation(coords);
        setGpsAccuracyMeters(pos.coords.accuracy || 15);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGpsError(err.message || 'Unable to retrieve your GPS location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      },
    );
  }, []);

  // Auto-request location on initial mount if autoCenterOnGps is enabled
  useEffect(() => {
    if (settings.autoCenterOnGps && !userGpsLocation && !isLocating) {
      requestGpsLocation();
    }
  }, [settings.autoCenterOnGps, userGpsLocation, isLocating, requestGpsLocation]);

  const getCenterCoordinates = useCallback((): [number, number] => {
    if (userGpsLocation && settings.autoCenterOnGps) {
      return userGpsLocation;
    }
    const districtData = KERALA_DISTRICTS[settings.selectedDistrict] || KERALA_DISTRICTS.Kasaragod;
    return [districtData.lat, districtData.lng];
  }, [userGpsLocation, settings.autoCenterOnGps, settings.selectedDistrict]);

  return (
    <WorkerMapContext.Provider
      value={{
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
        isFullMapOpen,
        setIsFullMapOpen,
        getCenterCoordinates,
      }}
    >
      {children}
    </WorkerMapContext.Provider>
  );
}

export function useWorkerMap() {
  const ctx = useContext(WorkerMapContext);
  if (!ctx) {
    throw new Error('useWorkerMap must be used within a WorkerMapProvider');
  }
  return ctx;
}
