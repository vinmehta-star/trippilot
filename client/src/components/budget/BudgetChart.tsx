import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import { BudgetBreakdown } from '../../types';

interface BudgetChartProps {
  breakdown: BudgetBreakdown;
  totalBudget: number;
}

const CATEGORIES = [
  { key: 'transport', label: 'Long Distance Transit', color: '#FF6B35' },
  { key: 'accommodation', label: 'Lodging & Stays', color: '#845EC2' },
  { key: 'food', label: 'Dining & Food', color: '#FFB547' },
  { key: 'activities', label: 'Activities & Tours', color: '#00D4FF' },
  { key: 'localTransport', label: 'Local Transit / Taxi', color: '#00E5A0' },
  { key: 'miscellaneous', label: 'Souvenirs & Shopping', color: '#FF2E63' },
  { key: 'emergencyBuffer', label: 'Emergency Reserve (5%)', color: '#B8FF57' },
] as const;

const CustomTooltip = ({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: any[];
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  const pct = p.pct;
  const color = p.color;

  return (
    <div className="p-3.5 rounded-xl bg-[#0e0e1a]/95 border border-white/15 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-xs space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-white text-sm">{name}</span>
      </div>
      <p className="font-mono text-base font-black text-white">
        {currency} {Number(value).toLocaleString()}
      </p>
      <p className="text-white/50 font-mono text-[11px]">{pct}% of total expenditure</p>
    </div>
  );
};

const BudgetChart: React.FC<BudgetChartProps> = ({ breakdown, totalBudget }) => {
  const currency = breakdown.currency;
  const spent = breakdown.total;
  const utilization = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const isOver = breakdown.isOverBudget;

  const data = CATEGORIES.map(({ key, label, color }) => ({
    name: label,
    value: breakdown[key as keyof BudgetBreakdown] as number,
    color,
    pct: spent > 0 ? Math.round(((breakdown[key as keyof BudgetBreakdown] as number) / spent) * 100) : 0,
  })).filter((d) => d.value > 0);

  const utilizationColor =
    utilization < 85 ? '#00E5A0' : utilization <= 100 ? '#FFB547' : '#FF4757';

  return (
    <div className="flex flex-col gap-6">
      {/* Over-budget or Safe notice */}
      {isOver ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FF4757]/15 border border-[#FF4757]/30 text-[#FF4757]">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Budget Cap Exceeded by {currency} {(breakdown.overBudgetBy ?? 0).toLocaleString()}</p>
            <p className="text-white/60 mt-0.5">Use the Trade-Off Simulator below to apply cost-cutting adjustments.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/25 text-[#00E5A0] text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            <span className="font-bold">Budget Within Safe Range</span>
          </div>
          <span className="font-mono font-bold">
            {currency} {(totalBudget - spent).toLocaleString()} Remaining Buffer
          </span>
        </div>
      )}

      {/* Donut Chart Container */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={290}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={74}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              stroke="#0a0a14"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">EST. TOTAL</span>
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            ${spent.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono font-bold" style={{ color: utilizationColor }}>
            {Math.round(utilization)}% of Cap
          </span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/60 font-medium">Budget Saturation</span>
          <span className="font-mono font-bold" style={{ color: utilizationColor }}>
            {Math.round(utilization)}% ({currency} {spent.toLocaleString()} / {totalBudget.toLocaleString()})
          </span>
        </div>
        <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, utilization)}%`,
              backgroundColor: utilizationColor,
              boxShadow: `0 0 12px ${utilizationColor}80`,
            }}
          />
        </div>
      </div>

      {/* Category Grid Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-white/70 truncate">{d.name}</span>
            </div>
            <span className="font-mono font-bold text-white text-[11px] ml-2">
              ${d.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetChart;
