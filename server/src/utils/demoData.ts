import { v4 as uuidv4 } from 'uuid';
import { TripRequest, Itinerary, Activity, Day } from '../types';
import { calculateBudget } from './budgetEngine';
import { addDays, getDayName } from './dateUtils';
import { enrichItineraryCoordinates, FAMOUS_CITIES } from './cityCoordinates';

interface DestinationTemplate {
  overview: string;
  theme: string;
  tips: string[];
  dayTemplates: {
    theme: string;
    activities: Omit<Activity, 'id'>[];
  }[];
}

const DESTINATION_TEMPLATES: Record<string, DestinationTemplate> = {
  paris: {
    overview: 'A magnificent journey through the City of Light, blending iconic architectural monuments, romantic riverside walks, and world-class culinary masterpieces.',
    theme: 'Art, Romance & Parisian Gastronomy',
    tips: [
      'Book timed-entry tickets for the Louvre and Eiffel Tower in advance to skip hours of queues.',
      'The Paris Metro is fast and convenient; grab a Navigo Easy pass at any station.',
      'Many museums offer free admission on the first Sunday of every month.',
      'Enjoy dinner like a local: Parisian bistros typically start evening service after 19:30.',
    ],
    dayTemplates: [
      {
        theme: 'Arrival & Iconic River Seine Landmarks',
        activities: [
          {
            name: 'Eiffel Tower & Champ de Mars Summit',
            description: 'Ascend Paris’s most iconic wrought-iron spire for breathtaking 360-degree views across the Seine basin.',
            category: 'sightseeing',
            startTime: '09:30',
            durationMinutes: 150,
            estimatedCost: 32,
            location: { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
            imageKeyword: 'eiffel tower paris',
            reasonForRecommendation: 'An essential first-day orientation to soak in the monumental skyline.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Seine River Cruise & Pont de l’Alma',
            description: 'Glide past historical quays, historic bridges, and riverfront stone facades on an open-deck cruise.',
            category: 'relaxation',
            startTime: '12:30',
            durationMinutes: 75,
            estimatedCost: 18,
            location: { name: 'Seine River Cruise', lat: 48.8634, lng: 2.3015 },
            imageKeyword: 'seine river cruise',
            reasonForRecommendation: 'Rest your feet while observing Paris’s UNESCO-listed riverbanks.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Musée d\'Orsay Impressionist Gallery',
            description: 'Admire masterpieces by Monet, Renoir, Degas, and Van Gogh inside a magnificent converted Beaux-Arts railway station.',
            category: 'culture',
            startTime: '14:30',
            durationMinutes: 120,
            estimatedCost: 16,
            location: { name: 'Musée d\'Orsay', lat: 48.8599, lng: 2.3265 },
            imageKeyword: 'musee orsay art',
            reasonForRecommendation: 'Home to the world\'s premier collection of Impressionist treasures.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Saint-Germain-des-Prés Bistro Dinner',
            description: 'Indulge in authentic coq au vin or confit de canard paired with artisan wine in a charming Latin quarter bistro.',
            category: 'food',
            startTime: '19:30',
            durationMinutes: 90,
            estimatedCost: 45,
            location: { name: 'Saint-Germain Bistro District', lat: 48.8539, lng: 2.3338 },
            imageKeyword: 'paris bistro dinner',
            reasonForRecommendation: 'Experience traditional Parisian evening ambiance and gastronomic heritage.',
            isOptional: false,
            travelTimeToNextMinutes: 0,
          },
        ],
      },
      {
        theme: 'Louvre Art Treasures & Royal Gardens',
        activities: [
          {
            name: 'Musée du Louvre Guided Masterpieces',
            description: 'Encounter the Mona Lisa, Winged Victory of Samothrace, and Venus de Milo in the world\'s largest art palace.',
            category: 'culture',
            startTime: '09:00',
            durationMinutes: 180,
            estimatedCost: 22,
            location: { name: 'Musée du Louvre', lat: 48.8606, lng: 2.3376 },
            imageKeyword: 'louvre museum',
            reasonForRecommendation: 'Unmatched historical scope spanning antiquity to the 19th century.',
            isOptional: false,
            travelTimeToNextMinutes: 10,
          },
          {
            name: 'Jardin des Tuileries & Cafe Angelina',
            description: 'Stroll through the manicured fountains of Tuileries and savor world-famous velvety hot chocolate and mont-blanc pastry.',
            category: 'food',
            startTime: '12:30',
            durationMinutes: 75,
            estimatedCost: 20,
            location: { name: 'Jardin des Tuileries', lat: 48.8638, lng: 2.3275 },
            imageKeyword: 'tuileries gardens paris',
            reasonForRecommendation: 'Classic Parisian leisurely midday pause.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Montmartre & Sacré-Cœur Sunset',
            description: 'Wander the cobblestone alleys of artists\' Montmartre and watch the sunset from the steps of the white basilica.',
            category: 'sightseeing',
            startTime: '16:00',
            durationMinutes: 120,
            estimatedCost: 0,
            location: { name: 'Sacré-Cœur Basilica', lat: 48.8867, lng: 2.3431 },
            imageKeyword: 'montmartre sacre coeur',
            reasonForRecommendation: 'The highest elevation in the city offering unmatched golden-hour vistas.',
            isOptional: false,
            travelTimeToNextMinutes: 25,
          },
        ],
      },
      {
        theme: 'Gothic Marvels & Historic Marais Quarter',
        activities: [
          {
            name: 'Cathédrale Notre-Dame & Sainte-Chapelle',
            description: 'Marvel at the 13th-century stained-glass jewel box of Sainte-Chapelle and the restored grandeur of Notre-Dame.',
            category: 'culture',
            startTime: '09:30',
            durationMinutes: 120,
            estimatedCost: 15,
            location: { name: 'Notre-Dame & Sainte-Chapelle', lat: 48.8530, lng: 2.3499 },
            imageKeyword: 'notre dame sainte chapelle',
            reasonForRecommendation: 'Gothic architecture at its absolute zenith.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Le Marais Artisan Boutiques & Falafel',
            description: 'Explore Renaissance mansions, contemporary art galleries, and taste world-famous Rue des Rosiers falafel.',
            category: 'food',
            startTime: '12:30',
            durationMinutes: 90,
            estimatedCost: 18,
            location: { name: 'Le Marais Historic District', lat: 48.8554, lng: 2.3655 },
            imageKeyword: 'le marais paris',
            reasonForRecommendation: 'Vibrant neighborhood mixing historic aristocracy with modern creative flair.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Arc de Triomphe & Champs-Élysées Evening',
            description: 'Stand beneath Napoleon\'s triumphal arch and gaze down twelve grand boulevards illuminated at dusk.',
            category: 'sightseeing',
            startTime: '18:00',
            durationMinutes: 90,
            estimatedCost: 16,
            location: { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950 },
            imageKeyword: 'arc de triomphe',
            reasonForRecommendation: 'Epic concluding panorama over the grand avenues of Paris.',
            isOptional: false,
            travelTimeToNextMinutes: 0,
          },
        ],
      },
    ],
  },
  tokyo: {
    overview: 'An electrifying journey blending high-speed neon futurism, serene Shinto shrines, and unparalleled culinary craft.',
    theme: 'Cyberpunk Skylines & Ancient Shinto Sanctuaries',
    tips: [
      'Get a digital Suica or Pasmo IC card on your phone for seamless train and metro transit.',
      'Convenience stores (7-Eleven, Lawson) have fresh gourmet onigiri and bentos.',
      'Tipping is not customary in Japan; polite "Arigato gozaimasu" is the highest compliment.',
      'Wear slip-on shoes as several traditional temples and restaurants require taking them off.',
    ],
    dayTemplates: [
      {
        theme: 'Historic Asakusa & Akihabara Neon',
        activities: [
          {
            name: 'Sensō-ji Temple & Nakamise Street',
            description: 'Tokyo\'s oldest Buddhist temple dating to 645 AD, entered through the iconic red Kaminarimon Gate.',
            category: 'culture',
            startTime: '09:00',
            durationMinutes: 120,
            estimatedCost: 10,
            location: { name: 'Sensō-ji Temple', lat: 35.7148, lng: 139.7967 },
            imageKeyword: 'sensoji temple tokyo',
            reasonForRecommendation: 'Captivating immersion into old Edo atmosphere.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Akihabara Electric Town Tech Walk',
            description: 'Explore multi-story electronics markets, retro arcade halls, and rare collectible boutiques.',
            category: 'shopping',
            startTime: '13:00',
            durationMinutes: 150,
            estimatedCost: 25,
            location: { name: 'Akihabara Electric Town', lat: 35.6984, lng: 139.7731 },
            imageKeyword: 'akihabara tokyo',
            reasonForRecommendation: 'The undisputed global capital of otaku subculture and consumer electronics.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Tokyo Skytree Sunset Panorama',
            description: 'Ascend Japan’s tallest structure for endless panoramic views extending to Mount Fuji on clear days.',
            category: 'sightseeing',
            startTime: '17:30',
            durationMinutes: 90,
            estimatedCost: 28,
            location: { name: 'Tokyo Skytree', lat: 35.7100, lng: 139.8107 },
            imageKeyword: 'tokyo skytree night',
            reasonForRecommendation: 'Dramatic twilight perspective over the boundless Kanto metropolis.',
            isOptional: false,
            travelTimeToNextMinutes: 0,
          },
        ],
      },
      {
        theme: 'Shibuya Scramble & Harajuku Fashion',
        activities: [
          {
            name: 'Meiji Jingu Forest Shrine',
            description: 'A serene evergreen sanctuary dedicated to Emperor Meiji set within 170 acres of tranquil sacred forest.',
            category: 'relaxation',
            startTime: '09:30',
            durationMinutes: 90,
            estimatedCost: 0,
            location: { name: 'Meiji Jingu Shrine', lat: 35.6764, lng: 139.6993 },
            imageKeyword: 'meiji shrine tokyo',
            reasonForRecommendation: 'An oasis of peace right next to Tokyo’s busiest shopping districts.',
            isOptional: false,
            travelTimeToNextMinutes: 10,
          },
          {
            name: 'Takeshita Street & Harajuku Vintage',
            description: 'Discover boundary-pushing youth fashion, kawaii desserts, and artisan vintage clothing boutiques.',
            category: 'shopping',
            startTime: '11:30',
            durationMinutes: 90,
            estimatedCost: 20,
            location: { name: 'Harajuku Takeshita Street', lat: 35.6702, lng: 139.7027 },
            imageKeyword: 'harajuku fashion',
            reasonForRecommendation: 'Unfiltered snapshot of creative contemporary Japanese street style.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Shibuya Crossing & Hachiko Plaza',
            description: 'Cross the world’s most famous pedestrian intersection and watch thousands navigate under giant neon screens.',
            category: 'sightseeing',
            startTime: '17:00',
            durationMinutes: 60,
            estimatedCost: 0,
            location: { name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7004 },
            imageKeyword: 'shibuya crossing tokyo',
            reasonForRecommendation: 'The quintessential pulse of Tokyo\'s modern heartbeat.',
            isOptional: false,
            travelTimeToNextMinutes: 10,
          },
          {
            name: 'Omoide Yokocho Yakitori Alleys',
            description: 'Dine in nostalgic post-war lantern-lit alleyways sampling charcoal-grilled yakitori skewers and draft beer.',
            category: 'food',
            startTime: '19:30',
            durationMinutes: 90,
            estimatedCost: 35,
            location: { name: 'Shinjuku Omoide Yokocho', lat: 35.6938, lng: 139.7003 },
            imageKeyword: 'tokyo yakitori alley',
            reasonForRecommendation: 'Unforgettable atmospheric dining with local workers and chefs.',
            isOptional: false,
            travelTimeToNextMinutes: 0,
          },
        ],
      },
    ],
  },
  barcelona: {
    overview: 'A vibrant Mediterranean journey through Antoni Gaudí’s surrealist architecture, sun-drenched beaches, and savory tapas bars.',
    theme: 'Modernist Wonders & Coastal Tapas Living',
    tips: [
      'Sagrada Família and Park Güell require advance tickets; same-day entries are rarely available.',
      'Lunch (la comida) is the largest meal, usually eaten between 14:00 and 16:00.',
      'Watch your belongings in crowded tourist spots like La Rambla and metro stations.',
      'TMB metro transit cards offer unlimited rides within Zone 1.',
    ],
    dayTemplates: [
      {
        theme: 'Gaudí\'s Architectural Revolution',
        activities: [
          {
            name: 'Basílica de la Sagrada Família',
            description: 'Gaze up at Gaudí’s awe-inspiring forest of stone pillars and radiant stained-glass lighting.',
            category: 'culture',
            startTime: '09:00',
            durationMinutes: 150,
            estimatedCost: 30,
            location: { name: 'Sagrada Família', lat: 41.4036, lng: 2.1744 },
            imageKeyword: 'sagrada familia barcelona',
            reasonForRecommendation: 'An architectural wonder unlike anything else on Earth.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Park Güell Mosaic Terraces',
            description: 'Explore whimsical stone viaducts, gingerbread gatehouses, and the famed multicolored salamander fountain.',
            category: 'sightseeing',
            startTime: '13:00',
            durationMinutes: 120,
            estimatedCost: 13,
            location: { name: 'Park Güell', lat: 41.4145, lng: 2.1527 },
            imageKeyword: 'park guell barcelona',
            reasonForRecommendation: 'Harmonious integration of nature, sculpture, and panoramic city vistas.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Passeig de Gràcia & Casa Batlló',
            description: 'Marvel at the undulating dragon-scale facade and bone-like balconies of Gaudí’s modernist residential triumph.',
            category: 'culture',
            startTime: '16:30',
            durationMinutes: 90,
            estimatedCost: 29,
            location: { name: 'Casa Batlló', lat: 41.3916, lng: 2.1649 },
            imageKeyword: 'casa batllo barcelona',
            reasonForRecommendation: 'One of the most imaginative architectural works ever conceived.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
        ],
      },
      {
        theme: 'Gothic Quarters & Mediterranean Coastline',
        activities: [
          {
            name: 'Barri Gòtic & Barcelona Cathedral',
            description: 'Get lost in a labyrinth of Roman ruins, secret courtyards, and 14th-century Gothic spires.',
            category: 'culture',
            startTime: '09:30',
            durationMinutes: 120,
            estimatedCost: 9,
            location: { name: 'Gothic Quarter', lat: 41.3839, lng: 2.1764 },
            imageKeyword: 'gothic quarter barcelona',
            reasonForRecommendation: 'The authentic historical root of Catalan civilization.',
            isOptional: false,
            travelTimeToNextMinutes: 10,
          },
          {
            name: 'Mercat de la Boqueria Tapas Lunch',
            description: 'Sample fresh Jamón Ibérico, sizzling gambas al ajillo, and tropical fruit smoothies inside the historic market.',
            category: 'food',
            startTime: '12:30',
            durationMinutes: 90,
            estimatedCost: 25,
            location: { name: 'Mercat de la Boqueria', lat: 41.3817, lng: 2.1716 },
            imageKeyword: 'boqueria market tapas',
            reasonForRecommendation: 'A sensory explosion of seasonal Mediterranean ingredients.',
            isOptional: false,
            travelTimeToNextMinutes: 20,
          },
          {
            name: 'Barceloneta Beachfront Sunset & Paella',
            description: 'Unwind along the palm-lined seaside promenade and taste authentic seafood paella right by the waves.',
            category: 'relaxation',
            startTime: '18:00',
            durationMinutes: 120,
            estimatedCost: 38,
            location: { name: 'Barceloneta Beach', lat: 41.3809, lng: 2.1895 },
            imageKeyword: 'barceloneta beach sunset',
            reasonForRecommendation: 'The perfect sea breeze conclusion to your Catalan experience.',
            isOptional: false,
            travelTimeToNextMinutes: 0,
          },
        ],
      },
    ],
  },
  default: {
    overview: 'A wonderful, meticulously tailored journey balancing landmark discovery, local gastronomy, and cultural immersion.',
    theme: 'Exploration & Cultural Discovery',
    tips: [
      'Carry a small amount of local currency for transit cards and street artisans.',
      'Download offline navigation maps before exploring unfamiliar districts.',
      'Major cultural attractions frequently require timed entry bookings in peak seasons.',
      'Seek out neighborhood eateries away from primary monuments for authentic quality and pricing.',
    ],
    dayTemplates: [
      {
        theme: 'City Highlights & Historic Orientation',
        activities: [
          {
            name: 'Historic City Center Walking Tour',
            description: 'Explore foundational monuments and secret alleyways with an engaging local storyteller.',
            category: 'sightseeing',
            startTime: '09:00',
            durationMinutes: 150,
            estimatedCost: 25,
            location: { name: 'Historic City Center' },
            imageKeyword: 'historic city tour',
            reasonForRecommendation: 'Provides critical architectural context and cultural orientation.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Central Food Market Discovery',
            description: 'Discover the culinary heartbeat of the city with dozens of local food artisans and vendors.',
            category: 'food',
            startTime: '12:00',
            durationMinutes: 90,
            estimatedCost: 20,
            location: { name: 'Central Food Market' },
            imageKeyword: 'local food market',
            reasonForRecommendation: 'Direct encounter with regional culinary tradition at fair prices.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'National Museum of Art & Heritage',
            description: 'Admire celebrated national collections, sculptures, and rotating historical exhibitions.',
            category: 'culture',
            startTime: '14:30',
            durationMinutes: 120,
            estimatedCost: 18,
            location: { name: 'National Museum' },
            imageKeyword: 'art museum gallery',
            reasonForRecommendation: 'Comprehensive dive into local artistry and civilization.',
            isOptional: false,
            travelTimeToNextMinutes: 15,
          },
          {
            name: 'Panoramic Sunset Viewpoint',
            description: 'Take in breathtaking panoramic golden-hour views over the city skyline.',
            category: 'sightseeing',
            startTime: '18:00',
            durationMinutes: 75,
            estimatedCost: 0,
            location: { name: 'Panoramic Viewpoint' },
            imageKeyword: 'sunset panoramic view',
            reasonForRecommendation: 'A serene visual punctuation mark to your first full day.',
            isOptional: false,
            travelTimeToNextMinutes: 0,
          },
        ],
      },
    ],
  },
};

const ACCOMMODATION_BY_STYLE = {
  budget: { type: 'hostel' as const, name: 'Boutique Social Hostel', pricePerNight: 35 },
  balanced: { type: 'hotel' as const, name: 'Centennial City Hotel', pricePerNight: 95 },
  comfort: { type: 'boutique' as const, name: 'Heritage Boutique Suites', pricePerNight: 175 },
  luxury: { type: 'resort' as const, name: 'Grand Luxury Palace', pricePerNight: 480 },
};

const PACKING_LIST = [
  {
    category: 'Documents & Wallet',
    items: [
      { name: 'Passport / National ID Card', essential: true },
      { name: 'Travel Insurance Documentation', essential: true },
      { name: 'Boarding Passes & Transport QR Codes', essential: true },
      { name: 'Multi-Currency Travel Debit Card', essential: true },
    ],
  },
  {
    category: 'Clothing & Comfort',
    items: [
      { name: 'Comfortable Arch-Support Walking Shoes', essential: true },
      { name: 'Breathable Weather-Adaptive Layers', essential: true },
      { name: 'Lightweight Packable Rain Jacket', essential: false },
      { name: 'Polarized Sunglasses & Sun Hat', essential: false },
    ],
  },
  {
    category: 'Tech & Electronics',
    items: [
      { name: 'Smartphone & Heavy-Duty Charging Cable', essential: true },
      { name: 'Universal International Travel Adapter', essential: true },
      { name: '10,000mAh Portable Power Bank', essential: true },
      { name: 'Noise-Cancelling Earbuds', essential: false },
    ],
  },
];

export function generateDemoItinerary(request: TripRequest): Itinerary {
  const { departureDate, returnDate, destination, travelStyle, numberOfTravellers } = request;

  const nights = Math.max(1, Math.floor(
    (new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  const destKey = destination.toLowerCase().trim();
  const matchedKey = Object.keys(DESTINATION_TEMPLATES).find(k => k !== 'default' && (destKey.includes(k) || k.includes(destKey)));
  const template = matchedKey ? DESTINATION_TEMPLATES[matchedKey] : DESTINATION_TEMPLATES.default;

  const budgetBreakdown = calculateBudget(request);
  const accom = ACCOMMODATION_BY_STYLE[travelStyle] || ACCOMMODATION_BY_STYLE.balanced;

  const days: Day[] = [];
  const costScale = numberOfTravellers;

  for (let i = 0; i < nights; i++) {
    const date = addDays(departureDate, i);
    const templateDay = template.dayTemplates[i % template.dayTemplates.length];

    const day: Day = {
      dayNumber: i + 1,
      date,
      theme: i === 0
        ? `Day 1: ${templateDay.theme}`
        : i === nights - 1
        ? `Day ${i + 1}: Farewell & Final Highlights`
        : `Day ${i + 1}: ${templateDay.theme}`,
      activities: templateDay.activities.map((act) => ({
        ...act,
        id: uuidv4(),
        estimatedCost: Math.round(act.estimatedCost * costScale),
      })),
      accommodation: {
        ...accom,
        location: { name: `${destination} Central ${accom.type}` },
        pricePerNight: Math.round(accom.pricePerNight * Math.ceil(numberOfTravellers / 2)),
      },
    };

    days.push(day);
  }

  const packingList = PACKING_LIST.map((cat) => ({
    category: cat.category,
    items: cat.items.map((item) => ({
      id: uuidv4(),
      name: item.name,
      checked: false,
      essential: item.essential,
    })),
  }));

  const itinerary: Itinerary = {
    destination,
    overview: `${template.overview} Your ${nights}-night journey to ${destination} has been mathematically balanced for ${numberOfTravellers} traveller(s) following your ${travelStyle} style preferences.`,
    days,
    budgetBreakdown,
    packingList,
    topTips: template.tips,
    localCurrency: 'Local Currency',
    emergencyContacts: [
      { name: 'Emergency Police & Medical', number: '112', type: 'Emergency' },
      { name: 'Tourist Information Helpline', number: '+33 1 49 52 42 63', type: 'Tourist Support' },
    ],
    isDemo: true,
  };

  // Guarantee all coordinates (lat/lng) are geocoded before returning
  return enrichItineraryCoordinates(itinerary);
}
