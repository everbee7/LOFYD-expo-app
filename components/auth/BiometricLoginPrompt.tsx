import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { biometricService } from '../../services/biometric';
import useAuthStore from '../../store/authStore';

interface BiometricLoginPromptProps {
  onSuccess: () => void;
  onFallback: () => void;
  onCancel?: () => void;
}

const BiometricLoginPrompt: React.FC<BiometricLoginPromptProps> = ({
  onSuccess,
  onFallback,
  onCancel
}) => {
  const { theme } = useTheme();
  const { loginWithToken, refreshToken } = useAuthStore();
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadBiometricType();
    // Auto-prompt for biometric authentication when component mounts
    handleBiometricLogin();
  }, []);

  const loadBiometricType = async () => {
    try {
      const capabilities = await biometricService.checkCapabilities();
      setBiometricType(capabilities.biometricType);
    } catch (error) {
      console.error('Error loading biometric type:', error);
    }
  };

  const handleBiometricLogin = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);

    try {
      const result = await biometricService.biometricLogin();

      if (result.success && result.idToken && result.userId && result.refreshToken) {
        // Check token status from client-side validation
        if (result.tokenStatus === 'valid') {
          // Token is valid, proceed with login
          try {
            await loginWithToken(result.idToken);
            onSuccess();
            return;
          } catch (error) {
            console.error('Login with token failed:', error);
            // If loginWithToken fails even with valid token, try refresh
          }
        }

        // Token is expired or loginWithToken failed, try refresh token
        try {
          await refreshToken(result.userId, result.refreshToken);
          onSuccess();
        } catch (error) {
          console.error('Refresh token failed:', error);
          // Both tokens are expired or invalid
          setIsAuthenticating(false);
          Alert.alert(
            'Authentication Required', 
            'Your biometric authentication session has expired. Please sign in with your password to continue using the app.',
            [
              { text: 'Sign In', onPress: onFallback }
            ]
          );
        }
      } else {
        // Biometric authentication failed or no token
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      setIsAuthenticating(false);
      Alert.alert(
        'Authentication Error', 
        'We encountered an issue with biometric authentication. Please try again or use your password to sign in.',
        [
          { text: 'Try Again', onPress: handleBiometricLogin },
          { text: 'Use Password', onPress: onFallback }
        ]
      );
    }
  };

  const getIcon = () => {
    if (biometricType === 'Face ID' || biometricType === 'Face Recognition') {
      return 'scan-outline';
    }
    return 'finger-print-outline';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Biometric Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIcon()}
            size={80}
            color={theme.colors.primary}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isAuthenticating ? 'Authenticating...' : `Login with ${biometricType}`}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {isAuthenticating
            ? 'Please authenticate to continue'
            : `Touch the ${biometricType.toLowerCase()} sensor to sign in`
          }
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!isAuthenticating && (
            <>
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={handleBiometricLogin}
              >
                <Text style={styles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fallbackButton}
                onPress={onFallback}
              >
                <Text style={styles.fallbackText}>Use Password Instead</Text>
              </TouchableOpacity>

              {onCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: theme.spacing.xxxl,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight + '20',
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxxl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  tryAgainButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  tryAgainText: {
    color: theme.colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  fallbackButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  fallbackText: {
    color: theme.colors.text,
    fontWeight: '500',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default BiometricLoginPrompt;