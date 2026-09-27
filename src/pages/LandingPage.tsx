import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CityMap } from '../maps/CityMap';
import {
  Compass,
  Hotel,
  Users,
  Tag,
  Sparkles,
  Info,
} from 'lucide-react';

interface ShuffleCardItem {
  id: string;
  title: string;
  category: string;
  offer: string;
  status: string;
}

const SHUFFLE_CARDS: ShuffleCardItem[] = [
  {
    id: 'c1',
    title: 'Lebanese Lemon Garlic Grill',
    category: 'Restaurant Partner',
    offer: '200rs off on 600rs',
    status: 'AVAILABLE NOW',
  },
  {
    id: 'c2',
    title: 'Grand Palace Hotel & Suites',
    category: 'Hotel Accommodation',
    offer: '500rs off on 2500rs',
    status: 'ROOMS OPEN',
  },
  {
    id: 'c3',
    title: 'City Arena Crowd Operations',
    category: 'Live Event Gate',
    offer: 'Priority Pass Active',
    status: 'LIVE FLOW',
  },
  {
    id: 'c4',
    title: 'Heritage Boutique Dining',
    category: 'Restaurant Partner',
    offer: '150rs off on 500rs',
    status: '10 TABLES FREE',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Slow pace card shuffling effect (swaps card every 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % SHUFFLE_CARDS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5CD] text-[#000000] font-sans relative overflow-hidden flex flex-col justify-between selection:bg-[#000000] selection:text-[#F5F5CD]">
      {/* Background Motion Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border-2 border-black/10 animate-float-orbs" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full border border-black/10 animate-slow-pulse" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full border-2 border-black/10 animate-float-orbs" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(#000000 1.5px, transparent 1.5px), radial-gradient(#000000 1.5px, #F5F5CD 1.5px)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Top Navbar ONLY App Logo + Login/signup button */}
        <header className="border-b-2 border-black bg-[#F5F5CD] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            {/* Liquidcity waves icon */}
            <div className="flex flex-col gap-1 text-black font-black">
              <span className="w-5 h-1 bg-black rounded-full" />
              <span className="w-4 h-1 bg-black rounded-full" />
              <span className="w-6 h-1 bg-black rounded-full" />
            </div>
            <span className="text-2xl font-black tracking-tight text-black uppercase">
              Liquidcity
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-black text-[#F5F5CD] text-sm font-extrabold rounded-full border-2 border-black hover:bg-[#F5F5CD] hover:text-black transition-all shadow-md uppercase"
            >
              Login/signup
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
          {/* Top Grid: Video-Style Non-Clickable Real Map & Slow Shuffling Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Non-Clickable Real Map (7 Cols) */}
            <div className="lg:col-span-7 bg-[#E2E2A4] rounded-3xl border-2 border-black p-4 flex flex-col justify-between shadow-lg relative overflow-hidden pointer-events-none min-h-[420px]">
              <div className="flex items-center justify-between border-b-2 border-black pb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-black animate-ping" />
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-black">
                    LIVE CITY MAP TELEMETRY VIEW
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-black/80">
                  LIVE VIDEO STREAM • NON-CLICKABLE
                </span>
              </div>

              {/* Embed Real Interactive-Disabled Map */}
              <div className="relative my-2 w-full h-[330px] rounded-2xl overflow-hidden border-2 border-black pointer-events-none">
                <CityMap
                  center={{ lat: 12.9716, lng: 77.5946 }}
                  zoom={13}
                  markers={[
                    { id: 'm1', lat: 12.9716, lng: 77.5946, title: 'City Stadium', status: 'HIGH', type: 'crowd' },
                    { id: 'm2', lat: 12.978, lng: 77.6, title: 'Lebanese Bistro', status: 'NORMAL', type: 'crowd' },
                    { id: 'm3', lat: 12.965, lng: 77.59, title: 'Grand Hotel', status: 'MODERATE', type: 'crowd' },
                  ]}
                  showTraffic={true}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-black border-t-2 border-black pt-2 px-2">
                <span>GPS: 12.9716° N, 77.5946° E</span>
                <span>FEED STATUS: STREAM ACTIVE</span>
              </div>
            </div>

            {/* Right Column: Slow Shuffling Cards Stack (5 Cols) */}
            <div className="lg:col-span-5 bg-[#E2E2A4] rounded-3xl border-2 border-black p-6 shadow-lg flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                  <Sparkles size={16} /> LIVE SHUFFLING VENUES & OFFERS
                </span>
                <span className="text-[10px] font-mono font-bold bg-black text-[#F5F5CD] px-2 py-0.5 rounded">
                  AUTO-SHUFFLE 3.5S
                </span>
              </div>

              {/* Shuffling Cards Stack Container */}
              <div className="relative min-h-[300px] flex items-center justify-center">
                {SHUFFLE_CARDS.map((card, index) => {
                  const position = (index - activeCardIndex + SHUFFLE_CARDS.length) % SHUFFLE_CARDS.length;

                  return (
                    <div
                      key={card.id}
                      className={`absolute inset-x-0 bg-[#F5F5CD] border-2 border-black p-5 rounded-2xl shadow-md transition-all duration-700 ease-in-out flex flex-col justify-between space-y-3 ${
                        position === 0
                          ? 'top-0 z-30 scale-100 opacity-100 translate-y-0'
                          : position === 1
                          ? 'top-4 z-20 scale-95 opacity-90 translate-y-2'
                          : position === 2
                          ? 'top-8 z-10 scale-90 opacity-75 translate-y-4'
                          : 'top-12 z-0 scale-85 opacity-50 translate-y-6'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border border-black bg-black text-[#F5F5CD]">
                          {card.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-0.5 rounded">
                          {card.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-black leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-xs text-stone-800 font-semibold mt-1">
                          Exclusive 1-Hour QR Pass available on visit.
                        </p>
                      </div>

                      <div className="bg-black text-[#F5F5CD] p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase text-stone-400">
                            SPECIAL VOUCHER
                          </div>
                          <div className="text-sm font-black">{card.offer}</div>
                        </div>
                        <Tag size={20} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shuffling Indicator Dots */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {SHUFFLE_CARDS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`w-3 h-3 rounded-full border border-black transition-all ${
                      activeCardIndex === idx ? 'bg-black w-6' : 'bg-[#F5F5CD]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Instruction Cards (NON-CLICKABLE) */}
          <div className="space-y-6 pt-4">
            <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase border-b-2 border-black pb-3">
              Explore what you can do with Liquidcity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Chaos Navigation (Static Instruction) */}
              <div className="bg-[#E2E2A4] rounded-3xl border-2 border-black p-6 shadow-md flex flex-col justify-between space-y-6 select-none">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-[#F5F5CD] flex items-center justify-center font-black border-2 border-black">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-black leading-tight">
                    Chaos Navigation
                  </h3>
                  <p className="text-xs font-bold text-stone-800 leading-relaxed">
                    AI crowd-aware travel routing that bypasses heavy congestion, event bottlenecks, and road surges in real-time.
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                    <Info size={14} /> Platform Feature
                  </span>
                  <span className="text-[10px] font-mono font-black uppercase bg-black text-[#F5F5CD] px-2.5 py-1 rounded-full">
                    INSTRUCTION
                  </span>
                </div>
              </div>

              {/* Feature 2: Find Accomodation (Static Instruction) */}
              <div className="bg-[#E2E2A4] rounded-3xl border-2 border-black p-6 shadow-md flex flex-col justify-between space-y-6 select-none">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-[#F5F5CD] flex items-center justify-center font-black border-2 border-black">
                    <Hotel size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-black leading-tight">
                    Find Accomodation
                  </h3>
                  <p className="text-xs font-bold text-stone-800 leading-relaxed">
                    Discover verified partner hotels and restaurants with live table/room availability and 1-hour scannable QR offers.
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                    <Info size={14} /> Platform Feature
                  </span>
                  <span className="text-[10px] font-mono font-black uppercase bg-black text-[#F5F5CD] px-2.5 py-1 rounded-full">
                    INSTRUCTION
                  </span>
                </div>
              </div>

              {/* Feature 3: Crowd Management Platform (Static Instruction) */}
              <div className="bg-[#E2E2A4] rounded-3xl border-2 border-black p-6 shadow-md flex flex-col justify-between space-y-6 select-none">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-[#F5F5CD] flex items-center justify-center font-black border-2 border-black">
                    <Users size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-black leading-tight">
                    Crowd Management Platform
                  </h3>
                  <p className="text-xs font-bold text-stone-800 leading-relaxed">
                    Weather-driven digital twin simulation, gate allocation controls, and real-time visitor telemetry for organizers & admins.
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                    <Info size={14} /> Platform Feature
                  </span>
                  <span className="text-[10px] font-mono font-black uppercase bg-black text-[#F5F5CD] px-2.5 py-1 rounded-full">
                    INSTRUCTION
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-[#F5F5CD] py-6 px-8 text-center text-xs font-black uppercase tracking-widest text-black relative z-10">
        © 2026 Liquidcity • Smart Event & Crowd Operations Platform
      </footer>
    </div>
  );
}
