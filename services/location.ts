import { apiRequest } from './api';
import {
  GetSpecialsRequest,
  GetSpecialsResponse,
  Special
} from '../types/location';

export const locationService = {
  // Get all specials with filters
  async getSpecials(params: GetSpecialsRequest): Promise<GetSpecialsResponse> {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('location', params.location);
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

  // Get a specific special by ID
  async getSpecialById(id: string): Promise<Special> {
    return apiRequest<Special>(`/special/${id}`, 'GET');
  },

  // Helper method to build location string from coordinates
  buildCoordsLocation(latitude: number, longitude: number): string {
    return `${latitude},${longitude}`;
  },

  // Helper method to validate coordinates
  isValidCoordinates(coords: string): boolean {
    const parts = coords.split(',');
    if (parts.length !== 2) return false;
    
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  },

  // Helper method to validate postal code (basic US format)
  isValidPostalCode(postalCode: string): boolean {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    return usZipRegex.test(postalCode);
  },

  // Helper method to determine location type
  determineLocationType(location: string): 'locale' | 'postal' | 'coords' {
    if (this.isValidCoordinates(location)) {
      return 'coords';
    } else if (this.isValidPostalCode(location)) {
      return 'postal';
    } else {
      return 'locale';
    }
  }
};