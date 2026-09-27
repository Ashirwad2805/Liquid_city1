// Shared Arrival & QR Scan Service for LiquidCity
// Manages real-time visitor arrivals when visitors scan unique partner QR codes

export interface VisitorArrival {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  partnerId: string;
  partnerName: string;
  partnerType: 'restaurant' | 'hotel' | 'shuttle' | 'parking';
  offerText: string;
  passCode: string;
  timestamp: string;
  isoTime: string;
  status: 'CHECKED_IN' | 'OFFER_REDEEMED' | 'EN_ROUTE';
  uniquePartnerQr: string;
}

const STORAGE_KEY = 'lc_visitor_arrivals';

// Initial realistic seed arrivals for Reality View
const SEED_ARRIVALS: VisitorArrival[] = [
  {
    id: 'arr_seed_1',
    visitorName: 'Aarav Sharma',
    visitorEmail: 'aarav@example.com',
    visitorPhone: '+91 98765 12345',
    partnerId: 'rest_1',
    partnerName: 'Lebanese Bistro & Grill',
    partnerType: 'restaurant',
    offerText: '200rs off on 600rs',
    passCode: 'LC-RED-9841',
    timestamp: '2 mins ago',
    isoTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'CHECKED_IN',
    uniquePartnerQr: 'LC-QR-REST-1-LEBANESE',
  },
  {
    id: 'arr_seed_2',
    visitorName: 'Priya Patel',
    visitorEmail: 'priya@example.com',
    visitorPhone: '+91 98123 45678',
    partnerId: 'hotel_1',
    partnerName: 'Grand Palace Hotel & Suites',
    partnerType: 'hotel',
    offerText: '500rs off on 2500rs',
    passCode: 'LC-RED-4512',
    timestamp: '7 mins ago',
    isoTime: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    status: 'OFFER_REDEEMED',
    uniquePartnerQr: 'LC-QR-HOTEL-1-GRANDPALACE',
  },
  {
    id: 'arr_seed_3',
    visitorName: 'Rohan Verma',
    visitorEmail: 'rohan@example.com',
    visitorPhone: '+91 99887 66554',
    partnerId: 'rest_2',
    partnerName: 'Royal Haveli Dining',
    partnerType: 'restaurant',
    offerText: '200rs off on 600rs',
    passCode: 'LC-RED-3309',
    timestamp: '14 mins ago',
    isoTime: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    status: 'CHECKED_IN',
    uniquePartnerQr: 'LC-QR-REST-2-ROYALHAVELI',
  },
];

export function getArrivals(): VisitorArrival[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ARRIVALS));
      return SEED_ARRIVALS;
    }
    return JSON.parse(raw) as VisitorArrival[];
  } catch {
    return SEED_ARRIVALS;
  }
}

export function recordArrival(arrivalData: Omit<VisitorArrival, 'id' | 'timestamp' | 'isoTime'>): VisitorArrival {
  const arrivals = getArrivals();
  const now = new Date();
  const newArrival: VisitorArrival = {
    ...arrivalData,
    id: `arr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: 'Just now',
    isoTime: now.toISOString(),
  };

  const updated = [newArrival, ...arrivals];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch custom browser event so open dashboards re-render immediately
  window.dispatchEvent(new CustomEvent('lc_arrival_recorded', { detail: newArrival }));
  return newArrival;
}

export function subscribeArrivals(callback: (arrivals: VisitorArrival[]) => void) {
  const handler = () => {
    callback(getArrivals());
  };

  window.addEventListener('lc_arrival_recorded', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('lc_arrival_recorded', handler);
    window.removeEventListener('storage', handler);
  };
}
