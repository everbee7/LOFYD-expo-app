import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

interface ConfirmCodeFormProps {
  onConfirm: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  loading?: boolean;
  email?: string;
}

const ConfirmCodeForm: React.FC<ConfirmCodeFormProps> = ({
  onConfirm,
  onResend,
  loading = false,
  email
}) => {
  const { theme } = useTheme();
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');

  const styles = createStyles(theme);

  const handleConfirmCode = async (): Promise<void> => {
    // Reset errors
    setCodeError('');

    // Validation
    let hasError = false;

    // Confirmation code validation
    if (!confirmationCode.trim()) {
      setCodeError('Confirmation code is required');
      hasError = true;
    } else if (confirmationCode.trim().length < 4) {
      setCodeError('Please enter a valid confirmation code');
      hasError = true;
    }

    if (hasError) return;

    await onConfirm(confirmationCode);
  };

  const handleResend = async (): Promise<void> => {
    if (onResend) {
      await onResend();
    }
  };

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          {email ? `Enter the confirmation code you received at ${email}.` : 'Enter the confirmation code you received.'}
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Confirmation Code Input */}
        <Input
          placeholder="Confirmation Code"
          value={confirmationCode}
          onChangeText={setConfirmationCode}
          keyboardType="numeric"
          autoCapitalize="none"
          maxLength={6}
          error={codeError}
        />

        {/* Confirm Button */}
        <Button
          title="Confirm"
          onPress={handleConfirmCode}
          loading={loading}
          variant="primary"
          leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.background} />}
          style={styles.confirmButton}
        />

        {/* Resend Code Link */}
        {onResend && (
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Haven't received code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={loading}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
  confirmButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 14,
  },
  resendLink: {
    ...theme.typography.body,
    color: theme.colors.textBlack || theme.colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default ConfirmCodeForm;