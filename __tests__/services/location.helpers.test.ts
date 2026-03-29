import { locationService } from '../../services/location';

describe('locationService.isValidCoordinates', () => {
  it('accepts valid lat/lng', () => {
    expect(locationService.isValidCoordinates('40.7128,-74.0060')).toBe(true);
  });

  it('accepts coords with spaces around comma (parseFloat ignores whitespace)', () => {
    expect(locationService.isValidCoordinates('40.7128, -74.0060')).toBe(true);
  });

  it('accepts boundary values: 0,0', () => {
    expect(locationService.isValidCoordinates('0,0')).toBe(true);
  });

  it('accepts max valid lat/lng', () => {
    expect(locationService.isValidCoordinates('90,180')).toBe(true);
  });

  it('accepts min valid lat/lng', () => {
    expect(locationService.isValidCoordinates('-90,-180')).toBe(true);
  });

  it('rejects latitude out of range', () => {
    expect(locationService.isValidCoordinates('91,0')).toBe(false);
  });

  it('rejects longitude out of range', () => {
    expect(locationService.isValidCoordinates('0,181')).toBe(false);
  });

  it('rejects non-numeric string', () => {
    expect(locationService.isValidCoordinates('dallas,tx')).toBe(false);
  });

  it('rejects single value with no comma', () => {
    expect(locationService.isValidCoordinates('40.7128')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(locationService.isValidCoordinates('')).toBe(false);
  });
});

describe('locationService.isValidPostalCode', () => {
  it('accepts 5-digit zip', () => {
    expect(locationService.isValidPostalCode('75201')).toBe(true);
  });

  it('accepts zip+4 format', () => {
    expect(locationService.isValidPostalCode('75201-1234')).toBe(true);
  });

  it('rejects 4-digit zip', () => {
    expect(locationService.isValidPostalCode('7520')).toBe(false);
  });

  it('rejects 6-digit zip', () => {
    expect(locationService.isValidPostalCode('752011')).toBe(false);
  });

  it('rejects letters', () => {
    expect(locationService.isValidPostalCode('ABCDE')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(locationService.isValidPostalCode('')).toBe(false);
  });
});

describe('locationService.determineLocationType', () => {
  it('returns coords for a valid coordinate string', () => {
    expect(locationService.determineLocationType('40.7128,-74.0060')).toBe('coords');
  });

  it('returns locale for a 5-digit zip code', () => {
    expect(locationService.determineLocationType('75201')).toBe('locale');
  });

  it('returns locale for a city name', () => {
    expect(locationService.determineLocationType('Dallas')).toBe('locale');
  });

  it('returns locale for empty string', () => {
    expect(locationService.determineLocationType('')).toBe('locale');
  });
});

describe('locationService.buildCoordsLocation', () => {
  it('formats lat and lng as a comma-separated string', () => {
    expect(locationService.buildCoordsLocation(40.7128, -74.006)).toBe('40.7128,-74.006');
  });

  it('handles zero values', () => {
    expect(locationService.buildCoordsLocation(0, 0)).toBe('0,0');
  });

  it('handles negative values', () => {
    expect(locationService.buildCoordsLocation(-33.8688, 151.2093)).toBe('-33.8688,151.2093');
  });
});

describe('locationService._makeTagCacheKey', () => {
  it('generates a coords-scoped cache key when coords are provided', () => {
    const key = locationService._makeTagCacheKey('location', { coords: '40.7128,-74.006' });
    expect(key).toBe('cache:locationTags:coords:40.7128,-74.006');
  });

  it('generates a locale-scoped cache key when only location is provided', () => {
    const key = locationService._makeTagCacheKey('location', { location: 'Dallas' });
    expect(key).toBe('cache:locationTags:locale:dallas');
  });

  it('lowercases the location value in the key', () => {
    const key = locationService._makeTagCacheKey('location', { location: 'NEW YORK' });
    expect(key).toBe('cache:locationTags:locale:new york');
  });

  it('prefers coords over location when both are provided', () => {
    const key = locationService._makeTagCacheKey('location', { coords: '0,0', location: 'Dallas' });
    expect(key).toBe('cache:locationTags:coords:0,0');
  });
});
