import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORY_ICONS } from '../../types';
import type { Day } from '../../types';
import { resolveLocation, getCityCenter } from '../../utils/cityCoordinates';
import { formatCurrency } from '../../utils/helpers';

// Fix default icon path issues with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Vibrant sunset cyber day palette
const DAY_COLORS = [
  '#FF6B35', '#FF2E63', '#845EC2', '#00D4FF',
  '#00E5A0', '#FFB547', '#D63384', '#B8FF57',
];

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  dayNumber: number;
  cost: number;
  category: string;
  type: 'activity' | 'accommodation';
}

function createDivIcon(color: string, label: string, type: 'activity' | 'accommodation') {
  const emoji = type === 'accommodation' ? '🛏️' : '';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 38px; height: 38px; border-radius: 50%;
        background: #0a0a14;
        border: 2px solid ${color};
        box-shadow: 0 0 16px ${color}80, 0 4px 10px rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; color: ${color}; font-weight: 800; font-family: monospace;
        cursor: pointer; transition: transform 0.2s ease;
      ">
        ${emoji || `D${label}`}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
}

function BoundsFitter({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [markers, map]);
  return null;
}

interface TripMapProps {
  days: Day[];
  center?: [number, number];
  destination?: string;
  currency?: string;
}

const TripMap: React.FC<TripMapProps> = ({ days, center, destination = 'Paris', currency = 'USD' }) => {
  const cityCenter = useMemo(() => getCityCenter(destination), [destination]);

  const markers: MarkerData[] = useMemo(() => {
    const list: MarkerData[] = [];
    if (!days || days.length === 0) return list;

    days.forEach((day) => {
      if (Array.isArray(day.activities)) {
        day.activities.forEach((activity, actIdx) => {
          let lat = activity.location?.lat;
          let lng = activity.location?.lng;

          // If coordinates are missing, undefined or invalid, resolve via city geocoding registry
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
            const locName = activity.location?.name || activity.name || '';
            const resolved = resolveLocation(destination, locName, day.dayNumber, actIdx);
            lat = resolved.lat;
            lng = resolved.lng;
          }

          list.push({
            lat,
            lng,
            label: String(day.dayNumber),
            dayNumber: day.dayNumber,
            cost: activity.estimatedCost,
            category: activity.category,
            type: 'activity',
          });
        });
      }

      if (day.accommodation) {
        let lat = day.accommodation.location?.lat;
        let lng = day.accommodation.location?.lng;

        if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
          lat = Number((cityCenter.lat - 0.003).toFixed(6));
          lng = Number((cityCenter.lng + 0.002).toFixed(6));
        }

        list.push({
          lat,
          lng,
          label: '🛏️',
          dayNumber: day.dayNumber,
          cost: day.accommodation.pricePerNight,
          category: 'accommodation',
          type: 'accommodation',
        });
      }
    });

    return list;
  }, [days, destination, cityCenter]);

  const hasMarkers = markers.length > 0;
  const initialCenter: [number, number] = center || (hasMarkers ? [markers[0].lat, markers[0].lng] : [cityCenter.lat, cityCenter.lng]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <MapContainer
        center={initialCenter}
        zoom={hasMarkers ? 13 : 12}
        scrollWheelZoom
        style={{ width: '100%', height: '100%', minHeight: 420, backgroundColor: '#07070d' }}
      >
        {/* Esri World Dark Gray Canvas - Clean, High-Contrast, Zero API Key / No Watermarks */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, OpenStreetMap'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {hasMarkers && <BoundsFitter markers={markers} />}

        {markers.map((m, idx) => {
          const color =
            m.type === 'accommodation'
              ? '#845EC2'
              : DAY_COLORS[(m.dayNumber - 1) % DAY_COLORS.length];

          const icon = createDivIcon(color, m.label, m.type);
          const categoryIcon =
            m.type === 'activity'
              ? CATEGORY_ICONS[m.category as keyof typeof CATEGORY_ICONS] ?? '📍'
              : '🛏️';

          return (
            <Marker key={idx} position={[m.lat, m.lng]} icon={icon}>
              <Popup>
                <div className="min-w-[170px] p-1 font-sans">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{categoryIcon}</span>
                    <span className="font-bold text-white text-sm capitalize">
                      {m.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-1.5 font-mono">
                    <span>Day {m.dayNumber}</span>
                    {m.cost > 0 && (
                      <span className="font-bold text-[#00E5A0]">
                        ~{formatCurrency(m.cost, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* No coordinates placeholder overlay */}
      {!hasMarkers && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070d]/85 backdrop-blur-md z-[500] text-center p-6 space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center text-2xl animate-pulse">
            🗺️
          </div>
          <p className="text-base font-bold text-white">Geographic Route Synchronization</p>
          <p className="text-xs text-white/50 max-w-sm">
            Coordinates are automatically geocoded as activities are added or refined by the AI engine.
          </p>
        </div>
      )}
    </div>
  );
};

export default TripMap;
