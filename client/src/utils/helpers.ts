import { BudgetBreakdown, Activity, Day, Itinerary } from '../types';

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function differenceInDays(endDate: string, startDate: string): number {
  const end = new Date(endDate);
  const start = new Date(startDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getActivityTotal(activities: Activity[]): number {
  return activities.reduce((sum, act) => sum + act.estimatedCost, 0);
}

export function getDayTotal(day: Day): number {
  const activitiesTotal = getActivityTotal(day.activities);
  const accommodationTotal = day.accommodation?.pricePerNight || 0;
  return activitiesTotal + accommodationTotal;
}

export function getItineraryTotal(itinerary: Itinerary): number {
  return itinerary.days.reduce((sum, day) => sum + getDayTotal(day), 0);
}

export function getBudgetUtilization(breakdown: BudgetBreakdown, totalBudget: number): number {
  if (totalBudget === 0) return 0;
  return Math.min(200, Math.round((breakdown.total / totalBudget) * 100));
}

export function getBudgetColor(utilization: number): string {
  if (utilization > 100) return '#f84b4b';
  if (utilization > 80) return '#f59e0b';
  return '#14b8a6';
}

export function getPackingProgress(packingList: Itinerary['packingList']): number {
  const total = packingList.reduce((sum, cat) => sum + cat.items.length, 0);
  const checked = packingList.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
  return total > 0 ? Math.round((checked / total) * 100) : 0;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export const UNSPLASH_IMAGE = (keyword: string, w = 400, h = 250): string =>
  `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keyword)},travel`;

export const DESTINATION_IMAGE = (destination: string): string =>
  UNSPLASH_IMAGE(`${destination} city landmark`, 800, 400);

