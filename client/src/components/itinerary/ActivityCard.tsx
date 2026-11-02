import React, { useState, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  DollarSign,
  Sparkles,
  Info,
  Footprints
} from 'lucide-react';
import { Activity, CATEGORY_ICONS } from '../../types';
import { getActivityImage } from '../../utils/activityImages';
import { getCurrencySymbol } from '../../utils/helpers';

interface ActivityCardProps {
  activity: Activity;
  currency?: string;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// Neon palette by category
const CATEGORY_THEMES: Record<string, { color: string; border: string; bg: string }> = {
  sightseeing: { color: '#00D4FF', border: 'border-[#00D4FF]/30', bg: 'bg-[#00D4FF]/10' },
  adventure: { color: '#FF6B35', border: 'border-[#FF6B35]/30', bg: 'bg-[#FF6B35]/10' },
  food: { color: '#FFB547', border: 'border-[#FFB547]/30', bg: 'bg-[#FFB547]/10' },
  culture: { color: '#845EC2', border: 'border-[#845EC2]/30', bg: 'bg-[#845EC2]/10' },
  shopping: { color: '#FF2E63', border: 'border-[#FF2E63]/30', bg: 'bg-[#FF2E63]/10' },
  nature: { color: '#00E5A0', border: 'border-[#00E5A0]/30', bg: 'bg-[#00E5A0]/10' },
  nightlife: { color: '#D63384', border: 'border-[#D63384]/30', bg: 'bg-[#D63384]/10' },
  relaxation: { color: '#B8FF57', border: 'border-[#B8FF57]/30', bg: 'bg-[#B8FF57]/10' },
  transport: { color: '#e0e0ec', border: 'border-white/20', bg: 'bg-white/10' },
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currency = 'USD',
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const theme = CATEGORY_THEMES[activity.category] || CATEGORY_THEMES.sightseeing;
  const categoryIcon = CATEGORY_ICONS[activity.category] || '📍';
  const resolvedImgUrl = useMemo(() => getActivityImage(activity), [activity]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="group rounded-2xl bg-[#0b0b14] border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail on left with real photo and smooth fallback */}
        <div className="relative sm:w-44 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-black/50">
          <img
            src={imageError ? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80' : resolvedImgUrl}
            alt={activity.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 sm:from-transparent to-transparent" />

          {/* Category Pill on Image */}
          <span
            className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${theme.border} ${theme.bg}`}
            style={{ color: theme.color }}
          >
            {categoryIcon} {activity.category}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          {/* Top row: Title and Action Buttons */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-white/50 flex items-center gap-1">
                  <Clock size={12} className="text-[#FF6B35]" />
                  {activity.startTime} ({formatDuration(activity.durationMinutes)})
                </span>
                {activity.isOptional && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-white/40">
                    OPTIONAL
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-[#FF6B35] transition-colors leading-snug">
                {activity.name}
              </h4>
            </div>

            {/* Quick Actions (Reorder, Edit, Delete) */}
            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {!isFirst && onMoveUp && (
                <button
                  onClick={onMoveUp}
                  className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white"
                  title="Move Up"
                >
                  <ChevronUp size={14} />
                </button>
              )}
              {!isLast && onMoveDown && (
                <button
                  onClick={onMoveDown}
                  className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white"
                  title="Move Down"
                >
                  <ChevronDown size={14} />
                </button>
              )}
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white"
                title="Edit Activity"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg bg-[#FF4757]/10 hover:bg-[#FF4757]/20 text-[#FF4757]"
                title="Delete Activity"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Location and Cost row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-white/[0.06] pt-2">
            <span className="text-white/60 flex items-center gap-1 truncate max-w-[240px]">
              <MapPin size={12} className="text-white/40 flex-shrink-0" />
              {activity.location.name}
            </span>

            <span className="font-mono font-bold text-sm">
              {activity.estimatedCost === 0 ? (
                <span className="text-[#00E5A0]">FREE</span>
              ) : (
                <span className="text-white">~{getCurrencySymbol(currency)}{activity.estimatedCost.toLocaleString()} <span className="text-[10px] text-white/40 font-normal">est.</span></span>
              )}
            </span>
          </div>

          {/* Expandable Explanation & Notes */}
          {expanded && (
            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <p className="text-white/70 leading-relaxed">{activity.description}</p>
              {activity.reasonForRecommendation && (
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2 text-[#00E5A0]">
                  <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-white/70 italic">
                    <strong className="text-[#00E5A0] not-italic">Why recommended: </strong>
                    {activity.reasonForRecommendation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-mono text-white/40 hover:text-[#FF6B35] flex items-center gap-1 self-start transition-colors cursor-pointer"
          >
            {expanded ? '▲ Hide details' : '▼ Read details & rationale'}
          </button>
        </div>
      </div>

      {/* Transit Connector between items */}
      {activity.travelTimeToNextMinutes && activity.travelTimeToNextMinutes > 0 && (
        <div className="px-5 py-1.5 bg-white/[0.02] border-t border-white/[0.05] flex items-center gap-2 text-[11px] font-mono text-white/40">
          <Footprints size={12} className="text-[#00D4FF]" />
          <span>Approx. {activity.travelTimeToNextMinutes} min transit to next stop</span>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
