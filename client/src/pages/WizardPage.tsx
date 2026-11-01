import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Loader2, MapPin, Calendar,
  Users, DollarSign, Sparkles, Compass, Shield, Heart, Zap,
  Plane, Train, Bus, Car, Anchor, Hotel, Home, Building2, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useTripStore } from '../store/tripStore';
import {
  TripRequest, TravelStyle, Interest, Transport, Accommodation,
  CURRENCIES, WizardFormData
} from '../types';
import { estimateBudget } from '../utils/budgetCalc';
import { formatCurrency } from '../utils/helpers';

// ─── Constants ────────────────────────────────────────────────────────────────

const POPULAR_DESTINATIONS = ['Tokyo', 'Paris', 'Bali', 'Barcelona', 'Rome', 'New York', 'Sydney', 'Bangkok', 'Swiss Alps', 'Kyoto'];

const TRAVEL_STYLES: { id: TravelStyle; emoji: string; title: string; subtitle: string; color: string }[] = [
  { id: 'budget', emoji: '🎒', title: 'Backpacker Budget', subtitle: 'Hostels, local street food & free sights', color: '#00E5A0' },
  { id: 'balanced', emoji: '⚖️', title: 'Balanced Explorer', subtitle: '3-4★ hotels, mixed dining & highlights', color: '#FF6B35' },
  { id: 'comfort', emoji: '🏨', title: 'Premium Comfort', subtitle: 'Boutique stays, top excursions & bistros', color: '#845EC2' },
  { id: 'luxury', emoji: '💎', title: 'Ultra Luxe', subtitle: '5★ resorts, private tours & fine dining', color: '#00D4FF' },
];

const INTEREST_OPTIONS: { id: Interest; emoji: string; label: string }[] = [
  { id: 'adventure', emoji: '🧗', label: 'Adventure' },
  { id: 'nature', emoji: '🌿', label: 'Nature & Scenery' },
  { id: 'food', emoji: '🍜', label: 'Food & Gastronomy' },
  { id: 'culture', emoji: '🎭', label: 'Arts & Culture' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'relaxation', emoji: '🧘', label: 'Spa & Wellness' },
  { id: 'nightlife', emoji: '🌙', label: 'Nightlife' },
];

const TRANSPORT_OPTIONS: { id: Transport; emoji: string; label: string }[] = [
  { id: 'flight', emoji: '✈️', label: 'Flight' },
  { id: 'train', emoji: '🚂', label: 'Train' },
  { id: 'bus', emoji: '🚌', label: 'Coach / Bus' },
  { id: 'car', emoji: '🚗', label: 'Rental Car' },
  { id: 'ferry', emoji: '⛴️', label: 'Ferry' },
];

const ACCOMMODATION_OPTIONS: { id: Accommodation; label: string; icon: string }[] = [
  { id: 'hotel', label: 'City Hotel', icon: '🏨' },
  { id: 'boutique', label: 'Boutique Hotel', icon: '🏛️' },
  { id: 'resort', label: 'Resort & Spa', icon: '🏝️' },
  { id: 'airbnb', label: 'Private Apartment', icon: '🏡' },
  { id: 'guesthouse', label: 'Guesthouse', icon: '🏘️' },
  { id: 'hostel', label: 'Social Hostel', icon: '🎒' },
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'No Restrictions'];

const BUDGET_QUICK_PICKS = [800, 1500, 2500, 4000, 7500];

const STEP_NAMES = [
  'Destination',
  'Dates',
  'Travellers',
  'Budget',
  'Travel Style',
  'Interests',
  'Logistics',
  'Blueprint Review',
];

const TOTAL_STEPS = 8;

