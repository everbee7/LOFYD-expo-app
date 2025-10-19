export interface Coordinates {
  Latitude: number;
  Longitude: number;
}

export type LocationType = 'locale' | 'coords';
export type ServiceType = 'dine-in' | 'take-out' | 'delivery';
export type SortType = 'relevance' | 'distance' | 'favorites';
export type HourType = {
  open: string;
  close: string;
}

export interface DailyHours {
  day: string;
  isClosed: boolean;
  times: HourType[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  coordinates: Coordinates;
  distFromInMiles: number;
  locationHours: DailyHours[];
  serviceType: string[];
  experience: string[];
  cuisine: string[];
  taste: string[];
  priceRange: number;
  images: string[];
  timezone: string;
  neighborhood: string;
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
  location?: string;
  coords?: string;
  locationType: LocationType;
  radiusInMiles: number;
  sortBy: SortType;
  serviceType?: ServiceType[];
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

export interface GetLocationsRequest {
  location?: string;
  coords?: string;
  locationType: LocationType;
  radiusInMiles: number;
  sortBy: SortType;
  serviceType?: ServiceType[];
  offset?: number;
  limit?: number;
}

export interface GetLocationsResponse {
  locations: Location[];
  offset: number;
  limit: number;
  totalSize: number;
}

// Tag responses for filters
export interface LocationTagResponse {
  experience: string[];
  cuisine: string[];
  taste: string[];
}

export interface SpecialTagResponse {
  experience: string[];
  cuisine: string[];
  taste: string[];
}

export interface FilterSetting {
  id: string;
  name: string;
  timestamp: number;
  activeTab: 'Specials' | 'Locations';
  searchLocation: string;
  radiusInMiles: number;
  sortBy: SortType;
  isCurrentLocation: boolean | null;
  activeFilters: {
    serviceType: ServiceType[];
    keywords: string[];
    priceRange: number[];
    experience: string[];
    cuisine: string[];
    taste: string[];
  };
}

export interface LocationState {
  // Data
  specials: Special[];
  locations: Location[];
  currentSpecial: Special | null;
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;

  // Search parameters
  searchLocation: string;
  searchedLocation: string;
  isCurrentLocation: boolean | null;
  locationType: LocationType;
  radiusInMiles: number;
  sortBy: SortType;

  // Device location (from GPS)
  deviceLocation: string;
  deviceLocationType: LocationType;

  // Active tab
  activeTab: 'Specials' | 'Locations';

  // Filters
  activeFilters: {
    serviceType: ServiceType[];
    keywords: string[];
    priceRange: number[];
    experience: string[];
    cuisine: string[];
    taste: string[];
  };

  // Filter Settings Log
  filterSettingLog: FilterSetting[];

  // Pagination
  pagination: {
    offset: number;
    limit: number;
    totalSize: number;
  };

  // Core methods
  initialize: () => Promise<void>;
  getSpecials: (params: GetSpecialsRequest) => Promise<GetSpecialsResponse>;
  getLocations: (params: GetLocationsRequest) => Promise<GetLocationsResponse>;
  getSpecialById: (id: string) => Promise<Special>;
  getLocationById: (id: string) => Promise<Location>;
  loadMore: () => Promise<void>;

  // Tab methods
  setActiveTab: (tab: 'Specials' | 'Locations') => void;

  // Filter methods
  setLocation: (location: string, locationType: LocationType) => void;
  setIsCurrentLocation: (isTrue: boolean) => void;
  setDeviceLocation: (location: string, locationType: LocationType) => void;
  setRadius: (radius: number) => void;
  setSortBy: (sortBy: SortType) => void;
  setFilters: (filters: Partial<LocationState['activeFilters']>) => void;
  addFilter: (filterType: keyof LocationState['activeFilters'], value: string | number) => void;
  removeFilter: (filterType: keyof LocationState['activeFilters'], value: string | number) => void;
  clearFilters: () => void;

  // Search methods
  searchWithCurrentParams: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Helper method to get effective location
  getEffectiveLocation: () => Promise<{ location: string; locationType: LocationType }>;

  // New methods for filter settings
  saveCurrentFilterSetting: (name: string) => void;
  applySavedFilterSetting: (settingId: string) => void;
  deleteFilterSetting: (settingId: string) => void;
  clearFilterSettingLog: () => void;

  // Utility methods
  clearError: () => void;
  setCurrentSpecial: (special: Special | null) => void;
  setCurrentLocation: (location: Location | null) => void;
}