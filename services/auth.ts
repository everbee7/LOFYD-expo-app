
import { apiRequest } from './api';
import {
  SignUpRequest,
  SignUpResponse,
  ConfirmSignUpRequest,
  ConfirmSignUpResponse,
  LoginRequest,
  LoginResponse,
  TokenLoginRequest,
  TokenLoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User
} from '../types/auth';

// Auth service functions
export const authService = {
  // User Signup
  async signup(signupData: SignUpRequest): Promise<SignUpResponse> {
    return apiRequest<SignUpResponse>('/auth/signup', 'POST', signupData);
  },

  // Confirm Signup
  async confirmSignup(confirmData: ConfirmSignUpRequest): Promise<ConfirmSignUpResponse> {
    return apiRequest<ConfirmSignUpResponse>('/auth/confirm-signup', 'POST', confirmData);
  },

  // User Login
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', 'POST', loginData);
  },

  // Token Login
  async loginWithToken(tokenData: TokenLoginRequest): Promise<TokenLoginResponse> {
    return apiRequest<TokenLoginResponse>('/auth/login/token', 'POST', tokenData);
  },

  // Forgot Password
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', 'POST', forgotData);
  },

  // Reset Password
  async resetPassword(resetData: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return apiRequest<ResetPasswordResponse>('/auth/reset-password', 'POST', resetData);
  },

  // Get user data (you might need this for token validation)
  // Note: This endpoint is not in your API spec, you may need to add it or adjust
  async getUserData(): Promise<{ data: User }> {
    return apiRequest<{ data: User }>('/user/profile', 'GET');
  },
};