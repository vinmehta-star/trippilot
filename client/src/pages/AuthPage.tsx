import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Compass, Lock, Mail, User as UserIcon, MapPin, Sparkles,
  ArrowRight, ShieldCheck, Eye, EyeOff, Zap, CheckCircle2, Flame
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { TravelStyle } from '../types';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.pathname.includes('signup') ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('balanced');
  const [homeCity, setHomeCity] = useState('');

  const { login, register, demoLogin, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success = false;
    if (mode === 'login') {
      success = await login(email, password);
    } else {
      success = await register({
        name,
        email,
        password,
        travelStyle,
        homeCity: homeCity || 'New York, USA',
      });
    }

    if (success) {
      navigate('/trips');
    }
  };

  const handleDemoAccess = async () => {
    const success = await demoLogin();
    if (success) {
      navigate('/trips');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35] via-[#FF2E63] to-[#845EC2] shadow-[0_0_30px_rgba(255,107,53,0.4)] mb-2">
            <Compass size={28} className="text-white transform rotate-12" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back, Explorer' : 'Create Your Travel Passport'}
          </h1>
          <p className="text-xs text-white/50 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Access your saved blueprints, adaptive itineraries, and budget intelligence.'
              : 'Join TripPilot to save, synchronize, and dynamically edit intelligent journeys.'}
          </p>
        </div>

        {/* 1-Click Fast Pass / Hackathon Demo Sign-In Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF6B35]/15 via-[#845EC2]/15 to-[#00D4FF]/10 border border-[#FF6B35]/30 backdrop-blur-xl space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF6B35]/20 text-[#FF6B35]">
                <Zap size={14} className="animate-bounce" />
              </span>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Instant Demo Access
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/30 font-semibold">
              Hackathon Ready
            </span>
          </div>

          <p className="text-[11px] text-white/70 leading-relaxed">
            Evaluating TripPilot? Bypass registration and test the platform with 1-click verified credentials.
          </p>

          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="w-full mt-1.5 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-[#FF6B35]/50 group-hover:shadow-[0_0_15px_rgba(255,107,53,0.2)]"
          >
            <Sparkles size={14} className="text-[#FF6B35]" />
            <span>Continue as Alex Mercer (Demo Adventurer)</span>
            <ArrowRight size={13} className="text-white/40 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Main Auth Form Card */}
        <div className="card p-6 sm:p-8 bg-[#0a0a16]/90 border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative space-y-5">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF2E63] text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF2E63] text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Sign Up only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-white/70">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field !pl-10 !text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-white/70">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input
                  type="email"
                  required
                  placeholder="explorer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-10 !text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-white/70">Password</label>
                {mode === 'login' && (
                  <span className="text-[11px] text-[#FF6B35] hover:underline cursor-pointer">
                    Forgot key?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10 !pr-10 !text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Registration Additional Fields */}
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-white/70">Preferred Travel Vibe</label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value as TravelStyle)}
                    className="input-field !text-sm"
                  >
                    <option value="budget">Budget Explorer ($)</option>
                    <option value="balanced">Balanced Adventurer ($$)</option>
                    <option value="comfort">Comfort Traveler ($$$)</option>
                    <option value="luxury">Luxury Elite ($$$$)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-white/70">Home City / Origin Airport</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. San Francisco (SFO)"
                      value={homeCity}
                      onChange={(e) => setHomeCity(e.target.value)}
                      className="input-field !pl-10 !text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-[#FF4757]/15 border border-[#FF4757]/30 text-xs text-[#FF4757]">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center !py-3.5 text-sm cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{mode === 'login' ? 'Open Travel Vault' : 'Initialize Passport'}</span>
                  <ArrowRight size={15} />
                </div>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-center gap-4 text-[11px] text-white/40">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#00E5A0]" /> 256-Bit SSL
            </span>
            <span>•</span>
            <span>Zero Data Brokerage</span>
            <span>•</span>
            <span>Sync Across Devices</span>
          </div>
        </div>

        {/* Back to planner */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-white/50 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Return to Home Explorer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

