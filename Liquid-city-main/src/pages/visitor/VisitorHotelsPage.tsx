import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnerService } from '../../services/partnerService';
import { usePolling } from '../../hooks/usePolling';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import OfferQRModal from '../../components/OfferQRModal';
import {
  Hotel as HotelIcon,
  Star,
  Clock,
  Tag,
  Navigation,
  Users,
  BedDouble,
  QrCode,
} from 'lucide-react';
import type { Partner } from '../../types';

interface HotelItem {
  id: string;
  name: string;
  roomName: string;
  description: string;
  imageUrl: string;
  tag: string;
  rating: number;
  distance: string;
  checkIn: string;
  occupancyCapacity: string;
  roomType: string;
  amenities: string[];
  extraTagsCount: number;
  highlightedOffer: string;
  capacity: number;
  occupancy: number;
}

const FEATURED_HOTELS: HotelItem[] = [
  {
    id: 'hotel_1',
    name: 'Grand Palace Hotel & Suites',
    roomName: 'Executive Deluxe Suite with City View',
    description:
      'Luxurious 5-star suite featuring premium king bed, complimentary gourmet breakfast, infinity rooftop pool, and 24/7 room service.',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    tag: '🏨 Luxury Stay',
    rating: 4.9,
    distance: '1.1 km to venue',
    checkIn: 'Immediate',
    occupancyCapacity: '2 Adults',
    roomType: 'King Suite',
    amenities: ['Free Wifi', 'Rooftop Pool', 'Breakfast', 'Spa'],
    extraTagsCount: 5,
    highlightedOffer: '500rs off on 2500rs',
    capacity: 50,
    occupancy: 40,
  },
  {
    id: 'hotel_2',
    name: 'The Heritage Boutique Hotel',
    roomName: 'Heritage Classic Room & Garden Lounge',
    description:
      'Charming heritage hotel offering colonial architecture, lush courtyard gardens, express check-in, and shuttles to main venue.',
    imageUrl:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    tag: '⭐ Top Rated',
    rating: 4.8,
    distance: '0.9 km to venue',
    checkIn: '2:00 PM',
    occupancyCapacity: '2-3 Guests',
    roomType: 'Heritage Deluxe',
    amenities: ['Garden View', 'Shuttle Service', 'Free Parking', 'Cafe'],
    extraTagsCount: 7,
    highlightedOffer: '400rs off on 2000rs',
    capacity: 35,
    occupancy: 60,
  },
  {
    id: 'hotel_3',
    name: 'Urban Vista Express Hotel',
    roomName: 'Modern Smart Studio Room',
    description:
      'Sleek modern hotel designed for quick event visitors, equipped with high-speed fiber internet, work desk, and soundproof windows.',
    imageUrl:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    tag: '⚡ Best Value',
    rating: 4.6,
    distance: '1.4 km to venue',
    checkIn: 'Immediate',
    occupancyCapacity: '2 Guests',
    roomType: 'Smart Studio',
    amenities: ['Fiber Wifi', 'Work Desk', 'Soundproof', '24/7 Gym'],
    extraTagsCount: 4,
    highlightedOffer: '300rs off on 1500rs',
    capacity: 60,
    occupancy: 30,
  },
];

