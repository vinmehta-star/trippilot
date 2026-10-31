import { v4 as uuidv4 } from 'uuid';
import { TripRequest, Itinerary, Activity, Day } from '../types';
import { calculateBudget } from './budgetEngine';
import { addDays, getDayName } from './dateUtils';

const DEMO_DESTINATIONS: Record<string, {
  overview: string;
  theme: string;
  tips: string[];
  activities: Omit<Activity, 'id'>[];
}> = {
  default: {
    overview: 'A wonderful trip full of exploration, culture, and memorable experiences.',
    theme: 'Exploration & Discovery',
    tips: [
      'Always carry a small amount of local currency for street food and small vendors.',
      'Download offline maps before you go to save data.',
      'Book major attractions in advance to avoid queues.',
      'Travel insurance is highly recommended for international trips.',
    ],
    activities: [
      {
        name: 'City Walking Tour',
        description: 'Explore the historic city center on foot with a local guide, visiting key landmarks and hidden gems.',
        category: 'sightseeing',
        startTime: '09:00',
        durationMinutes: 150,
        estimatedCost: 25,
        location: { name: 'City Center', lat: undefined, lng: undefined },
        imageKeyword: 'city tour',
        reasonForRecommendation: 'Perfect for first-day orientation and cultural immersion.',
        isOptional: false,
        travelTimeToNextMinutes: 20,
      },
      {
        name: 'Local Food Market',
        description: 'Discover the flavors of the region at a bustling local market with dozens of vendors.',
        category: 'food',
        startTime: '12:00',
        durationMinutes: 90,
        estimatedCost: 20,
        location: { name: 'Central Market', lat: undefined, lng: undefined },
        imageKeyword: 'food market',
        reasonForRecommendation: 'Best way to taste authentic local cuisine at reasonable prices.',
        isOptional: false,
        travelTimeToNextMinutes: 15,
      },
      {
        name: 'Cultural Museum',
        description: 'An impressive museum showcasing the history and art of the region.',
        category: 'culture',
        startTime: '14:30',
        durationMinutes: 120,
        estimatedCost: 15,
        location: { name: 'National Museum', lat: undefined, lng: undefined },
        imageKeyword: 'museum art',
        reasonForRecommendation: 'Highly rated by travelers interested in local history and culture.',
        isOptional: false,
        travelTimeToNextMinutes: 10,
      },
      {
        name: 'Sunset Viewpoint',
        description: 'Watch the sunset from a scenic viewpoint with panoramic views of the city.',
        category: 'sightseeing',
        startTime: '17:30',
        durationMinutes: 60,
        estimatedCost: 0,
        location: { name: 'Scenic Viewpoint', lat: undefined, lng: undefined },
        imageKeyword: 'sunset viewpoint',
        reasonForRecommendation: 'A magical, free experience that should not be missed.',
        isOptional: false,
        travelTimeToNextMinutes: 20,
      },
      {
        name: 'Traditional Dinner',
        description: 'Enjoy a traditional evening meal at a well-regarded local restaurant.',
        category: 'food',
        startTime: '19:30',
        durationMinutes: 90,
        estimatedCost: 35,
        location: { name: 'Old Town Restaurant District', lat: undefined, lng: undefined },
        imageKeyword: 'restaurant dinner',
        reasonForRecommendation: 'End the day with authentic local flavors in a cozy setting.',
        isOptional: false,
        travelTimeToNextMinutes: 0,
      },
    ],
  },
};

