import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  backgroundColor?: string;
  spinnerColor?: string;
  spinnerSize?: 'small' | 'large';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text = 'Loading...',
  backgroundColor,
  spinnerColor,
  spinnerSize = 'large'
}) => {
  const { theme } = useTheme();
  
  if (!visible) return null;

  const styles = createStyles(theme);

  return (
    <View style={[
      styles.loadingOverlay,
      backgroundColor && { backgroundColor }
    ]}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size={spinnerSize}
          color={spinnerColor || theme.colors.primary}
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingText}>{text}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingSpinner: {
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

export default LoadingOverlay;