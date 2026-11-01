import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, DollarSign, Users, Trash2, ArrowRight, Search, Plus, Sparkles } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { formatCurrency, formatDate, differenceInDays } from '../utils/helpers';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const { trips, fetchTrips, deleteTrip, isLoading } = useTripStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this travel blueprint permanently?')) {
      setDeletingId(id);
      try {
        await deleteTrip(id);
        toast.success('Trip blueprint deleted');
      } catch {
        toast.error('Failed to delete trip');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredTrips = trips.filter(t =>
    t.request.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.request.startingCity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent text-[#e0e0ec] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-sunset text-[10px] uppercase font-mono">Vault Storage</span>
              <span className="text-white/40 text-xs font-mono">{trips.length} Blueprints</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Saved Itineraries</h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Access, adapt, and refine your generated travel blueprints.
            </p>
          </div>

          <button
            onClick={() => navigate('/plan')}
            className="btn-primary self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> <span>Craft New Trip</span>
          </button>
        </div>

        {/* Search Bar */}
        {trips.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Filter by destination or origin city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-11 text-xs"
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && trips.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="card p-6 h-64 skeleton rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && trips.length === 0 && (
          <div className="card p-12 text-center max-w-md mx-auto border-white/10 bg-[#0a0a14] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35]/20 to-[#845EC2]/20 border border-[#FF6B35]/30 flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(255,107,53,0.2)]">
              🧭
            </div>
            <h2 className="text-xl font-bold text-white">Your Vault is Empty</h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Start your first AI-assisted journey. TripPilot balances real mathematical budgets, curates verified stops, and automatically plans contingency routes.
            </p>
            <button
              onClick={() => navigate('/plan')}
              className="btn-primary !px-6 !py-3 !text-sm mx-auto"
            >
              <Sparkles size={16} />
              <span>Craft Your First Trip</span>
            </button>
          </div>
        )}

        {/* Trips Grid */}
        {!isLoading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const nights = differenceInDays(trip.request.returnDate, trip.request.departureDate);
              const isDeleting = deletingId === trip.id;
              const totalActivities = trip.itinerary?.days?.reduce((acc, d) => acc + d.activities.length, 0) || 0;

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/dashboard/${trip.id}`)}
                  className="card-hover group cursor-pointer overflow-hidden flex flex-col justify-between border-white/10 bg-[#090914] shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Style & Badge */}
                    <div className="flex items-center justify-between">
                      <span className="badge badge-sunset uppercase text-[10px] font-mono tracking-wider">
                        {trip.request.travelStyle}
                      </span>
                      {trip.itinerary?.isDemo ? (
                        <span className="badge badge-amber text-[10px] font-mono">Demo AI</span>
                      ) : (
                        <span className="badge badge-teal text-[10px] font-mono flex items-center gap-1">
                          <Sparkles size={10} /> AI Live
                        </span>
                      )}
                    </div>

                    {/* Destination Title */}
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-[#FF6B35] transition-colors leading-tight">
                        {trip.request.destination}
                      </h3>
                      <p className="text-xs text-white/40 mt-1 font-mono">
                        Departing from {trip.request.startingCity}
                      </p>
                    </div>

                    {/* Metadata Summary */}
                    <div className="space-y-2 text-xs font-mono text-white/60 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[#FF6B35]" />
                        <span>{formatDate(trip.request.departureDate)} ({nights} Nights)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-[#845EC2]" />
                        <span>{trip.request.numberOfTravellers} Adventurer{trip.request.numberOfTravellers > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={13} className="text-[#00E5A0]" />
                        <span>Target: {formatCurrency(trip.request.totalBudget, trip.request.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="px-6 py-3.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF6B35] flex items-center gap-1 group-hover:gap-2 transition-all font-mono">
                      Open Dashboard <ArrowRight size={13} />
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-white/40 hover:text-[#FF4757] hover:bg-[#FF4757]/10 transition-colors cursor-pointer"
                      title="Delete trip blueprint"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
