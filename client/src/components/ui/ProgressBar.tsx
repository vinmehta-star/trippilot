import React from 'react';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  color?: string;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color = '#00E5A0',
  showLabel = true,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
          {label && (
            <span className="font-semibold text-white/80">{label}</span>
          )}
          {showLabel && (
            <span className="font-bold" style={{ color }}>
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden p-0.5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: color,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
