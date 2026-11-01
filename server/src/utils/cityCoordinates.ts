// Universal City & Landmark Geocoding Registry for TripPilot
// Provides realistic coordinates for world destinations, popular landmarks, and deterministic route dispersion.

export interface GeoCoords {
  lat: number;
  lng: number;
}

export const FAMOUS_CITIES: Record<string, GeoCoords> = {
  paris: { lat: 48.8566, lng: 2.3522 },
  france: { lat: 48.8566, lng: 2.3522 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  japan: { lat: 35.6762, lng: 139.6503 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  spain: { lat: 41.3851, lng: 2.1734 },
  bali: { lat: -8.4095, lng: 115.1889 },
  indonesia: { lat: -8.4095, lng: 115.1889 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  nyc: { lat: 40.7128, lng: -74.0060 },
  usa: { lat: 40.7128, lng: -74.0060 },
  rome: { lat: 41.9028, lng: 12.4964 },
  italy: { lat: 41.9028, lng: 12.4964 },
  santorini: { lat: 36.3932, lng: 25.4615 },
  greece: { lat: 36.3932, lng: 25.4615 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  london: { lat: 51.5074, lng: -0.1278 },
  uk: { lat: 51.5074, lng: -0.1278 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  netherlands: { lat: 52.3676, lng: 4.9041 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  germany: { lat: 52.5200, lng: 13.4050 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  australia: { lat: -33.8688, lng: 151.2093 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  thailand: { lat: 13.7563, lng: 100.5018 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  uae: { lat: 25.2048, lng: 55.2708 },
  'swiss alps': { lat: 46.6863, lng: 7.8632 },
  switzerland: { lat: 46.6863, lng: 7.8632 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  florence: { lat: 43.7696, lng: 11.2558 },
  venice: { lat: 45.4408, lng: 12.3155 },
  prague: { lat: 50.0755, lng: 14.4378 },
  vienna: { lat: 48.2082, lng: 16.3738 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  seoul: { lat: 37.5665, lng: 126.9780 },
  korea: { lat: 37.5665, lng: 126.9780 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  turkey: { lat: 41.0082, lng: 28.9784 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  canada: { lat: 43.6532, lng: -79.3832 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
};

export const FAMOUS_LANDMARKS: Record<string, GeoCoords> = {
  // Paris
  'eiffel tower': { lat: 48.8584, lng: 2.2945 },
  'tour eiffel': { lat: 48.8584, lng: 2.2945 },
  'champ de mars': { lat: 48.8556, lng: 2.2986 },
  'louvre': { lat: 48.8606, lng: 2.3376 },
  'musée du louvre': { lat: 48.8606, lng: 2.3376 },
  'montmartre': { lat: 48.8867, lng: 2.3431 },
  'sacré-cœur': { lat: 48.8867, lng: 2.3431 },
  'sacre coeur': { lat: 48.8867, lng: 2.3431 },
  'notre-dame': { lat: 48.8530, lng: 2.3499 },
  'notre dame': { lat: 48.8530, lng: 2.3499 },
  'musée d\'orsay': { lat: 48.8599, lng: 2.3265 },
  'musee d\'orsay': { lat: 48.8599, lng: 2.3265 },
  'arc de triomphe': { lat: 48.8738, lng: 2.2950 },
  'champs-élysées': { lat: 48.8698, lng: 2.3075 },
  'champs elysees': { lat: 48.8698, lng: 2.3075 },
  'sainte-chapelle': { lat: 48.8554, lng: 2.3450 },
  'jardin du luxembourg': { lat: 48.8462, lng: 2.3372 },
  'le marais': { lat: 48.8554, lng: 2.3655 },
  'seine': { lat: 48.8634, lng: 2.3015 },
  'latin quarter': { lat: 48.8500, lng: 2.3450 },
  'panthéon': { lat: 48.8462, lng: 2.3464 },

  // Tokyo
  'senso-ji': { lat: 35.7148, lng: 139.7967 },
  'asakusa': { lat: 35.7148, lng: 139.7967 },
  'shibuya crossing': { lat: 35.6595, lng: 139.7004 },
  'shibuya': { lat: 35.6595, lng: 139.7004 },
  'meiji shrine': { lat: 35.6764, lng: 139.6993 },
  'harajuku': { lat: 35.6702, lng: 139.7027 },
  'shinjuku gyoen': { lat: 35.6852, lng: 139.7100 },
  'shinjuku': { lat: 35.6938, lng: 139.7034 },
  'akihabara': { lat: 35.6984, lng: 139.7731 },
  'tsukiji': { lat: 35.6655, lng: 139.7708 },
  'tokyo skytree': { lat: 35.7100, lng: 139.8107 },
  'tokyo tower': { lat: 35.6586, lng: 139.7454 },
  'ginza': { lat: 35.6719, lng: 139.7648 },

  // Barcelona
  'sagrada família': { lat: 41.4036, lng: 2.1744 },
  'sagrada familia': { lat: 41.4036, lng: 2.1744 },
  'park güell': { lat: 41.4145, lng: 2.1527 },
  'park guell': { lat: 41.4145, lng: 2.1527 },
  'gothic quarter': { lat: 41.3839, lng: 2.1764 },
  'barcelona cathedral': { lat: 41.3839, lng: 2.1764 },
  'casa batlló': { lat: 41.3916, lng: 2.1649 },
  'casa batllo': { lat: 41.3916, lng: 2.1649 },
  'casa milà': { lat: 41.3953, lng: 2.1619 },
  'casa mila': { lat: 41.3953, lng: 2.1619 },
  'la rambla': { lat: 41.3817, lng: 2.1716 },
  'barceloneta': { lat: 41.3809, lng: 2.1895 },
  'montjuïc': { lat: 41.3688, lng: 2.1527 },

  // Bali
  'monkey forest': { lat: -8.5194, lng: 115.2632 },
  'ubud': { lat: -8.5069, lng: 115.2625 },
  'tegallalang': { lat: -8.4346, lng: 115.2787 },
  'tanah lot': { lat: -8.6212, lng: 115.0868 },
  'uluwatu': { lat: -8.8291, lng: 115.0849 },
  'seminyak': { lat: -8.6913, lng: 115.1580 },
  'mount batur': { lat: -8.2422, lng: 115.3753 },

  // New York
  'central park': { lat: 40.7738, lng: -73.9708 },
  'metropolitan museum': { lat: 40.7794, lng: -73.9632 },
  'times square': { lat: 40.7580, lng: -73.9855 },
  'empire state building': { lat: 40.7484, lng: -73.9857 },
  'brooklyn bridge': { lat: 40.7061, lng: -73.9969 },
  'high line': { lat: 40.7420, lng: -74.0080 },
  'statue of liberty': { lat: 40.6892, lng: -74.0445 },

  // Rome
  'colosseum': { lat: 41.8902, lng: 12.4922 },
  'roman forum': { lat: 41.8925, lng: 12.4853 },
  'trevi fountain': { lat: 41.9009, lng: 12.4833 },
  'pantheon': { lat: 41.8986, lng: 12.4769 },
  'vatican': { lat: 41.9029, lng: 12.4534 },
  'piazza navona': { lat: 41.8992, lng: 12.4731 },
  'trastevere': { lat: 41.8887, lng: 12.4707 },

  // Santorini
  'oia': { lat: 36.4618, lng: 25.3753 },
  'fira': { lat: 36.4167, lng: 25.4319 },
  'imerovigli': { lat: 36.4333, lng: 25.4222 },
  'red beach': { lat: 36.3533, lng: 25.3889 },
};

export function getCityCenter(destination: string): GeoCoords {
  const norm = destination.toLowerCase().trim();
  for (const [key, coords] of Object.entries(FAMOUS_CITIES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return coords;
    }
  }
  // Default fallback (Europe / Central Europe coordinates if unknown)
  return { lat: 48.8566, lng: 2.3522 };
}

export function resolveLocation(
  destination: string,
  locationName: string,
  dayNumber: number = 1,
  activityIndex: number = 0
): GeoCoords {
  const normLoc = (locationName || '').toLowerCase().trim();

  // 1. Direct landmark match
  for (const [key, coords] of Object.entries(FAMOUS_LANDMARKS)) {
    if (normLoc.includes(key) || key.includes(normLoc)) {
      return coords;
    }
  }

  // 2. City match with deterministic neighborhood distribution
  const center = getCityCenter(destination);
  const angle = (dayNumber * 2.1) + (activityIndex * 0.95);
  const dist = 0.007 + (activityIndex * 0.005) + ((dayNumber % 3) * 0.004);

  const cosLat = Math.cos((center.lat * Math.PI) / 180);
  const latOffset = Math.sin(angle) * dist;
  const lngOffset = (Math.cos(angle) * dist) / (cosLat || 1);

  return {
    lat: Number((center.lat + latOffset).toFixed(6)),
    lng: Number((center.lng + lngOffset).toFixed(6)),
  };
}

export function enrichItineraryCoordinates<T extends { days: any[]; destination: string }>(itinerary: T): T {
  if (!itinerary || !Array.isArray(itinerary.days)) return itinerary;

  const destination = itinerary.destination || 'Paris';
  const center = getCityCenter(destination);

  itinerary.days.forEach((day, dayIdx) => {
    const dayNumber = day.dayNumber || (dayIdx + 1);

    // Enrich activities
    if (Array.isArray(day.activities)) {
      day.activities.forEach((act: any, actIdx: number) => {
        if (!act.location) {
          act.location = { name: `${destination} Activity Spot` };
        }
        if (act.location.lat == null || act.location.lng == null) {
          const coords = resolveLocation(destination, act.location.name || act.name, dayNumber, actIdx);
          act.location.lat = coords.lat;
          act.location.lng = coords.lng;
        }
      });
    }

    // Enrich accommodation
    if (day.accommodation) {
      if (!day.accommodation.location) {
        day.accommodation.location = { name: `${destination} District Hotel` };
      }
      if (day.accommodation.location.lat == null || day.accommodation.location.lng == null) {
        day.accommodation.location.lat = Number((center.lat - 0.003).toFixed(6));
        day.accommodation.location.lng = Number((center.lng + 0.002).toFixed(6));
      }
    }
  });

  return itinerary;
}

