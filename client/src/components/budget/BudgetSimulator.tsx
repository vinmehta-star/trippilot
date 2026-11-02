import React, { useState } from 'react';
import {
  BedDouble,
  Ticket,
  UtensilsCrossed,
  Users,
  CalendarPlus,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { BudgetBreakdown } from '../../types';
import { formatCurrency, getCurrencySymbol } from '../../utils/helpers';

interface BudgetSimulatorProps {
  breakdown: BudgetBreakdown;
  totalBudget: number;
  currency: string;
  onScenarioSelect?: (delta: number) => void;
}

interface Scenario {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  savesOrCosts: 'SAVES' | 'COSTS';
  computeDelta: (bd: BudgetBreakdown) => number;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'accommodation',
    label: 'Optimize Lodging Tier',
    description: 'Switch to boutique guesthouses or private apartments (-20% lodging).',
    icon: <BedDouble size={18} />,
    savesOrCosts: 'SAVES',
    computeDelta: (bd) => -(bd.accommodation * 0.2),
  },
  {
    id: 'activities',
    label: 'Prioritize Free Cultural Sights',
    description: 'Substitute high-cost commercial passes with parks, open plazas & heritage walks (-30% activities).',
    icon: <Ticket size={18} />,
    savesOrCosts: 'SAVES',
    computeDelta: (bd) => -(bd.activities * 0.3),
  },
  {
    id: 'food',
    label: 'Upgrade Culinary Focus',
    description: 'Add authentic chef tastings and Michelin bib-gourmand dinners (+25% food).',
    icon: <UtensilsCrossed size={18} />,
    savesOrCosts: 'COSTS',
    computeDelta: (bd) => bd.food * 0.25,
  },
  {
    id: 'traveller',
    label: 'Add 1 Additional Traveler',
    description: 'Share twin room lodging costs while adding individual flights & food (+15% total).',
    icon: <Users size={18} />,
    savesOrCosts: 'COSTS',
    computeDelta: (bd) => bd.total * 0.15,
  },
  {
    id: 'extend',
    label: 'Extend Itinerary by +1 Day',
    description: 'Add an extra day of lodging, dining, and local excursions (+14% total).',
    icon: <CalendarPlus size={18} />,
    savesOrCosts: 'COSTS',
    computeDelta: (bd) => bd.total * 0.14,
  },
];

const BudgetSimulator: React.FC<BudgetSimulatorProps> = ({
  breakdown,
  totalBudget,
  currency,
  onScenarioSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeScenario = SCENARIOS.find((s) => s.id === selectedId);
  const delta = activeScenario ? Math.round(activeScenario.computeDelta(breakdown)) : 0;
  const simulatedTotal = breakdown.total + delta;
  const isSimulatedOver = simulatedTotal > totalBudget;

  const handleSelect = (scenario: Scenario) => {
    const nextId = selectedId === scenario.id ? null : scenario.id;
    setSelectedId(nextId);
    if (onScenarioSelect) {
      const d = nextId ? Math.round(scenario.computeDelta(breakdown)) : 0;
      onScenarioSelect(d);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Zap size={20} className="text-[#FF6B35]" />
            Budget Trade-Off Simulator
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Compare tactical what-if scenarios to calibrate cost versus experience before booking.
          </p>
        </div>

        {activeScenario && (
          <span className="badge badge-sunset text-xs uppercase font-mono">
            Scenario Active
          </span>
        )}
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {SCENARIOS.map((scenario) => {
          const isSelected = selectedId === scenario.id;
          const sDelta = Math.round(scenario.computeDelta(breakdown));
          const isSave = scenario.savesOrCosts === 'SAVES';

          return (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white/[0.08] border-[#FF6B35] shadow-[0_0_25px_rgba(255,107,53,0.25)]'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSave
                      ? 'bg-[#00E5A0]/15 text-[#00E5A0]'
                      : 'bg-[#FF6B35]/15 text-[#FF6B35]'
                  }`}
                >
                  {scenario.icon}
                </div>

                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSave
                      ? 'bg-[#00E5A0]/15 text-[#00E5A0] border border-[#00E5A0]/30'
                      : 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30'
                  }`}
                >
                  {isSave ? `-${getCurrencySymbol(currency)}${Math.abs(sDelta).toLocaleString()}` : `+${getCurrencySymbol(currency)}${sDelta.toLocaleString()}`}
                </span>
              </div>

              <h4 className="font-bold text-white text-sm">{scenario.label}</h4>
              <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Simulation Result Box */}
      {activeScenario ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Simulation Outcome</span>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                {activeScenario.label}
              </h4>
            </div>

            <div className="flex items-center gap-6 font-mono">
              <div>
                <span className="text-[10px] text-white/40 block">Current Baseline</span>
                <span className="text-sm font-bold text-white">{formatCurrency(breakdown.total, currency)}</span>
              </div>
              <span className="text-white/20 text-xl">➔</span>
              <div>
                <span className="text-[10px] text-white/40 block">Simulated Total</span>
                <span className={`text-xl font-black ${isSimulatedOver ? 'text-[#FF4757]' : 'text-[#00E5A0]'}`}>
                  {formatCurrency(simulatedTotal, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 border-t border-white/[0.06] pt-3">
            <span>
              Net Impact:{' '}
              <strong className={delta < 0 ? 'text-[#00E5A0]' : 'text-[#FF6B35]'}>
                {delta < 0 ? `Saves ${formatCurrency(Math.abs(delta), currency)}` : `Adds ${formatCurrency(delta, currency)}`}
              </strong>
            </span>
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs text-white/40 hover:text-white underline font-mono cursor-pointer"
            >
              Reset Simulation
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs font-mono text-white/40 text-center py-2">
          Click any scenario above to dynamically simulate cost fluctuations.
        </p>
      )}
    </div>
  );
};

export default BudgetSimulator;
