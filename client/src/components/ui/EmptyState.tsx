import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-white">
      {/* Icon circle */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B35]/20 to-[#845EC2]/20 border border-[#FF6B35]/30 flex items-center justify-center mb-5 text-[#FF6B35] shadow-[0_0_30px_rgba(255,107,53,0.2)]">
        <div className="w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-white/50 max-w-sm leading-relaxed text-xs">{description}</p>

      {/* Optional action */}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary mt-6 !px-6 !py-3 !text-xs cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
