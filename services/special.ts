import { apiRequest } from './api';
import {
  GetSpecialsRequest,
  GetSpecialsResponse,
  Special,
  SpecialTagResponse
} from '../types/location';

export const specialService = {
  // Get all specials with filters
  async getSpecials(params: GetSpecialsRequest): Promise<GetSpecialsResponse> {
    const queryParams = new URLSearchParams();

    // Required parameters
    if (params.locationType === 'coords') {
      queryParams.append('coords', params.coords || '');
    } else {
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

    return apiRequest<GetSpecialsResponse>(`/special?${queryParams.toString()}`, 'GET');
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
    const queryParams = new URLSearchParams();
    if (params.coords) {
      queryParams.append('coords', params.coords);
    } else if (params.location) {
      queryParams.append('location', params.location);
    }
    return apiRequest<SpecialTagResponse>(`/special/tags?${queryParams.toString()}`, 'GET');
  }
};