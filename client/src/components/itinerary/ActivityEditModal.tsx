import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../ui/Modal';
import { Activity, ActivityCategory, CATEGORY_ICONS } from '../../types';
import { getCurrencySymbol } from '../../utils/helpers';

interface ActivityEditModalProps {
  activity: Activity | null;
  isOpen: boolean;
  currency?: string;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}

const CATEGORIES: ActivityCategory[] = [
  'sightseeing', 'adventure', 'food', 'culture',
  'shopping', 'nature', 'nightlife', 'relaxation', 'transport',
];

const EMPTY_ACTIVITY: Activity = {
  id: '',
  name: '',
  description: '',
  category: 'sightseeing',
  startTime: '09:00',
  durationMinutes: 60,
  estimatedCost: 0,
  location: { name: '' },
  imageKeyword: '',
  reasonForRecommendation: '',
  isOptional: false,
  notes: '',
};

const ActivityEditModal: React.FC<ActivityEditModalProps> = ({
  activity,
  isOpen,
  currency = 'USD',
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<Activity>(EMPTY_ACTIVITY);
  const [errors, setErrors] = useState<Partial<Record<keyof Activity, string>>>({});

  useEffect(() => {
    if (activity) {
      setForm({ ...activity });
    } else {
      setForm({ ...EMPTY_ACTIVITY, id: uuidv4() });
    }
    setErrors({});
  }, [activity, isOpen]);

  const set = <K extends keyof Activity>(key: K, value: Activity[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Activity, string>> = {};
    if (!form.name.trim()) e.name = 'Activity title is required';
    if (!form.location.name.trim()) {
      e.location = 'Location name is required' as any;
    }
    if (form.durationMinutes <= 0) e.durationMinutes = 'Duration must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, id: form.id || uuidv4() });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Scheduled Activity' : 'Add New Itinerary Stop'}
      size="lg"
    >
      <div className="px-6 py-5 flex flex-col gap-5 text-white">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="label">Activity Title *</label>
          <input
            type="text"
            className={`input-field ${errors.name ? '!border-[#FF4757]' : ''}`}
            placeholder="e.g., Sunset Tour at Shibuya Sky"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          {errors.name && <p className="text-xs text-[#FF4757] font-mono">{errors.name}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="label">Activity Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => set('category', cat)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
                  form.category === cat
                    ? 'border-[#FF6B35] bg-[#FF6B35]/20 text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/60 hover:text-white'
                }`}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                <span className="capitalize leading-tight text-center">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label">Start Time</label>
            <input
              type="time"
              className="input-field"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              className={`input-field font-mono ${errors.durationMinutes ? '!border-[#FF4757]' : ''}`}
              min={5}
              max={1440}
              value={form.durationMinutes}
              onChange={(e) => set('durationMinutes', Number(e.target.value))}
            />
            {errors.durationMinutes && (
              <p className="text-xs text-[#FF4757] font-mono">{errors.durationMinutes}</p>
            )}
          </div>
        </div>

        {/* Location + Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label">Location Name *</label>
            <input
              type="text"
              className={`input-field ${errors.location ? '!border-[#FF4757]' : ''}`}
              placeholder="e.g., Shibuya Crossing, Tokyo"
              value={form.location.name}
              onChange={(e) => set('location', { ...form.location, name: e.target.value })}
            />
            {errors.location && (
              <p className="text-xs text-[#FF4757] font-mono">{String(errors.location)}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="label">Estimated Cost ({getCurrencySymbol(currency)})</label>
            <input
              type="number"
              className="input-field font-mono text-[#00E5A0]"
              min={0}
              value={form.estimatedCost}
              onChange={(e) => set('estimatedCost', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="label">Activity Description</label>
          <textarea
            className="input-field resize-none text-xs"
            rows={3}
            placeholder="Describe what the traveler will experience..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="label">Logistics & Tips</label>
          <textarea
            className="input-field resize-none text-xs"
            rows={2}
            placeholder="Advance ticketing, footwear, booking links..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {/* Optional toggle */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <input
            id="is-optional"
            type="checkbox"
            className="w-4 h-4 rounded accent-[#00E5A0] cursor-pointer"
            checked={form.isOptional}
            onChange={(e) => set('isOptional', e.target.checked)}
          />
          <label htmlFor="is-optional" className="text-xs font-semibold text-white/80 cursor-pointer select-none">
            Mark as optional bonus stop (flexible pacing)
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button type="button" onClick={onClose} className="btn-secondary !px-5 !py-2.5 !text-xs cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-primary !px-6 !py-2.5 !text-xs cursor-pointer">
            {activity ? 'Save Modifications' : 'Add Activity'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityEditModal;
