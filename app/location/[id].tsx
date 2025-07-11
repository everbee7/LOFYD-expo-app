import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Share
} from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Tabs from '@/components/common/Tabs';
import useLocationStore from '@/store/locationStore';
import { specialService } from '@/services/special';
import { Location, Special } from '@/types/location';

export default function LocationDetail() {
  const { id, specialId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const { getLocationById } = useLocationStore();

  const [activeTab, setActiveTab] = useState('Specials');
  const [location, setLocation] = useState<Location | null>(null);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [selectedSpecial, setSelectedSpecial] = useState<Special | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load location and specials data
  const loadData = useCallback(async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch location details and specials in parallel
      const [locationData, specialsData] = await Promise.all([
        getLocationById(id),
        specialService.getSpecialsByLocationId(id)
      ]);

      setLocation(locationData);
      setSpecials(specialsData);

      // If specialId is provided, find and select the corresponding special
      if (specialId && typeof specialId === 'string') {
        const targetSpecial = specialsData.find(special => special.id === specialId);
        if (targetSpecial) {
          setSelectedSpecial(targetSpecial);
        }
      }
    } catch (err: any) {
      console.error('Error loading location data:', err);
      setError(err?.message || 'Failed to load location data');
      Alert.alert('Error', 'Failed to load location details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id, specialId, getLocationById]);

  // Load data when component mounts
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const styles = createStyles(theme);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      if (!location) return;

      const fullAddress = `${location.street}, ${location.city}, ${location.state} ${location.postalCode}`;
      const shareContent = {
        title: location.name,
        message: `Check out ${location.name}!\n\nAddress: ${fullAddress}\n${location.phone ? `Phone: ${location.phone}\n` : ''}${location.description ? `\n${location.description}` : ''}`,
        url: undefined, // You can add your app's deep link here if you have one
      };

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        console.log('Location shared successfully');
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert('Error', 'Unable to share location. Please try again.');
    }
  };

  // Complete handleDirections function
  const handleDirections = async () => {
    try {
      if (!location) return;

      const { coordinates } = location;
      const fullAddress = `${location.street}, ${location.city}, ${location.state} ${location.postalCode}`;

      let mapUrl = '';

      // Check if we have coordinates and they're not zero
      if (coordinates && coordinates.Latitude !== 0 && coordinates.Longitude !== 0) {
        // Use coordinates for more accurate directions
        const { Latitude: lat, Longitude: lng } = coordinates;

        if (Platform.OS === 'ios') {
          // iOS - Try Apple Maps first, fallback to Google Maps
          mapUrl = `maps://app?daddr=${lat},${lng}`;
          const canOpenAppleMaps = await Linking.canOpenURL(mapUrl);

          if (!canOpenAppleMaps) {
            mapUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
          }
        } else {
          // Android - Use Google Maps
          mapUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
        }
      } else {
        // Fallback to address-based directions
        const encodedAddress = encodeURIComponent(fullAddress);

        if (Platform.OS === 'ios') {
          // iOS - Try Apple Maps first, fallback to Google Maps
          mapUrl = `maps://app?daddr=${encodedAddress}`;
          const canOpenAppleMaps = await Linking.canOpenURL(mapUrl);

          if (!canOpenAppleMaps) {
            mapUrl = `https://maps.google.com/maps?daddr=${encodedAddress}`;
          }
        } else {
          // Android - Use Google Maps
          mapUrl = `https://maps.google.com/maps?daddr=${encodedAddress}`;
        }
      }

      // Open the map application
      const canOpenMap = await Linking.canOpenURL(mapUrl);

      if (canOpenMap) {
        await Linking.openURL(mapUrl);
      } else {
        // Final fallback - open in browser
        const browserUrl = coordinates && coordinates.Latitude !== 0 && coordinates.Longitude !== 0
          ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.Latitude},${coordinates.Longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

        await Linking.openURL(browserUrl);
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert('Error', 'Unable to open directions. Please try again.');
    }
  };

  // Alternative handleDirections with user choice (optional)
  const handleDirectionsWithChoice = () => {
    if (!location) return;

    const { coordinates } = location;
    const fullAddress = `${location.street}, ${location.city}, ${location.state} ${location.postalCode}`;

    Alert.alert(
      'Get Directions',
      'Choose your preferred map application:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Google Maps',
          onPress: async () => {
            const url = coordinates && coordinates.Latitude !== 0 && coordinates.Longitude !== 0
              ? `https://maps.google.com/maps?daddr=${coordinates.Latitude},${coordinates.Longitude}`
              : `https://maps.google.com/maps?daddr=${encodeURIComponent(fullAddress)}`;

            try {
              await Linking.openURL(url);
            } catch (error) {
              Alert.alert('Error', 'Unable to open Google Maps');
            }
          },
        },
        ...(Platform.OS === 'ios' ? [{
          text: 'Apple Maps',
          onPress: async () => {
            const url = coordinates && coordinates.Latitude !== 0 && coordinates.Longitude !== 0
              ? `maps://app?daddr=${coordinates.Latitude},${coordinates.Longitude}`
              : `maps://app?daddr=${encodeURIComponent(fullAddress)}`;

            try {
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Error', 'Apple Maps is not available');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to open Apple Maps');
            }
          },
        }] : []),
      ]
    );
  };

  const handleCall = async () => {
    try {
      if (!location?.phone) {
        Alert.alert('No Phone Number', 'Phone number is not available for this location.');
        return;
      }

      const phoneNumber = location.phone;
      const phoneUrl = `tel:${phoneNumber}`;

      // Check if device can make phone calls
      const canCall = await Linking.canOpenURL(phoneUrl);

      if (canCall) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Unable to Call', 'Your device cannot make phone calls or the phone number is invalid.');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      Alert.alert('Error', 'Unable to make phone call. Please try again.');
    }
  };

  const formatHours = (hours: any[]) => {
    if (!hours || hours.length === 0) return [];

    return hours.map(dayHour => {
      if (dayHour.isClosed) {
        return `${dayHour.day}: Closed`;
      }
      return `${dayHour.day}: ${dayHour.open} AM - ${dayHour.close} PM`;
    });
  };

  const getCurrentDayStatus = () => {
    if (!location?.locationHours || location.locationHours.length === 0) {
      return { isOpen: false, todayHours: 'Hours not available' };
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = location.locationHours.find(h => h.day.toLowerCase() === today.toLowerCase());

    if (!todayHours) {
      return { isOpen: false, todayHours: 'Hours not available' };
    }

    if (todayHours.isClosed) {
      return { isOpen: false, todayHours: `${todayHours.day}: Closed` };
    }

    // Simple open/closed logic - you might want to implement more sophisticated time checking
    const isOpen = true; // Simplified - implement actual time checking logic
    return {
      isOpen,
      todayHours: `${todayHours.day}: ${todayHours.open} AM - ${todayHours.close} PM`
    };
  };

  const formatExpiry = (expireDate: string) => {
    try {
      const date = new Date(expireDate);
      return `Expire: ${date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`;
    } catch {
      return 'Expiry date not available';
    }
  };

  const getPriceRangeText = (priceRange: number) => {
    switch (priceRange) {
      case 1: return '$1~10';
      case 2: return '$10~20';
      case 3: return '$20~40';
      case 4: return '$40+';
      default: return 'Price not available';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading location details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Location not found'}
          </Text>
          <TouchableOpacity onPress={loadData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack} style={styles.backToListButton}>
            <Text style={styles.backToListButtonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { isOpen, todayHours } = getCurrentDayStatus();
  const fullAddress = `${location.street}, ${location.city}, ${location.state} ${location.postalCode}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.background} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Image
            source={location.images && location.images.length > 0
              ? { uri: location.images[0] }
              : require('../../assets/images/default-location-rec.jpg')
            }
            style={styles.locationImage}
            resizeMode="cover"
          />
        </View>

        {/* Location Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.address}>{fullAddress}</Text>

            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, isOpen && styles.statusBadgeOpen]}>
                <Text style={[styles.statusText, isOpen && styles.statusTextOpen]}>
                  {isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
              <Text style={styles.hours}>{todayHours}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDirectionsWithChoice} style={styles.actionButton}>
              <Ionicons name="navigate-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            {location.phone && (
              <TouchableOpacity onPress={handleCall} style={styles.actionButton}>
                <Ionicons name="call-outline" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{
          display: selectedSpecial ? 'none' : 'flex'
        }}>
          {/* Tabs */}
          <Tabs
            tabs={[
              { key: 'Specials', title: 'Specials' },
              { key: 'Details', title: 'Details' }
            ]}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            style={styles.tabContainer}
          />

          {/* Content based on active tab */}
          {activeTab === 'Specials' && (
            <View style={styles.specialsContainer}>
              {specials.length > 0 ? (
                specials.map((special) => (
                  <TouchableOpacity
                    key={special.id}
                    style={styles.specialCard}
                    onPress={() => setSelectedSpecial(special)}
                  >
                    <View style={styles.specialContent}>
                      <Text style={styles.specialTitle}>{special.title}</Text>
                      <Text style={styles.specialDescription}>{special.description}</Text>
                      <Text style={styles.specialExpiry}>{formatExpiry(special.expireDate)}</Text>
                    </View>
                    <Image
                      source={special.images && special.images.length > 0
                        ? { uri: special.images[0] }
                        : require('../../assets/images/default-location-rec.jpg')
                      }
                      style={styles.specialImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noSpecialsContainer}>
                  <Text style={styles.noSpecialsText}>No specials available at this location</Text>
                </View>
              )}

              <View style={styles.logoContainer}>
                <Image tintColor={'#737373'} source={require("../../assets/images/logo.png")} style={styles.logo} />
              </View>
            </View>
          )}

          {activeTab === 'Details' && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsText}>{location.description || 'No description available'}</Text>

              {location.neighborhood && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Located in:</Text>
                  <Text style={styles.detailValue}>{location.neighborhood}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{fullAddress}</Text>
              </View>

              {location.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{location.phone}</Text>
                </View>
              )}

              <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={styles.detailLabel}>Hours:</Text>
                <View style={styles.hoursContainer}>
                  {location.locationHours && location.locationHours.length > 0 ? (
                    formatHours(location.locationHours).map((hourText: string, index: number) => (
                      <View key={`hours-${index}`} style={styles.hourRow}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.timeText}>{hourText}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.timeText}>Hours not available</Text>
                  )}
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price per person:</Text>
                <Text style={styles.detailValue}>{getPriceRangeText(location.priceRange)}</Text>
              </View>

              {location.serviceType && location.serviceType.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service Types:</Text>
                  <Text style={styles.detailValue}>{location.serviceType.join(', ')}</Text>
                </View>
              )}

              {location.cuisine && location.cuisine.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cuisine:</Text>
                  <Text style={styles.detailValue}>{location.cuisine.join(', ')}</Text>
                </View>
              )}

              {location.experience && location.experience.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Experience:</Text>
                  <Text style={styles.detailValue}>{location.experience.join(', ')}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Selected special section */}
        <View style={[
          styles.restaurentDetailWrap,
          {
            display: selectedSpecial ? 'flex' : 'none'
          }
        ]}>
          <View style={styles.restaurentDetailcontainer}>
            <View style={styles.restaurentImageWrap}>
              <TouchableOpacity style={styles.restaurentBack} onPress={() => setSelectedSpecial(null)}>
                <Image
                  source={require('../../assets/images/allow-big-down.png')}
                  style={styles.restaurentImageBack}
                />
              </TouchableOpacity>
              <Image
                source={selectedSpecial?.images && selectedSpecial.images.length > 0
                  ? { uri: selectedSpecial.images[0] }
                  : require('../../assets/images/default-location-rec.jpg')
                }
                style={styles.restaurentImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.restaurentContent}>
              <Text style={styles.expireDate}>
                {selectedSpecial ? formatExpiry(selectedSpecial.expireDate) : ''}
              </Text>
              <Text style={styles.restaurentName}>{selectedSpecial?.title}</Text>
              <Text style={styles.restaurentDescription}>
                {selectedSpecial?.description}
              </Text>

              {selectedSpecial?.terms && (
                <View style={styles.terms}>
                  <Text style={styles.termsText}>Terms:</Text>
                  <Text style={styles.termsText}>{selectedSpecial.terms}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error || '#ff6b6b',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius?.md || 8,
    marginBottom: theme.spacing.md,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  backToListButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backToListButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    backgroundColor: theme.colors.border,
    position: 'relative',
  },
  locationImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    zIndex: 100,
    left: theme.spacing.md,
    top: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: theme.spacing.xs,
  },
  infoContainer: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  infoSection: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  address: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius?.sm / 2 || 4,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.error + '20',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  statusBadgeOpen: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.error,
  },
  statusTextOpen: {
    color: theme.colors.primary,
  },
  hours: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  tabContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 0,
  },
  specialsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  specialCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  specialContent: {
    flex: 1,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  specialDescription: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  specialExpiry: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  specialImage: {
    width: 86,
    height: 60,
    backgroundColor: theme.colors.border,
  },
  noSpecialsContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noSpecialsText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 100,
    height: 32,
  },
  detailsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  detailsText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  hoursContainer: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs / 2,
    paddingLeft: theme.spacing.xs,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    fontSize: 18,
    lineHeight: 13,
    fontWeight: '900',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
    width: 10,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.text,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.text,
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
  },
  restaurentDetailWrap: {
    padding: theme.spacing.sm,
  },
  restaurentDetailcontainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  restaurentImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 320 / 155,
    alignItems: 'center',
  },
  restaurentBack: {
    zIndex: 100,
    position: 'absolute',
    top: theme.spacing.md,
  },
  restaurentImageBack: {
    width: 36,
    height: 12,
  },
  restaurentImage: {
    width: '100%',
    height: '100%',
  },
  restaurentContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  expireDate: {
    width: '100%',
    textAlign: 'right',
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  restaurentName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  restaurentDescription: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    marginBottom: theme.spacing.md,
  },
  terms: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  termsText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  }
});