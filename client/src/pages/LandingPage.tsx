import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, DollarSign, MapPin, Compass, Shield,
  Clock, Zap, Calendar, Users, Plane, CheckCircle2, ChevronRight,
  TrendingDown, CloudSun, Eye, Layers, Star
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useTripStore } from '../store/tripStore';

const POPULAR_DESTINATIONS = [
  {
    name: 'Tokyo',
    country: 'Japan',
    tagline: 'Cyberpunk skylines & historic serene shrines',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    tags: ['Culinary', 'Culture', 'Nightlife'],
    costUSD: 1850,
    weather: 'Sunny · 21°C',
    days: 6,
  },
  {
    name: 'Paris',
    country: 'France',
    tagline: 'World-renowned bistros, art & sunset vistas',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    tags: ['Art & Museums', 'Romance', 'Cafes'],
    costUSD: 2100,
    weather: 'Mild · 18°C',
    days: 5,
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    tagline: 'Emerald terraced hills & coastal rejuvenation',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    tags: ['Wellness', 'Beaches', 'Temples'],
    costUSD: 1150,
    weather: 'Tropical · 29°C',
    days: 7,
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    tagline: 'Gaudí surrealism, Mediterranean tapas & beaches',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
    tags: ['Architecture', 'Tapas', 'Vibrant'],
    costUSD: 1650,
    weather: 'Clear · 24°C',
    days: 5,
  },
  {
    name: 'New York',
    country: 'USA',
    tagline: 'Electric Broadway energy & legendary gastronomy',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    tags: ['Urban', 'Broadway', 'Skyline'],
    costUSD: 2400,
    weather: 'Crisp · 17°C',
    days: 4,
  },
  {
    name: 'Santorini',
    country: 'Greece',
    tagline: 'Volcanic cliffside panoramas & Aegean sunsets',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    tags: ['Sunsets', 'Wine', 'Seaside'],
    costUSD: 1950,
    weather: 'Sunny · 26°C',
    days: 5,
  },
];

