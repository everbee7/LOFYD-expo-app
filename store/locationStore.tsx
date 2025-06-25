import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationService } from '../services/location';
import { specialService } from '../services/special';
import { LocationState, Special, Location, GetSpecialsRequest, GetLocationsRequest, FilterSetting } from '../types/location';

const DEFAULT_LOCATION = 'New York, NY';
const DEFAULT_RADIUS = 0.5;
const DEFAULT_LIMIT = 20;

const useLocationStore = create<LocationState>((set, get) => ({
  // Data
  specials: [],
  locations: [],
  currentSpecial: null,
  currentLocation: null,
  isLoading: false,
  error: null,

  // Search parameters
  searchLocation: DEFAULT_LOCATION,
  locationType: 'locale',
  radiusInMiles: DEFAULT_RADIUS,
  sortBy: 'relevance',

  // Active tab
  activeTab: 'Specials',

  // Filters
  activeFilters: {
    serviceType: ['dine-in', 'take-out', 'delivery'], // Default to all service types
    keywords: [],
    priceRange: [],
    experience: [],
    cuisine: [],
    taste: [],
  },

  // Filter Settings Log
  filterSettingLog: [],

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
      const savedTab = await AsyncStorage.getItem('activeTab');

      if (savedLocation) {
        const locationType = locationService.determineLocationType(savedLocation);
        set({
          searchLocation: savedLocation,
          locationType
        });
      }

      if (savedRadius) {
        set({ radiusInMiles: parseFloat(savedRadius) });
      }

      if (savedSortBy) {
        set({ sortBy: savedSortBy as 'relevance' | 'distance' | 'favorites' });
      }

      if (savedTab) {
        set({ activeTab: savedTab as 'Specials' | 'Locations' });
      }

      // Load saved filter settings from AsyncStorage
      const savedFilterSettings = await AsyncStorage.getItem('filterSettingLog');
      if (savedFilterSettings) {
        set({ filterSettingLog: JSON.parse(savedFilterSettings) });
      }

      // Load initial data
      await get().searchWithCurrentParams();

    } catch (error) {
      console.error('Failed to initialize location store:', error);
      set({ error: 'Failed to initialize location services' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Set active tab
  setActiveTab: (tab: 'Specials' | 'Locations') => {
    set({
      activeTab: tab,
      pagination: { ...get().pagination, offset: 0 } // Reset pagination
    });
    AsyncStorage.setItem('activeTab', tab);
    // Trigger search with current params for the new tab
    get().searchWithCurrentParams();
  },

  // Get specials with current parameters
  getSpecials: async (params: GetSpecialsRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await specialService.getSpecials(params);

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

  // Get locations with current parameters
  getLocations: async (params: GetLocationsRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await locationService.getLocations(params);

      set({
        locations: response.locations,
        pagination: {
          offset: response.offset,
          limit: response.limit,
          totalSize: response.totalSize,
        },
        isLoading: false,
      });

      return response;
    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to fetch locations';
      set({ isLoading: false, error: errMsg });
      throw error;
    }
  },

  // Get a specific special by ID
  getSpecialById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const special = await specialService.getSpecialById(id);

      set({ currentSpecial: special, isLoading: false });

      return special;
    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to fetch special';
      set({ isLoading: false, error: errMsg });
      throw error;
    }
  },

  // Get a specific location by ID
  getLocationById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const location = await locationService.getLocationById(id);

      set({ currentLocation: location, isLoading: false });

      return location;
    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to fetch location';
      set({ isLoading: false, error: errMsg });
      throw error;
    }
  },

  // Load more data (pagination)
  loadMore: async () => {
    const { pagination, searchLocation, locationType, radiusInMiles, sortBy, activeFilters, activeTab } = get();

    if (pagination.offset >= pagination.totalSize) {
      return; // No more data to load
    }

    try {
      set({ isLoading: true });

      if (activeTab === 'Specials') {
        const params: GetSpecialsRequest = {
          location: searchLocation,
          locationType,
          radiusInMiles,
          sortBy,
          offset: pagination.offset,
          limit: pagination.limit,
          ...activeFilters,
        };

        const response = await specialService.getSpecials(params);
        const currentSpecials = get().specials;

        set({
          specials: [...currentSpecials, ...response.specials],
          pagination: {
            offset: response.offset,
            limit: response.limit,
            totalSize: response.totalSize,
          },
          isLoading: false,
        });
      } else {
        const params: GetLocationsRequest = {
          location: searchLocation,
          locationType,
          radiusInMiles,
          sortBy,
          offset: pagination.offset,
          limit: pagination.limit,
          serviceType: activeFilters.serviceType,
        };

        const response = await locationService.getLocations(params);
        const currentLocations = get().locations;

        set({
          locations: [...currentLocations, ...response.locations],
          pagination: {
            offset: response.offset,
            limit: response.limit,
            totalSize: response.totalSize,
          },
          isLoading: false,
        });
      }

    } catch (error: any) {
      const errMsg = error?.data?.error || error?.message || error || 'Failed to load more data';
      set({ isLoading: false, error: errMsg });
    }
  },

  // Set location and save to AsyncStorage
  setLocation: (location: string, locationType: 'locale' | 'postal' | 'coords') => {
    set({
      searchLocation: location,
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
        serviceType: [], // Reset to all service types
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
    const { searchLocation, locationType, radiusInMiles, sortBy, activeFilters, pagination, activeTab } = get();

    if (activeTab === 'Specials') {
      const params: GetSpecialsRequest = {
        location: searchLocation,
        locationType,
        radiusInMiles,
        sortBy,
        offset: 0, // Always start from beginning for new search
        limit: pagination.limit,
        ...activeFilters,
      };

      await get().getSpecials(params);
    } else {
      const params: GetLocationsRequest = {
        location: searchLocation,
        locationType,
        radiusInMiles,
        sortBy,
        offset: 0, // Always start from beginning for new search
        limit: pagination.limit,
        serviceType: activeFilters.serviceType,
      };

      await get().getLocations(params);
    }
  },

  // Refresh data (reload current search)
  refreshData: async () => {
    await get().searchWithCurrentParams();
  },


  // Save current filter setting
  saveCurrentFilterSetting: (name: string) => {
    const { activeTab, searchLocation, radiusInMiles, sortBy, activeFilters, filterSettingLog } = get();

    const newSetting: FilterSetting = {
      id: Date.now().toString(),
      name: name.trim(),
      timestamp: Date.now(),
      activeTab,
      searchLocation,
      radiusInMiles,
      sortBy,
      activeFilters: JSON.parse(JSON.stringify(activeFilters)), // Deep copy
    };

    const updatedLog = [newSetting, ...filterSettingLog];
    set({ filterSettingLog: updatedLog });

    // Save to AsyncStorage
    AsyncStorage.setItem('filterSettingLog', JSON.stringify(updatedLog));
  },

  // Apply saved filter setting
  applySavedFilterSetting: (settingId: string) => {
    const { filterSettingLog } = get();
    const setting = filterSettingLog.find(s => s.id === settingId);

    if (setting) {
      // Apply all settings from the saved filter
      set({
        activeTab: setting.activeTab,
        searchLocation: setting.searchLocation,
        radiusInMiles: setting.radiusInMiles,
        sortBy: setting.sortBy,
        activeFilters: JSON.parse(JSON.stringify(setting.activeFilters)), // Deep copy
        pagination: { ...get().pagination, offset: 0 } // Reset pagination
      });

      // Save location to AsyncStorage
      AsyncStorage.setItem('userLocation', setting.searchLocation);
      AsyncStorage.setItem('searchRadius', setting.radiusInMiles.toString());
      AsyncStorage.setItem('sortPreference', setting.sortBy);
      AsyncStorage.setItem('activeTab', setting.activeTab);

      // Trigger search with applied settings
      get().searchWithCurrentParams();
    }
  },

  // Delete filter setting
  deleteFilterSetting: (settingId: string) => {
    const { filterSettingLog } = get();
    const updatedLog = filterSettingLog.filter(s => s.id !== settingId);
    set({ filterSettingLog: updatedLog });

    // Save to AsyncStorage
    AsyncStorage.setItem('filterSettingLog', JSON.stringify(updatedLog));
  },

  // Clear all filter settings
  clearFilterSettingLog: () => {
    set({ filterSettingLog: [] });
    AsyncStorage.removeItem('filterSettingLog');
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set current special
  setCurrentSpecial: (special: Special | null) => {
    set({ currentSpecial: special });
  },

  // Set current location
  setCurrentLocation: (location: Location | null) => {
    set({ currentLocation: location });
  }
}));

export default useLocationStore;