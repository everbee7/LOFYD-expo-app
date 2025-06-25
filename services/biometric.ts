import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';
const BIOMETRIC_USER_ID = 'userId';
const BIOMETRIC_USER_TOKEN_KEY = 'idToken';
const BIOMETRIC_USER_REFRESH_TOKEN_KEY = 'refreshToken';

export interface BiometricCapabilities {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricType: string;
}

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Consider invalid tokens as expired
  }
};

export const biometricService = {
  // Check device biometric capabilities
  async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Always use generic "Biometric" term - no need to be specific
      const biometricType = 'Biometric';

      return {
        isAvailable,
        isEnrolled,
        supportedTypes,
        biometricType
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricType: 'Biometric'
      };
    }
  },

  // Authenticate user with biometric
  async authenticate(promptMessage?: string): Promise<LocalAuthentication.LocalAuthenticationResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate with biometric',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false, // Allow device fallback (PIN/Pattern on Android)
      });

      return result;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'unknown',
      };
    }
  },

  // Enable biometric login
  async enableBiometric(userId: string, idToken: string, refreshToken: string): Promise<boolean> {
    try {
      const capabilities = await this.checkCapabilities();

      // Check if biometric is available
      if (!capabilities.isAvailable) {
        Alert.alert(
          'Biometric Not Available',
          'Your device does not support biometric authentication.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Check if user has enrolled biometric data
      if (!capabilities.isEnrolled) {
        Alert.alert(
          'No Biometric Data',
          'Please set up biometric authentication in your device settings first.',
          [
            { text: 'Cancel' },
            {
              text: 'Settings',
              onPress: () => {
                Alert.alert(
                  'Setup Instructions', 
                  'Go to your device Settings and set up biometric authentication (fingerprint, face recognition, etc.) to use this feature.'
                );
              }
            }
          ]
        );
        return false;
      }

      // Authenticate to confirm setup
      const authResult = await this.authenticate('Authenticate to enable biometric login');

      if (authResult.success) {
        // Save biometric preference and user token using AsyncStorage
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(BIOMETRIC_USER_ID, userId);
        await AsyncStorage.setItem(BIOMETRIC_USER_TOKEN_KEY, idToken);
        await AsyncStorage.setItem(BIOMETRIC_USER_REFRESH_TOKEN_KEY, refreshToken);

        Alert.alert(
          'Biometric Enabled',
          'Biometric login has been enabled for your account.',
          [{ text: 'OK' }]
        );

        return true;
      } else {
        let errorMessage = 'Authentication failed. Please try again.';

        if (authResult.error === 'user_cancel') {
          errorMessage = 'Authentication was cancelled.';
        } else if (authResult.error === 'user_fallback') {
          errorMessage = 'Please use your device passcode to enable biometric login.';
        } else if (authResult.error === 'not_available') {
          errorMessage = 'Biometric authentication is not available.';
        }

        Alert.alert('Authentication Failed', errorMessage, [{ text: 'OK' }]);
        return false;
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication.', [{ text: 'OK' }]);
      return false;
    }
  },

  // Disable biometric login
  async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_USER_ID);
      await AsyncStorage.removeItem(BIOMETRIC_USER_TOKEN_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_USER_REFRESH_TOKEN_KEY);
      console.log('Biometric authentication disabled');
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  },

  // Check if biometric is enabled
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const isEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return isEnabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  },

  // Get stored user token for biometric login
  async getBiometricUserInfo(): Promise<{ userId: string | null, idToken: string | null, refreshToken: string | null }> {
    try {
      const userId = await AsyncStorage.getItem(BIOMETRIC_USER_ID);
      const idToken = await AsyncStorage.getItem(BIOMETRIC_USER_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(BIOMETRIC_USER_REFRESH_TOKEN_KEY);
      return {
        userId,
        idToken,
        refreshToken
      }
    } catch (error) {
      console.error('Error getting biometric user token:', error);
      return {
        userId: null,
        idToken: null,
        refreshToken: null
      };
    }
  },

  // Update biometric stored tokens (call this after successful login/refresh)
  async updateBiometricTokens(userId: string, idToken: string, refreshToken: string): Promise<void> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      
      if (isEnabled) {
        await AsyncStorage.setItem(BIOMETRIC_USER_ID, userId);
        await AsyncStorage.setItem(BIOMETRIC_USER_TOKEN_KEY, idToken);
        await AsyncStorage.setItem(BIOMETRIC_USER_REFRESH_TOKEN_KEY, refreshToken);
        console.log('Biometric tokens updated successfully');
      }
    } catch (error) {
      console.error('Error updating biometric tokens:', error);
    }
  },

  // Perform biometric login
  async biometricLogin(): Promise<{ success: boolean; userId?: string ; idToken?: string; refreshToken?: string; tokenStatus?: 'valid' | 'expired' | 'invalid' }> {
    try {
      const isEnabled = await this.isBiometricEnabled();

      if (!isEnabled) {
        return { success: false };
      }

      const authResult = await this.authenticate('Login with biometric');

      if (authResult.success) {
        const { userId, idToken, refreshToken } = await this.getBiometricUserInfo();
        
        if (userId && idToken && refreshToken) {
          // Check if idToken is expired on client side
          const tokenStatus = isTokenExpired(idToken) ? 'expired' : 'valid';
          
          return { 
            success: true, 
            userId, 
            idToken, 
            refreshToken,
            tokenStatus
          };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('Biometric login error:', error);
      return { success: false };
    }
  }
};