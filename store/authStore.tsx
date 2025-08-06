import { Alert } from 'react-native';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { authService } from '../services/auth';
import { BIOMETRIC_USER_ID, BIOMETRIC_USER_REFRESH_TOKEN_KEY, BIOMETRIC_USER_TOKEN_KEY, biometricService } from '../services/biometric';
import { AuthState, User, SignUpRequest, UserProfileRequest } from '../types/auth';
import { locationService } from '@/services/location';

const BIOMETRIC_ALARM_AT_FIRST_KEY = 'BIOMETRIC_ALARM_AT_FIRST_KEY';

const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isJustLoggedOut: false,
	isPasswordLogin: false,
	isLoading: true,
	error: null,

	// Initialize the store by checking for existing auth
	initialize: async () => {
		try {
			set({ isLoading: true });
			const idToken = await AsyncStorage.getItem('idToken');

			if (idToken) {
				try {
					const data = await authService.getUserData();
					console.log('data', data);
					set({
						user: {
							...data,
							userId: data.id
						}, isLoading: false
					});
				} catch (error) {
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

			const user = {
				userId: response.userId,
				email: response.email,
				firstName: response.firstName,
				lastName: response.lastName,
				postalCode: response.postalCode,
			}

			// Store token & simple userInfo
			await AsyncStorage.setItem('idToken', response.token.idToken);
			await AsyncStorage.setItem('userId', response.userId);
			await AsyncStorage.setItem('accessToken', response.token.accessToken);
			await AsyncStorage.setItem('refreshToken', response.token.refreshToken);
			// Update Biometric data
			await AsyncStorage.setItem(BIOMETRIC_USER_ID, response.userId);
			await AsyncStorage.setItem(BIOMETRIC_USER_TOKEN_KEY, response.token.idToken);
			await AsyncStorage.setItem(BIOMETRIC_USER_REFRESH_TOKEN_KEY, response.token.refreshToken);

			// Update biometric tokens if biometric is enabled
			await biometricService.updateBiometricTokens(
				response.userId,
				response.token.idToken,
				response.token.refreshToken
			);

			// Handle location permission on first login
			const storedPermissionStatus = await locationService.getStoredPermissionStatus();
			console.log("storedPermissionStatus", storedPermissionStatus);
			// Check if this is first time or if user previously allowed location
			if (storedPermissionStatus === null) {
				// Check current device permission status
				const currentPermission = await locationService.checkLocationPermission();

				// If permission not granted yet, request it
				if (!currentPermission) {
					try {
						const locationGranted = await locationService.handleLocationPermissionFlow();
						console.log('Location permission granted:', locationGranted);
					} catch (error) {
						console.error('Error requesting location permission:', error);
					}
				} else {
					// Permission already granted, just update storage
					await locationService.setStoredPermissionStatus('granted');
				}
			}

			// Handle Biometic Alarm
			const biometricAlarmStatus = await AsyncStorage.getItem(BIOMETRIC_ALARM_AT_FIRST_KEY);
			if (biometricAlarmStatus === null) {
				await AsyncStorage.setItem(BIOMETRIC_ALARM_AT_FIRST_KEY, 'confirm');
				Alert.alert(
					'Biometric Setup',
					'Would you like to enable Biometric?',
					[
						{ text: 'Yes', onPress: () => router.push('/profile?activeTab=settings'), },
						{ text: 'No, thanks' }
					]
				);
			}

			set({ user: user, error: null });

			return user;
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Login failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Token login method
	loginWithToken: async (idToken: string): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const user = await authService.loginWithToken({ token: idToken });
			await AsyncStorage.setItem('idToken', idToken);
			await AsyncStorage.setItem(BIOMETRIC_USER_TOKEN_KEY, idToken);

			if (user) {
				set({ user, isLoading: false });
				return user;
			}

			return user;
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Token login failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Refresh token method
	refreshToken: async (userId: string, refreshToken: string): Promise<User> => {
		try {
			set({ isLoading: true, error: null });

			const response = await authService.refreshToken({ userId, refreshToken });

			// Store updated tokens
			await AsyncStorage.setItem('idToken', response.token.idToken);
			await AsyncStorage.setItem('userId', response.userId);
			await AsyncStorage.setItem('accessToken', response.token.accessToken);
			await AsyncStorage.setItem(BIOMETRIC_USER_ID, response.userId);
			await AsyncStorage.setItem(BIOMETRIC_USER_TOKEN_KEY, response.token.idToken);

			// Update biometric tokens with new tokens
			await biometricService.updateBiometricTokens(
				response.userId,
				response.token.idToken,
				refreshToken
			);

			const user = {
				userId: response.userId,
				email: response.email,
				firstName: response.firstName,
				lastName: response.lastName,
				postalCode: response.postalCode,
			}

			if (user) {
				set({ user, isLoading: false });
				return user;
			}

			return user;
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Token refresh failed';
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
			await AsyncStorage.removeItem('idToken');

			set({ user: null, error: null, isJustLoggedOut: true });
		} catch (error: any) {
			console.error('Failed to logout:', error);
			// Still clear user state even if AsyncStorage fails
			set({ user: null });
		}
	},

	// Tap to login method
	makeNotJustLoggedOut: () => {
		set({ isJustLoggedOut: false });
	},

	setLoginMethod: (_method: string) => {
		set({ isPasswordLogin: _method === "password" })
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

	// Update userinfo
	updateUserData: async (userData: UserProfileRequest): Promise<void> => {
		try {
			set({ isLoading: true, error: null });

			const user = await authService.updateUserData(userData);

			set({
				user: {
					...user,
					userId: user.id
				}, isLoading: false
			});
		} catch (error: any) {
			const errMsg = error?.data?.message || error?.message || error || 'Password reset failed';
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