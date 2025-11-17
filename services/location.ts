import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import { apiRequest } from './api';
import {
  GetLocationsRequest,
  GetLocationsResponse,
  Location as LocationType,
  LocationTagResponse
} from '../types/location';

// Constants
export const LOCATION_PERMISSION_KEY = 'userLocationPermissionStatus';

export interface DeviceLocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export const buildLocationRequestUrl = (params: GetLocationsRequest): string => {
  const queryParams = new URLSearchParams();

  // Required parameters
  if (params.locationType === 'coords') {
    queryParams.append('coords', params.coords || '');
  } else {
    queryParams.append('coords', params.coords || '');
    queryParams.append('location', params.location || '');
  }
  queryParams.append('locationType', params.locationType);
  queryParams.append('radiusInMiles', params.radiusInMiles.toString());
  queryParams.append('sortBy', params.sortBy);

  // Optional parameters
  if (params.serviceType && params.serviceType.length > 0) {
    params.serviceType.forEach(type => queryParams.append('serviceType', type));
  }

  if (params.offset !== undefined) {
    queryParams.append('offset', params.offset.toString());
  }

  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }

  if (params.keywords && params.keywords.length > 0) {
    params.keywords.forEach(keyword => queryParams.append('keywords', keyword));
  }

  if (params.priceRange && params.priceRange.length > 0) {
    params.priceRange.forEach(price => queryParams.append('priceRange', price.toString()));
  }

  if (params.experience && params.experience.length > 0) {
    params.experience.forEach(exp => queryParams.append('experience', exp));
  }

  if (params.cuisine && params.cuisine.length > 0) {
    params.cuisine.forEach(cuisine => queryParams.append('cuisine', cuisine));
  }

  if (params.taste && params.taste.length > 0) {
    params.taste.forEach(taste => queryParams.append('taste', taste));
  }

  return `/location?${queryParams.toString()}`;
};