export default function VisitorHotelsPage() {
  const navigate = useNavigate();
  const [selectedQRTarget, setSelectedQRTarget] = useState<HotelItem | null>(null);

  // Poll real backend hotel partners if present
  const { data: partners } = usePolling(
    () => partnerService.getAll().then((list) => list.filter((p) => p.type === 'hotel')),
    { interval: 30000 }
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#F5F5CD] text-black">
      {/* Page Header */}
      <div className="bg-[#E2E2A4] p-6 rounded-3xl border-2 border-black shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#F5F5CD] px-3 py-1 rounded-full border border-black">
            HOTEL ACCOMMODATION & OFFERS
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-black mt-2 uppercase tracking-tight">
            Partner Hotel Stay & Exclusive Vouchers
          </h1>
          <p className="text-xs font-bold text-stone-800 mt-1">
            Browse partner hotels, check live room availability, and redeem real 1-Hour QR discount passes.
          </p>
        </div>

        <button
          onClick={() => navigate('/visitor/journey')}
          className="py-2.5 px-5 bg-black text-[#F5F5CD] font-black text-xs rounded-2xl hover:bg-stone-800 transition-colors flex items-center gap-2 shrink-0 border-2 border-black"
        >
          <Navigation size={14} /> Plan Event Route
        </button>
      </div>

      {/* Main Hotel Directory */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <span className="text-xs font-black uppercase tracking-widest text-black">
            RECOMMENDED PARTNER HOTELS & DISCOUNT CARDS
          </span>
          <span className="text-xs text-black font-extrabold">Click card to redeem 1-hour QR</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_HOTELS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedQRTarget(item)}
              className="bg-[#E2E2A4] rounded-3xl border-2 border-black p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Top Image Container */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border-2 border-black bg-stone-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#F5F5CD] border-2 border-black text-black text-xs font-black px-3 py-1 rounded-full shadow-md">
                    <span>{item.tag}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black text-[#F5F5CD] text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 border border-black">
                    <Star size={12} className="text-amber-300 fill-amber-300" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                {/* Hotel Title & Description */}
                <div>
                  <h3 className="font-black text-xl text-black leading-tight group-hover:underline">
                    {item.name}
                  </h3>
                  <p className="text-xs font-black text-black mt-0.5">{item.roomName}</p>
                  <p className="text-xs text-stone-800 font-semibold line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Stat Bar Strip */}
                <div className="flex items-center justify-between py-2 border-y-2 border-black text-xs text-black font-extrabold">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{item.checkIn}</span>
                  </div>
                  <span className="text-black">|</span>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{item.occupancyCapacity}</span>
                  </div>
                  <span className="text-black">|</span>
                  <div className="flex items-center gap-1">
                    <BedDouble size={14} />
                    <span>{item.roomType}</span>
                  </div>
                </div>

                {/* Amenity Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {item.amenities.map((am) => (
                    <span
                      key={am}
                      className="text-[11px] font-black text-black bg-[#F5F5CD] px-2.5 py-1 rounded-full border border-black"
                    >
                      {am}
                    </span>
                  ))}
                  <span className="text-[11px] font-black text-black bg-[#F5F5CD] px-2 py-1 rounded-full border border-black">
                    +{item.extraTagsCount}
                  </span>
                </div>

                {/* HIGHLIGHTED OFFER BADGE */}
                <div className="bg-[#F5F5CD] p-3.5 rounded-2xl border-2 border-black flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-black text-[#F5F5CD] flex items-center justify-center shrink-0 font-black">
                      <Tag size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                        HOTEL OFFER
                      </div>
                      <div className="text-sm font-black text-black">
                        {item.highlightedOffer}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#F5F5CD] bg-black px-2.5 py-1 rounded-lg border border-black">
                    GET QR
                  </span>
                </div>
              </div>

              {/* Action Redeem Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedQRTarget(item);
                }}
                className="mt-5 w-full py-3.5 px-4 bg-black text-[#F5F5CD] font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 border-2 border-black hover:bg-stone-800"
              >
                <QrCode size={16} />
                Redeem Offer & Get QR Code
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Offer QR Code Modal */}
      {selectedQRTarget && (
        <OfferQRModal
          isOpen={!!selectedQRTarget}
          onClose={() => setSelectedQRTarget(null)}
          title={selectedQRTarget.roomName}
          venueName={selectedQRTarget.name}
          venueType="hotel"
          offerText={selectedQRTarget.highlightedOffer}
          imageUrl={selectedQRTarget.imageUrl}
        />
      )}
    </div>
  );
}
