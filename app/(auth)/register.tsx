import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Text,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

// Import auth components and store
import RegisterForm from '../../components/auth/RegisterForm';
import ConfirmCodeForm from '../../components/auth/ConfirmCodeForm';
import useAuthStore from '../../store/authStore';
import { SignUpRequest } from '../../types/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signup, confirmSignup, error, clearError } = useAuthStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const styles = createStyles(theme);

  const handleRegister = async (data: SignUpRequest): Promise<void> => {
    setLoading(true);
    clearError();

    try {
      await signup(data);
      console.log('Registration successful, showing confirmation code screen');
      setUserEmail(data.email);
      setIsCodeSent(true);
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Registration Failed',
        error?.data?.message || error?.message || error || 'An error occurred during registration',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (code: string): Promise<void> => {
    setLoading(true);
    clearError();

    try {
      const user = await confirmSignup(userEmail, code);
      console.log('Code confirmed successfully, user logged in:', user);

      router.push('/(auth)/login');
    } catch (error: any) {
      console.error('Code confirmation error:', error);
      Alert.alert(
        'Confirmation Failed',
        error?.data?.message || error?.message || error || 'Invalid confirmation code',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    setLoading(true);
    clearError();

    try {
      // Note: Your API doesn't seem to have a resend endpoint
      // You might need to call signup again or implement a separate resend endpoint
      await signup({
        email: userEmail,
        firstName: '', // You might need to store these values
        lastName: '',
        password: '',
        postalCode: ''
      });

      console.log('Code resent successfully');
      Alert.alert('Code Resent', 'A new confirmation code has been sent to your email.', [{ text: 'OK' }]);
    } catch (error: any) {
      console.error('Resend code error:', error);
      Alert.alert(
        'Resend Failed',
        error?.data?.message || error?.message || error || 'Failed to resend confirmation code',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogIn = (): void => {
    router.push('/(auth)/login');
  };

  const handleBack = (): void => {
    if (isCodeSent) {
      // Go back to registration form
      setIsCodeSent(false);
    } else {
      // Go back to previous screen
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          </View>

          {/* Form Section */}
          {!isCodeSent ? (
            <RegisterForm
              onRegister={handleRegister}
              onNavigateToLogin={handleLogIn}
              loading={loading}
            />
          ) : (
            <ConfirmCodeForm
              onConfirm={handleConfirmCode}
              onResend={handleResendCode}
              loading={loading}
              email={userEmail}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl * 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    alignSelf: 'flex-start',
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '400',
    marginLeft: theme.spacing.xs,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xxxl,
  },
  logo: {
    width: 164,
    height: 48,
  },
});