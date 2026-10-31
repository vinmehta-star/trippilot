import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Heart, Shield, Terminal, Globe, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#06060c] border-t border-white/[0.08] text-white/60 overflow-hidden pt-16 pb-12">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gradient-to-t from-[#FF6B35]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B35] via-[#FF2E63] to-[#845EC2] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.35)]">
                <Compass size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Trip<span className="text-[#FF6B35]">Pilot</span>
              </span>
            </Link>

            <p className="text-sm text-white/50 max-w-md leading-relaxed">
              The next-generation adaptive travel intelligence platform. Powered by Google Gemini and deterministic budgeting algorithms that adapt to flight delays, bad weather, and real-time budget adjustments.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 font-mono">
                <Terminal size={12} className="text-[#00E5A0]" />
                Gemini 1.5 Flash Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 font-mono">
                <Shield size={12} className="text-[#00D4FF]" />
                Zod Schema Validated
              </span>
            </div>
          </div>

          {/* Nav Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  Home Landing
                </Link>
              </li>
              <li>
                <Link to="/plan" className="hover:text-white transition-colors flex items-center gap-1">
                  Trip Creation Wizard <span className="text-[10px] text-[#FF6B35] font-mono">NEW</span>
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-white transition-colors flex items-center gap-1">
                  Saved Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Engine Tech Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">Core Differentiators</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                Adaptive Itinerary Engine
              </li>
              <li className="text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#845EC2]" />
                Budget Trade-Off Simulator
              </li>
              <li className="text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0]" />
                Live Weather Plan B Shield
              </li>
              <li className="text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
                Natural Language AI Edits
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
          <p>© {new Date().getFullYear()} TripPilot. Built for Hackathon Excellence.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-white/60">
              Crafted with <Heart size={13} className="text-[#FF2E63] fill-[#FF2E63]" /> for Travelers Worldwide
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
