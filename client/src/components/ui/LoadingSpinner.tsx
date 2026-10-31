import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading TripPilot Engine...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050507]/90 backdrop-blur-xl text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Double Glowing Ring */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF6B35] border-r-[#FF2E63] animate-spin shadow-[0_0_20px_rgba(255,107,53,0.4)]" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#845EC2] animate-spin [animation-duration:1.5s]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass size={24} className="text-[#FF6B35] animate-pulse" />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-bold text-base tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-[#FF6B35]" />
              <span>{message}</span>
            </p>
            <div className="flex gap-1.5 pt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
