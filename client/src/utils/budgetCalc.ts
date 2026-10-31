/**
 * Standalone budget calculation utilities for the frontend.
 * These mirror the server-side calculations and are used for
 * real-time estimates in the wizard and simulator.
 */

import { TripRequest, BudgetBreakdown } from '../types';

const BASE_COSTS = {
  budget: {
    accommodation: 25,
    food: 20,
    localTransport: 5,
    activities: 15,
    miscellaneous: 10,
  },
  balanced: {
    accommodation: 70,
    food: 50,
    localTransport: 15,
    activities: 35,
    miscellaneous: 25,
  },
  comfort: {
    accommodation: 150,
    food: 100,
    localTransport: 30,
    activities: 75,
    miscellaneous: 50,
  },
  luxury: {
    accommodation: 400,
    food: 200,
    localTransport: 80,
    activities: 150,
    miscellaneous: 120,
  },
} as const;

const TRANSPORT_BASE = {
  flight: 300,
  train: 80,
  bus: 40,
  car: 60,
  ferry: 50,
} as const;

export function estimateBudget(
  request: Partial<TripRequest> & {
    departureDate?: string;
    returnDate?: string;
    numberOfTravellers?: number;
    travelStyle?: TripRequest['travelStyle'];
    preferredTransport?: TripRequest['preferredTransport'];
    currency?: string;
    totalBudget?: number;
  }
): BudgetBreakdown {
  const {
    departureDate = '',
    returnDate = '',
    numberOfTravellers = 2,
    travelStyle = 'balanced',
    preferredTransport = ['flight'],
    currency = 'USD',
    totalBudget = 0,
  } = request;

  const dep = new Date(departureDate);
  const ret = new Date(returnDate);
  const nights = Math.max(1,
    isNaN(dep.getTime()) || isNaN(ret.getTime())
      ? 7
      : Math.floor((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24))
  );

  const base = BASE_COSTS[travelStyle] || BASE_COSTS.balanced;
  const people = Math.max(1, numberOfTravellers);

  const transportModes = preferredTransport.length > 0 ? preferredTransport : ['flight' as const];
  const cheapestTransport = Math.min(
    ...transportModes.map(t => TRANSPORT_BASE[t as keyof typeof TRANSPORT_BASE] || 100)
  );

  const transport = Math.round(cheapestTransport * 2 * people);
  const accommodation = Math.round(base.accommodation * nights * Math.ceil(people / 2));
  const food = Math.round(base.food * (nights + 1) * people);
  const activities = Math.round(base.activities * nights * people);
  const localTransport = Math.round(base.localTransport * (nights + 1) * people);
  const miscellaneous = Math.round(base.miscellaneous * (nights + 1) * people);
  const subtotal = transport + accommodation + food + activities + localTransport + miscellaneous;
  const emergencyBuffer = Math.round(subtotal * 0.05);
  const total = subtotal + emergencyBuffer;
  const perPerson = Math.round(total / people);
  const isOverBudget = totalBudget > 0 && total > totalBudget;

  return {
    transport,
    accommodation,
    food,
    activities,
    localTransport,
    miscellaneous,
    emergencyBuffer,
    total,
    perPerson,
    currency,
    isOverBudget,
    overBudgetBy: isOverBudget ? total - totalBudget : undefined,
  };
}

export function getBudgetScenarios(breakdown: BudgetBreakdown): Array<{
  id: string;
  label: string;
  description: string;
  icon: string;
  totalDelta: number;
  isPositive: boolean;
}> {
  return [
    {
      id: 'save-accommodation',
      label: 'Save on Accommodation',
      description: 'Switch to a simpler hotel or hostel',
      icon: '🏨',
      totalDelta: -Math.round(breakdown.accommodation * 0.20),
      isPositive: false,
    },
    {
      id: 'skip-attractions',
      label: 'Skip Paid Attractions',
      description: 'Focus on free sights and local experiences',
      icon: '🏛️',
      totalDelta: -Math.round(breakdown.activities * 0.30),
      isPositive: false,
    },
    {
      id: 'more-food',
      label: 'Upgrade Food Budget',
      description: 'Splurge on nicer restaurants',
      icon: '🍽️',
      totalDelta: Math.round(breakdown.food * 0.25),
      isPositive: true,
    },
    {
      id: 'add-traveller',
      label: 'Add 1 More Traveller',
      description: 'Recalculate costs with one extra person',
      icon: '👤',
      totalDelta: Math.round(breakdown.total * 0.15),
      isPositive: true,
    },
    {
      id: 'extend-day',
      label: 'Extend Trip by 1 Day',
      description: 'What one extra night would cost',
      icon: '📅',
      totalDelta: Math.round(breakdown.total * 0.14),
      isPositive: true,
    },
  ];
}

