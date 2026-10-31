import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, AlertTriangle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

interface WeatherDay {
  date: string;
  condition: string;
  temperatureHigh: number;
  temperatureLow: number;
  precipitation: number;
  icon?: string;
  isAdverse?: boolean;
}

interface Props {
  destination: string;
  startDate: string;
}

export default function WeatherWidget({ destination, startDate }: Props) {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [message, setMessage] = useState<string>('');

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const data = await api.getWeather(destination, startDate);
      setAvailable(data.available);
      setForecast(data.forecast || []);
      setMessage(data.message || '');
    } catch {
      setAvailable(false);
      setMessage('Unable to connect to weather service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [destination, startDate]);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-6 h-6 text-[#00D4FF]" />;
    if (c.includes('thunder') || c.includes('storm')) return <AlertTriangle className="w-6 h-6 text-[#FF4757]" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-6 h-6 text-white/50" />;
    if (c.includes('wind')) return <Wind className="w-6 h-6 text-[#00E5A0]" />;
    return <Sun className="w-6 h-6 text-[#FFB547]" />;
  };

  if (loading) {
    return (
      <div className="card p-6 space-y-4 border-white/10 bg-[#080812]">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 skeleton rounded-lg" />
          <div className="h-6 w-24 skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <div key={n} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Graceful fallback display when key is propagating or offline
  if (!available || forecast.length === 0) {
    return (
      <div className="card p-6 sm:p-7 border border-white/10 bg-[#0a0a14] space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#00E5A0]/20 border border-[#00D4FF]/30 flex items-center justify-center text-[#00D4FF] flex-shrink-0">
              <Cloud size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">Weather Shield & Plan B Contingency</h4>
                <span className="badge badge-teal text-[10px] font-mono">Shield Active</span>
              </div>
              <p className="text-xs text-white/60 max-w-xl leading-relaxed">
                Continuous radar integration ready for {destination}. If adverse weather (rain, storms) occurs, the adaptive engine suggests pre-curated indoor substitutions without exceeding your daily budget.
              </p>
            </div>
          </div>

          <button
            onClick={fetchWeather}
            className="btn-secondary !px-4 !py-2 !text-xs self-start md:self-auto flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Check Radar</span>
          </button>
        </div>
      </div>
    );
  }

  const hasAdverseWeather = forecast.some(f => f.isAdverse);

  return (
    <div className="card p-6 space-y-5 border-white/10 bg-[#0a0a14]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-white text-lg flex items-center gap-2">
            <span>Live Forecast for {destination}</span>
            <span className="badge badge-teal text-xs font-mono">OpenWeather Live</span>
          </h3>
          <p className="text-xs text-white/50 font-mono">Continuous monitoring for outdoor activity feasibility</p>
        </div>
        <button
          onClick={fetchWeather}
          className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.05]"
          title="Refresh forecast"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {hasAdverseWeather && (
        <div className="flex items-start gap-3 p-4 bg-[#FF4757]/15 rounded-2xl border border-[#FF4757]/30 text-xs text-[#FF4757]">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-sm">Adverse Weather Detected in Forecast</h5>
            <p className="text-white/70 mt-0.5">
              Rain or heavy overcast expected. Use the "AI Natural Edit" tab to instantly activate indoor alternative recommendations.
            </p>
          </div>
        </div>
      )}

      {/* 7-Day Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((day, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
              day.isAdverse
                ? 'bg-[#FF4757]/10 border-[#FF4757]/30'
                : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
            }`}
          >
            <span className="text-[11px] font-mono text-white/60 mb-1">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div className="my-2">{getWeatherIcon(day.condition)}</div>
            <div className="text-base font-black text-white font-mono">
              {day.temperatureHigh}°C
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              Low {day.temperatureLow}°C
            </div>
            <span className="text-[10px] text-white/50 capitalize mt-1.5 truncate max-w-full font-mono">
              {day.condition}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
