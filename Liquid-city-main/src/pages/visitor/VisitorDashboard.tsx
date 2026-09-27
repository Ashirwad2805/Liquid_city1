import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CityMap, MapMarkerData, getUserLocation } from '../../maps/CityMap';
import { partnerService } from '../../services/partnerService';
import { crowdService } from '../../services/crowdService';
import { eventService } from '../../services/eventService';
import { usePolling } from '../../hooks/usePolling';
import { CrowdStatusBadge } from '../../components/ui/ProgressBar';
import OfferQRModal from '../../components/OfferQRModal';
import {
  Utensils,
  Hotel,
  Truck,
  Route,
  Calendar,
  Users,
  Navigation,
  ExternalLink,
  Clock,
  Tag,
  MapPin,
  Sparkles,
  QrCode,
} from 'lucide-react';
import type { Partner, Crowd, Event } from '../../types';

type FilterTab = 'all' | 'restaurants' | 'hotels' | 'transport' | 'events' | 'crowd';

const DESTINATIONS = [
  { id: 'dest_1', name: 'Central Stadium Arena & Cultural Zone', lat: 12.9716, lng: 77.5946 },
  { id: 'dest_2', name: 'Downtown Food & Entertainment District', lat: 12.9780, lng: 77.6000 },
  { id: 'dest_3', name: 'Tech Park Pavilion & Exhibition Grounds', lat: 12.9650, lng: 77.5900 },
  { id: 'dest_4', name: 'Beachfront Promenade & Resort Strip', lat: 12.9850, lng: 77.6100 },
];

