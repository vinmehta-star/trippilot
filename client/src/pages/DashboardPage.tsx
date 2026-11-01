import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass, Calendar, DollarSign, MapPin, PackageCheck, CloudSun, Sparkles,
  ArrowLeft, Share2, Printer, Plus, AlertCircle, Info, CheckCircle2, ShieldAlert,
  Flame, Zap, Clock, Users, ArrowUpRight
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Activity, Day, Itinerary } from '../types';
import { formatCurrency, formatDate, differenceInDays } from '../utils/helpers';
import toast from 'react-hot-toast';

import DemoBanner from '../components/ui/DemoBanner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DayTimeline from '../components/itinerary/DayTimeline';
import ActivityEditModal from '../components/itinerary/ActivityEditModal';
import BudgetChart from '../components/budget/BudgetChart';
import BudgetSimulator from '../components/budget/BudgetSimulator';
import PackingChecklist from '../components/packing/PackingChecklist';
import ReadinessScore from '../components/readiness/ReadinessScore';
import WeatherWidget from '../components/weather/WeatherWidget';
import NLEditPanel from '../components/nlEdit/NLEditPanel';
import PrintDossier from '../components/itinerary/PrintDossier';

const TripMap = lazy(() => import('../components/map/TripMap'));

type TabType = 'overview' | 'itinerary' | 'budget' | 'map' | 'packing' | 'weather' | 'nledit';

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTrip,
    fetchTrip,
    isLoading,
    error,
    updateActivity,
    addActivity,
    removeActivity,
    reorderActivities,
    updatePackingItem,
    addPackingItem,
    readinessScore,
    readinessFactors,
  } = useTripStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [editingActivity, setEditingActivity] = useState<{ dayNumber: number; activity: Activity | null } | null>(null);

  useEffect(() => {
    if (id) {
      fetchTrip(id);
    }
  }, [id, fetchTrip]);

  if (isLoading || (!currentTrip && !error)) {
    return <LoadingSpinner message="Calibrating Adaptive Trip Environment..." />;
  }

  if (error || !currentTrip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="card p-10 space-y-5 max-w-md mx-auto border-white/10 bg-[#0a0a14]">
          <AlertCircle className="w-12 h-12 text-[#FF4757] mx-auto" />
          <h2 className="text-xl font-bold text-white">Trip Blueprint Not Found</h2>
          <p className="text-sm text-white/50">
            {error || 'The requested itinerary record does not exist or may have been pruned.'}
          </p>
          <button onClick={() => navigate('/trips')} className="btn-primary w-full justify-center">
            Return to Vault
          </button>
        </div>
      </div>
    );
  }

  const { request, itinerary } = currentTrip;
  const nights = differenceInDays(request.returnDate, request.departureDate);
  const totalActivities = itinerary.days.reduce((acc, d) => acc + d.activities.length, 0);

  const handleApplyNLChanges = (updatedItinerary: Itinerary) => {
    useTripStore.setState((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, itinerary: updatedItinerary } : null,
    }));
  };

  const handleSaveModalActivity = (activity: Activity) => {
    if (!editingActivity) return;
    if (editingActivity.activity) {
      updateActivity(editingActivity.dayNumber, activity);
      toast.success('Activity stop updated');
    } else {
      addActivity(editingActivity.dayNumber, activity);
      toast.success('Activity stop added');
    }
    setEditingActivity(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Trip link copied to clipboard!');
  };

  const selectedDay = itinerary.days.find(d => d.dayNumber === selectedDayNumber) || itinerary.days[0];

  return (
    <>
      {/* ─── High-Contrast Travel Dossier (Visible ONLY when Printing / Exporting to PDF) ─── */}
      <PrintDossier trip={currentTrip} />

      {/* ─── Interactive Cyber-Luxe Dashboard (Screen View Only) ─── */}
      <div className="print:hidden min-h-screen bg-transparent text-[#e0e0ec] pb-24 relative">
        <DemoBanner isDemo={itinerary.isDemo} />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER: Sunset Cyber-Luxe Identity
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#0d0d1a]/85 via-[#090912]/70 to-transparent backdrop-blur-md">
        {/* Ambient lighting orb */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-[#FF6B35]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Top navigation row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate('/trips')}
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#FF6B35] hover:text-white transition-colors"
            >
              <ArrowLeft size={15} /> Back to Saved Vault
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="btn-secondary !px-3.5 !py-1.5 !text-xs flex items-center gap-1.5"
              >
                <Share2 size={13} /> Share Link
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary !px-3.5 !py-1.5 !text-xs flex items-center gap-1.5"
              >
                <Printer size={13} /> Export PDF
              </button>
            </div>
          </div>

          {/* Destination Details & Quick Stat Chips */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-sunset text-[10px] uppercase font-mono tracking-wider">
                  {request.travelStyle} STYLE
                </span>
                <span className="text-white/40 text-xs font-mono">
                  {request.numberOfTravellers} Adventurer{request.numberOfTravellers > 1 ? 's' : ''}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[#00E5A0] text-xs font-mono font-semibold">
                  Adaptive Route Active
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {request.destination}
              </h1>

              <p className="text-white/60 text-xs sm:text-sm font-mono flex items-center gap-2">
                <span>{formatDate(request.departureDate)} — {formatDate(request.returnDate)}</span>
                <span>•</span>
                <span>{nights} Nights / {nights + 1} Days</span>
              </p>
            </div>

            {/* Quick Stat Pill Holograms */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 font-mono">
              <div className="p-3 px-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-center min-w-[120px]">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Target Cap</span>
                <span className="text-base font-bold text-[#FF6B35]">
                  {formatCurrency(request.totalBudget, request.currency)}
                </span>
              </div>
              <div className="p-3 px-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-center min-w-[120px]">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Est. Cost</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(itinerary.budgetBreakdown.total, request.currency)}
                </span>
              </div>
              <div className="p-3 px-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-center min-w-[120px]">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Total Stops</span>
                <span className="text-base font-bold text-[#00E5A0]">
                  {totalActivities} Planned
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY CYBER TAB NAVIGATION
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-[#080812]/90 border-b border-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto">
          <nav className="flex space-x-2 py-2.5">
            {[
              { id: 'overview', label: 'Overview', icon: Compass },
              { id: 'itinerary', label: 'Daily Timeline', icon: Calendar },
              { id: 'budget', label: 'Budget Engine', icon: DollarSign },
              { id: 'map', label: 'Route Map', icon: MapPin },
              { id: 'packing', label: 'Smart Packing', icon: PackageCheck },
              { id: 'weather', label: 'Weather & Plan B', icon: CloudSun },
              { id: 'nledit', label: 'AI Natural Edit', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF2E63] text-white shadow-[0_0_20px_rgba(255,107,53,0.35)]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />
                  {tab.label}
                  {tab.id === 'nledit' && (
                    <span className="w-2 h-2 rounded-full bg-[#00E5A0] animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB CONTENT PANELS
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Narrative & Blueprint Details */}
              <div className="lg:col-span-2 card p-6 sm:p-7 space-y-5 border-white/10 bg-[#0a0a14]">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <h3 className="section-title text-xl">Trip Narrative & Blueprint</h3>
                  <span className="badge badge-teal font-mono text-[10px]">VERIFIED ITINERARY</span>
                </div>

                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  {itinerary.overview}
                </p>

                <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-white/40 block">Origin</span>
                    <span className="font-bold text-white text-sm">{request.startingCity}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Destination</span>
                    <span className="font-bold text-[#FF6B35] text-sm">{request.destination}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Interests</span>
                    <span className="font-bold text-white text-sm capitalize">
                      {request.interests.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Transport</span>
                    <span className="font-bold text-white text-sm capitalize">
                      {request.preferredTransport.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Over Budget Notice */}
                {itinerary.budgetBreakdown.isOverBudget && (
                  <div className="p-4 bg-[#FF4757]/15 rounded-2xl border border-[#FF4757]/30 flex items-start gap-3 text-xs text-[#FF4757]">
                    <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">
                        Budget Cap Exceeded by {formatCurrency(itinerary.budgetBreakdown.overBudgetBy || 0, request.currency)}
                      </h4>
                      <p className="text-white/70 mt-1">
                        Your chosen stops and accommodations exceed your target budget. Explore the Budget Engine tab for instant cost-saving simulations.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Readiness Score Card */}
              <div className="card p-6 border-white/10 bg-[#0a0a14] flex flex-col justify-between">
                <ReadinessScore score={readinessScore} factors={readinessFactors} />
              </div>
            </div>

            {/* Travel Tips & Support Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 space-y-3.5 border-white/10 bg-[#0a0a14]">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Info size={18} className="text-[#00E5A0]" /> Essential Local Travel Tips
                </h3>
                <ul className="space-y-2.5">
                  {itinerary.topTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed">
                      <CheckCircle2 size={15} className="text-[#00E5A0] flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6 space-y-3.5 border-white/10 bg-[#0a0a14]">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldAlert size={18} className="text-[#FFB547]" /> Emergency & Tourist Assistance
                </h3>
                <div className="space-y-2">
                  {(itinerary.emergencyContacts || [
                    { name: 'National Emergency Service', number: '112 / 911', type: 'Emergency' },
                    { name: 'Local Tourist Assistance Hotline', number: '+1-800-TOURISM', type: 'Helpline' }
                  ]).map((contact, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{contact.name}</span>
                        <span className="text-[11px] text-white/40 font-mono capitalize">{contact.type}</span>
                      </div>
                      <span className="font-mono font-bold text-[#00E5A0] text-xs bg-[#00E5A0]/10 px-2.5 py-1 rounded-lg border border-[#00E5A0]/20">
                        {contact.number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather Snapshot */}
            <WeatherWidget destination={request.destination} startDate={request.departureDate} />
          </div>
        )}

        {/* ─── TAB 2: ITINERARY ───────────────────────────────────────── */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono">
              {itinerary.days.map((day) => {
                const isSelected = day.dayNumber === selectedDayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayNumber(day.dayNumber)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF6B35] text-white shadow-[0_0_20px_rgba(255,107,53,0.35)]'
                        : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/10'
                    }`}
                  >
                    <span>Day {day.dayNumber}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-white/50'}`}>
                      {day.activities.length} stops
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Timeline */}
            <DayTimeline
              day={selectedDay}
              onActivityEdit={(act) => setEditingActivity({ dayNumber: selectedDay.dayNumber, activity: act })}
              onActivityDelete={(actId) => removeActivity(selectedDay.dayNumber, actId)}
              onAddActivity={() => setEditingActivity({ dayNumber: selectedDay.dayNumber, activity: null })}
              onReorder={(acts) => reorderActivities(selectedDay.dayNumber, acts)}
            />
          </div>
        )}

        {/* ─── TAB 3: BUDGET ENGINE ────────────────────────────────────── */}
        {activeTab === 'budget' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 card p-6 sm:p-7 border-white/10 bg-[#0a0a14]">
                <h3 className="section-title text-xl mb-4">Expenditure Breakdown & Donut</h3>
                <BudgetChart breakdown={itinerary.budgetBreakdown} totalBudget={request.totalBudget} />
              </div>

              <div className="card p-6 border-white/10 bg-[#0a0a14] space-y-4">
                <h3 className="font-bold text-white text-base">Detailed Cost Ledger</h3>
                <div className="space-y-2.5 text-xs font-mono">
                  {[
                    { label: 'Long Distance Transit', value: itinerary.budgetBreakdown.transport },
                    { label: 'Lodging & Stays', value: itinerary.budgetBreakdown.accommodation },
                    { label: 'Dining & Meals', value: itinerary.budgetBreakdown.food },
                    { label: 'Activities & Tickets', value: itinerary.budgetBreakdown.activities },
                    { label: 'Local Transit / Commute', value: itinerary.budgetBreakdown.localTransport },
                    { label: 'Misc & Souvenirs', value: itinerary.budgetBreakdown.miscellaneous },
                    { label: 'Emergency Reserve (5%)', value: itinerary.budgetBreakdown.emergencyBuffer },
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 border-b border-white/[0.05]">
                      <span className="text-white/60">{row.label}</span>
                      <span className="font-bold text-white">
                        {formatCurrency(row.value, request.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 text-sm font-bold text-white border-t border-white/10">
                    <span>Grand Total</span>
                    <span className="text-[#00E5A0]">{formatCurrency(itinerary.budgetBreakdown.total, request.currency)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#00D4FF]">
                    <span>Per Person ({request.numberOfTravellers} pax)</span>
                    <span>{formatCurrency(itinerary.budgetBreakdown.perPerson, request.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Trade-Off Simulator */}
            <div className="card p-6 sm:p-7 border-white/10 bg-[#0a0a14]">
              <BudgetSimulator
                breakdown={itinerary.budgetBreakdown}
                totalBudget={request.totalBudget}
                currency={request.currency}
              />
            </div>
          </div>
        )}

        {/* ─── TAB 4: ROUTE MAP ────────────────────────────────────────── */}
        {activeTab === 'map' && (
          <div className="card p-6 space-y-4 border-white/10 bg-[#0a0a14]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="section-title text-xl">Interactive Geographic Route</h3>
                <p className="text-xs text-white/50 font-mono">
                  High-contrast dark tiles with coordinated activity stops across {request.destination}
                </p>
              </div>
            </div>
            <div className="h-[620px] w-full rounded-2xl overflow-hidden border border-white/10">
              <Suspense fallback={<div className="h-full w-full skeleton flex items-center justify-center">Loading Dark CartoDB Map...</div>}>
                <TripMap days={itinerary.days} />
              </Suspense>
            </div>
          </div>
        )}

        {/* ─── TAB 5: SMART PACKING ────────────────────────────────────── */}
        {activeTab === 'packing' && (
          <div className="card p-6 sm:p-7 border-white/10 bg-[#0a0a14]">
            <PackingChecklist
              packingList={itinerary.packingList}
              onToggleItem={(catIdx, itemId, checked) => updatePackingItem(catIdx, itemId, checked)}
              onAddItem={(catIdx, item) => addPackingItem(catIdx, item)}
            />
          </div>
        )}

        {/* ─── TAB 6: WEATHER & PLAN B ─────────────────────────────────── */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <WeatherWidget destination={request.destination} startDate={request.departureDate} />

            <div className="card p-6 sm:p-7 border border-[#00E5A0]/20 bg-gradient-to-r from-[#00E5A0]/08 to-[#00D4FF]/05">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#00E5A0]/20 border border-[#00E5A0]/30 text-[#00E5A0] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-base">Adaptive Plan B Weather Contingency Engine</h4>
                  <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                    When unpredictable rainfall or storms jeopardize open-air sights, Plan B identifies affected activities and suggests instant indoor museum, culinary, and historic alternatives without distorting daily transport lines.
                  </p>
                  <button
                    onClick={() => setActiveTab('nledit')}
                    className="btn-primary !px-4 !py-2 !text-xs mt-2"
                  >
                    Launch AI Natural Editor for Weather Swaps
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 7: AI NATURAL EDIT ──────────────────────────────────── */}
        {activeTab === 'nledit' && (
          <NLEditPanel
            tripId={currentTrip.id}
            currentItinerary={itinerary}
            tripRequest={request}
            onApplyChanges={handleApplyNLChanges}
          />
        )}
      </div>

      {/* Activity Edit Modal */}
      {editingActivity && (
        <ActivityEditModal
          isOpen={true}
          activity={editingActivity.activity}
          onClose={() => setEditingActivity(null)}
          onSave={handleSaveModalActivity}
        />
      )}
    </div>
    </>
  );
}
