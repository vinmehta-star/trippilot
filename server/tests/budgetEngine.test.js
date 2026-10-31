const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { calculateBudget, calculateReadinessScore, suggestCostSavings } = require('../dist/utils/budgetEngine');
const { differenceInDays, addDays } = require('../dist/utils/dateUtils');

function makeRequest(overrides = {}) {
  return {
    startingCity: 'New York',
    destination: 'Paris',
    departureDate: '2025-06-01',
    returnDate: '2025-06-08',
    numberOfTravellers: 2,
    totalBudget: 3000,
    currency: 'USD',
    travelStyle: 'balanced',
    interests: ['culture', 'food'],
    preferredTransport: ['flight'],
    preferredAccommodation: 'hotel',
    dietaryRequirements: [],
    ...overrides,
  };
}

describe('Date Utilities', () => {
  test('differenceInDays calculates correct number of days', () => {
    assert.equal(differenceInDays('2025-06-08', '2025-06-01'), 7);
    assert.equal(differenceInDays('2025-06-01', '2025-06-01'), 0);
    assert.equal(differenceInDays('2025-01-01', '2024-12-31'), 1);
  });

  test('differenceInDays returns 0 for reversed dates', () => {
    assert.equal(differenceInDays('2025-06-01', '2025-06-08'), 0);
  });

  test('addDays correctly advances date', () => {
    assert.equal(addDays('2025-06-01', 7), '2025-06-08');
    assert.equal(addDays('2025-12-28', 5), '2026-01-02');
    assert.equal(addDays('2025-06-01', 0), '2025-06-01');
  });
});

describe('Budget Engine - calculateBudget', () => {
  test('returns all required fields', () => {
    const result = calculateBudget(makeRequest());
    assert.ok(typeof result.transport === 'number');
    assert.ok(typeof result.accommodation === 'number');
    assert.ok(typeof result.food === 'number');
    assert.ok(typeof result.activities === 'number');
    assert.ok(typeof result.localTransport === 'number');
    assert.ok(typeof result.miscellaneous === 'number');
    assert.ok(typeof result.emergencyBuffer === 'number');
    assert.ok(typeof result.total === 'number');
    assert.ok(typeof result.perPerson === 'number');
    assert.equal(result.currency, 'USD');
    assert.equal(typeof result.isOverBudget, 'boolean');
  });

  test('total equals sum of all components', () => {
    const result = calculateBudget(makeRequest());
    const componentSum = result.transport + result.accommodation + result.food +
      result.activities + result.localTransport + result.miscellaneous + result.emergencyBuffer;
    assert.equal(result.total, Math.round(componentSum));
  });

  test('perPerson is approximately total divided by travellers', () => {
    const request = makeRequest({ numberOfTravellers: 2 });
    const result = calculateBudget(request);
    assert.ok(result.perPerson > 0);
    assert.ok(result.perPerson < result.total);
  });

  test('luxury costs more than budget', () => {
    const budget = calculateBudget(makeRequest({ travelStyle: 'budget' }));
    const luxury = calculateBudget(makeRequest({ travelStyle: 'luxury' }));
    assert.ok(luxury.total > budget.total);
    assert.ok(luxury.accommodation > budget.accommodation);
  });

  test('more travellers increases transport cost', () => {
    const twoTravellers = calculateBudget(makeRequest({ numberOfTravellers: 2 }));
    const fourTravellers = calculateBudget(makeRequest({ numberOfTravellers: 4 }));
    assert.ok(fourTravellers.total > twoTravellers.total);
  });

  test('detects over-budget correctly', () => {
    const overBudget = calculateBudget(makeRequest({ totalBudget: 10 }));
    assert.equal(overBudget.isOverBudget, true);
    assert.ok((overBudget.overBudgetBy || 0) > 0);

    const underBudget = calculateBudget(makeRequest({ totalBudget: 999999 }));
    assert.equal(underBudget.isOverBudget, false);
    assert.equal(underBudget.overBudgetBy, undefined);
  });

  test('emergency buffer is approximately 5% of subtotal', () => {
    const result = calculateBudget(makeRequest());
    const subtotal = result.transport + result.accommodation + result.food +
      result.activities + result.localTransport + result.miscellaneous;
    const expectedBuffer = Math.round(subtotal * 0.05);
    assert.equal(result.emergencyBuffer, expectedBuffer);
  });

  test('currency is preserved from request', () => {
    const result = calculateBudget(makeRequest({ currency: 'EUR' }));
    assert.equal(result.currency, 'EUR');
  });

  test('longer trips cost more', () => {
    const shortTrip = calculateBudget(makeRequest({
      departureDate: '2025-06-01',
      returnDate: '2025-06-04',
    }));
    const longTrip = calculateBudget(makeRequest({
      departureDate: '2025-06-01',
      returnDate: '2025-06-15',
    }));
    assert.ok(longTrip.total > shortTrip.total);
    assert.ok(longTrip.accommodation > shortTrip.accommodation);
  });

  test('all numeric values are non-negative', () => {
    const result = calculateBudget(makeRequest());
    const numericFields = ['transport', 'accommodation', 'food', 'activities', 'localTransport', 'miscellaneous', 'emergencyBuffer', 'total', 'perPerson'];
    for (const field of numericFields) {
      assert.ok(result[field] >= 0);
    }
  });
});

