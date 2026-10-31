import React from 'react';
import { ReadinessFactor } from '../../types';
import { Info, ShieldCheck, Zap } from 'lucide-react';

interface ReadinessScoreProps {
  score: number; // 0-100
  factors: ReadinessFactor[];
}

const ReadinessScore: React.FC<ReadinessScoreProps> = ({ score, factors }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const scoreColor =
    score >= 75 ? '#00E5A0' : score >= 50 ? '#FFB547' : '#FF4757';

  const scoreLabel =
    score >= 80
      ? 'Mission Ready 🚀'
      : score >= 60
        ? 'Solid Groundwork 👍'
        : 'Incomplete Buffers ⚠️';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00E5A0]" />
            Trip Readiness Gauge
          </h3>
          <p className="text-xs text-white/50">Multi-factor logistical feasibility score</p>
        </div>
        <span
          className="text-xs font-mono font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
        >
          {scoreLabel}
        </span>
      </div>

      {/* Circular Glowing Gauge */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
            {/* Background Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Glowing Active Arc */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              style={{
                transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: `drop-shadow(0 0 8px ${scoreColor}80)`,
              }}
            />
          </svg>

          {/* Center Score Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black font-mono tracking-tight" style={{ color: scoreColor }}>
              {Math.round(score)}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">Out of 100</span>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="space-y-3 pt-2">
        {factors.map((factor) => {
          const pct = factor.maxScore > 0 ? (factor.score / factor.maxScore) * 100 : 0;
          return (
            <div key={factor.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/80">{factor.label}</span>
                <span className="font-mono font-bold text-white text-[11px]">
                  {factor.score} <span className="text-white/40 font-normal">/ {factor.maxScore} pts</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 80 ? '#00E5A0' : pct >= 50 ? '#FFB547' : '#FF4757',
                  }}
                />
              </div>

              <p className="text-[10px] text-white/40">{factor.description}</p>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-white/40 font-mono">
        <Info size={13} className="flex-shrink-0 mt-0.5 text-white/40" />
        <span>
          Planning heuristic score based on itinerary completeness, budget margins, and transit verification. Not an official agency guarantee.
        </span>
      </div>
    </div>
  );
};

export default ReadinessScore;
