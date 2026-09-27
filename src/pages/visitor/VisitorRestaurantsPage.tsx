import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnerService } from '../../services/partnerService';
import { recommendationService } from '../../services/recommendationService';
import { usePolling } from '../../hooks/usePolling';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import OfferQRModal from '../../components/OfferQRModal';
import {
  Utensils,
  Star,
  Clock,
  Tag,
  MapPin,
  Check,
  Sparkles,
  Users,
  ChefHat,
  QrCode,
} from 'lucide-react';
import type { Recommendation, Partner } from '../../types';

interface RestaurantItem {
  id: string;
  name: string;
  dishName: string;
  description: string;
  imageUrl: string;
  tag: string;
  rating: number;
  distance: string;
  prepTime: string;
  servings: string;
  spiciness: string;
  ingredients: string[];
  extraTagsCount: number;
  highlightedOffer: string;
  capacity: number;
  occupancy: number;
  waitingTime: number;
}

const FEATURED_RESTAURANTS: RestaurantItem[] = [
  {
    id: 'rest_1',
    name: 'Lebanese Bistro & Grill',
    dishName: 'Lebanese Lemon Garlic Chicken',
    description:
      'A fragrant and spicy stir-fry with fresh Thai basil, chillies, and tender chicken served with aromatic garlic pilaf.',
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tag: '🔥 Spicy Choice',
    rating: 4.8,
    distance: '0.8 km',
    prepTime: '20 mins',
    servings: '4 serving',
    spiciness: 'Medium',
    ingredients: ['Yogurt', 'Olive Oil', 'Garlic', 'Chili'],
    extraTagsCount: 8,
    highlightedOffer: '200rs off on 600rs',
    capacity: 40,
    occupancy: 45,
    waitingTime: 10,
  },
  {
    id: 'rest_2',
    name: 'Royal Haveli Dining',
    dishName: 'Chef Special Butter Chicken Feast',
    description:
      'Rich charcoal-grilled tandoori chicken simmered in a velvet tomato cream gravy with aromatic whole spices.',
    imageUrl:
      'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    tag: '⭐ Top Rated',
    rating: 4.9,
    distance: '1.2 km',
    prepTime: '25 mins',
    servings: '2 serving',
    spiciness: 'Mild',
    ingredients: ['Butter', 'Cashew Cream', 'Basmati', 'Naan'],
    extraTagsCount: 5,
    highlightedOffer: '200rs off on 600rs',
    capacity: 60,
    occupancy: 70,
    waitingTime: 15,
  },
  {
    id: 'rest_3',
    name: 'Trattoria Bella Pasta',
    dishName: 'Wood-Fired Truffle Mushroom Pizza',
    description:
      'Authentic sourdough base layered with wild porcini mushrooms, fresh mozzarella, white truffle oil, and basil.',
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    tag: '✨ Chef Choice',
    rating: 4.7,
    distance: '1.5 km',
    prepTime: '15 mins',
    servings: '3 serving',
    spiciness: 'Non-Spicy',
    ingredients: ['Truffle Oil', 'Mozzarella', 'Mushrooms', 'Oregano'],
    extraTagsCount: 6,
    highlightedOffer: '150rs off on 500rs',
    capacity: 35,
    occupancy: 30,
    waitingTime: 0,
  },
];