const ACTIVITY_POOLS: Omit<Activity, 'id'>[][] = [
  // Day 2 pool
  [
    {
      name: 'Morning Yoga / Meditation Session',
      description: 'Start the day with a calming yoga session at a local studio or park.',
      category: 'relaxation',
      startTime: '07:30',
      durationMinutes: 60,
      estimatedCost: 10,
      location: { name: 'Local Park / Wellness Studio' },
      imageKeyword: 'yoga meditation',
      reasonForRecommendation: 'A rejuvenating start to an activity-filled day.',
      isOptional: true,
      travelTimeToNextMinutes: 15,
    },
    {
      name: 'Street Art & Neighborhoods Walk',
      description: 'Wander through colorful neighborhoods admiring local murals and street art.',
      category: 'culture',
      startTime: '09:30',
      durationMinutes: 120,
      estimatedCost: 0,
      location: { name: 'Arts District' },
      imageKeyword: 'street art graffiti',
      reasonForRecommendation: 'Free, highly photogenic, and gives insight into local culture.',
      isOptional: false,
      travelTimeToNextMinutes: 20,
    },
    {
      name: 'Cooking Class',
      description: 'Learn to prepare traditional local dishes from a professional chef.',
      category: 'food',
      startTime: '12:00',
      durationMinutes: 180,
      estimatedCost: 60,
      location: { name: 'Culinary School / Local Kitchen' },
      imageKeyword: 'cooking class',
      reasonForRecommendation: 'An interactive, hands-on way to connect with local food culture.',
      isOptional: false,
      travelTimeToNextMinutes: 20,
    },
    {
      name: 'Evening River Cruise',
      description: 'See the city from the water on a relaxing evening boat tour.',
      category: 'relaxation',
      startTime: '19:00',
      durationMinutes: 90,
      estimatedCost: 30,
      location: { name: 'City Waterfront' },
      imageKeyword: 'river cruise boat',
      reasonForRecommendation: 'Romantic and scenic; a wonderful way to end the day.',
      isOptional: false,
      travelTimeToNextMinutes: 0,
    },
  ],
  // Day 3 pool
  [
    {
      name: 'Nature Hike or Scenic Trek',
      description: 'Hike through stunning natural landscapes with panoramic views.',
      category: 'adventure',
      startTime: '08:00',
      durationMinutes: 240,
      estimatedCost: 20,
      location: { name: 'National Park / Nature Reserve' },
      imageKeyword: 'hiking nature trail',
      reasonForRecommendation: 'Perfect for adventure-seekers and nature lovers.',
      isOptional: false,
      travelTimeToNextMinutes: 45,
    },
    {
      name: 'Local Craft & Souvenir Shopping',
      description: 'Browse artisan shops and markets for unique local crafts and keepsakes.',
      category: 'shopping',
      startTime: '15:00',
      durationMinutes: 90,
      estimatedCost: 50,
      location: { name: 'Artisan Market / Craft District' },
      imageKeyword: 'souvenir shopping market',
      reasonForRecommendation: 'Great for picking up authentic handmade souvenirs.',
      isOptional: true,
      travelTimeToNextMinutes: 20,
    },
    {
      name: 'Rooftop Bar & Nightlife',
      description: 'Experience the city\'s vibrant nightlife at a well-known rooftop bar.',
      category: 'nightlife',
      startTime: '20:00',
      durationMinutes: 120,
      estimatedCost: 40,
      location: { name: 'City Rooftop Venue' },
      imageKeyword: 'rooftop bar night',
      reasonForRecommendation: 'Fantastic city views and a lively atmosphere to end the trip.',
      isOptional: true,
      travelTimeToNextMinutes: 0,
    },
  ],
];

const ACCOMMODATION_BY_STYLE = {
  budget: { type: 'hostel' as const, name: 'City Backpackers Hostel', pricePerNight: 25 },
  balanced: { type: 'hotel' as const, name: 'Comfort City Hotel', pricePerNight: 80 },
  comfort: { type: 'boutique' as const, name: 'Boutique Heritage Hotel', pricePerNight: 160 },
  luxury: { type: 'resort' as const, name: 'Grand Luxury Resort', pricePerNight: 450 },
};

