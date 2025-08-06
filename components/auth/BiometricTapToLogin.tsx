import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import useAuthStore from '@/store/authStore';

export default function BiometricTapToLogin() {
  const { theme } = useTheme();
  const { makeNotJustLoggedOut, setLoginMethod } = useAuthStore();

  const styles = createStyles(theme);

  const handleGoToSignInWithPassword = () => {
    setLoginMethod("password");
    makeNotJustLoggedOut();
  }

  const handleGoToSignInWithBiometric = () => {
    setLoginMethod("biometric");
    makeNotJustLoggedOut();
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

          <TouchableOpacity style={styles.biometricIconContainer} onPress={handleGoToSignInWithBiometric}>
            <Ionicons
              name="finger-print-outline"
              size={56}
              color={theme.colors.background}
            />
          </TouchableOpacity>
          <Text style={styles.tapToLoginText}>Tap to Login</Text>

          <View style={styles.loginSection}>
            <TouchableOpacity onPress={handleGoToSignInWithPassword}>
              <Text style={styles.loginLink}>
                Sign In
              </Text>
            </TouchableOpacity>
            <Text style={styles.loginText}> with Password</Text>
          </View>
        </ScrollView>
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
    alignItems: 'center',
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
  biometricIconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderRadius: '50%',
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.primary,
  },
  tapToLoginText: {
    ...theme.typography.h4,
    color: theme.colors.textBlack,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl * 2,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  loginLink: {
    ...theme.typography.body,
    color: theme.colors.black,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});