// constants/theme.ts
export const theme = {
  colors: {
    // Primary colors
    primary: '#006252', // Green for active states
    primaryLight: '#4ade80',
    primaryDark: '#166534',
    primaryDisable: '#66b3a6',

    // Background colors
    background: '#ffffff', // White background for restaurant app
    surface: '#ffffff', // White surface
    cardBackground: '#ffffff', // White cards
    tabBarBackground: '#ffffff', // White tab bar

    // Text colors
    text: '#141820', // Dark text
    textSecondary: '#444444', // Secondary text
    textLight: '#999999', // Light text for distances, etc.
    textBlack: '#141820', // Pure black for headings

    // Status colors
    error: '#ef4444',
    errorLight: '#fee2e2',
    success: '#10b981',
    warning: '#f59e0b',

    // Border and divider colors
    border: '#e0e0e0', // Light gray borders
    divider: '#f0f0f0', // Very light dividers

    // Input colors
    inputBackground: '#ffffff', // Light gray input background
    inputBorder: '#e0e0e0', // Input borders
    inputReadOnly: "#00625222",
    inputPlaceholder: '#999999', // Placeholder text
    inputFocusBorder: '#3b82f666',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    none: 0, // No border radius for restaurant app
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    // Restaurant specific typography
    restaurantName: {
      fontSize: 18,
      fontWeight: '700' as const,
      lineHeight: 22,
    },
    restaurantDescription: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    restaurantDistance: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 12,
    },
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },

  // Restaurant app specific dimensions
  dimensions: {
    filterIconSize: 32,
    filterBadgeSize: 16,
    restaurantImageWidth: 80,
    restaurantImageHeight: 60,
    searchIconSize: 20,
    closeIconSize: 14,
    chevronIconSize: 16,
  },
};

export type Theme = typeof theme;