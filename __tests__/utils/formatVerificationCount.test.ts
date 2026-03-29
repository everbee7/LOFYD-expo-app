import { formatVerificationCount } from '../../utils/formatVerificationCount';

describe('formatVerificationCount', () => {
  it('returns "0" for zero', () => {
    expect(formatVerificationCount(0)).toBe('0');
  });

  it('returns string for single digit', () => {
    expect(formatVerificationCount(9)).toBe('9');
  });

  it('returns string for three digits', () => {
    expect(formatVerificationCount(999)).toBe('999');
  });

  it('returns one-decimal k for 1000', () => {
    expect(formatVerificationCount(1000)).toBe('1.0k');
  });

  it('returns one-decimal k for 1500', () => {
    expect(formatVerificationCount(1500)).toBe('1.5k');
  });

  it('returns one-decimal k for 9900', () => {
    expect(formatVerificationCount(9900)).toBe('9.9k');
  });

  it('returns no-decimal k for 10000', () => {
    expect(formatVerificationCount(10000)).toBe('10k');
  });

  it('returns no-decimal k for 12345', () => {
    expect(formatVerificationCount(12345)).toBe('12k');
  });

  it('returns no-decimal k for 100000', () => {
    expect(formatVerificationCount(100000)).toBe('100k');
  });
});