export const locationService = {
  // ==================== API METHODS (Existing) ====================

  /**
   * Get all locations with filters
   */
  async getLocations(params: GetLocationsRequest): Promise<GetLocationsResponse> {
    const endpoint = buildLocationRequestUrl(params);

    return apiRequest<GetLocationsResponse>(endpoint, 'GET');
  },

  /**
   * Get a specific location by ID
   */
  async getLocationById(id: string): Promise<LocationType> {
    return apiRequest<LocationType>(`/location/${id}`, 'GET');
  },

  /**
   * Get list of location search tags (experience, cuisine, taste)
   */
  async getLocationTags(params: { location?: string; coords?: string }): Promise<LocationTagResponse> {
    // Try cache first (24h TTL)
    const key = this._makeTagCacheKey('location', params);
    const cached = await this._getTagCache<LocationTagResponse>('location', key);
    console.log('getLocationTags cached', cached);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    if (params.coords) {
      queryParams.append('location', '');
      queryParams.append('coords', params.coords);
    } else if (params.location) {
      queryParams.append('location', params.location);
    }
    const data = await apiRequest<LocationTagResponse>(`/location/tags?${queryParams.toString()}`, 'GET');
    console.log('getLocationTags data', data);
    await this._setTagCache('location', key, data);
    return data;
  },

  /**
   * Get location search suggestions
   */
  async searchLocationSuggestions(location: string): Promise<{ locations: string[] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('location', location);
    return apiRequest<{ locations: string[] }>(`/location/search?${queryParams.toString()}`, 'GET');
  },

  /**
   * Helper method to build location string from coordinates
   */
  buildCoordsLocation(latitude: number, longitude: number): string {
    return `${latitude},${longitude}`;
  },

  /**
   * Helper method to validate coordinates
   */
  isValidCoordinates(coords: string): boolean {
    const parts = coords.split(',');
    if (parts.length !== 2) return false;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    return !isNaN(lat) && !isNaN(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180;
  },

  /**
   * Helper method to validate postal code (basic US format)
   */
  isValidPostalCode(postalCode: string): boolean {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    return usZipRegex.test(postalCode);
  },

  /**
   * Enhanced method to determine location type (merged from both versions)
   */
  determineLocationType(location: string): 'locale' | 'coords' {
    if (!location || location.trim() === '') {
      return 'locale';
    }

    const trimmed = location.trim();

    // Check for coordinates first
    if (this.isValidCoordinates(trimmed)) {
      return 'coords';
    }

    // Check for postal code
    if (this.isValidPostalCode(trimmed)) {
      return 'locale';
    }

    return 'locale';
  },

  // ==================== DEVICE LOCATION METHODS (New) ====================

  /**
   * Check if location permission is granted
   */
  async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  },

  /**
   * Request location permission from the user
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const rep = await Location.requestForegroundPermissionsAsync();
      console.log('requestLocationPermission', rep);
      await this.setStoredPermissionStatus(rep.status);
      return rep.status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      await this.setStoredPermissionStatus('denied');
      return false;
    }
  },

  /**
   * Get stored permission status from AsyncStorage
   */
  async getStoredPermissionStatus(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LOCATION_PERMISSION_KEY);
    } catch (error) {
      console.error('Error getting stored permission status:', error);
      return null;
    }
  },

  /**
   * Set stored permission status in AsyncStorage
   */
  async setStoredPermissionStatus(status: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, status);
    } catch (error) {
      console.error('Error setting stored permission status:', error);
    }
  },

  /**
   * Get current device location and return in format suitable for API
   */
  async getCurrentLocation(): Promise<DeviceLocationData | null> {
    try {
      // First check if location services are enabled on the device
      const servicesEnabled = await this.isLocationServicesEnabled();
      if (!servicesEnabled) {
        console.error('[getCurrentLocation] Location services are disabled on the device. Please enable location services (GPS) in your device settings.');
        return null;
      }

      // Check if permission is granted
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        console.error('[getCurrentLocation] Location permission not granted. Please grant location permission in app settings.');
        return null;
      }

      // Get current position with timeout to prevent hanging
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 10,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Location request timed out after 15 seconds')), 15000)
        ),
      ]);

      if (!location || !location.coords) {
        console.error('[getCurrentLocation] Invalid location data received');
        return null;
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error: any) {
      // Provide detailed error logging
      const errorMessage = error?.message || 'Unknown error';
      console.error('[getCurrentLocation] Error getting current location:', {
        message: errorMessage,
        code: error?.code,
        error,
      });

      // Check for common error scenarios
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        console.error('[getCurrentLocation] Location request timed out. This usually means:');
        console.error('  - GPS cannot get a fix (try going outside or near a window)');
        console.error('  - Location services are disabled');
        console.error('  - Device is in airplane mode');
      } else if (errorMessage.includes('permission') || error?.code === 'E_LOCATION_PERMISSION_DENIED') {
        console.error('[getCurrentLocation] Location permission issue. Please check app permissions in device settings.');
      } else if (errorMessage.includes('services') || error?.code === 'E_LOCATION_SERVICES_DISABLED') {
        console.error('[getCurrentLocation] Location services are disabled. Please enable GPS/location services in device settings.');
      }

      return null;
    }
  },

  /**
   * Get current location formatted for API calls
   */
  async getCurrentLocationForAPI(): Promise<string | null> {
    const location = await this.getCurrentLocation();
    if (!location) return null;

    return this.buildCoordsLocation(location.latitude, location.longitude);
  },

  /**
   * Check if location services are enabled on the device
   */
  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  },

  /**
   * Show alert asking user to enable location services
   */
  showLocationPermissionAlert(onEnable?: () => void): void {
    Alert.alert(
      'Location Services',
      'To find services near you, we need access to your location. Would you like to enable location services?',
      [
        {
          text: 'Enable Location',
          onPress: () => {
            if (onEnable) {
              onEnable();
            }
          }
        },
        {
          text: 'Not Now',
          style: 'cancel'
        }
      ]
    );
  },

  /**
   * Show alert directing user to device settings for location permission
   */
  showLocationSettingsAlert(): void {
    Alert.alert(
      'Location Permission Required',
      'Location services are required for location-based features. Please enable them in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings();
          }
        }
      ]
    );
  },

  /**
   * Comprehensive method to handle location permission flow
   */
  async handleLocationPermissionFlow(): Promise<boolean> {
    try {
      // Check if location services are enabled on device
      const servicesEnabled = await this.isLocationServicesEnabled();
      if (!servicesEnabled) {
        this.showLocationSettingsAlert();
        return false;
      }

      // Check current permission status
      const { canAskAgain, status } = await Location.getForegroundPermissionsAsync();
      console.log('status', canAskAgain, status);
      if (status === 'granted') {
        await this.setStoredPermissionStatus('granted');
        return true;
      } else {
        if (canAskAgain) {
          const granted = await this.requestLocationPermission();
          return granted;
        } else {
          this.showLocationSettingsAlert();
        }
      }

      // Permission was previously denied
      return false;
    } catch (error) {
      console.error('Error in location permission flow:', error);
      return false;
    }
  },

  /**
   * Sync location permission status between device and storage
   */
  async syncLocationPermissionStatus(): Promise<boolean> {
    try {
      const devicePermission = await this.checkLocationPermission();
      const storedStatus = await this.getStoredPermissionStatus();

      if (devicePermission) {
        // Device has permission, update storage if needed
        if (storedStatus !== 'granted') {
          await this.setStoredPermissionStatus('granted');
        }
        return true;
      } else {
        // Device doesn't have permission, update storage if needed
        if (storedStatus === 'granted') {
          await this.setStoredPermissionStatus('denied');
        }
        return false;
      }
    } catch (error) {
      console.error('Error syncing location permission status:', error);
      return false;
    }
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Get location for API call - either current location or provided location
   */
  async getLocationForAPI(useCurrentLocation: boolean, providedLocation?: string): Promise<string> {
    if (useCurrentLocation) {
      const currentLocation = await this.getCurrentLocationForAPI();
      return currentLocation || providedLocation || '';
    }
    return providedLocation || '';
  },

  /**
   * Get location type for API call
   */
  getLocationTypeForAPI(useCurrentLocation: boolean, providedLocation?: string): string {
    if (useCurrentLocation) {
      return 'coords';
    }
    return providedLocation ? this.determineLocationType(providedLocation) : 'locale';
  },

  // ==================== TAG CACHE (Private) ====================
  _tagTTLMs: 24 * 60 * 60 * 1000,
  _tagIndexKey: 'cache:index:locationTags',

  async clearTagCaches(): Promise<void> {
    try {
      const indexRaw = await AsyncStorage.getItem(this._tagIndexKey);
      if (indexRaw) {
        const keys: string[] = JSON.parse(indexRaw);
        if (Array.isArray(keys) && keys.length > 0) {
          await AsyncStorage.multiRemove(keys);
        }
      }
      await AsyncStorage.removeItem(this._tagIndexKey);
    } catch (e) {
      console.warn('Failed clearing location tag cache', e);
    }
  },

  _makeTagCacheKey(prefix: 'location', params: { location?: string; coords?: string }): string {
    const scope = params.coords
      ? `coords:${(params.coords || '').trim().toLowerCase()}`
      : `locale:${(params.location || '').trim().toLowerCase()}`;
    return `cache:${prefix}Tags:${scope}`;
  },

  async _getTagCache<T>(prefix: 'location', key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { timestamp: number; data: T };
      if (!parsed || typeof parsed.timestamp !== 'number') return null;
      const isFresh = Date.now() - parsed.timestamp < this._tagTTLMs;
      return isFresh ? parsed.data : null;
    } catch {
      return null;
    }
  },

  async _setTagCache<T>(prefix: 'location', key: string, data: T): Promise<void> {
    try {
      const payload = JSON.stringify({ timestamp: Date.now(), data });
      await AsyncStorage.setItem(key, payload);
      // update index
      const indexRaw = await AsyncStorage.getItem(this._tagIndexKey);
      const keys: string[] = indexRaw ? JSON.parse(indexRaw) : [];
      if (!keys.includes(key)) {
        keys.push(key);
        await AsyncStorage.setItem(this._tagIndexKey, JSON.stringify(keys));
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed writing location tag cache', e);
    }
  }
};