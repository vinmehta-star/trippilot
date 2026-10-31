import React from 'react';

const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* ─── Layer 1: High-Resolution Cinematic Alpine Sunset Horizon ─── */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 scale-[1.02]"
        style={{
          backgroundImage: "url('/backgrounds/hero_wallpaper.jpg')",
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.75) contrast(1.15) saturate(1.1)',
        }}
      />

      {/* ─── Layer 2: Deep Midnight Obsidian & Twilight Purple Vignette ─── */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 15%, rgba(255, 107, 53, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 85% 35%, rgba(132, 94, 194, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 15% 70%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, 
              rgba(7, 8, 16, 0.65) 0%, 
              rgba(10, 10, 22, 0.78) 35%, 
              rgba(8, 8, 18, 0.88) 70%, 
              rgba(5, 5, 10, 0.97) 100%
            )
          `,
        }}
      />

      {/* ─── Layer 3: Dynamic Cyber-Flight Trajectory Arcs & Constellations ─── */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.18]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flightGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FF2E63" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#845EC2" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="flightGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#00E5A0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#845EC2" stopOpacity="0.05" />
          </linearGradient>
          <pattern id="travelGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            <circle cx="80" cy="0" r="1.5" fill="rgba(255, 107, 53, 0.25)" />
          </pattern>
        </defs>

        {/* Global coordinate grid */}
        <rect width="100%" height="100%" fill="url(#travelGrid)" />

        {/* Curving supersonic travel trajectories */}
        <path
          d="M -100,200 Q 400,50 900,350 T 1920,180"
          fill="none"
          stroke="url(#flightGrad1)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
        <path
          d="M 200,850 Q 800,450 1400,600 T 2100,400"
          fill="none"
          stroke="url(#flightGrad2)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />

        {/* Luminous Waypoint Beacons */}
        <g>
          <circle cx="400" cy="125" r="3" fill="#FF6B35" />
          <circle cx="400" cy="125" r="7" fill="none" stroke="#FF6B35" strokeOpacity="0.4" className="animate-ping" />

          <circle cx="900" cy="350" r="3.5" fill="#00E5A0" />
          <circle cx="900" cy="350" r="9" fill="none" stroke="#00E5A0" strokeOpacity="0.3" />

          <circle cx="1400" cy="600" r="3" fill="#00D4FF" />
          <circle cx="1400" cy="600" r="8" fill="none" stroke="#00D4FF" strokeOpacity="0.4" />
        </g>
      </svg>

      {/* ─── Layer 4: Floating Ambient Aurora Glow Orbs ─── */}
      <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-[#FF6B35]/12 rounded-full blur-[140px] animate-float pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-[580px] h-[580px] bg-[#845EC2]/18 rounded-full blur-[150px] animate-float-delayed pointer-events-none" />
      <div className="absolute -bottom-36 left-1/3 w-[620px] h-[620px] bg-[#00D4FF]/09 rounded-full blur-[160px] animate-float-slow pointer-events-none" />

      {/* ─── Layer 5: Subtle Micro-Noise Film Grain for Physical Luxe Feel ─── */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default BackgroundAtmosphere;