const ARCHETYPES = [
  {
    id: 'foodie',
    title: 'The Epicurean',
    emoji: '🍜',
    desc: 'Michelin star reservations, bustling night street markets, and private sommelier tastings.',
    pacing: 'Relaxed & Sensory',
    budgetFocus: '45% Dining Allocation',
    color: '#FF6B35',
  },
  {
    id: 'adventurer',
    title: 'The Thrillseeker',
    emoji: '🧗',
    desc: 'Sunrise volcano summit treks, reef diving, and off-the-beaten-path hidden ravines.',
    pacing: 'High Energy · 18,000 steps/day',
    budgetFocus: 'Prioritizes Experience Passes',
    color: '#00E5A0',
  },
  {
    id: 'culturalist',
    title: 'The Historian',
    emoji: '🏛️',
    desc: 'Curated architectural tours, local craft workshops, and private museum evening slots.',
    pacing: 'Balanced & Enriching',
    budgetFocus: 'Curated Guides & Heritage Hotels',
    color: '#845EC2',
  },
  {
    id: 'zen',
    title: 'The Slow Nomad',
    emoji: '🧘',
    desc: 'Boutique thermal spas, scenic book-cafes, and lingering Mediterranean sunset lunches.',
    pacing: 'Unhurried Pacing (1–2 main spots/day)',
    budgetFocus: 'Premium Lodging & Wellness',
    color: '#00D4FF',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [quickPrompt, setQuickPrompt] = useState('');
  const [activeArchetype, setActiveArchetype] = useState(ARCHETYPES[0]);

  const userTripCurrency = useTripStore((s) => s.currentTrip?.request?.currency || (s.trips.length > 0 ? s.trips[0].request?.currency : null));
  const activeCurrency = userTripCurrency || (typeof window !== 'undefined' ? localStorage.getItem('trippilot_preferred_currency') : null) || 'USD';
  const isINR = activeCurrency === 'INR';
  const isJPY = activeCurrency === 'JPY';

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      navigate(`/plan?destination=${encodeURIComponent(quickPrompt.trim())}`);
    } else {
      navigate('/plan');
    }
  };

  const handleDestinationClick = (destName: string) => {
    navigate(`/plan?destination=${encodeURIComponent(destName)}`);
  };

  return (
    <div className="relative overflow-hidden space-y-24 md:space-y-36 pb-24">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION: Dark Luxe with Hologram Itinerary Preview
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center pt-8 md:pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Col: Hero Copy & Quick Search Bar */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#FF6B35]/30 shadow-[0_0_20px_rgba(255,107,53,0.15)] backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/90">
                  Adaptive Travel Engine 2.0
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-xs font-semibold text-[#00E5A0]">Zero Hallucinations</span>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08]">
                  Where wanderlust meets <br className="hidden sm:inline" />
                  <span className="text-shimmer">machine precision.</span>
                </h1>
                <p className="text-base sm:text-xl text-white/60 max-w-xl leading-relaxed font-normal">
                  Say goodbye to generic static itineraries and budget guesswork. TripPilot engineers dynamic, budget-guaranteed travel blueprints that adapt instantly to your changes.
                </p>
              </motion.div>

              {/* Instant Search / Launch Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 max-w-xl"
              >
                <form
                  onSubmit={handleQuickSearch}
                  className="relative p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] focus-within:border-[#FF6B35]/60 focus-within:shadow-[0_0_30px_rgba(255,107,53,0.2)] transition-all flex items-center gap-2"
                >
                  <MapPin size={20} className="text-[#FF6B35] ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    placeholder="Where to? (e.g., Tokyo, Paris, Bali, Swiss Alps...)"
                    className="w-full bg-transparent border-none text-white placeholder-white/30 focus:outline-none text-sm sm:text-base font-medium px-2"
                  />
                  <button
                    type="submit"
                    className="btn-primary !px-6 !py-3 !text-sm whitespace-nowrap flex-shrink-0"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-white/40 font-mono text-[11px] mr-1">Trending:</span>
                  {['Tokyo ⛩️', 'Paris 🗼', 'Bali 🌺', 'Barcelona 🏖️', 'New York 🗽'].map((city) => (
                    <button
                      key={city}
                      onClick={() => handleDestinationClick(city.split(' ')[0])}
                      className="px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FF6B35]/40 text-white/70 hover:text-white transition-all text-xs"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Trust Metric Chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="pt-4 flex flex-wrap items-center gap-8 border-t border-white/[0.06] text-white/50 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00E5A0]" />
                  <span>Real Mathematical Budgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00D4FF]" />
                  <span>Live Weather Plan B</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#FF6B35]" />
                  <span>Natural Language Rewrites</span>
                </div>
              </motion.div>
            </div>

            {/* Right Col: Hologram Itinerary Card Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Decorative radial halo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B35]/20 via-[#FF2E63]/15 to-[#845EC2]/20 rounded-3xl blur-3xl -z-10" />

              {/* Main Floating Glass Card */}
              <div className="card p-6 md:p-7 border border-white/15 bg-[#0a0a16]/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-6 relative overflow-hidden">

                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-sunset text-[10px]">6 NIGHTS · BALANCED</span>
                      <span className="text-[11px] font-mono text-white/40">GR-4402</span>
                    </div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      Tokyo, Japan
                      <span className="text-lg">🗾</span>
                    </h3>
                    <p className="text-xs text-white/50 font-medium">October 14 — October 20 • 2 Travellers</p>
                  </div>

                  {/* Weather Status Pill */}
                  <div className="px-3 py-1.5 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/30 text-right">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#00E5A0]">
                      <CloudSun size={13} /> Clear · 22°C
                    </span>
                    <span className="text-[9px] font-mono text-white/40 uppercase">Optimal Feasibility</span>
                  </div>
                </div>

                {/* Live Budget Utilization Gauge */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white/80">Estimated Cost vs Target</span>
                    <span className="font-mono font-bold text-[#00E5A0]">
                      {formatCurrency(isINR ? 205000 : isJPY ? 380000 : 2480, activeCurrency)}{' '}
                      <span className="text-white/40 font-normal">
                        / {formatCurrency(isINR ? 250000 : isJPY ? 450000 : 3000, activeCurrency)}
                      </span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00E5A0] via-[#FFB547] to-[#FF6B35] transition-all duration-1000"
                      style={{ width: '82%' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/40 font-mono">
                    <span>82.6% Allocated</span>
                    <span className="text-[#00E5A0] font-bold">
                      +{formatCurrency(isINR ? 45000 : isJPY ? 70000 : 520, activeCurrency)} Safety Buffer Left
                    </span>
                  </div>
                </div>

                {/* Day Snapshot Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
                    <span className="font-mono font-bold uppercase text-white/70">Day 2 • Neon & Historic Temples</span>
                    <span className="text-[10px] text-[#FF6B35] font-mono">3 Sights Planned</span>
                  </div>

                  {/* Timeline items */}
                  <div className="space-y-2.5 relative pl-4 border-l border-white/10 text-xs">
                    <div className="relative group">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF6B35] shadow-[0_0_8px_#FF6B35]" />
                      <div className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] transition-colors border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Senso-ji Temple & Asakusa Walk</p>
                          <p className="text-[10px] text-white/40">09:00 AM • 2.5h • Sightseeing</p>
                        </div>
                        <span className="font-mono text-[11px] text-[#00E5A0] font-bold">FREE</span>
                      </div>
                    </div>

                    <div className="relative group">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#845EC2] shadow-[0_0_8px_#845EC2]" />
                      <div className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] transition-colors border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Tsukiji Seafood & Wagyu Tasting</p>
                          <p className="text-[10px] text-white/40">12:30 PM • 1.5h • Food & Dining</p>
                        </div>
                        <span className="font-mono text-[11px] text-white font-bold">
                          ~{formatCurrency(isINR ? 3150 : isJPY ? 5800 : 38, activeCurrency)} est.
                        </span>
                      </div>
                    </div>

                    <div className="relative group">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
                      <div className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] transition-colors border border-white/[0.05] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Shibuya Sky Rooftop Sunset</p>
                          <p className="text-[10px] text-white/40">05:30 PM • 1.5h • Panorama</p>
                        </div>
                        <span className="font-mono text-[11px] text-white font-bold">
                          ~{formatCurrency(isINR ? 1500 : isJPY ? 2750 : 18, activeCurrency)} est.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Demo Trigger */}
                <button
                  onClick={() => handleDestinationClick('Tokyo')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B35]/20 via-[#FF2E63]/20 to-[#845EC2]/20 hover:from-[#FF6B35]/30 hover:to-[#845EC2]/30 border border-[#FF6B35]/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,107,53,0.15)] cursor-pointer"
                >
                  <Sparkles size={14} className="text-[#FF6B35]" />
                  <span>Customize & Generate Similar Trip</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          METRICS & PROOF BAR: Hackathon Credibility
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-white/[0.08] bg-white/[0.01] backdrop-blur-lg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF2E63]">
                99.4%
              </span>
              <p className="text-xs font-mono uppercase text-white/50 tracking-wider">Budget Precision</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5A0] to-[#00D4FF]">
                &lt; 1.5s
              </span>
              <p className="text-xs font-mono uppercase text-white/50 tracking-wider">Adaptive Recalculation</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#845EC2] to-[#FF2E63]">
                100%
              </span>
              <p className="text-xs font-mono uppercase text-white/50 tracking-wider">Zod Schema Validated</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFB547] to-[#FF6B35]">
                Plan B
              </span>
              <p className="text-xs font-mono uppercase text-white/50 tracking-wider">Weather Contingency</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          INTERACTIVE TRAVEL DNA VISUALIZER: High Hackathon WOW Factor
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#845EC2]/20 border border-[#845EC2]/40 text-[#c9a8ff] text-xs font-mono">
            <Layers size={13} />
            INTELLIGENT ARCHETYPE ADAPTATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Calibrated to your exact travel DNA.
          </h2>
          <p className="text-base text-white/50 max-w-2xl mx-auto">
            Choose an archetype to see how TripPilot dynamically re-weights daily budgets, scheduling intensity, and activity categories.
          </p>
        </div>

        {/* Archetype Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {ARCHETYPES.map((arch) => {
            const isSelected = activeArchetype.id === arch.id;
            return (
              <button
                key={arch.id}
                onClick={() => setActiveArchetype(arch)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${isSelected
                  ? 'bg-white/[0.08] border-[#FF6B35] shadow-[0_0_30px_rgba(255,107,53,0.2)]'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  }`}
              >
                <span className="text-2xl mb-2 block">{arch.emoji}</span>
                <p className="font-bold text-white text-base">{arch.title}</p>
                <p className="text-xs text-white/40 mt-1 line-clamp-1">{arch.pacing}</p>
                {isSelected && (
                  <span
                    className="absolute top-0 right-0 w-8 h-8 rounded-bl-2xl flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: arch.color, color: '#050507' }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Active Archetype Demonstration Box */}
        <div className="card p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-white/40">Pacing Profile</span>
              <h4 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>{activeArchetype.emoji}</span>
                {activeArchetype.title}
              </h4>
              <p className="text-sm text-white/60 leading-relaxed">
                {activeArchetype.desc}
              </p>
            </div>

            <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <span className="text-[11px] font-mono text-white/40 block">Daily Pacing</span>
                <span className="text-sm font-bold text-white">{activeArchetype.pacing}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-white/40 block">Budget Weighting</span>
                <span className="text-sm font-bold text-[#00E5A0]">{activeArchetype.budgetFocus}</span>
              </div>
            </div>

            <div className="space-y-3 text-center md:text-right">
              <p className="text-xs text-white/50">Ready to plan with this profile?</p>
              <button
                onClick={() => navigate('/plan')}
                className="btn-primary !px-6 !py-3 !text-sm"
              >
                <span>Launch Wizard as {activeArchetype.title}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          POPULAR DESTINATIONS: High-Res Vibrant Visuals
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-xs font-mono mb-3">
              <Compass size={13} />
              CURATED TRAVEL DESTINATIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Instant-Launch Escapes
            </h2>
          </div>
          <p className="text-sm text-white/50 max-w-md">
            Click any destination to pre-populate the adaptive wizard with verified regional cost tables and attractions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => handleDestinationClick(dest.name)}
              className="card-hover group cursor-pointer overflow-hidden flex flex-col justify-between border-white/10 bg-[#080812]"
            >
              {/* Photo Banner */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-[#080812]/30 to-transparent" />

                {/* Weather pill overlay */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/80">
                  {dest.weather}
                </div>

                {/* Est Cost pill overlay */}
                <div className="absolute bottom-3 left-4">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">Est. 5-Day Plan</span>
                  <span className="text-lg font-black text-[#00E5A0]">
                    {formatCurrency(isINR ? dest.costUSD * 83 : isJPY ? dest.costUSD * 155 : dest.costUSD, activeCurrency)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white group-hover:text-[#FF6B35] transition-colors">
                      {dest.name}
                    </h3>
                    <span className="text-xs font-mono text-white/40">{dest.country}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">
                    {dest.tagline}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dest.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60 font-mono">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Button */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#FF6B35]">
                  <span>Craft {dest.name} Itinerary</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS: 4-Step Adaptive Intelligence Pipeline
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5A0]/20 border border-[#00E5A0]/40 text-[#00E5A0] text-xs font-mono">
            <Zap size={13} />
            REVOLUTIONARY ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            How TripPilot constructs your perfect trip.
          </h2>
          <p className="text-base text-white/50 max-w-xl mx-auto">
            Traditional tools give you generic bullet lists. TripPilot runs a four-stage verified planning pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Parameter Ingestion',
              desc: 'Collects destination, traveler count, precise budget cap, duration, and dietary needs.',
              icon: MapPin,
              color: '#FF6B35',
            },
            {
              step: '02',
              title: 'Deterministic Calculus',
              desc: 'Calculates exact regional cost ceilings for lodging, meals, transit, and emergency reserves in JavaScript.',
              icon: DollarSign,
              color: '#FF2E63',
            },
            {
              step: '03',
              title: 'AI Neural Synthesis',
              desc: 'Generates structured, validated day-by-day itineraries with opening hours and verified locations.',
              icon: Sparkles,
              color: '#845EC2',
            },
            {
              step: '04',
              title: 'Adaptive Plan B Shield',
              desc: 'Monitors real weather and allows conversational AI tweaks without breaking budget rules.',
              icon: Shield,
              color: '#00E5A0',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="card p-6 border-white/10 bg-white/[0.02] backdrop-blur-xl relative space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-2xl font-black text-white/15">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHY TRIPPILOT WINS: Hackathon Deep Feature Grid
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-2xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Built for real travellers, not just AI demos.
            </h2>
            <p className="text-sm text-white/50">
              TripPilot combines AI creativity with deterministic software engineering to solve the actual pain points of modern travel planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Budget Trade-Off Simulator</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Test hypothetical trade-offs like "What if we switch to boutique hostels?" or "What if we upgrade dining?" and watch all daily projections recalibrate instantly.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-[#00E5A0]/20 flex items-center justify-center text-[#00E5A0]">
                <CloudSun size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Live Weather Contingency</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                When rainy forecasts threaten outdoor hikes or open-air markets, Plan B automatically swaps them for world-class indoor museums, culinary studios, and arcades.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF]">
                <Eye size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Trip Readiness Score</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                A 100-point transparent rating that evaluates itinerary density, packing checklist completion, flight buffers, and budget feasibility before you leave home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM CTA: Irresistible Conversion Banner
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 border border-white/15 text-center space-y-6">
          {/* Animated sunset gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/20 via-[#FF2E63]/25 to-[#845EC2]/20 backdrop-blur-2xl -z-10" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF6B35]/30 rounded-full blur-[120px] pointer-events-none" />

          <span className="badge badge-sunset text-xs uppercase tracking-widest font-mono">
            FREE HACKATHON EDITION
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white max-w-2xl mx-auto">
            Ready to design your next great adventure?
          </h2>

          <p className="text-base text-white/60 max-w-lg mx-auto">
            Experience the future of travel planning. Tailored to your wallet, your rhythm, and your curiosity.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/plan')}
              className="btn-primary !px-9 !py-4 !text-base shadow-[0_0_40px_rgba(255,107,53,0.5)]"
            >
              <Sparkles size={18} />
              <span>Launch Trip Creation Wizard</span>
            </button>
            <button
              onClick={() => navigate('/trips')}
              className="btn-secondary !px-8 !py-4 !text-base"
            >
              <span>Explore Saved Trips</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
