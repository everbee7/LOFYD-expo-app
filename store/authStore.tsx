import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';
import { AuthState, User, SignUpRequest } from '../types/auth';

const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isLoading: true,
	error: null,

	// Initialize the store by checking for existing auth
	initialize: async () => {
		try {
			set({ isLoading: true });
			const token = await AsyncStorage.getItem('userToken');
			console.log('token', token);

			if (token) {
				try {
					// const userData = await authService.getUserData();
					// set({ user: userData.data, isLoading: false });
					set({ user: {
						"id": "545894b8-4001-702e-a546-b67594ba01c9",
						"email": "creativemoderndev0831+1@gmail.com",
						"firstName": "123",
						"lastName": "123",
						"postalCode": "12345"
					}, isLoading: false });
				} catch (error) {
					// Token might be invalid, remove it
					await AsyncStorage.removeItem('userToken');
					set({ user: null, isLoading: false });
				}
			} else {
				set({ isLoading: false });
			}
		} catch (error) {
			console.error('Failed to initialize auth:', error);
			set({ isLoading: false, error: 'Failed to initialize authentication' });
		}
	},

	// Login method
	login: async (email: string, password: string): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const response = await authService.login({ email, password });

			console.log(response);
			// Store token
			await AsyncStorage.setItem('userToken', response.token.accessToken);

			const user = {
				id: response.userId,
				email: response.email,
				firstName: response.firstName,
				lastName: response.lastName,
				postalCode: response.zipcode,
			}

			set({ user: user, error: null });

			return user;
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Login failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Signup method
	signup: async (signupData: SignUpRequest): Promise<void> => {
		try {
			set({ isLoading: true, error: null });

			await authService.signup(signupData);

			set({ isLoading: false });
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Signup failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Confirm signup method
	confirmSignup: async (email: string, confirmCode: string): Promise<void> => {
		try {
			set({ isLoading: true, error: null });

			await authService.confirmSignup({ email, confirmCode });

			set({ isLoading: false });
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Confirmation failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Logout method
	logout: async (): Promise<void> => {
		try {
			await AsyncStorage.removeItem('userToken');
			set({ user: null, error: null });
		} catch (error: any) {
			console.error('Failed to logout:', error);
			// Still clear user state even if AsyncStorage fails
			set({ user: null });
		}
	},

	// Forgot password method
	forgotPassword: async (email: string): Promise<void> => {
		try {
			set({ isLoading: true, error: null });

			await authService.forgotPassword({ email });

			set({ isLoading: false });
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Password reset request failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Reset password method
	resetPassword: async (email: string, password: string, resetCode: string): Promise<void> => {
		try {
			set({ isLoading: true, error: null });

			await authService.resetPassword({ email, password, resetCode });

			set({ isLoading: false });
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Password reset failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Token login method
	loginWithToken: async (idToken: string): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const response = await authService.loginWithToken({ idToken });

			await AsyncStorage.setItem('userToken', response.token);

			if (response.user) {
				set({ user: response.user, isLoading: false });
				return response.user;
			}

			// Fetch user data if not included
			const userData = await authService.getUserData();
			set({ user: userData.data, isLoading: false });
			return userData.data;

		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Token login failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Clear error
	clearError: () => {
		set({ error: null });
	},
}));

export default useAuthStore;