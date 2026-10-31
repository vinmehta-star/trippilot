import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SavedTrip,
  Itinerary,
  Activity,
  Day,
  PackingItem,
  ReadinessFactor,
} from '../types';
import { api } from '../services/api';

interface TripStore {
  // State
  trips: SavedTrip[];
  currentTrip: SavedTrip | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  readinessScore: number;
  readinessFactors: ReadinessFactor[];

  // Actions
  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  setCurrentTrip: (trip: SavedTrip | null) => void;
  deleteTrip: (id: string) => Promise<void>;

  // Itinerary mutations
  updateActivity: (dayNumber: number, activity: Activity) => Promise<void>;
  addActivity: (dayNumber: number, activity: Activity) => Promise<void>;
  removeActivity: (dayNumber: number, activityId: string) => Promise<void>;
  reorderActivities: (dayNumber: number, activities: Activity[]) => Promise<void>;
  updatePackingItem: (categoryIndex: number, itemId: string, checked: boolean) => Promise<void>;
  addPackingItem: (categoryIndex: number, item: PackingItem) => Promise<void>;

  clearError: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTrip: null,
      isLoading: false,
      isGenerating: false,
      error: null,
      readinessScore: 0,
      readinessFactors: [],

      fetchTrips: async () => {
        set({ isLoading: true, error: null });
        try {
          const { trips } = await api.getTrips();
          set({ trips, isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      fetchTrip: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { trip, readinessScore, readinessFactors } = await api.getTrip(id);
          set({ currentTrip: trip, readinessScore, readinessFactors, isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      setCurrentTrip: (trip) => set({ currentTrip: trip }),

      deleteTrip: async (id: string) => {
        await api.deleteTrip(id);
        set(state => ({
          trips: state.trips.filter(t => t.id !== id),
          currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
        }));
      },

      updateActivity: async (dayNumber: number, activity: Activity) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedDays = currentTrip.itinerary.days.map(d =>
          d.dayNumber === dayNumber
            ? { ...d, activities: d.activities.map(a => a.id === activity.id ? activity : a) }
            : d
        );
        const updatedItinerary = { ...currentTrip.itinerary, days: updatedDays };
        await saveItineraryUpdate(set, get, updatedItinerary);
      },

      addActivity: async (dayNumber: number, activity: Activity) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedDays = currentTrip.itinerary.days.map(d =>
          d.dayNumber === dayNumber
            ? { ...d, activities: [...d.activities, activity] }
            : d
        );
        const updatedItinerary = { ...currentTrip.itinerary, days: updatedDays };
        await saveItineraryUpdate(set, get, updatedItinerary);
      },

      removeActivity: async (dayNumber: number, activityId: string) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedDays = currentTrip.itinerary.days.map(d =>
          d.dayNumber === dayNumber
            ? { ...d, activities: d.activities.filter(a => a.id !== activityId) }
            : d
        );
        const updatedItinerary = { ...currentTrip.itinerary, days: updatedDays };
        await saveItineraryUpdate(set, get, updatedItinerary);
      },

      reorderActivities: async (dayNumber: number, activities: Activity[]) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedDays = currentTrip.itinerary.days.map(d =>
          d.dayNumber === dayNumber ? { ...d, activities } : d
        );
        const updatedItinerary = { ...currentTrip.itinerary, days: updatedDays };
        await saveItineraryUpdate(set, get, updatedItinerary);
      },

      updatePackingItem: async (categoryIndex: number, itemId: string, checked: boolean) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedPackingList = currentTrip.itinerary.packingList.map((cat, i) =>
          i === categoryIndex
            ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, checked } : item) }
            : cat
        );
        const updatedItinerary = { ...currentTrip.itinerary, packingList: updatedPackingList };
        const totalItems = updatedPackingList.reduce((sum, cat) => sum + cat.items.length, 0);
        const checkedItems = updatedPackingList.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
        const packingProgress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
        await saveItineraryUpdate(set, get, updatedItinerary, packingProgress);
      },

      addPackingItem: async (categoryIndex: number, item: PackingItem) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedPackingList = currentTrip.itinerary.packingList.map((cat, i) =>
          i === categoryIndex ? { ...cat, items: [...cat.items, item] } : cat
        );
        const updatedItinerary = { ...currentTrip.itinerary, packingList: updatedPackingList };
        await saveItineraryUpdate(set, get, updatedItinerary);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'trippilot-trips',
      partialize: (state) => ({ currentTrip: state.currentTrip }),
    }
  )
);

async function saveItineraryUpdate(
  set: any,
  get: any,
  updatedItinerary: Itinerary,
  packingProgress?: number
) {
  const { currentTrip } = get();
  if (!currentTrip) return;

  // Optimistic update
  set({ currentTrip: { ...currentTrip, itinerary: updatedItinerary } });

  try {
    const result = await api.updateTrip(currentTrip.id, {
      itinerary: updatedItinerary,
      packingProgress,
    });
    set({
      currentTrip: result.trip,
      readinessScore: result.readinessScore,
      readinessFactors: result.readinessFactors,
    });
  } catch (e: any) {
    // Revert optimistic update
    set({ currentTrip, error: 'Failed to save changes' });
  }
}