export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>(() => {
    return localStorage.getItem('lc_visitor_destination') || DESTINATIONS[0].name;
  });

  const currentDestObj = DESTINATIONS.find((d) => d.name === selectedDestination) || DESTINATIONS[0];

  const [hoveredMarker, setHoveredMarker] = useState<MapMarkerData | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);
  const [selectedQRTarget, setSelectedQRTarget] = useState<any | null>(null);

  // Poll partners, crowd, events
  const { data: partners } = usePolling(() => partnerService.getAll(), { interval: 25000 });
  const { data: crowds } = usePolling(() => crowdService.getAll(), { interval: 20000 });
  const { data: events } = usePolling(() => eventService.getAll(), { interval: 30000 });

  const baseLat = currentDestObj.lat;
  const baseLng = currentDestObj.lng;

  // Assemble markers anchored to chosen Destination
  const markers: MapMarkerData[] = [
    {
      id: 'dest-marker',
      lat: baseLat,
      lng: baseLng,
      title: `🎯 Target Destination: ${currentDestObj.name}`,
      type: 'user',
    },
  ];

  if (partners && (activeTab === 'all' || activeTab === 'restaurants' || activeTab === 'hotels' || activeTab === 'transport')) {
    partners.forEach((p, idx) => {
      if (activeTab === 'restaurants' && p.type !== 'restaurant') return;
      if (activeTab === 'hotels' && p.type !== 'hotel') return;
      if (activeTab === 'transport' && p.type !== 'shuttle' && p.type !== 'parking' && p.type !== 'transport') return;

      const offsetLat = ((idx % 4) - 1.5) * 0.007;
      const offsetLng = (Math.floor(idx / 4) - 1) * 0.008;

      markers.push({
        id: `partner-${p.id}`,
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng,
        title: p.name,
        status: p.occupancy >= 85 ? 'HIGH' : p.occupancy >= 60 ? 'MODERATE' : 'NORMAL',
        type: p.type === 'restaurant' ? 'restaurant' : p.type === 'hotel' ? 'hotel' : 'transport',
      });
    });
  }

  if (crowds && (activeTab === 'all' || activeTab === 'crowd')) {
    crowds.forEach((c, idx) => {
      const offsetLat = ((idx % 3) - 1) * 0.01;
      const offsetLng = ((idx % 2) - 0.5) * 0.012;

      markers.push({
        id: `crowd-${c.location_id}`,
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng,
        title: `${c.name} (${c.occupancy}% Crowd Density)`,
        status: c.status,
        type: 'crowd',
      });
    });
  }

  if (events && (activeTab === 'all' || activeTab === 'events')) {
    events.forEach((e, idx) => {
      const offsetLat = 0.005 * (idx + 1);
      const offsetLng = -0.004 * (idx + 1);

      markers.push({
        id: `event-${e.id}`,
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng,
        title: e.name,
        status: e.status === 'ongoing' ? 'HIGH' : 'NORMAL',
        type: 'event',
      });
    });
  }

  const handleSelectDestChange = (name: string) => {
    setSelectedDestination(name);
    localStorage.setItem('lc_visitor_destination', name);
  };

  return (
    <div className="flex flex-col h-full relative font-sans bg-[#F5F5CD] text-black">
      {/* Top Destination Selector Bar */}
      <div className="p-4 bg-[#E2E2A4] border-b-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-[#F5F5CD] flex items-center justify-center font-black">
            <MapPin size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-stone-700">
              TARGET DESTINATION PROXIMITY
            </div>
            <select
              value={selectedDestination}
              onChange={(e) => handleSelectDestChange(e.target.value)}
              className="font-black text-sm text-black bg-[#F5F5CD] border-2 border-black rounded-xl px-3 py-1 focus:outline-none cursor-pointer"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.name}>
                  🎯 {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Proximity', icon: Navigation },
            { id: 'restaurants', label: 'Restaurants', icon: Utensils },
            { id: 'hotels', label: 'Hotels', icon: Hotel },
            { id: 'transport', label: 'Transport', icon: Truck },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'crowd', label: 'Crowd Heat', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as FilterTab);
                  setSelectedMarker(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2 border-black ${
                  active
                    ? 'bg-black text-[#F5F5CD] shadow'
                    : 'bg-[#F5F5CD] text-black hover:bg-[#FAFAD9]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/visitor/journey')}
          className="py-2 px-4 bg-black text-[#F5F5CD] text-xs font-black rounded-xl border-2 border-black flex items-center gap-1.5 shadow hover:bg-stone-800 shrink-0"
        >
          <Route size={14} /> Plan Route
        </button>
      </div>

      {/* Main Interactive Map View */}
      <div className="flex-1 relative overflow-hidden">
        <CityMap
          center={{ lat: baseLat, lng: baseLng }}
          zoom={14}
          markers={markers}
          onMarkerClick={(m) => {
            setSelectedMarker(m);
            setHoveredMarker(m);
          }}
          showTraffic={true}
        />

        {/* INSTANT HOVER / CLICK OFFER POPUP CARD FOR RESTAURANTS AND HOTELS */}
        {(hoveredMarker || selectedMarker) && (hoveredMarker || selectedMarker)!.type !== 'user' && (
          <div
            className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-[#FAFAD9] border-2 border-black rounded-3xl p-5 shadow-2xl z-30 fade-in space-y-3 select-none"
            onMouseLeave={() => setHoveredMarker(null)}
          >
            <div className="flex items-start justify-between border-b-2 border-black pb-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#F5F5CD] px-2.5 py-0.5 rounded">
                  {(hoveredMarker || selectedMarker)!.type?.toUpperCase()} OFFER POPUP
                </span>
                <h3 className="font-black text-black text-lg mt-1 leading-tight">
                  {(hoveredMarker || selectedMarker)!.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedMarker(null);
                  setHoveredMarker(null);
                }}
                className="text-black font-black hover:bg-black hover:text-[#F5F5CD] w-6 h-6 rounded-full border border-black flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Highlighted Merchant Offer Box */}
            <div className="bg-[#E2E2A4] p-3.5 rounded-2xl border-2 border-black space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-stone-700">EXCLUSIVE MERCHANDISE OFFER</span>
                <Tag size={16} className="text-black" />
              </div>
              <div className="text-base font-black text-black">
                {(hoveredMarker || selectedMarker)!.type === 'restaurant'
                  ? '🔥 200rs off on 600rs'
                  : (hoveredMarker || selectedMarker)!.type === 'hotel'
                  ? '🏨 500rs off on 2500rs'
                  : '🎫 Priority Venue Pass'}
              </div>
              <p className="text-[11px] font-semibold text-stone-800">
                Near <strong>{currentDestObj.name}</strong> • Valid for 1 hour on arrival
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold bg-[#F5F5CD] p-2.5 rounded-xl border border-black">
              <span>Wait Time / Delay: <strong>5-10 mins</strong></span>
              <CrowdStatusBadge status={(hoveredMarker || selectedMarker)!.status || 'NORMAL'} />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() =>
                  setSelectedQRTarget({
                    name: (hoveredMarker || selectedMarker)!.title,
                    type: (hoveredMarker || selectedMarker)!.type,
                    offer:
                      (hoveredMarker || selectedMarker)!.type === 'restaurant'
                        ? '200rs off on 600rs'
                        : '500rs off on 2500rs',
                  })
                }
                className="py-2.5 px-4 bg-black text-[#F5F5CD] text-xs font-black rounded-xl border-2 border-black flex-1 flex items-center justify-center gap-1.5 shadow hover:bg-stone-800"
              >
                <QrCode size={15} /> Redeem 1-Hr QR Pass
              </button>
              <button
                onClick={() => {
                  if ((hoveredMarker || selectedMarker)!.type === 'restaurant') navigate('/visitor/restaurants');
                  else if ((hoveredMarker || selectedMarker)!.type === 'hotel') navigate('/visitor/hotels');
                  else navigate('/visitor/routes');
                }}
                className="py-2.5 px-3 bg-[#F5F5CD] text-black text-xs font-black rounded-xl border-2 border-black hover:bg-black hover:text-[#F5F5CD]"
              >
                View Details
              </button>
            </div>
          </div>
        )}

        {/* Floating Legend */}
        <div className="absolute top-4 right-4 bg-[#E2E2A4] border-2 border-black rounded-2xl p-3 text-xs shadow-md hidden md:flex flex-col gap-1.5 z-10 font-bold">
          <div className="font-black text-black uppercase tracking-wider text-[10px] border-b border-black pb-1">
            Proximity Telemetry
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-black"></span>
            <span>Available / Free Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-black"></span>
            <span>Moderate Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-black"></span>
            <span>Crowded Hotspot</span>
          </div>
        </div>
      </div>

      {/* Offer QR Redemption Modal */}
      {selectedQRTarget && (
        <OfferQRModal
          isOpen={!!selectedQRTarget}
          onClose={() => setSelectedQRTarget(null)}
          title={selectedQRTarget.name}
          venueName={selectedQRTarget.name}
          venueType={selectedQRTarget.type === 'restaurant' ? 'restaurant' : 'hotel'}
          offerText={selectedQRTarget.offer}
        />
      )}
    </div>
  );
}
