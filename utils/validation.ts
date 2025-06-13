// utils/validation.ts

/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns Returns true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 6)
 * @returns Returns true if password is valid, false otherwise
 */
export const validatePassword = (password: string, minLength: number = 6): boolean => {
  return password?.trim().length >= minLength;
};