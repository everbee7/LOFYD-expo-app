import { apiRequest } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GetSpecialsRequest,
  GetSpecialsResponse,
  Special,
  SpecialTagResponse
} from '../types/location';

export const buildSpecialRequestUrl = (params: GetSpecialsRequest): string => {
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

  return `/special?${queryParams.toString()}`;
};

export const specialService = {
  // Get all specials with filters
  async getSpecials(params: GetSpecialsRequest): Promise<GetSpecialsResponse> {
    const endpoint = buildSpecialRequestUrl(params);

    return apiRequest<GetSpecialsResponse>(endpoint, 'GET');
  },

  // Get the specific specials by locationID
  async getSpecialsByLocationId(locationId: string): Promise<Special[]> {
    return apiRequest<Special[]>(`/special?locationId=${locationId}`, 'GET');
  },

  // Get a specific special by ID
  async getSpecialById(id: string): Promise<Special> {
    return apiRequest<Special>(`/special/${id}`, 'GET');
  },

  // Get list of special search tags (experience, cuisine, taste)
  async getSpecialTags(params: { location?: string; coords?: string }): Promise<SpecialTagResponse> {
    // Try cache first (24h TTL)
    const key = this._makeTagCacheKey('special', params);
    const cached = await this._getTagCache<SpecialTagResponse>('special', key);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    if (params.coords) {
      queryParams.append('coords', params.coords);
    } else if (params.location) {
      queryParams.append('location', params.location);
    }
    const data = await apiRequest<SpecialTagResponse>(`/special/tags?${queryParams.toString()}`, 'GET');
    await this._setTagCache('special', key, data);
    return data;
  },

  // ==================== TAG CACHE (Private) ====================
  _tagTTLMs: 24 * 60 * 60 * 1000,
  _tagIndexKey: 'cache:index:specialTags',

  async clearTagCaches(): Promise<void> {
    try {
      const indexRaw = await AsyncStorage.getItem(this._tagIndexKey as any);
      if (indexRaw) {
        const keys: string[] = JSON.parse(indexRaw);
        if (Array.isArray(keys) && keys.length > 0) {
          await AsyncStorage.multiRemove(keys);
        }
      }
      await AsyncStorage.removeItem(this._tagIndexKey as any);
    } catch (e) {
      console.warn('Failed clearing special tag cache', e);
    }
  },

  _makeTagCacheKey(prefix: 'special', params: { location?: string; coords?: string }): string {
    const scope = params.coords
      ? `coords:${(params.coords || '').trim().toLowerCase()}`
      : `locale:${(params.location || '').trim().toLowerCase()}`;
    return `cache:${prefix}Tags:${scope}`;
  },

  async _getTagCache<T>(prefix: 'special', key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key as any);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { timestamp: number; data: T };
      if (!parsed || typeof parsed.timestamp !== 'number') return null;
      const isFresh = Date.now() - parsed.timestamp < this._tagTTLMs;
      return isFresh ? parsed.data : null;
    } catch {
      return null;
    }
  },

  async _setTagCache<T>(prefix: 'special', key: string, data: T): Promise<void> {
    try {
      const payload = JSON.stringify({ timestamp: Date.now(), data });
      await AsyncStorage.setItem(key as any, payload);
      // update index
      const indexRaw = await AsyncStorage.getItem(this._tagIndexKey as any);
      const keys: string[] = indexRaw ? JSON.parse(indexRaw) : [];
      if (!keys.includes(key)) {
        keys.push(key);
        await AsyncStorage.setItem(this._tagIndexKey as any, JSON.stringify(keys));
      }
    } catch (e) {
      console.warn('Failed writing special tag cache', e);
    }
  }
};