const PACKING_LIST = [
  {
    category: 'Documents & Money',
    items: [
      { name: 'Passport / National ID', essential: true },
      { name: 'Travel insurance documents', essential: true },
      { name: 'Flight / transport tickets', essential: true },
      { name: 'Hotel confirmations', essential: true },
      { name: 'Local currency / travel card', essential: true },
      { name: 'Emergency contact list', essential: false },
    ],
  },
  {
    category: 'Clothing & Accessories',
    items: [
      { name: 'Comfortable walking shoes', essential: true },
      { name: 'Weather-appropriate outfits', essential: true },
      { name: 'Light jacket / layers', essential: false },
      { name: 'Swimwear (if applicable)', essential: false },
      { name: 'Sunglasses', essential: false },
      { name: 'Hat / cap', essential: false },
    ],
  },
  {
    category: 'Tech & Gadgets',
    items: [
      { name: 'Smartphone & charger', essential: true },
      { name: 'Universal power adapter', essential: true },
      { name: 'Portable power bank', essential: false },
      { name: 'Camera / extra batteries', essential: false },
      { name: 'Earphones', essential: false },
    ],
  },
  {
    category: 'Health & Wellness',
    items: [
      { name: 'Prescription medications', essential: true },
      { name: 'Basic first aid kit', essential: false },
      { name: 'Sunscreen SPF 30+', essential: false },
      { name: 'Insect repellent', essential: false },
      { name: 'Hand sanitizer', essential: true },
      { name: 'Reusable water bottle', essential: false },
    ],
  },
  {
    category: 'Comfort & Convenience',
    items: [
      { name: 'Neck pillow (long flights)', essential: false },
      { name: 'Snacks for travel', essential: false },
      { name: 'Reusable shopping bag', essential: false },
      { name: 'Travel umbrella', essential: false },
      { name: 'Day pack / small backpack', essential: false },
    ],
  },
];

export function generateDemoItinerary(request: TripRequest): Itinerary {
  const { departureDate, returnDate, destination, travelStyle, numberOfTravellers } = request;

  const nights = Math.max(1, Math.floor(
    (new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const budgetBreakdown = calculateBudget(request);
  const accom = ACCOMMODATION_BY_STYLE[travelStyle];
  const baseData = DEMO_DESTINATIONS.default;

  const days: Day[] = [];

  for (let i = 0; i < nights; i++) {
    const date = addDays(departureDate, i);
    const dayName = getDayName(date);

    // Pick activities for this day
    let activityPool: Omit<Activity, 'id'>[];
    if (i === 0) {
      activityPool = baseData.activities;
    } else if (i === 1 && ACTIVITY_POOLS[0]) {
      activityPool = ACTIVITY_POOLS[0];
    } else {
      activityPool = ACTIVITY_POOLS[Math.min(i - 1, ACTIVITY_POOLS.length - 1)];
    }

    // Scale costs by number of travellers and style
    const costScale = numberOfTravellers;

    const day: Day = {
      dayNumber: i + 1,
      date,
      theme: i === 0 ? 'Arrival & First Impressions' :
             i === nights - 1 ? 'Last Day & Farewell' :
             baseData.theme,
      activities: activityPool.map(act => ({
        ...act,
        id: uuidv4(),
        estimatedCost: Math.round(act.estimatedCost * costScale),
      })),
      accommodation: {
        ...accom,
        location: { name: `${destination} ${accom.type} area` },
        pricePerNight: Math.round(accom.pricePerNight * Math.ceil(numberOfTravellers / 2)),
      },
    };

    days.push(day);
  }

  const packingList = PACKING_LIST.map(cat => ({
    category: cat.category,
    items: cat.items.map(item => ({
      id: uuidv4(),
      name: item.name,
      checked: false,
      essential: item.essential,
    })),
  }));

  return {
    destination,
    overview: `${baseData.overview} Your ${nights}-night trip to ${destination} has been planned to balance your interests in ${request.interests.join(', ')} with your ${travelStyle} travel style.`,
    days,
    budgetBreakdown,
    packingList,
    topTips: baseData.tips,
    localCurrency: 'Local Currency',
    emergencyContacts: [
      { name: 'Emergency Services', number: '112', type: 'Emergency' },
      { name: 'Tourist Helpline', number: '1800-XXX-XXXX', type: 'Tourist Support' },
    ],
    isDemo: true,
  };
}