export default function VisitorRestaurantsPage() {
  const navigate = useNavigate();
  const [pref, setPref] = useState<'balanced' | 'low_crowd' | 'fastest' | 'cheapest'>('balanced');
  const [recList, setRecList] = useState<Recommendation[] | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [choiceSubmitted, setChoiceSubmitted] = useState<string | null>(null);

  // Modal QR State
  const [selectedQRTarget, setSelectedQRTarget] = useState<RestaurantItem | null>(null);

  // Poll real backend partners
  const { data: partners } = usePolling(
    () => partnerService.getAll().then((list) => list.filter((p) => p.type === 'restaurant')),
    { interval: 25000 }
  );

  const handleGetRecommendations = async () => {
    setRecLoading(true);
    try {
      const recs = await recommendationService.postRestaurants({
        visitor_preference: pref,
      });
      setRecList(recs);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleSelectChoice = async (id: string, name: string) => {
    try {
      await recommendationService.submitChoice({ chosen_id: id });
      setChoiceSubmitted(`Choice recorded: ${name}! Route updated.`);
      setTimeout(() => setChoiceSubmitted(null), 4000);
    } catch (err) {
      console.error('Error recording choice:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans bg-[#F5F5CD] text-black">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2E2A4] p-6 rounded-3xl border-2 border-black shadow-md">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#F5F5CD] px-3 py-1 rounded-full border border-black">
            VISITOR DINING & DISCOUNTS
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-black mt-2 uppercase tracking-tight">
            Restaurant Dining & Live Offers
          </h1>
          <p className="text-xs font-bold text-stone-800 mt-1">
            Click on any restaurant card to view highlighted deals and generate your real 1-Hour QR redemption pass.
          </p>
        </div>

        {/* AI Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F5F5CD] border-2 border-black p-1 rounded-2xl">
            {(['balanced', 'low_crowd', 'fastest', 'cheapest'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPref(mode)}
                className={`px-3 py-1.5 text-xs font-black rounded-xl capitalize transition-colors ${
                  pref === mode
                    ? 'bg-black text-[#F5F5CD]'
                    : 'text-black hover:bg-black/10'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={recLoading}
            className="py-2.5 px-4 bg-black text-[#F5F5CD] text-xs font-black rounded-2xl border-2 border-black flex items-center gap-1.5 shadow-md hover:bg-stone-800 transition-all"
          >
            <Sparkles size={14} />
            {recLoading ? 'Ranking...' : 'AI Recommendation'}
          </button>
        </div>
      </div>

      {choiceSubmitted && (
        <div className="p-4 bg-[#F5F5CD] border-2 border-black text-black text-xs font-bold rounded-2xl flex items-center gap-2 fade-in">
          <Check size={16} />
          <span>{choiceSubmitted}</span>
        </div>
      )}

      {/* AI Recommendation Box if loaded */}
      {recList && recList.length > 0 && (
        <div className="space-y-4 bg-[#E2E2A4] p-6 rounded-3xl border-2 border-black shadow-md">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-black" />
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                Personalized Recommendation ({pref})
              </h2>
            </div>
            <button
              onClick={() => setRecList(null)}
              className="text-xs font-bold text-black hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recList.map((rec, idx) => (
              <div
                key={rec.id}
                className="bg-[#F5F5CD] p-5 rounded-2xl border-2 border-black shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-black text-[#F5F5CD]">
                      Rank #{idx + 1}
                    </span>
                    <span className="text-xs font-black text-black">
                      Score: {rec.score?.toFixed(1) || '9.4'}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-black">{rec.name}</h3>
                  <p className="text-xs font-semibold text-stone-700 italic mt-0.5 mb-3">"{rec.reason}"</p>

                  <div className="space-y-1.5 text-xs text-black bg-[#E2E2A4] p-3 rounded-xl border border-black font-semibold">
                    <div className="flex justify-between">
                      <span>Occupancy</span>
                      <span className="font-black">{Math.round(rec.occupancy)}%</span>
                    </div>
                    <ProgressBar value={rec.occupancy} />
                    <div className="flex justify-between pt-1">
                      <span>Wait time:</span>
                      <span className="font-bold">{Math.round(rec.waiting_time)} mins</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black flex gap-2">
                  <button
                    onClick={() => handleSelectChoice(rec.id, rec.name)}
                    className="py-2.5 px-3 bg-black text-[#F5F5CD] text-xs font-black rounded-xl flex-1 hover:bg-stone-800"
                  >
                    Select Recommendation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Restaurant Cards Directory */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <span className="text-xs font-black uppercase tracking-widest text-black">
            POPULAR RESTAURANTS & EXCLUSIVE OFFERS
          </span>
          <span className="text-xs text-black font-extrabold">Click card to redeem 1-hour QR</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_RESTAURANTS.map((item) => (
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
                    alt={item.dishName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#F5F5CD] border-2 border-black text-black text-xs font-black px-3 py-1 rounded-full shadow-md">
                    <span>{item.tag}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-black text-xl text-black leading-tight group-hover:underline">
                    {item.dishName}
                  </h3>
                  <p className="text-xs text-black font-semibold line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Stat Bar Strip */}
                <div className="flex items-center justify-between py-2 border-y-2 border-black text-xs text-black font-extrabold">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{item.prepTime}</span>
                  </div>
                  <span className="text-black">|</span>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{item.servings}</span>
                  </div>
                  <span className="text-black">|</span>
                  <div className="flex items-center gap-1">
                    <ChefHat size={14} />
                    <span>{item.spiciness}</span>
                  </div>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="text-[11px] font-black text-black bg-[#F5F5CD] px-2.5 py-1 rounded-full border border-black"
                    >
                      {ing}
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
                        RESTAURANT OFFER
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
          title={selectedQRTarget.dishName}
          venueName={selectedQRTarget.name}
          venueType="restaurant"
          offerText={selectedQRTarget.highlightedOffer}
          imageUrl={selectedQRTarget.imageUrl}
        />
      )}
    </div>
  );
}
