import React, { useState } from 'react';
import { Sparkles, Send, RotateCcw, Check, X, Loader2, Lightbulb, Terminal, Zap } from 'lucide-react';
import { Itinerary, TripRequest, NLEditResult, Activity } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
  tripId: string;
  currentItinerary: Itinerary;
  tripRequest: TripRequest;
  onApplyChanges: (updatedItinerary: Itinerary) => void;
}

const EXAMPLE_PROMPTS = [
  'Make day 2 more budget-friendly & focus on free walks',
  'Replace outdoor sights on day 3 with indoor museums (rain contingency)',
  'Add an evening street food market on the first night',
  'Make the last day more relaxing with a spa or cafe lounge',
  'Swap the museum on day 2 for something adventurous',
];

export default function NLEditPanel({ tripId, currentItinerary, tripRequest, onApplyChanges }: Props) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NLEditResult | null>(null);
  const [acceptedChanges, setAcceptedChanges] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    setAcceptedChanges(new Set());

    try {
      const res = await api.nlEdit(tripId, prompt, currentItinerary, tripRequest);
      setResult(res);
      setAcceptedChanges(new Set(res.changes.map((_, i) => i)));
    } catch (e: any) {
      setError(e.message || 'Failed to process your request');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChange = (index: number) => {
    setAcceptedChanges(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const applyChanges = () => {
    if (!result) return;

    let updatedItinerary = { ...currentItinerary };
    const accepted = result.changes.filter((_, i) => acceptedChanges.has(i));

    for (const change of accepted) {
      const dayIndex = updatedItinerary.days.findIndex(d => d.dayNumber === change.dayNumber);
      if (dayIndex === -1) continue;

      const day = { ...updatedItinerary.days[dayIndex] };

      if (change.type === 'replace' && change.activityId && change.newActivity) {
        day.activities = day.activities.map(a =>
          a.id === change.activityId ? change.newActivity as Activity : a
        );
      } else if (change.type === 'add' && change.newActivity) {
        day.activities = [...day.activities, change.newActivity as Activity];
      } else if (change.type === 'remove' && change.activityId) {
        day.activities = day.activities.filter(a => a.id !== change.activityId);
      } else if (change.type === 'modify' && change.activityId && change.newActivity) {
        day.activities = day.activities.map(a =>
          a.id === change.activityId ? { ...a, ...change.newActivity } : a
        );
      }

      updatedItinerary = {
        ...updatedItinerary,
        days: updatedItinerary.days.map((d, i) => i === dayIndex ? day : d),
      };
    }

    onApplyChanges(updatedItinerary);
    toast.success(`Applied ${accepted.length} modification${accepted.length !== 1 ? 's' : ''} to your itinerary!`);
    setResult(null);
    setPrompt('');
  };

  return (
    <div className="card p-6 sm:p-7 border border-white/10 bg-[#0a0a14] shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#845EC2] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-black text-white text-lg flex items-center gap-2">
              Conversational Itinerary Refinement
            </h3>
            <p className="text-xs text-white/50">
              Command Gemini in natural language to replace, prune, or enrich stops without disrupting day flow.
            </p>
          </div>
        </div>

        {currentItinerary.isDemo ? (
          <span className="badge badge-amber text-xs font-mono">Demo AI</span>
        ) : (
          <span className="badge badge-teal text-xs font-mono">Gemini 1.5 Live</span>
        )}
      </div>

      {/* Input Box */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
            placeholder="e.g. Make day 2 cheaper and replace outdoor sights with world-class indoor spots..."
            rows={3}
            className="input-field resize-none !pr-14 text-sm font-medium"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-[#FF6B35] text-white hover:bg-[#FF2E63] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,107,53,0.3)] cursor-pointer"
            title="Execute (Ctrl+Enter)"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="flex items-center gap-1 text-[11px] font-mono text-white/40">
            <Lightbulb size={12} className="text-[#FFB547]" /> Try:
          </span>
          {EXAMPLE_PROMPTS.map(ex => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-[11px] px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#FF6B35]/40 text-white/70 hover:text-white transition-all cursor-pointer font-sans"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
          <Loader2 size={20} className="animate-spin text-[#FF6B35]" />
          <div>
            <p className="font-bold text-white text-sm">Gemini AI is analyzing schedule and budget impacts...</p>
            <p className="text-xs text-white/40 font-mono">Synthesizing verified replacements</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#FF4757]/15 border border-[#FF4757]/30 rounded-2xl text-xs text-[#FF4757] flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Proposed Diff Output */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Interpretation banner */}
          <div className="p-4 bg-white/[0.03] border border-[#00D4FF]/30 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D4FF] block">
              Cognitive Interpretation
            </span>
            <p className="text-sm font-semibold text-white">{result.interpretation}</p>
          </div>

          {/* Change Items Checklist */}
          {result.changes.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-white/50 block">
                Proposed Modifications ({result.changes.length}):
              </span>

              {result.changes.map((change, i) => {
                const isAccepted = acceptedChanges.has(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleChange(i)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isAccepted
                        ? 'bg-white/[0.06] border-[#00E5A0]/40'
                        : 'bg-white/[0.01] border-white/10 opacity-40'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 text-xs font-bold ${
                        isAccepted ? 'bg-[#00E5A0] text-[#050507]' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {isAccepted ? <Check size={12} /> : <X size={12} />}
                    </div>

                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            change.type === 'remove'
                              ? 'bg-[#FF4757]/20 text-[#FF4757]'
                              : change.type === 'add'
                              ? 'bg-[#00E5A0]/20 text-[#00E5A0]'
                              : 'bg-[#00D4FF]/20 text-[#00D4FF]'
                          }`}
                        >
                          {change.type}
                        </span>
                        <span className="text-white/40 font-mono">Day {change.dayNumber}</span>
                      </div>
                      <p className="font-semibold text-white">{change.description}</p>
                      {change.newActivity && (
                        <p className="text-white/60 font-mono text-[11px]">➔ New: {change.newActivity.name}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Budget Impact Badge */}
              {result.budgetImpact !== 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">Estimated Budget Impact:</span>
                  <span className={`font-bold ${result.budgetImpact > 0 ? 'text-[#FFB547]' : 'text-[#00E5A0]'}`}>
                    {result.budgetImpact > 0 ? `+${result.budgetImpact}` : result.budgetImpact} {currentItinerary.budgetBreakdown.currency}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={applyChanges}
                  disabled={acceptedChanges.size === 0}
                  className="btn-primary !px-5 !py-2.5 !text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Check size={14} />
                  <span>Apply {acceptedChanges.size} Selected Changes</span>
                </button>
                <button
                  onClick={() => { setResult(null); setPrompt(''); }}
                  className="btn-secondary !px-4 !py-2.5 !text-xs"
                >
                  <RotateCcw size={14} />
                  <span>Discard</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/50 text-center py-4 font-mono">
              No specific modifications suggested. Try rephrasing with specific day numbers.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
