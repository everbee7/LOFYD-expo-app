import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'expo-router';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  loading = false
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const styles = createStyles(theme);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validation
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    await onLogin(email, password);
  };

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Login for great specials and a{'\n'}good time with local restaurants.
        </Text>
      </View>

      {/* Form Inputs */}
      <View style={styles.formSection}>
        {/* Email Input */}
        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          rightIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.primary} />}
          error={emailError}
        />

        {/* Password Input */}
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          type="password"
          autoCapitalize="none"
          autoComplete="password"
          error={passwordError}
        />

        {/* Login Button */}
        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          variant="primary"
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.background} />}
          style={styles.loginButton}
        />

        {/* Sign Up Link */}
        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>Create an account! </Text>
          <TouchableOpacity>
            <Link href="/(auth)/register" style={styles.signUpLink}>
              Sign Up
            </Link>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordSection}>
          <Link href="/(auth)/forgot-password" style={styles.forgotPasswordLink}>
            Forgot Password
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  welcomeText: {
    color: theme.colors.text,
    fontSize: theme.spacing.xl,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
  },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  signUpText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  signUpLink: {
    ...theme.typography.body,
    color: theme.colors.black,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  forgotPasswordSection: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  forgotPasswordLink: {
    ...theme.typography.body,
    color: theme.colors.black,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default LoginForm;