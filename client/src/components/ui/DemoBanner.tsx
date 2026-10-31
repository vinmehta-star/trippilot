import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoBannerProps {
  isDemo: boolean;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ isDemo }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <div className="relative z-40 w-full bg-gradient-to-r from-[#FF6B35]/20 via-[#FFB547]/20 to-[#845EC2]/20 border-b border-[#FF6B35]/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 justify-center text-xs font-mono font-medium text-white/90">
          <Sparkles size={14} className="text-[#FFB547] flex-shrink-0" />
          <span>
            <strong className="text-[#FFB547]">Pre-recorded / Demo Itinerary</strong> — This trip blueprint was saved in simulated mode.
          </span>
          <Link
            to="/plan"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FF6B35]/20 hover:bg-[#FF6B35]/30 text-[#FF6B35] hover:text-white border border-[#FF6B35]/30 transition-all font-sans font-semibold text-xs"
          >
            <span>Plan New Live AI Trip</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
