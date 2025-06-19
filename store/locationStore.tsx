import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationService } from '../services/location';
import { LocationState, Special, GetSpecialsRequest } from '../types/location';

const DEFAULT_LOCATION = 'New York, NY';
const DEFAULT_RADIUS = 10;
const DEFAULT_LIMIT = 20;

const useLocationStore = create<LocationState>((set, get) => ({
  specials: [],
  currentSpecial: null,
  isLoading: false,
  error: null,
  
  // Location search parameters
  currentLocation: DEFAULT_LOCATION,
  locationType: 'locale',
  radiusInMiles: DEFAULT_RADIUS,
  sortBy: 'relevance',
  
  // Filters
  activeFilters: {
    serviceType: ['dine-in', 'take-out', 'delivery'], // Default to all service types
    keywords: [],
    priceRange: [],
    experience: [],
    cuisine: [],
    taste: [],
  },
  
  // Pagination
  pagination: {
    offset: 0,
    limit: DEFAULT_LIMIT,
    totalSize: 0,
  },

  // Initialize the store
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Load saved preferences from AsyncStorage
      const savedLocation = await AsyncStorage.getItem('userLocation');
      const savedRadius = await AsyncStorage.getItem('searchRadius');
      const savedSortBy = await AsyncStorage.getItem('sortPreference');
      
      if (savedLocation) {
        const locationType = locationService.determineLocationType(savedLocation);
        set({ 
          currentLocation: savedLocation, 
          locationType 
        });
      }
      
      if (savedRadius) {
        set({ radiusInMiles: parseFloat(savedRadius) });
      }
      
      if (savedSortBy) {
        set({ sortBy: savedSortBy as 'relevance' | 'distance' | 'favorites' });
      }
      
      // Load initial specials
      await get().searchWithCurrentParams();
      
    } catch (error) {
      console.error('Failed to initialize location store:', error);
      set({ error: 'Failed to initialize location services' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Get specials with current parameters
  getSpecials: async (params: GetSpecialsRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await locationService.getSpecials(params);
      
      set({
        specials: response.specials,
        pagination: {
          offset: response.offset,
          limit: response.limit,
          totalSize: response.totalSize,
        },
        isLoading: false,
      });
      
      return response;
    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to fetch specials';
      set({ isLoading: false, error: errMsg });
      throw error;
    }
  },

  // Get a specific special by ID
  getSpecialById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const special = await locationService.getSpecialById(id);
      
      set({ currentSpecial: special, isLoading: false });
      
      return special;
    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to fetch special';
      set({ isLoading: false, error: errMsg });
      throw error;
    }
  },

  // Load more specials (pagination)
  loadMore: async () => {
    const { pagination, currentLocation, locationType, radiusInMiles, sortBy, activeFilters, specials } = get();
    
    if (pagination.offset >= pagination.totalSize) {
      return; // No more data to load
    }
    
    try {
      set({ isLoading: true });
      
      const params: GetSpecialsRequest = {
        location: currentLocation,
        locationType,
        radiusInMiles,
        sortBy,
        offset: pagination.offset,
        limit: pagination.limit,
        ...activeFilters,
      };
      
      const response = await locationService.getSpecials(params);
      
      set({
        specials: [...specials, ...response.specials],
        pagination: {
          offset: response.offset,
          limit: response.limit,
          totalSize: response.totalSize,
        },
        isLoading: false,
      });
      
    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to load more specials';
      set({ isLoading: false, error: errMsg });
    }
  },

  // Set location and save to AsyncStorage
  setLocation: (location: string, locationType: 'locale' | 'postal' | 'coords') => {
    set({ 
      currentLocation: location, 
      locationType,
      pagination: { ...get().pagination, offset: 0 } // Reset pagination
    });
    AsyncStorage.setItem('userLocation', location);
  },

  // Set search radius
  setRadius: (radius: number) => {
    set({ 
      radiusInMiles: radius,
      pagination: { ...get().pagination, offset: 0 } // Reset pagination
    });
    AsyncStorage.setItem('searchRadius', radius.toString());
  },

  // Set sort preference
  setSortBy: (sortBy: 'relevance' | 'distance' | 'favorites') => {
    set({ 
      sortBy,
      pagination: { ...get().pagination, offset: 0 } // Reset pagination
    });
    AsyncStorage.setItem('sortPreference', sortBy);
  },

  // Set multiple filters at once
  setFilters: (filters: Partial<LocationState['activeFilters']>) => {
    set({
      activeFilters: { ...get().activeFilters, ...filters },
      pagination: { ...get().pagination, offset: 0 } // Reset pagination
    });
  },

  // Add a single filter
  addFilter: (filterType: keyof LocationState['activeFilters'], value: string | number) => {
    const currentFilters = get().activeFilters;
    
    if (filterType === 'serviceType') {
      const serviceValue = value as 'dine-in' | 'take-out' | 'delivery';
      const currentServiceTypes = currentFilters.serviceType;
      if (!currentServiceTypes.includes(serviceValue)) {
        set({
          activeFilters: {
            ...currentFilters,
            serviceType: [...currentServiceTypes, serviceValue],
          },
          pagination: { ...get().pagination, offset: 0 }
        });
      }
    } else {
      const currentFilterArray = currentFilters[filterType] as (string | number)[];
      if (!currentFilterArray.includes(value)) {
        set({
          activeFilters: {
            ...currentFilters,
            [filterType]: [...currentFilterArray, value],
          },
          pagination: { ...get().pagination, offset: 0 }
        });
      }
    }
  },

  // Remove a single filter
  removeFilter: (filterType: keyof LocationState['activeFilters'], value: string | number) => {
    const currentFilters = get().activeFilters;
    
    if (filterType === 'serviceType') {
      const serviceValue = value as 'dine-in' | 'take-out' | 'delivery';
      const currentServiceTypes = currentFilters.serviceType;
      set({
        activeFilters: {
          ...currentFilters,
          serviceType: currentServiceTypes.filter(item => item !== serviceValue),
        },
        pagination: { ...get().pagination, offset: 0 }
      });
    } else {
      const currentFilterArray = currentFilters[filterType] as (string | number)[];
      set({
        activeFilters: {
          ...currentFilters,
          [filterType]: currentFilterArray.filter(item => item !== value),
        },
        pagination: { ...get().pagination, offset: 0 }
      });
    }
  },

  // Clear all filters
  clearFilters: () => {
    set({
      activeFilters: {
        serviceType: ['dine-in', 'take-out', 'delivery'], // Reset to all service types
        keywords: [],
        priceRange: [],
        experience: [],
        cuisine: [],
        taste: [],
      },
      pagination: { ...get().pagination, offset: 0 } // Reset pagination
    });
  },

  // Search with current parameters
  searchWithCurrentParams: async () => {
    const { currentLocation, locationType, radiusInMiles, sortBy, activeFilters, pagination } = get();
    
    const params: GetSpecialsRequest = {
      location: currentLocation,
      locationType,
      radiusInMiles,
      sortBy,
      offset: 0, // Always start from beginning for new search
      limit: pagination.limit,
      ...activeFilters,
    };
    
    await get().getSpecials(params);
  },

  // Refresh specials (reload current search)
  refreshSpecials: async () => {
    await get().searchWithCurrentParams();
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set current special
  setCurrentSpecial: (special: Special | null) => {
    set({ currentSpecial: special });
  },
}));

export default useLocationStore;