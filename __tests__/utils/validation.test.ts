import { validateEmail, validatePassword } from '../../utils/validation';

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true);
  });

  it('accepts email with plus alias', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('rejects email with no @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects email with no domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects email with no local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('trims whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ')).toBe(true);
  });
});

describe('validatePassword', () => {
  it('accepts password meeting default min length (6)', () => {
    expect(validatePassword('secret')).toBe(true);
  });

  it('accepts password longer than min length', () => {
    expect(validatePassword('supersecurepassword')).toBe(true);
  });

  it('rejects password below default min length', () => {
    expect(validatePassword('abc')).toBe(false);
  });

  it('accepts password meeting custom min length', () => {
    expect(validatePassword('abcdefgh', 8)).toBe(true);
  });

  it('rejects password below custom min length', () => {
    expect(validatePassword('short', 8)).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validatePassword('')).toBe(false);
  });
});
