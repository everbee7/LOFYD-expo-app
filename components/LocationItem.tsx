import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import VerifiedBadge from './VerifiedBadge';
import { formatVerificationCount } from '../utils/formatVerificationCount';

interface LocationItemProps {
  location: {
    id: string;
    name: string;
    description: string;
    distance?: string;
    address: string;
    cuisine: string[];
    amenities: string[];
    image: string;
    priceRange: string;
    serviceType: string[];
    specialId?: string;
    verified_badge?: boolean;
    verification_count?: number;
  };
  isSpecial?: boolean;
  onPress?: () => void;
}

export default function LocationItem({ location, onPress, isSpecial = false}: LocationItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }

    // If this is a special, pass the specialId as a parameter
    const params: any = { id: location.id };
    if (isSpecial && location.specialId) {
      params.specialId = location.specialId;
    }

    router.push({ pathname: "/location/[id]", params });
  }

  return (
    <TouchableOpacity style={styles.locationCard} onPress={handlePress}>
      <View style={styles.locationContent}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName} numberOfLines={1} ellipsizeMode="tail">
            {location.name}
          </Text>
          <Text style={styles.locationDescription} numberOfLines={2} ellipsizeMode="tail">
            {location.description}
          </Text>
          {Boolean(location.distance) && (
            <Text style={styles.locationDistance}>{location.distance}</Text>
          )}
          {location.verified_badge && (
            <VerifiedBadge count={location.verification_count ?? 0} />
          )}
        </View>
        <Image source={location.image ? { uri: location.image } : require('../assets/images/default-location-rec.jpg')} style={styles.locationImage} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  locationCard: {
    backgroundColor: theme.colors.cardBackground,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  locationInfo: {
    flex: 1,
    marginRight: theme.spacing.lg,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    color: theme.colors.textBlack,
    marginBottom: theme.spacing.xs,
  },
  locationDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: theme.colors.textBlack,
    marginBottom: theme.spacing.xs,
  },
  locationDistance: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: theme.colors.textLight,
  },
  locationImage: {
    width: 96,
    height: 84,
    backgroundColor: theme.colors.inputBackground,
  },
});