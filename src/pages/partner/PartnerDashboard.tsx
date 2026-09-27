import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { partnerService } from '../../services/partnerService';
import { crowdService } from '../../services/crowdService';
import { getArrivals, subscribeArrivals, VisitorArrival } from '../../services/arrivalService';
import { usePolling } from '../../hooks/usePolling';
import { StatCardSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { ProgressBar, CrowdStatusBadge } from '../../components/ui/ProgressBar';
import {
  Utensils,
  Hotel,
  Truck,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Tag,
  Plus,
  QrCode,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const partnerType = user?.partnerType || 'restaurant';

  const { data: partners, loading: partnersLoading } = usePolling(() => partnerService.getAll(), {
    interval: 25000,
  });
  const { data: crowds, loading: crowdsLoading } = usePolling(() => crowdService.getAll(), {
    interval: 20000,
  });

  // Visitor Arrivals state synced via arrivalService
  const [arrivals, setArrivals] = useState<VisitorArrival[]>(getArrivals);

  useEffect(() => {
    const unsubscribe = subscribeArrivals((updated) => setArrivals(updated));
    return () => unsubscribe();
  }, []);

  // Current partner record (or first matching type)
  const currentPartner = partners?.find((p) => p.type === partnerType) || partners?.[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-[#FAF6F0] p-6 rounded-3xl border border-[#E5DCD6] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1E1E1E] text-white capitalize font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full uppercase">
              {partnerType} Partner Portal
            </span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Merchant
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E1E1E] mt-1.5">
            {currentPartner?.name || `${user?.name || 'Partner'} Business Portal`}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time live visitor arrivals stream, QR scan redemptions, and table occupancy control.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/partner/availability')}
            className="py-2.5 px-4 bg-[#1E1E1E] hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Calendar size={14} />
            Manage {partnerType === 'hotel' ? 'Rooms' : partnerType === 'transport' ? 'Fleet' : 'Tables'}
          </button>
          <button
            onClick={() => navigate('/partner/offers')}
            className="py-2.5 px-4 bg-[#D88A8A] hover:bg-[#C27777] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Tag size={14} />
            Live Offers
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {partnersLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-[#E5DCD6] shadow-sm space-y-2 hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                Live Occupancy
              </span>
              <span className="text-3xl font-black text-[#1E1E1E]">
                {Math.round(currentPartner?.occupancy || 65)}%
              </span>
              <ProgressBar value={currentPartner?.occupancy || 65} />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5DCD6] shadow-sm space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                Total QR Check-Ins
              </span>
              <span className="text-3xl font-black text-emerald-600 flex items-center gap-1.5">
                {arrivals.length} <Radio size={18} className="animate-pulse text-emerald-500" />
              </span>
              <span className="text-[11px] text-stone-500 font-medium">Synced from Visitor App</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5DCD6] shadow-sm space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                Avg Waiting Time
              </span>
              <span className="text-3xl font-black text-[#B85B5B]">
                {Math.round(currentPartner?.waiting_time || 10)}m
              </span>
              <span className="text-[11px] text-stone-500">Immediate seating available</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5DCD6] shadow-sm space-y-1 hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                Partner Rating
              </span>
              <span className="text-3xl font-black text-[#1E1E1E]">
                ★ {currentPartner?.rating?.toFixed(1) || '4.8'}
              </span>
              <span className="text-[11px] text-stone-500">Verified by city visitors</span>
            </div>
          </>
        )}
      </div>

      {/* REAL-TIME VISITOR ARRIVALS FEED (Key Requirement) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5DCD6] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5EBE6] text-[#B85B5B] flex items-center justify-center font-bold">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1E1E1E] flex items-center gap-2">
                Live Visitor Arrival & Unique QR Scan Stream
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-stone-500">
                Real-time notification whenever a visitor generates or scans your unique partner QR code.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-[#F5EBE6] px-3 py-1 rounded-full border border-[#E5DCD6]">
            {arrivals.length} Live Scans Logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {arrivals.map((arr) => (
            <div
              key={arr.id}
              className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5DCD6] shadow-sm space-y-2 hover:border-[#1E1E1E] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-white px-2 py-0.5 rounded text-[#B85B5B] border border-[#E5DCD6]">
                  {arr.partnerType.toUpperCase()} PASS
                </span>
                <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                  <Clock size={12} /> {arr.timestamp}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-[#1E1E1E]">{arr.visitorName}</h4>
                <p className="text-xs text-stone-500 font-mono">{arr.visitorPhone}</p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#E5DCD6] text-xs space-y-1">
                <div className="flex justify-between font-bold text-[#1E1E1E]">
                  <span>Voucher:</span>
                  <span className="text-[#B85B5B]">{arr.offerText}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-stone-500">
                  <span>Pass Code:</span>
                  <span className="font-bold text-stone-800">{arr.passCode}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-stone-400 truncate">
                  <span>QR ID:</span>
                  <span className="truncate max-w-[140px]">{arr.uniquePartnerQr}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Arrival Verified
                </span>
                <span className="text-[10px] font-mono text-stone-500">Partner & Admin Synced</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Floor Status & Nearby Crowds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Floor Plan Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCD6] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E1E1E]">
              {partnerType === 'hotel'
                ? 'Room Status Overview'
                : partnerType === 'transport'
                ? 'Fleet Readiness'
                : 'Live Table Status'}
            </h2>
            <button
              onClick={() => navigate('/partner/availability')}
              className="text-xs font-bold text-[#B85B5B] hover:underline flex items-center gap-1"
            >
              Floor Plan <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-2xl font-black text-emerald-700">8</div>
              <div className="text-xs font-bold text-emerald-800">Available</div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="text-2xl font-black text-rose-700">12</div>
              <div className="text-xs font-bold text-rose-800">Occupied</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-2xl font-black text-amber-700">2</div>
              <div className="text-xs font-bold text-amber-800">Reserved</div>
            </div>
          </div>
        </div>

        {/* Live Crowd Surges Nearby */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DCD6] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#1E1E1E]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1E1E1E]">
                Nearby Event Crowd Surges
              </h2>
            </div>
            <button
              onClick={() => navigate('/partner/crowd-map')}
              className="text-xs font-bold text-[#B85B5B] hover:underline flex items-center gap-1"
            >
              Crowd Map <ArrowRight size={13} />
            </button>
          </div>

          {crowdsLoading ? (
            <CardSkeleton />
          ) : !crowds || crowds.length === 0 ? (
            <p className="text-xs text-stone-500 py-4">No live crowd telemetry at this moment.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {crowds.slice(0, 4).map((c) => (
                <div
                  key={c.location_id}
                  className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E5DCD6] flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-extrabold text-xs text-[#1E1E1E]">{c.name}</h4>
                    <span className="text-[11px] text-stone-500">{c.occupancy}% capacity reached</span>
                  </div>
                  <CrowdStatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
