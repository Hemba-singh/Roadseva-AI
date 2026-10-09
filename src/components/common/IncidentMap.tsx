import React, { useEffect, useRef } from 'react';
import type { RoadReport } from '../../types/index.js';
import L from 'leaflet';

interface IncidentMapProps {
  reports?: RoadReport[];
  selectedLocation?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  interactiveSelect?: boolean;
  onSelectReport?: (report: RoadReport) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#FF3B30',
  High: '#FF9500',
  Medium: '#FFCC00',
  Low: '#34C759',
  Resolved: '#007AFF',
};

export const IncidentMap: React.FC<IncidentMapProps> = ({
  reports = [],
  selectedLocation,
  onLocationSelect,
  interactiveSelect = false,
  onSelectReport,
  height = '360px',
  zoom = 11,
  center = [24.8170, 93.9368], // Central Imphal, Manipur
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    }).setView(
      selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : center,
      zoom
    );

    // High quality OpenStreetMap tiles with retina support
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle map click for manual GPS location selection
    if (interactiveSelect && onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update reports markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    reports.forEach((report) => {
      const color = report.status === 'Resolved' ? '#34C759' : (SEVERITY_COLORS[report.estimatedSeverity] || '#007AFF');
      const isCritical = report.estimatedSeverity === 'Critical' && report.status !== 'Resolved';

      const customIcon = L.divIcon({
        className: 'custom-road-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            ${
              isCritical
                ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="width: 26px; height: 26px; border-radius: 50%; background: ${color}; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 11px; font-weight: bold;">
              ${report.defectType === 'Pothole' ? 'P' : report.defectType === 'Road Crack' ? 'C' : report.defectType === 'Edge Break' ? 'E' : 'R'}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: -apple-system, system-ui, sans-serif; padding: 2px; width: 220px;">
          <div style="position: relative; height: 96px; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #E5E5EA;">
            <img src="${report.imageUrl}" alt="${report.defectType}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); color: #FFF; font-size: 10px; padding: 2px 6px; border-radius: 6px; font-weight: 600;">
              ${report.estimatedSeverity}
            </div>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #1D1D1F; line-height: 1.2;">${report.defectType}</div>
          <div style="font-size: 11px; color: #6E6E73; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${report.locationLabel}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid #E5E5EA;">
            <span style="font-size: 10px; font-weight: 600; color: #007AFF;">${report.referenceNumber}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 12px; background: ${report.status === 'Resolved' ? '#D1FADF' : '#FEF08A'}; color: ${report.status === 'Resolved' ? '#027A48' : '#854D0E'}; font-weight: 600;">${report.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onSelectReport) {
        marker.on('click', () => {
          onSelectReport(report);
        });
      }

      markersGroup.addLayer(marker);
    });
  }, [reports, onSelectReport]);

  // Update selected manual GPS location pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }

    if (selectedLocation) {
      const pinIcon = L.divIcon({
        className: 'selected-pin-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #007AFF; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0,122,255,0.4); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: rgba(0,0,0,0.3); margin-top: 2px;"></div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: pinIcon,
        draggable: !!interactiveSelect,
      }).addTo(map);

      if (interactiveSelect && onLocationSelect) {
        marker.on('dragend', (e) => {
          const { lat, lng } = (e.target as L.Marker).getLatLng();
          onLocationSelect(lat, lng);
        });
      }

      pinMarkerRef.current = marker;
      map.panTo([selectedLocation.lat, selectedLocation.lng], { animate: true });
    }
  }, [selectedLocation, interactiveSelect, onLocationSelect]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-2xs bg-gray-100">
      <div ref={mapContainerRef} style={{ width: '100%', height }} className="z-10" />

      {interactiveSelect && (
        <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#1D1D1F] text-xs font-medium shadow-md border border-gray-200/80 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
          Tap or drag pin to pinpoint damage location
        </div>
      )}
    </div>
  );
};
