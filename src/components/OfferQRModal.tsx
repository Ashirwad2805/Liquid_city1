import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Tag,
  Radio,
  Send,
} from 'lucide-react';
import { recordArrival } from '../services/arrivalService';

interface OfferQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  venueName: string;
  partnerId?: string;
  venueType: 'restaurant' | 'hotel' | 'shuttle' | 'parking';
  offerText: string;
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  imageUrl?: string;
}

export default function OfferQRModal({
  isOpen,
  onClose,
  title,
  venueName,
  partnerId = 'partner_1',
  venueType,
  offerText,
  visitorName = 'Visitor',
  visitorPhone = '+91 98765 43210',
  visitorEmail = 'visitor@demo.liquidcity',
  imageUrl,
}: OfferQRModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [passId] = useState<string>(() => `LC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [uniquePartnerQr] = useState<string>(
    () => `LC-QR-${venueType.toUpperCase()}-${venueName.replace(/\s+/g, '').substring(0, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [scannedAndSynced, setScannedAndSynced] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(3600);
    setScannedAndSynced(false);

    const recorded = recordArrival({
      visitorName,
      visitorEmail,
      visitorPhone,
      partnerId,
      partnerName: venueName,
      partnerType: venueType as any,
      offerText,
      passCode: passId,
      status: 'CHECKED_IN',
      uniquePartnerQr,
    });

    if (recorded) {
      setScannedAndSynced(true);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  const qrPayload = JSON.stringify({
    uniquePartnerQr,
    passId,
    venueName,
    partnerId,
    venueType,
    offer: offerText,
    visitorName,
    visitorEmail,
    visitorPhone,
    expiresIn: `${minutes}m ${seconds}s`,
    timestamp: new Date().toISOString(),
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    qrPayload
  )}&color=000000&bgcolor=F5F5CD`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(uniquePartnerQr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualScanSimulation = () => {
    recordArrival({
      visitorName,
      visitorEmail,
      visitorPhone,
      partnerId,
      partnerName: venueName,
      partnerType: venueType as any,
      offerText,
      passCode: passId,
      status: 'OFFER_REDEEMED',
      uniquePartnerQr,
    });
    setScannedAndSynced(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#F5F5CD] rounded-3xl shadow-2xl border-2 border-black overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-black text-[#F5F5CD] p-5 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5F5CD] text-black flex items-center justify-center font-black text-sm border border-black shadow">
              LC
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide uppercase">UNIQUE PARTNER QR PASS</h3>
              <p className="text-[11px] font-bold text-stone-300">Real-Time Sync with Partner & Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5CD] text-black flex items-center justify-center hover:bg-stone-300 transition-colors border border-black font-bold"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Broadcast Banner */}
        {scannedAndSynced && (
          <div className="bg-black text-[#F5F5CD] border-b-2 border-black px-4 py-2 text-[11px] font-black flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-1.5 uppercase">
              <Radio size={14} className="animate-spin" /> Live Arrival Shared to Partner & Admin!
            </span>
            <CheckCircle2 size={14} />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Venue & Offer Info */}
          <div className="bg-[#E2E2A4] p-4 rounded-2xl border-2 border-black shadow-sm flex items-center gap-3">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={venueName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-black"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-[#F5F5CD]">
                {venueType === 'restaurant' ? 'Restaurant Partner' : 'Hotel Partner'}
              </span>
              <h4 className="font-black text-base text-black truncate mt-0.5">{venueName}</h4>
              <p className="text-xs text-stone-800 font-bold truncate">{title}</p>
            </div>
          </div>

          {/* Highlighted Offer Banner */}
          <div className="bg-black text-[#F5F5CD] p-4 rounded-2xl shadow-md border-2 border-black flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                UNIQUE PARTNER VOUCHER
              </div>
              <div className="text-xl font-black mt-0.5">{offerText}</div>
              <p className="text-[11px] text-stone-300 mt-0.5">Valid for direct visitor arrival scan</p>
            </div>
            <Tag size={28} className="text-[#F5F5CD] shrink-0" />
          </div>

          {/* Real Unique QR Code Section */}
          <div className="bg-[#FAFAD9] p-5 rounded-2xl border-2 border-black shadow-sm flex flex-col items-center text-center relative">
            {isExpired ? (
              <div className="py-8 flex flex-col items-center space-y-2">
                <AlertCircle size={48} className="text-black animate-pulse" />
                <h4 className="font-black text-black uppercase">Pass Expired</h4>
                <p className="text-xs font-bold text-stone-700">
                  This 1-hour QR voucher has expired. Please regenerate a new offer.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-[#F5F5CD] rounded-2xl border-2 border-black mb-3 shadow-inner relative group">
                  <img
                    src={qrImageUrl}
                    alt="Unique Partner QR Code"
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                  <div className="absolute inset-x-3 top-3 h-0.5 bg-black shadow-md animate-pulse" />
                </div>

                <div className="space-y-1 mb-3">
                  <div className="text-[10px] font-black text-black uppercase tracking-widest">
                    UNIQUE PARTNER QR ID
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="text-xs font-mono font-black text-black bg-[#E2E2A4] px-2.5 py-1 rounded-lg border border-black">
                      {uniquePartnerQr}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="text-xs text-black font-black hover:underline uppercase"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <p className="text-xs font-semibold text-black max-w-xs leading-relaxed">
                  Scanning this QR code automatically notifies <strong>{venueName}</strong> and logs arrival on the <strong>Admin Dashboard</strong>.
                </p>
              </>
            )}
          </div>

          {/* Live 1-Hour Countdown Timer */}
          <div className="p-4 rounded-2xl border-2 border-black bg-[#E2E2A4] text-black flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock size={20} className="text-black" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-black">
                  QR Expiration Timer
                </div>
                <div className="text-xs font-extrabold">Valid for 1 Hour</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-wider text-black">
                Time Remaining
              </div>
              <div className="text-base font-black font-mono tracking-wider text-black">
                {isExpired
                  ? '00m 00s'
                  : `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`}
              </div>
            </div>
          </div>

          {/* Visitor Arrival Details */}
          <div className="bg-[#FAFAD9] p-3.5 rounded-2xl border-2 border-black text-xs text-black space-y-1.5 font-semibold">
            <div className="flex justify-between">
              <span className="text-stone-700">Visitor:</span>
              <span className="font-black text-black">{visitorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-700">Phone:</span>
              <span className="font-black text-black">{visitorPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-700">Arrival Sync:</span>
              <span className="font-black text-black flex items-center gap-1 uppercase">
                <ShieldCheck size={13} /> Active & Sent to Partner/Admin
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F5F5CD] border-t-2 border-black flex gap-2">
          <button
            onClick={handleManualScanSimulation}
            className="flex-1 py-3 px-3 rounded-xl bg-[#E2E2A4] hover:bg-black hover:text-[#F5F5CD] text-black font-black text-xs border-2 border-black flex items-center justify-center gap-1.5 transition-colors uppercase"
          >
            <Send size={13} /> Resend Scan Signal
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-black text-[#F5F5CD] font-black text-xs hover:bg-stone-800 transition-colors border-2 border-black shadow-md uppercase"
          >
            Close Pass
          </button>
        </div>
      </div>
    </div>
  );
}
