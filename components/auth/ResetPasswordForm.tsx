import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

// Import validation utils
import { validatePassword } from '../../utils/validation';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  resetCode: string;
}

interface ResetPasswordFormProps {
  onReset: (data: ResetPasswordFormData) => Promise<void>;
  loading?: boolean;
  email?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onReset,
  loading = false,
  email
}) => {
  const { theme } = useTheme();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [resetCodeError, setResetCodeError] = useState<string>('');

  const styles = createStyles(theme);

  const handleResetPassword = async (): Promise<void> => {
    // Reset errors
    setPasswordError('');
    setConfirmPasswordError('');
    setResetCodeError('');

    // Validation
    let hasError = false;

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    // Reset code validation
    if (!resetCode.trim()) {
      setResetCodeError('Reset code is required');
      hasError = true;
    } else if (resetCode.trim().length < 4) {
      setResetCodeError('Please enter a valid reset code');
      hasError = true;
    }

    if (hasError) return;

    await onReset({
      password,
      confirmPassword,
      resetCode
    });
  };

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          {email 
            ? `Enter the new password and the\nreset code you received at\n${email}.`
            : 'Enter the new password and the\nreset code you received.'
          }
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Password Input */}
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
          error={passwordError}
        />

        {/* Confirm Password Input */}
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
          error={confirmPasswordError}
        />

        {/* Reset Code Input */}
        <Input
          placeholder="Reset Code"
          value={resetCode}
          onChangeText={setResetCode}
          keyboardType="numeric"
          autoCapitalize="none"
          maxLength={6}
          error={resetCodeError}
        />

        {/* Reset Password Button */}
        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={loading}
          variant="primary"
          leftIcon={<Ionicons name="refresh-circle-outline" size={18} color={theme.colors.background} />}
          style={styles.resetButton}
        />
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
    fontSize: theme.spacing.xl || 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginTop: theme.spacing.md,
  },
  resetButton: {
    marginTop: theme.spacing.md,
  },
});

export default ResetPasswordForm;