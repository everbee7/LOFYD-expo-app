export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Special {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  terms: string;
  locationId: string;
  coordinates: Coordinates;
  distFromInMiles: number;
  serviceType: string[];
  experience: string[];
  cuisine: string[];
  taste: string[];
  priceRange: number;
  images: string[];
  timezone: string;
  neighborhood: string;
  expireDate: string;
}

export interface GetSpecialsRequest {
  location: string;
  locationType: 'locale' | 'postal' | 'coords';
  radiusInMiles: number;
  sortBy: 'relevance' | 'distance' | 'favorites';
  serviceType?: ('dine-in' | 'take-out' | 'delivery')[];
  offset?: number;
  limit?: number;
  keywords?: string[];
  priceRange?: number[];
  experience?: string[];
  cuisine?: string[];
  taste?: string[];
}

export interface GetSpecialsResponse {
  specials: Special[];
  offset: number;
  limit: number;
  totalSize: number;
}

export interface LocationState {
  specials: Special[];
  currentSpecial: Special | null;
  isLoading: boolean;
  error: string | null;
  
  // Location search parameters
  currentLocation: string;
  locationType: 'locale' | 'postal' | 'coords';
  radiusInMiles: number;
  sortBy: 'relevance' | 'distance' | 'favorites';
  
  // Filters
  activeFilters: {
    serviceType: ('dine-in' | 'take-out' | 'delivery')[];
    keywords: string[];
    priceRange: number[];
    experience: string[];
    cuisine: string[];
    taste: string[];
  };
  
  // Pagination
  pagination: {
    offset: number;
    limit: number;
    totalSize: number;
  };
  
  // Core methods
  initialize: () => Promise<void>;
  getSpecials: (params: GetSpecialsRequest) => Promise<GetSpecialsResponse>;
  getSpecialById: (id: string) => Promise<Special>;
  loadMore: () => Promise<void>;
  
  // Filter methods
  setLocation: (location: string, locationType: 'locale' | 'postal' | 'coords') => void;
  setRadius: (radius: number) => void;
  setSortBy: (sortBy: 'relevance' | 'distance' | 'favorites') => void;
  setFilters: (filters: Partial<LocationState['activeFilters']>) => void;
  addFilter: (filterType: keyof LocationState['activeFilters'], value: string | number) => void;
  removeFilter: (filterType: keyof LocationState['activeFilters'], value: string | number) => void;
  clearFilters: () => void;
  
  // Search methods
  searchWithCurrentParams: () => Promise<void>;
  refreshSpecials: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  setCurrentSpecial: (special: Special | null) => void;
}