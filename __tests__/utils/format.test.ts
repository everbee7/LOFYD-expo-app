import { formatSearchedLocation } from '../../utils/format';

describe('formatSearchedLocation', () => {
  it('title-cases a city name', () => {
    expect(formatSearchedLocation('new york')).toBe('New York');
  });

  it('title-cases a multi-word city', () => {
    expect(formatSearchedLocation('fort worth')).toBe('Fort Worth');
  });

  it('lowercases then capitalizes mixed-case input', () => {
    expect(formatSearchedLocation('dAlLaS')).toBe('Dallas');
  });

  it('preserves a 5-digit zip code as-is', () => {
    expect(formatSearchedLocation('75201')).toBe('75201');
  });

  it('preserves coordinate string as-is', () => {
    expect(formatSearchedLocation('40.7128,-74.0060')).toBe('40.7128,-74.0060');
  });

  it('preserves negative coordinate string as-is', () => {
    expect(formatSearchedLocation('-33.8688,151.2093')).toBe('-33.8688,151.2093');
  });

  it('trims surrounding whitespace', () => {
    expect(formatSearchedLocation('  dallas  ')).toBe('Dallas');
  });

  it('collapses multiple internal spaces', () => {
    expect(formatSearchedLocation('new   york')).toBe('New York');
  });

  it('returns the input unchanged if falsy (null-like empty string)', () => {
    expect(formatSearchedLocation('')).toBe('');
  });
});
