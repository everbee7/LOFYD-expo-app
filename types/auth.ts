export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  birthDate?: string;
  eatOutFrequency?: string;
}

export interface SignUpRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  postalCode: string;
}

export interface SignUpResponse {
  message: string;
}

export interface ConfirmSignUpRequest {
  email: string;
  confirmCode: string;
}

export interface ConfirmSignUpResponse {
  message: string;
  token?: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: User;
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  token: {
    accessToken: string;
    expiresAt: string;
    idToken: string;
    refreshToken: string;
    tokenType: string;
  };
}

export interface TokenLoginRequest {
  token: string;
}

export interface TokenLoginResponse {
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface RefreshTokenRequest {
  userId: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  token: {
    accessToken: string;
    expiresAt: string;
    idToken: string;
    tokenType: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  resetCode: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserProfileRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  birthDate?: string;
  eatOutFrequency?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  birthDate?: string;
  eatOutFrequency?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isJustLoggedOut: boolean;
  error: string | null;
  
  // Core auth methods
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  
  // Token login
  loginWithToken: (idToken: string) => Promise<User>;
  refreshToken: (userId: string, refreshToken: string) => Promise<User>;
  
  // Sign up methods
  signup: (signupData: SignUpRequest) => Promise<void>;
  confirmSignup: (email: string, confirmCode: string) => Promise<void>;
  logout: () => Promise<void>;
  tapToLogin: () => void;
  
  // Password reset methods
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string, resetCode: string) => Promise<void>;
  
  // User profile methods
  updateUserData: (userData: UserProfileRequest) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
}