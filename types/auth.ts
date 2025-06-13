
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  // Add any additional user fields as needed
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
  email: string;
  firstName: string;
  lastName: string;
  token: {
    accessToken: string;
    expiresAt: string;
    idToken: string;
    refreshToken: string;
    tokenType: string;
  },
  userId: string;
  username: string;
  zipcode: string;
}

export interface TokenLoginRequest {
  idToken: string;
}

export interface TokenLoginResponse {
  token: string;
  user?: User;
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

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Core auth methods
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signup: (signupData: SignUpRequest) => Promise<void>;
  confirmSignup: (email: string, confirmCode: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Password reset methods
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string, resetCode: string) => Promise<void>;
  
  // Token login
  loginWithToken: (idToken: string) => Promise<User>;
  
  // Utility methods
  clearError: () => void;
}