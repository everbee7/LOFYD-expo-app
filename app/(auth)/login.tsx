import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import Constants from 'expo-constants';
import * as Application from 'expo-application';

// Import auth components and services
import LoginForm from '../../components/auth/LoginForm';
import BiometricLoginPrompt from '../../components/auth/BiometricLoginPrompt';
import useAuthStore from '../../store/authStore';
import { biometricService } from '../../services/biometric';
import BiometricTapToLogin from '@/components/auth/BiometricTapToLogin';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { login, error, clearError, isJustLoggedOut, isPasswordLogin, setLoginMethod } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [isBiometricLoginEnabled, setIsBiometricLoginEnabled] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);

  const styles = createStyles(theme);

  // Get dynamic values for footer
  const version = Constants.expoConfig?.version || 'Unknown';
  const build = Application.nativeBuildVersion || 'Unknown';
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 'Unknown';

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const isBiometricEnabled = await biometricService.isBiometricEnabled();
      const capabilities = await biometricService.checkCapabilities();

      if (isBiometricEnabled && capabilities.isAvailable && capabilities.isEnrolled) {
        setIsBiometricLoginEnabled(true);
        setShowBiometric(true);
      } else {
        setShowPasswordLogin(true);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setShowPasswordLogin(true);
    }
  };

  const handlePasswordLogin = async (email: string, password: string) => {
    setLoading(true);
    clearError();

    try {
      const user = await login(email, password);
      console.log('Login successful:', user);

      // Navigation will be handled by AuthGuard in _layout.tsx
      // The user will automatically be redirected to the main app

    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        (typeof error === 'string' ? error : error?.data?.message || error?.message || 'Invalid email or password'),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSuccess = () => {
    console.log('Biometric authentication successful');
    // Navigation will be handled by AuthGuard
  };

  const handleBiometricFallback = () => {
    setShowBiometric(false);
    setShowPasswordLogin(true);
  };

  const handleBiometricCancel = () => {
    // Could navigate back or show other options
    setShowBiometric(false);
    setShowPasswordLogin(true);
  };

  const handleSwitchToBiometric = () => {
    setLoginMethod("biometric")
    setShowBiometric(true);
  }

  // Show biometric prompt if available
  if (showBiometric) {
    if (isJustLoggedOut) return <BiometricTapToLogin />

    if (!isPasswordLogin) {
      return (
        <SafeAreaView style={styles.container}>
          <BiometricLoginPrompt
            onSuccess={handleBiometricSuccess}
            onFallback={handleBiometricFallback}
            onCancel={handleBiometricCancel}
          />
        </SafeAreaView>
      );
    }
  }

  // Show password login form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          </View>

          {/* Form Section */}
          <LoginForm onLogin={handlePasswordLogin} loading={loading} onSwitchToBiometric={handleSwitchToBiometric} isBiometricEnabled={isBiometricLoginEnabled} />
        </ScrollView>

        <Text style={styles.footerText}>
          Version: {version} · Build #: {build} · Environment: {env}
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl * 2,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xxxl,
  },
  logo: {
    width: 164,
    height: 48,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  }
});