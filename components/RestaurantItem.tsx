import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface RestaurantItemProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    distance: string;
    address: string;
    cuisine: string[];
    amenities: string[];
    image: string;
  };
  onPress?: () => void;
}

export default function RestaurantItem({ restaurant, onPress }: RestaurantItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.restaurantCard} onPress={onPress}>
      <View style={styles.restaurantContent}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1} ellipsizeMode="tail">
            {restaurant.name}
          </Text>
          <Text style={styles.restaurantDescription} numberOfLines={2} ellipsizeMode="tail">
            {restaurant.description}
          </Text>
          <Text style={styles.restaurantDistance}>{restaurant.distance}</Text>
        </View>
        <Image source={restaurant.image ? { uri: restaurant.image } : require('../assets/images/default-location-rec.jpg')} style={styles.restaurantImage} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  restaurantCard: {
    backgroundColor: theme.colors.cardBackground,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  restaurantContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  restaurantName: {
    ...theme.typography.restaurantName,
    color: theme.colors.textBlack,
    marginBottom: theme.spacing.xs,
  },
  restaurantDescription: {
    ...theme.typography.restaurantDescription,
    color: theme.colors.textBlack,
    marginBottom: theme.spacing.xs,
  },
  restaurantDistance: {
    ...theme.typography.restaurantDistance,
    color: theme.colors.textLight,
  },
  restaurantImage: {
    width: theme.dimensions?.restaurantImageWidth || 80,
    height: theme.dimensions?.restaurantImageHeight || 60,
    backgroundColor: theme.colors.inputBackground,
  },
});