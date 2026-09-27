'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  useWorkerMap,
  TILE_PROVIDERS,
  KERALA_DISTRICTS,
} from '@/context/worker-map-context';
import { ServiceEnquiry } from '@/services';
import { CrewMember } from './WorkerCrewList';
import { Navigation, Phone, ExternalLink, HardHat, MapPin, Briefcase } from 'lucide-react';

interface WorkerLeafletMapCoreProps {
  activeJob?: ServiceEnquiry | null;
  jobs?: ServiceEnquiry[];
  operatives?: CrewMember[];
  height?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
}

// Controller to smoothly fly/pan map when center or zoom changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.8,
    });
  }, [center, zoom, map]);

  return null;
}

// Custom Leaflet Icons using SVG DivIcons
function createWorkerGpsIcon() {
  return L.divIcon({
    className: 'custom-worker-gps-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(42, 131, 95, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #2A835F; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function createJobSiteIcon(isHourly?: boolean) {
  return L.divIcon({
    className: 'custom-job-site-pin',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: #EF4444; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createCrewIcon(name: string) {
  const initial = (name || 'W').charAt(0).toUpperCase();
  return L.divIcon({
    className: 'custom-crew-pin',
    html: `
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #5E42B4; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(94, 66, 180, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
        ${initial}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -15],
  });
}

export default function WorkerLeafletMapCore({
  activeJob,
  jobs = [],
  operatives = [],
  height = '100%',
  zoom,
  center,
  interactive = true,
}: WorkerLeafletMapCoreProps) {
  const { settings, userGpsLocation, getCenterCoordinates } = useWorkerMap();

  const activeTile = TILE_PROVIDERS[settings.tileLayer] || TILE_PROVIDERS.STREET;

  // Determine center coordinates
  const mapCenter: [number, number] = useMemo(() => {
    if (center) return center;
    if (userGpsLocation && settings.autoCenterOnGps) {
      return userGpsLocation;
    }
    return getCenterCoordinates();
  }, [center, userGpsLocation, settings.autoCenterOnGps, getCenterCoordinates]);

  const mapZoom = zoom || settings.mapZoom || 13;

  // Derive job site coordinates from district or mock offsets around center
  const jobPosition: [number, number] | null = useMemo(() => {
    if (!activeJob) return null;
    const districtKey = activeJob.district || settings.selectedDistrict;
    const dCoord = KERALA_DISTRICTS[districtKey] || KERALA_DISTRICTS.Kasaragod;
    // Offset slightly so it doesn't overlap perfectly with district center
    return [dCoord.lat + 0.012, dCoord.lng + 0.015];
  }, [activeJob, settings.selectedDistrict]);

  // Derive crew member coordinates around center
  const crewPositions = useMemo(() => {
    return operatives.map((op, idx) => {
      const angle = (idx * (2 * Math.PI)) / (operatives.length || 1);
      const radius = 0.018; // approx ~2km offset
      return {
        ...op,
        coords: [mapCenter[0] + radius * Math.cos(angle), mapCenter[1] + radius * Math.sin(angle)] as [number, number],
      };
    });
  }, [operatives, mapCenter]);

  return (
    <div style={{ width: '100%', height, position: 'relative' }} className="rounded-2xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        attributionControl={false}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <MapViewController center={mapCenter} zoom={mapZoom} />

        {/* Dynamic Tile Layer (Street / Satellite / Terrain / Dark) */}
        <TileLayer
          key={activeTile.id}
          url={activeTile.url}
          attribution={activeTile.attribution}
          maxZoom={activeTile.maxZoom}
        />

        {/* Working Coverage Radius Circle */}
        {settings.showCoverageRadius && (
          <Circle
            center={mapCenter}
            radius={settings.coverageRadiusKm * 1000}
            pathOptions={{
              color: '#2A835F',
              fillColor: '#2A835F',
              fillOpacity: 0.06,
              weight: 1.5,
              dashArray: '4, 6',
            }}
          />
        )}

        {/* Worker Current GPS Marker */}
        {userGpsLocation && (
          <Marker position={userGpsLocation} icon={createWorkerGpsIcon()}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Your Current GPS Location</span>
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  {userGpsLocation[0].toFixed(5)}, {userGpsLocation[1].toFixed(5)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  Active Operative On Duty
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Job Marker */}
        {settings.showActiveJobPin && jobPosition && activeJob && (
          <Marker position={jobPosition} icon={createJobSiteIcon(activeJob.isHourlyCalculated)}>
            <Popup>
              <div className="p-1 font-sans text-xs max-w-xs space-y-1.5">
                <div className="font-mono text-[10px] font-bold text-emerald-600">
                  {activeJob.trackingNumber}
                </div>
                <div className="font-bold text-slate-900 leading-snug">
                  {activeJob.serviceName}
                </div>
                <div className="text-slate-600 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2A835F]" />
                  <span>{activeJob.location || activeJob.district || 'Kerala'}</span>
                </div>
                {activeJob.customerPhone && (
                  <div className="text-slate-600 text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-500" />
                    <span>{activeJob.customerPhone} ({activeJob.customerName})</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${activeJob.location || activeJob.district || 'Kerala'}, Kerala`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-[#2A835F] text-white font-bold text-[10px] inline-flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Crew Squad Members Pins */}
        {settings.showCrewPins &&
          crewPositions.map((crew) => (
            <Marker key={crew.id} position={crew.coords} icon={createCrewIcon(crew.name)}>
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <div className="font-bold text-[#5E42B4] flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5" />
                    <span>{crew.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{crew.role}</div>
                  {crew.phone && (
                    <a
                      href={`tel:${crew.phone}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>Call Teammate ({crew.phone})</span>
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
