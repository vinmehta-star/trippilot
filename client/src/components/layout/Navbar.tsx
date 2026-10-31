import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Sparkles, Map, Home, Briefcase, Plus, Flame, LogIn, LogOut, User as UserIcon, ChevronDown, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [geminiOnline, setGeminiOnline] = useState<boolean | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getStatus()
      .then(res => {
        if (mounted) setGeminiOnline(!!res.geminiAvailable);
      })
      .catch(() => {
        if (mounted) setGeminiOnline(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('trippilot-trips');
      if (raw) {
        const parsed = JSON.parse(raw);
        const trips = parsed?.state?.trips ?? [];
        setTripCount(Array.isArray(trips) ? trips.length : 0);
      }
    } catch {
      setTripCount(0);
    }
  }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/trips', label: 'My Vault', icon: Briefcase, count: tripCount },
    { to: '/plan', label: 'Explore & Plan', icon: Map },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080811]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group relative"
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF6B35] via-[#FF2E63] to-[#845EC2] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.4)] group-hover:shadow-[0_0_30px_rgba(255,46,99,0.7)] transition-all duration-300 group-hover:scale-105">
              <Compass size={22} className="text-white transform group-hover:rotate-45 transition-transform duration-500 ease-out" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#00E5A0] rounded-full border-2 border-[#050507] shadow-[0_0_8px_#00E5A0]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FF6B35] group-hover:via-[#FF2E63] group-hover:to-[#845EC2] transition-all">
                Trip<span className="text-[#FF6B35]">Pilot</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] font-medium text-white/40 tracking-wider">
              ADAPTIVE TRAVEL ENGINE
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-md">
          {links.map(({ to, label, icon: Icon, count }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'text-white bg-gradient-to-r from-white/10 to-white/5 border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#FF6B35]' : 'text-white/40'} />
                {label}
                {typeof count === 'number' && count > 0 && (
                  <span className="ml-1 text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                    {count}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FF2E63] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side CTAs */}
        <div className="flex items-center gap-3">
          {/* Live Engine Status */}
          {geminiOnline !== null && (
            <div className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs backdrop-blur-sm transition-all duration-300 ${
              geminiOnline
                ? 'bg-[#00E5A0]/10 border-[#00E5A0]/25 shadow-[0_0_12px_rgba(0,229,160,0.15)]'
                : 'bg-[#FFB547]/10 border-[#FFB547]/25 shadow-[0_0_12px_rgba(255,181,71,0.15)]'
            }`}>
              <span className="relative flex h-2 w-2">
                {geminiOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  geminiOnline ? 'bg-[#00E5A0]' : 'bg-[#FFB547]'
                }`}></span>
              </span>
              <span className="font-mono text-white/60 text-[11px]">
                {geminiOnline ? 'Gemini AI' : 'Planner'}
              </span>
              <span className={`font-semibold text-[11px] ${
                geminiOnline ? 'text-[#00E5A0]' : 'text-[#FFB547]'
              }`}>
                {geminiOnline ? 'Live Online' : 'Demo Mode'}
              </span>
            </div>
          )}

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-xl object-cover border border-[#FF6B35]/40"
                />
                <span className="text-xs font-semibold text-white/90 hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0d0d1a]/95 border border-white/15 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#FF6B35]/50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="badge badge-sunset text-[9px] uppercase font-mono py-0 px-1.5">
                          {user.travelStyle || 'Pro Explorer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <Link
                      to="/trips"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase size={14} className="text-[#FF6B35]" />
                        <span>My Trip Vault</span>
                      </span>
                      {tripCount > 0 && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35]">
                          {tripCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/plan"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/[0.06] text-white/80 hover:text-white transition-colors"
                    >
                      <Plus size={14} className="text-[#00E5A0]" />
                      <span>New Trip Blueprint</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#FF4757] hover:bg-[#FF4757]/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
            >
              <LogIn size={14} className="text-[#FF6B35]" />
              <span>Sign In</span>
            </Link>
          )}

          <button
            onClick={() => navigate('/plan')}
            className="btn-primary !px-5 !py-2.5 !text-sm group"
          >
            <Sparkles size={16} className="text-white group-hover:rotate-12 transition-transform" />
            <span>Plan My Trip</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/[0.1] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a14]/95 border-b border-white/10 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {links.map(({ to, label, icon: Icon, count }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#FF6B35]/15 to-transparent text-white border-l-4 border-[#FF6B35]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={active ? 'text-[#FF6B35]' : 'text-white/40'} />
                    {label}
                  </div>
                  {typeof count === 'number' && count > 0 && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35]">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2.5">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-white/50">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="p-1.5 rounded-lg text-[#FF4757] hover:bg-[#FF4757]/10"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary w-full justify-center !py-2.5 !text-xs"
              >
                <LogIn size={15} />
                <span>Sign In / Create Passport</span>
              </Link>
            )}

            <button
              onClick={() => {
                setMobileOpen(false);
                navigate('/plan');
              }}
              className="btn-primary w-full justify-center !py-3.5"
            >
              <Sparkles size={18} />
              <span>Craft New Itinerary</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