describe('Budget Engine - calculateReadinessScore', () => {
  function makeItinerary(overrides = {}) {
    return {
      destination: 'Paris',
      overview: 'A wonderful trip',
      days: [
        {
          dayNumber: 1,
          date: '2025-06-01',
          theme: 'Day 1',
          activities: [
            { id: '1', name: 'Eiffel Tower', description: '', category: 'sightseeing', startTime: '09:00', durationMinutes: 120, estimatedCost: 25, location: { name: 'Paris' }, isOptional: false },
            { id: '2', name: 'Lunch', description: '', category: 'food', startTime: '12:00', durationMinutes: 60, estimatedCost: 20, location: { name: 'Cafe' }, isOptional: false },
          ],
          accommodation: { name: 'Hotel Paris', type: 'hotel', pricePerNight: 100, location: { name: 'Paris Center' } },
        },
      ],
      budgetBreakdown: {
        transport: 500, accommodation: 700, food: 300, activities: 200,
        localTransport: 100, miscellaneous: 100, emergencyBuffer: 95,
        total: 1995, perPerson: 998, currency: 'USD',
        isOverBudget: false,
      },
      packingList: [
        {
          category: 'Documents',
          items: [
            { id: 'p1', name: 'Passport', checked: true, essential: true },
            { id: 'p2', name: 'Insurance', checked: false, essential: true },
          ],
        },
      ],
      topTips: ['Tip 1'],
      isDemo: false,
      ...overrides,
    };
  }

  test('score is between 0 and 100', () => {
    const itinerary = makeItinerary();
    const request = makeRequest();
    const { score } = calculateReadinessScore(itinerary, request);
    assert.ok(score >= 0 && score <= 100);
  });

  test('returns factors array', () => {
    const { factors } = calculateReadinessScore(makeItinerary(), makeRequest());
    assert.ok(Array.isArray(factors));
    assert.ok(factors.length > 0);
    for (const factor of factors) {
      assert.ok('label' in factor);
      assert.ok('score' in factor);
      assert.ok('maxScore' in factor);
      assert.ok('description' in factor);
    }
  });

  test('score is lower for over-budget plan', () => {
    const normal = makeItinerary();
    const overBudget = makeItinerary({
      budgetBreakdown: { ...normal.budgetBreakdown, isOverBudget: true, overBudgetBy: 500 },
    });
    const { score: normalScore } = calculateReadinessScore(normal, makeRequest());
    const { score: overScore } = calculateReadinessScore(overBudget, makeRequest({ totalBudget: 100 }));
    assert.ok(normalScore > overScore);
  });
});

describe('Budget Engine - suggestCostSavings', () => {
  test('returns array of suggestions', () => {
    const breakdown = {
      transport: 500, accommodation: 800, food: 300, activities: 200,
      localTransport: 100, miscellaneous: 100, emergencyBuffer: 95,
      total: 2095, perPerson: 1048, currency: 'USD',
      isOverBudget: true, overBudgetBy: 500,
    };
    const suggestions = suggestCostSavings(breakdown, 'balanced', 500);
    assert.ok(Array.isArray(suggestions));
    assert.ok(suggestions.length > 0);
    assert.ok(suggestions.every(s => typeof s === 'string'));
  });

  test('no more than 4 suggestions returned', () => {
    const breakdown = {
      transport: 200, accommodation: 900, food: 600, activities: 400,
      localTransport: 200, miscellaneous: 200, emergencyBuffer: 125,
      total: 2625, perPerson: 1313, currency: 'USD',
      isOverBudget: true, overBudgetBy: 1000,
    };
    const suggestions = suggestCostSavings(breakdown, 'luxury', 1000);
    assert.ok(suggestions.length <= 4);
  });
});
