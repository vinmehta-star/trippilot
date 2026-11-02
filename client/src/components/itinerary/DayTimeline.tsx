import React from 'react';
import { Plus, BedDouble, DollarSign, Clock, Sparkles } from 'lucide-react';
import { Day, Activity } from '../../types';
import ActivityCard from './ActivityCard';
import { formatCurrency } from '../../utils/helpers';

interface DayTimelineProps {
  day: Day;
  currency?: string;
  onActivityEdit: (activity: Activity) => void;
  onActivityDelete: (id: string) => void;
  onAddActivity: () => void;
  onReorder: (activities: Activity[]) => void;
}

const DayTimeline: React.FC<DayTimelineProps> = ({
  day,
  currency = 'USD',
  onActivityEdit,
  onActivityDelete,
  onAddActivity,
  onReorder,
}) => {
  const dayTotal = day.activities.reduce((sum, a) => sum + a.estimatedCost, 0);

  const formattedDate = (() => {
    try {
      return new Date(day.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return day.date;
    }
  })();

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const activities = [...day.activities];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [activities[index], activities[swapIndex]] = [activities[swapIndex], activities[index]];
    onReorder(activities);
  };

  return (
    <div className="card overflow-hidden border-white/10 bg-[#080812]">
      {/* Day header banner with sunset gradient accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-transparent border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF2E63] flex items-center justify-center font-mono font-black text-white text-lg shadow-[0_0_20px_rgba(255,107,53,0.35)]">
            D{day.dayNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-lg">Day {day.dayNumber}</h3>
              {day.theme && (
                <span className="badge badge-sunset text-[10px] uppercase font-mono">
                  {day.theme}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 font-mono mt-0.5">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-white/40 mr-1.5">Day Est:</span>
            <span className="font-bold text-[#00E5A0]">{formatCurrency(dayTotal, currency)}</span>
          </div>

          <button
            onClick={onAddActivity}
            className="btn-primary !px-3.5 !py-1.5 !text-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Stop</span>
          </button>
        </div>
      </div>

      {/* Activity Cards Timeline */}
      <div className="p-5 sm:p-6 space-y-4">
        {day.activities.length === 0 ? (
          <div className="text-center py-12 space-y-3 border-2 border-dashed border-white/10 rounded-2xl">
            <p className="text-3xl">☕</p>
            <p className="font-bold text-white text-sm">No activities scheduled yet</p>
            <p className="text-xs text-white/40 max-w-xs mx-auto">
              Add a custom sight, cafe, or attraction to populate this day.
            </p>
            <button
              onClick={onAddActivity}
              className="btn-secondary !px-4 !py-2 !text-xs mt-2"
            >
              <Plus size={14} /> Add First Activity
            </button>
          </div>
        ) : (
          day.activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              currency={currency}
              isFirst={index === 0}
              isLast={index === day.activities.length - 1}
              onEdit={() => onActivityEdit(activity)}
              onDelete={() => onActivityDelete(activity.id)}
              onMoveUp={index > 0 ? () => moveActivity(index, 'up') : undefined}
              onMoveDown={index < day.activities.length - 1 ? () => moveActivity(index, 'down') : undefined}
            />
          ))
        )}

        {/* Accommodation Footer Card */}
        {day.accommodation && (
          <div className="p-4 rounded-2xl bg-[#845EC2]/10 border border-[#845EC2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#845EC2]/20 flex items-center justify-center text-[#c9a8ff]">
                <BedDouble size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#c9a8ff] block">
                  Nightly Lodging Tier
                </span>
                <p className="font-bold text-white text-sm">{day.accommodation.name}</p>
                <p className="text-white/40 text-[11px] capitalize">{day.accommodation.type} • {day.accommodation.location?.name}</p>
              </div>
            </div>

            <div className="font-mono text-right">
              <span className="text-[10px] text-white/40 block">Est. Nightly Rate</span>
              <span className="text-sm font-bold text-white">{formatCurrency(day.accommodation.pricePerNight, currency)} / night</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayTimeline;
