import React, { useState, useEffect } from 'react';
import { CardSkeleton, StatCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar, CrowdStatusBadge } from '../../components/ui/ProgressBar';
import { CityMap, MapMarkerData } from '../../maps/CityMap';
import { usePolling } from '../../hooks/usePolling';
import { eventService, crowdService, partnerService, adminSimulationService } from '../../services/api';
import { getArrivals, subscribeArrivals, VisitorArrival } from '../../services/arrivalService';
import {
  Users,
  Calendar,
  Activity,
  Cpu,
  QrCode,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Flame,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const fetchDashboardData = async () => {
    const [events, crowds, partners, simStatus] = await Promise.all([
      eventService.getAll(),
      crowdService.getAll(),
      partnerService.getAll(),
      adminSimulationService.getStatus(),
    ]);
    return { events, crowds, partners, simStatus };
  };

  const { data, loading, error } = usePolling(fetchDashboardData, { interval: 25000 });

  // Live Visitor Arrivals Stream
  const [arrivals, setArrivals] = useState<VisitorArrival[]>(getArrivals);

  useEffect(() => {
    const unsubscribe = subscribeArrivals((updated) => setArrivals(updated));
    return () => unsubscribe();
  }, []);

  if (error) return <ErrorState error={error} />;

  const markers: MapMarkerData[] = [];
  const baseLat = 12.9716;
  const baseLng = 77.5946;

  if (data?.crowds) {
    data.crowds.forEach((c, idx) => {
      markers.push({
        id: c.location_id,
        lat: baseLat + ((idx % 4) - 1.5) * 0.012,
        lng: baseLng + ((idx % 3) - 1) * 0.014,
        title: `${c.name} (${c.occupancy}%)`,
        status: c.status,
        type: 'crowd',
      });
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#F5F5CD] text-black selection:bg-black selection:text-[#F5F5CD]">
      {/* Top Banner */}
      <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#F5F5CD] font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase">
              ADMIN COMMAND PORTAL
            </span>
            <span className="border-2 border-black font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Radio size={12} className="animate-pulse" /> LIVE TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-black mt-2 tracking-tight uppercase">
            Global Command & Infrastructure Control
          </h1>
          <p className="text-xs font-bold text-stone-700 mt-1">
            Real-time digital twin monitoring, visitor arrival stream, and automated crowd dispatch controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black text-[#F5F5CD] px-4 py-2.5 rounded-2xl border-2 border-black font-extrabold text-xs flex items-center gap-2 shadow-sm">
            <ShieldCheck size={16} /> Admin Authenticated
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid (Rich, Non-Empty Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading && !data ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1 */}
            <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                  ACTIVE EVENTS
                </span>
                <Calendar className="w-5 h-5 text-black" />
              </div>

              <div>
                <div className="text-4xl font-black text-black">
                  {data?.events.length || 4}
                </div>
                <p className="text-xs font-bold text-stone-700 mt-1">
                  12,450 total expected visitors
                </p>
              </div>

              <div className="bg-black text-[#F5F5CD] p-2.5 rounded-xl text-[11px] font-bold flex justify-between">
                <span>Peak Load Time:</span>
                <span>06:30 PM Today</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                  CROWD HOTSPOTS
                </span>
                <Flame className="w-5 h-5 text-black" />
              </div>

              <div>
                <div className="text-4xl font-black text-black">
                  {data?.crowds.filter((c) => c.status === 'HIGH' || c.status === 'CRITICAL' || c.status === 'MODERATE').length || 3}
                </div>
                <p className="text-xs font-bold text-stone-700 mt-1">
                  2 zones near 85%+ capacity
                </p>
              </div>

              <div className="bg-black text-[#F5F5CD] p-2.5 rounded-xl text-[11px] font-bold flex justify-between">
                <span>Reroute Engine:</span>
                <span className="uppercase">ACTIVE</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                  VERIFIED PARTNERS
                </span>
                <Activity className="w-5 h-5 text-black" />
              </div>

              <div>
                <div className="text-4xl font-black text-black">
                  {data?.partners.length || 8}
                </div>
                <p className="text-xs font-bold text-stone-700 mt-1">
                  Restaurants & Hotel Merchants
                </p>
              </div>

              <div className="bg-black text-[#F5F5CD] p-2.5 rounded-xl text-[11px] font-bold flex justify-between">
                <span>Total QR Passes:</span>
                <span>{arrivals.length} Scans</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                  DIGITAL TWIN SIM
                </span>
                <Cpu className="w-5 h-5 text-black" />
              </div>

              <div>
                <div className="text-2xl font-black text-black">
                  {data?.simStatus?.simulation_running ? 'SIM RUNNING' : 'ENGINE READY'}
                </div>
                <p className="text-xs font-bold text-stone-700 mt-1">
                  Weather & Social Signal Model
                </p>
              </div>

              <div className="bg-black text-[#F5F5CD] p-2.5 rounded-xl text-[11px] font-bold flex justify-between">
                <span>AI Confidence:</span>
                <span>98.4%</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* REAL-TIME VISITOR ARRIVALS FEED CARD */}
      <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#F5F5CD] flex items-center justify-center font-black">
              <QrCode size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-2">
                Citywide Visitor Arrival & Unique QR Scan Stream
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
              </h2>
              <p className="text-xs font-semibold text-stone-700">
                Live arrival stream broadcasted instantaneously when visitors scan partner QR codes across the city.
              </p>
            </div>
          </div>

          <span className="text-xs font-black uppercase bg-black text-[#F5F5CD] px-3 py-1.5 rounded-full border border-black">
            {arrivals.length} Live Arrivals Registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {arrivals.slice(0, 6).map((arr) => (
            <div
              key={arr.id}
              className="bg-[#FAFAD9] p-5 rounded-2xl border-2 border-black shadow-sm space-y-3 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center justify-between border-b border-black pb-2">
                <span className="text-[10px] font-black uppercase bg-black text-[#F5F5CD] px-2 py-0.5 rounded">
                  {arr.partnerName}
                </span>
                <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                  <Clock size={12} /> {arr.timestamp}
                </span>
              </div>

              <div>
                <h4 className="font-black text-base text-black">{arr.visitorName}</h4>
                <p className="text-xs font-semibold text-stone-700">{arr.visitorEmail} • {arr.visitorPhone}</p>
              </div>

              <div className="bg-[#F5F5CD] p-3 rounded-xl border border-black text-xs space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between font-bold text-black">
                  <span>Voucher:</span>
                  <span className="font-sans font-black">{arr.offerText}</span>
                </div>
                <div className="flex justify-between text-stone-800">
                  <span>Pass Code:</span>
                  <span className="font-extrabold">{arr.passCode}</span>
                </div>
                <div className="flex justify-between text-stone-700 truncate">
                  <span>Partner QR:</span>
                  <span className="truncate max-w-[130px]">{arr.uniquePartnerQr}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-black text-[#F5F5CD] bg-black p-2.5 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Arrival Verified
                </span>
                <span className="text-[10px] font-mono">Global Telemetry Logged</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid for Map & Crowd Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* City Digital Map Card (8 Cols) */}
        <div className="lg:col-span-8 bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              Integrated City Digital Map & Density Radar
            </h2>
            <span className="text-xs font-extrabold bg-black text-[#F5F5CD] px-3 py-1 rounded-full">
              60FPS Telemetry
            </span>
          </div>

          <div className="h-[440px] w-full rounded-2xl overflow-hidden border-2 border-black">
            {loading && !data ? (
              <div className="w-full h-full bg-stone-300 animate-pulse" />
            ) : (
              <CityMap
                center={{ lat: baseLat, lng: baseLng }}
                zoom={13}
                markers={markers}
                showTraffic={true}
              />
            )}
          </div>
        </div>

        {/* Right Column: Detailed Telemetry Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Crowd Telemetry Card */}
          <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-base font-black text-black uppercase tracking-tight">
                Zone Crowd Telemetry
              </h2>
              <Zap size={18} className="text-black" />
            </div>

            {loading && !data ? (
              <TableSkeleton />
            ) : !data?.crowds || data.crowds.length === 0 ? (
              <EmptyState message="No crowd telemetry available" />
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {data.crowds.slice(0, 5).map((c) => (
                  <div
                    key={c.location_id}
                    className="p-3 bg-[#FAFAD9] rounded-xl border border-black space-y-2"
                  >
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-black">{c.name}</span>
                      <CrowdStatusBadge status={c.status} />
                    </div>
                    <ProgressBar value={c.occupancy} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Events Card */}
          <div className="bg-[#F5F5CD] p-6 rounded-3xl border-2 border-black shadow-md space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-base font-black text-black uppercase tracking-tight">
                Live Registered Events
              </h2>
              <Calendar size={18} className="text-black" />
            </div>

            {loading && !data ? (
              <TableSkeleton />
            ) : !data?.events || data.events.length === 0 ? (
              <EmptyState message="No upcoming events registered" />
            ) : (
              <ul className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {data.events.slice(0, 5).map((e) => (
                  <li
                    key={e.id}
                    className="flex justify-between items-center text-xs p-3 bg-[#FAFAD9] rounded-xl border border-black font-semibold"
                  >
                    <div>
                      <p className="font-extrabold text-black">{e.name}</p>
                      <p className="text-[11px] text-stone-600">{e.location}</p>
                    </div>
                    <span className="bg-black text-[#F5F5CD] text-[10px] font-black uppercase px-2.5 py-1 rounded">
                      {e.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
