import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingProps {
  message?: string;
  showLogo?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  showLogo = true 
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        {showLogo && (
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Loading Spinner */}
        <View style={styles.spinnerSection}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.spinner}
          />
        </View>

        {/* Loading Message */}
        {message && (
          <View style={styles.messageSection}>
            <Text style={styles.messageText}>
              {message}
            </Text>
          </View>
        )}
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
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoSection: {
    marginBottom: theme.spacing.xxxl,
  },
  logo: {
    width: 164,
    height: 48,
  },
  spinnerSection: {
    marginBottom: theme.spacing.lg,
  },
  spinner: {
    transform: [{ scale: 1.2 }], // Make spinner slightly larger
  },
  messageSection: {
    marginTop: theme.spacing.md,
  },
  messageText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Loading;