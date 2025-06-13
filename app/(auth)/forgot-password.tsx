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
import EmailForm from '../../components/auth/EmailForm';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  resetCode: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'email' | 'reset'>('email');
  const [userEmail, setUserEmail] = useState<string>('');

  const styles = createStyles(theme);

  const handleSendPasswordReset = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('Password reset request for:', email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Password reset email sent successfully');
      setUserEmail(email);
      setCurrentStep('reset'); // Go directly to reset password step
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData): Promise<void> => {
    setLoading(true);
    try {
      console.log('Reset password attempt:', {
        email: userEmail,
        resetCode: data.resetCode,
        newPassword: data.password
      });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Password reset successful');
      // Navigate to login screen or show success message
      // router.push('/login');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
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
          {currentStep === 'email' ? (
            <EmailForm 
              onSubmit={handleSendPasswordReset}
              loading={loading}
              buttonTitle="Send Password Reset Email"
              buttonIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.background} />}
              welcomeText="Enter your email address to send\npassword reset instructions."
            />
          ) : (
            <ResetPasswordForm 
              onReset={handleResetPassword}
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