const initialForm: WizardFormData = {
  step: 1,
  startingCity: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  numberOfTravellers: 2,
  totalBudget: 2500,
  currency: 'USD',
  travelStyle: 'balanced',
  interests: ['food', 'culture'],
  preferredTransport: ['flight'],
  preferredAccommodation: 'hotel',
  dietaryRequirements: [],
  accessibilityNeeds: '',
  additionalNotes: '',
};

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getMinReturnDate(departureDate: string) {
  if (!departureDate) return getTodayStr();
  const d = new Date(departureDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function computeNights(departure: string, returnDate: string): number {
  if (!departure || !returnDate) return 0;
  const ms = new Date(returnDate).getTime() - new Date(departure).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function validateStep(step: number, form: WizardFormData): string | null {
  switch (step) {
    case 1:
      if (!form.startingCity?.trim()) return 'Please enter your departure origin.';
      if (!form.destination?.trim()) return 'Please enter your dream destination.';
      return null;
    case 2:
      if (!form.departureDate) return 'Please select a departure date.';
      if (!form.returnDate) return 'Please select a return date.';
      if (new Date(form.returnDate) <= new Date(form.departureDate)) return 'Return date must be strictly after departure.';
      return null;
    case 3:
      if (!form.numberOfTravellers || form.numberOfTravellers < 1) return 'Please specify number of travellers.';
      return null;
    case 4:
      if (!form.totalBudget || form.totalBudget < 50) return 'Please specify a reasonable trip budget.';
      return null;
    case 5:
      if (!form.travelStyle) return 'Please pick a travel style.';
      return null;
    case 6:
      if (!form.interests || form.interests.length === 0) return 'Select at least one travel interest.';
      return null;
    case 7:
      if (!form.preferredTransport || form.preferredTransport.length === 0) return 'Select at least one transport option.';
      if (!form.preferredAccommodation) return 'Select an accommodation type.';
      return null;
    default:
      return null;
  }
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepDestination({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="label">Where are you traveling from?</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            className="input-field !pl-12"
            placeholder="e.g., New York, London, San Francisco, Delhi..."
            value={form.startingCity ?? ''}
            onChange={(e) => update({ startingCity: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label">Where do you want to go?</label>
        <div className="relative">
          <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF6B35]" />
          <input
            className="input-field !pl-12 !border-[#FF6B35]/30 focus:!border-[#FF6B35]"
            placeholder="e.g., Tokyo, Paris, Bali, Swiss Alps, Rome..."
            value={form.destination ?? ''}
            onChange={(e) => update({ destination: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <span className="text-xs font-mono text-white/50 block uppercase tracking-wider">Quick Pick Trending Escapes:</span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_DESTINATIONS.map((dest) => {
            const isSelected = form.destination?.toLowerCase() === dest.toLowerCase();
            return (
              <button
                key={dest}
                type="button"
                onClick={() => update({ destination: dest })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6B35] text-white shadow-[0_0_15px_rgba(255,107,53,0.4)]'
                    : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {dest}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepDates({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  const nights = computeNights(form.departureDate ?? '', form.returnDate ?? '');
  const today = getTodayStr();

  const handleQuickDuration = (durationDays: number) => {
    const start = form.departureDate || today;
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    update({
      departureDate: start,
      returnDate: end.toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="label">Departure Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="date"
              min={today}
              className="input-field !pl-11"
              value={form.departureDate ?? ''}
              onChange={(e) => update({ departureDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">Return Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF6B35]" />
            <input
              type="date"
              min={getMinReturnDate(form.departureDate ?? '')}
              className="input-field !pl-11"
              value={form.returnDate ?? ''}
              onChange={(e) => update({ returnDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {nights > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF6B35]/15 to-[#845EC2]/15 border border-[#FF6B35]/30 flex items-center justify-between">
          <span className="text-xs text-white/70 font-mono">Calculated Stay Duration:</span>
          <span className="text-sm font-black text-white font-mono">
            {nights} Nights • {nights + 1} Days
          </span>
        </div>
      )}

      <div className="space-y-2 pt-2">
        <span className="text-xs font-mono text-white/50 block">Preset Stay Lengths:</span>
        <div className="flex flex-wrap gap-2">
          {[3, 5, 7, 10, 14].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleQuickDuration(d)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
            >
              {d} Nights
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepTravellers({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  const count = form.numberOfTravellers ?? 1;

  return (
    <div className="space-y-8 text-center py-4">
      <div className="space-y-2">
        <label className="label text-base">How many adventurers are embarking?</label>
        <p className="text-xs text-white/40">TripPilot automatically splits room and transit logistics based on group size.</p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => update({ numberOfTravellers: Math.max(1, count - 1) })}
          disabled={count <= 1}
          className="w-14 h-14 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-2xl font-black text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          -
        </button>
        <div className="w-24 text-center">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF2E63]">
            {count}
          </span>
          <span className="block text-xs font-mono text-white/50 mt-1">
            {count === 1 ? 'Solo Adventurer' : count === 2 ? 'Couple / Pair' : 'Group Trip'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => update({ numberOfTravellers: Math.min(20, count + 1) })}
          disabled={count >= 20}
          className="w-14 h-14 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-2xl font-black text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Visual Avatar Avatars */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
          <span key={i} className="text-2xl animate-in zoom-in-50 duration-200">
            {i % 2 === 0 ? '🧭' : '🎒'}
          </span>
        ))}
        {count > 10 && <span className="text-xs font-mono text-white/40 self-center">+{count - 10} more</span>}
      </div>
    </div>
  );
}

function StepBudget({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  const budget = form.totalBudget ?? 2000;
  const currency = form.currency ?? 'USD';
  const travellers = form.numberOfTravellers ?? 1;
  const perPerson = Math.round(budget / travellers);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1 space-y-2">
          <label className="label">Currency</label>
          <select
            value={currency}
            onChange={(e) => update({ currency: e.target.value })}
            className="input-field font-mono font-bold bg-[#12121e]"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0a0a12]">
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-2">
          <label className="label">Total Trip Budget</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00E5A0]" />
            <input
              type="number"
              step="50"
              min="100"
              className="input-field !pl-11 font-mono font-black text-lg text-[#00E5A0]"
              value={budget}
              onChange={(e) => update({ totalBudget: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Per Person Live Readout */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
        <span className="text-xs text-white/50 font-mono">Budget per traveller ({travellers} pax):</span>
        <span className="text-base font-black text-white font-mono">
          ~{formatCurrency(perPerson, currency)} / person
        </span>
      </div>

      {/* Quick Picks */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-mono text-white/40 block">Quick Preset Budgets:</span>
        <div className="flex flex-wrap gap-2">
          {BUDGET_QUICK_PICKS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => update({ totalBudget: b })}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                budget === b
                  ? 'bg-[#00E5A0] text-[#050507] shadow-[0_0_15px_rgba(0,228,160,0.3)]'
                  : 'bg-white/[0.04] text-white/70 hover:text-white border border-white/10'
              }`}
            >
              ${b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepTravelStyle({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-white/50 mb-2">Select your travel vibe to guide lodging standards, meal pacing, and ticket choices.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {TRAVEL_STYLES.map((style) => {
          const isSelected = form.travelStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => update({ travelStyle: style.id })}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white/[0.08] border-[#FF6B35] shadow-[0_0_25px_rgba(255,107,53,0.25)]'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{style.emoji}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-[#FF6B35] text-[#050507] flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </div>
              <h4 className="font-bold text-white text-base">{style.title}</h4>
              <p className="text-xs text-white/50 mt-1">{style.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepInterests({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  const selected = form.interests ?? [];

  const toggleInterest = (id: Interest) => {
    if (selected.includes(id)) {
      update({ interests: selected.filter((i) => i !== id) });
    } else {
      update({ interests: [...selected, id] });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/50 mb-2">Pick everything you enjoy. TripPilot weights daily activities to match.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {INTEREST_OPTIONS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleInterest(item.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF6B35]/20 to-[#FF2E63]/20 border-[#FF6B35] text-white shadow-[0_0_15px_rgba(255,107,53,0.2)]'
                  : 'bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPreferences({ form, update }: { form: WizardFormData; update: (p: Partial<WizardFormData>) => void }) {
  const transport = form.preferredTransport ?? [];
  const dietary = form.dietaryRequirements ?? [];

  const toggleTransport = (id: Transport) => {
    if (transport.includes(id)) {
      update({ preferredTransport: transport.filter((t) => t !== id) });
    } else {
      update({ preferredTransport: [...transport, id] });
    }
  };

  const toggleDietary = (item: string) => {
    if (dietary.includes(item)) {
      update({ dietaryRequirements: dietary.filter((d) => d !== item) });
    } else {
      update({ dietaryRequirements: [...dietary, item] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Transport */}
      <div className="space-y-2">
        <label className="label">Transit Preference (Multi-select)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TRANSPORT_OPTIONS.map((opt) => {
            const isSelected = transport.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleTransport(opt.id)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00D4FF]/20 border-[#00D4FF] text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lodging */}
      <div className="space-y-2">
        <label className="label">Preferred Accommodation</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACCOMMODATION_OPTIONS.map((opt) => {
            const isSelected = form.preferredAccommodation === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ preferredAccommodation: opt.id })}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#845EC2]/20 border-[#845EC2] text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary */}
      <div className="space-y-2">
        <label className="label">Dietary Preferences (Optional)</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((d) => {
            const isSelected = dietary.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDietary(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFB547] text-[#050507] font-bold'
                    : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepSummary({
  form,
  update,
  onGenerate,
  isGenerating
}: {
  form: WizardFormData;
  update: (p: Partial<WizardFormData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const nights = computeNights(form.departureDate ?? '', form.returnDate ?? '');
  const estimate = estimateBudget(form);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-start justify-between border-b border-white/[0.06] pb-3">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF6B35] block">Trip Blueprint</span>
            <h3 className="text-2xl font-black text-white">{form.destination}</h3>
            <p className="text-xs text-white/50">Departing from {form.startingCity}</p>
          </div>
          <span className="badge badge-sunset text-xs uppercase">{form.travelStyle}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-white/40 block">Duration</span>
            <span className="font-bold text-white font-mono">{nights} Nights</span>
          </div>
          <div>
            <span className="text-white/40 block">Group Size</span>
            <span className="font-bold text-white font-mono">{form.numberOfTravellers} Adventurers</span>
          </div>
          <div>
            <span className="text-white/40 block">Total Target</span>
            <span className="font-bold text-[#00E5A0] font-mono">{formatCurrency(form.totalBudget ?? 0, form.currency ?? 'USD')}</span>
          </div>
          <div>
            <span className="text-white/40 block">Lodging Type</span>
            <span className="font-bold text-white capitalize">{form.preferredAccommodation}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-white/50 block mb-1">Interests Focus:</span>
          <div className="flex flex-wrap gap-1.5">
            {form.interests?.map((i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] font-mono text-white/80 capitalize">
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Notes textarea */}
      <div className="space-y-1.5">
        <label className="label text-xs">Specific Requests or Special Constraints</label>
        <textarea
          rows={2}
          value={form.additionalNotes ?? ''}
          onChange={(e) => update({ additionalNotes: e.target.value })}
          placeholder="e.g., Must include a traditional tea ceremony; prefer morning activities..."
          className="input-field text-xs resize-none"
        />
      </div>

      {/* Big Action Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="btn-primary w-full !py-4 !text-base justify-center shadow-[0_0_40px_rgba(255,107,53,0.4)] cursor-pointer"
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-white" />
              <span>Synthesizing AI Itinerary...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-white" />
              <span>Synthesize Adaptive Itinerary ✨</span>
            </div>
          )}
        </button>
        <p className="text-[11px] text-center text-white/40 mt-2 font-mono">
          Deterministic calculus guarantees realistic schedules & zero budget hallucination.
        </p>
      </div>
    </div>
  );
}

// ─── Main Wizard Page ─────────────────────────────────────────────────────────

export default function WizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentTrip } = useTripStore();

  const [form, setForm] = useState<WizardFormData>(() => {
    const destParam = searchParams.get('destination');
    return {
      ...initialForm,
      destination: destParam || '',
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const destParam = searchParams.get('destination');
    if (destParam && !form.destination) {
      setForm((prev) => ({ ...prev, destination: destParam }));
    }
  }, [searchParams]);

  const update = useCallback((partial: Partial<WizardFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setError(null);
  }, []);

  const currentStep = form.step ?? 1;

  function goNext() {
    const err = validateStep(currentStep, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setForm((prev) => ({ ...prev, step: Math.min(TOTAL_STEPS, (prev.step ?? 1) + 1) }));
  }

  function goBack() {
    setError(null);
    setForm((prev) => ({ ...prev, step: Math.max(1, (prev.step ?? 1) - 1) }));
  }

  async function handleGenerate() {
    const err = validateStep(currentStep, form);
    if (err) {
      setError(err);
      return;
    }

    setIsGenerating(true);
    setError(null);

    const request: TripRequest = {
      startingCity: form.startingCity ?? '',
      destination: form.destination ?? '',
      departureDate: form.departureDate ?? '',
      returnDate: form.returnDate ?? '',
      numberOfTravellers: form.numberOfTravellers ?? 2,
      totalBudget: form.totalBudget ?? 2500,
      currency: form.currency ?? 'USD',
      travelStyle: form.travelStyle ?? 'balanced',
      interests: form.interests ?? ['food', 'culture'],
      preferredTransport: form.preferredTransport ?? ['flight'],
      preferredAccommodation: form.preferredAccommodation ?? 'hotel',
      dietaryRequirements: form.dietaryRequirements ?? [],
      accessibilityNeeds: form.accessibilityNeeds,
      additionalNotes: form.additionalNotes,
    };

    try {
      const result = await api.generateItinerary(request);
      setCurrentTrip(result.trip);
      toast.success(`✈️ Blueprint for ${request.destination} generated successfully!`);
      navigate(`/dashboard/${result.trip.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to generate itinerary. Please try again.');
      toast.error('Failed to generate itinerary.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 relative z-10 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* Step Progress Bar */}
        <div className="card p-4 sm:p-5 border-white/10 bg-[#080812]/90 backdrop-blur-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#FF6B35] font-bold">
              STEP 0{currentStep} / 0{TOTAL_STEPS}
            </span>
            <span className="text-white/60 font-semibold">
              {STEP_NAMES[currentStep - 1]}
            </span>
          </div>

          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] via-[#FF2E63] to-[#845EC2] transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Wizard Card */}
        <div className="card p-6 sm:p-8 border-white/15 bg-[#0a0a16]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {STEP_NAMES[currentStep - 1]}
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Configure your parameters for the adaptive travel engine.
            </p>
          </div>

          {/* Form Step Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && <StepDestination form={form} update={update} />}
              {currentStep === 2 && <StepDates form={form} update={update} />}
              {currentStep === 3 && <StepTravellers form={form} update={update} />}
              {currentStep === 4 && <StepBudget form={form} update={update} />}
              {currentStep === 5 && <StepTravelStyle form={form} update={update} />}
              {currentStep === 6 && <StepInterests form={form} update={update} />}
              {currentStep === 7 && <StepPreferences form={form} update={update} />}
              {currentStep === 8 && (
                <StepSummary
                  form={form}
                  update={update}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Inline Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-[#FF4757]/15 border border-[#FF4757]/30 text-[#FF4757] text-xs font-semibold"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Controls Footer */}
          {currentStep < TOTAL_STEPS && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                className="btn-secondary !px-4 !py-2.5 !text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="btn-primary !px-6 !py-2.5 !text-xs"
              >
                <span>{currentStep === TOTAL_STEPS - 1 ? 'Review Blueprint' : 'Continue'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {currentStep === TOTAL_STEPS && !isGenerating && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={goBack}
                className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                <ChevronLeft size={14} /> Back to Edit Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
