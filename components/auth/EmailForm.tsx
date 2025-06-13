import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

// Import validation utils
import { validateEmail } from '../../utils/validation';

interface EmailFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  buttonTitle?: string;
  buttonIcon?: React.ReactNode;
  welcomeText?: string;
}

const EmailForm: React.FC<EmailFormProps> = ({
  onSubmit,
  loading = false,
  buttonTitle = "Send Password Reset Email",
  buttonIcon,
  welcomeText = "Enter your email address to send password reset instructions."
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const styles = createStyles(theme);

  const handleSubmit = async (): Promise<void> => {
    // Reset errors
    setEmailError('');

    // Validation
    let hasError = false;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (hasError) return;

    await onSubmit(email);
  };

  const defaultIcon = <Ionicons name="mail-outline" size={18} color={theme.colors.background} />;

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTextStyle}>
          {welcomeText}
        </Text>
      </View>

      {/* Form Section */}
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

        {/* Submit Button */}
        <Button
          title={buttonTitle}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          leftIcon={buttonIcon || defaultIcon}
          style={styles.submitButton}
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
  welcomeTextStyle: {
    color: theme.colors.text,
    fontSize: theme.spacing.xl || 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});

export default EmailForm;