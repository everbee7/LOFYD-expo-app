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
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

// Import auth components
import RegisterForm from '../../components/auth/RegisterForm';
import ConfirmCodeForm from '../../components/auth/ConfirmCodeForm';

interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  zipCode: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [isCodeSent, setIsCodeSent] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('');

  const styles = createStyles(theme);

  const handleRegister = async (data: RegisterFormData): Promise<void> => {
    setLoading(true);
    try {
      console.log('Sign up attempt:', data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Show confirmation code screen
      console.log('Registration successful, showing confirmation code screen');
      setUserEmail(data.email);
      setIsCodeSent(true);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (code: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('Confirming code:', code, 'for email:', userEmail);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Code confirmed successfully');
      // Navigate to dashboard or main app
      // router.push('/dashboard');
    } catch (error) {
      console.error('Code confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log('Resending code to:', userEmail);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Code resent successfully');
    } catch (error) {
      console.error('Resend code error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogIn = (): void => {
    // Navigate to login screen
    router.push('/login');
  };

  const handleBack = (): void => {
    // Navigate back
    router.back();
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