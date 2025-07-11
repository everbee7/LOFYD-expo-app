import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  SafeAreaView,
  Dimensions,
  ViewStyle,
  Alert
} from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ServiceType } from '@/types/location';
import ToggleButton from '@/components/common/ToggleButton';
import useLocationStore from '@/store/locationStore';
import { locationService } from '@/services/location';
import SaveFilterModal from './SaveFilterModal';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  theme
}) => {
  const {
    activeTab,
    activeFilters,
    searchLocation,
    radiusInMiles,
    sortBy,
    setActiveTab,
    setLocation,
    setRadius,
    setSortBy,
    clearFilters,
    addFilter,
    removeFilter,
    searchWithCurrentParams
  } = useLocationStore();

  const [tempSearchLocation, setTempSearchLocation] = useState('');
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedTastes, setSelectedTastes] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number>(0.5);
  const [selectedSortBy, setSelectedSortBy] = useState<string>('relevance');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // Collapse states for each section
  const [collapsedSections, setCollapsedSections] = useState({
    price: true,
    experience: true,
    cuisine: true,
    taste: true,
  });

  // Check location permission status when modal opens
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const locationPermission = await AsyncStorage.getItem('locationPermissionGranted');
        const isEnabled = locationPermission ? JSON.parse(locationPermission) : false;
        setIsLocationEnabled(isEnabled);
      } catch (error) {
        console.error('Error checking location permission:', error);
        setIsLocationEnabled(false);
      }
    };

    if (visible) {
      checkLocationPermission();
    }
  }, [visible]);

  // Initialize state with current store values when modal opens
  useFocusEffect(
    useCallback(() => {
      if (visible) {
        setTempSearchLocation(searchLocation);
        setSelectedServiceTypes([...activeFilters.serviceType]);
        setSelectedPriceRanges([...activeFilters.priceRange]);
        setSelectedExperiences([...activeFilters.experience]);
        setSelectedCuisines([...activeFilters.cuisine]);
        setSelectedTastes([...activeFilters.taste]);
        setSelectedDistance(radiusInMiles);
        console.log('radiusInMiles', radiusInMiles);
        setSelectedSortBy(sortBy);
      }
    }, [visible, activeFilters, searchLocation, radiusInMiles, sortBy])
  )

  const serviceTypes = [{
    key: 'dine-in',
    label: 'Dine In',
    icon: "table-restaurant",
  }, {
    key: 'take-out',
    label: 'Takeout',
    icon: "takeout-dining",
  }, {
    key: 'delivery',
    label: 'Delivery',
    icon: "delivery-dining",
  }];

  const priceRanges = [
    { value: 1, label: '$' },
    { value: 2, label: '$$' },
    { value: 3, label: '$$$' },
    { value: 4, label: '$$$$' }
  ];

  const experiences = [
    'Live Music', 'Romance', 'Karaoke', 'Dance Floor',
    'Games', 'Outdoor Seating'
  ];

  const cuisines = [
    'American', 'Mexican', 'Italian', 'Greek', 'Chinese', 'Japanese', 'Indian',
    'Mediterranean', 'South American', 'Texas Mex'
  ];

  const tastes = [
    'BBQ', 'Tacos', 'Soul Food', 'Sushi', 'Bagel', 'Sandwich', 'Pizza', 'Thai', 'Hamburger',
    'Steak', 'Salmon', 'Seafood', 'Pasta', 'Beer', 'Wine', 'Margarita'
  ];

  const distances = [0.5, 2, 10, 15, 20, 25];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'distance', label: 'Distance' },
    { value: 'favorites', label: 'Favorites' }
  ];

  const styles = createStyles(theme);

  const toggleSelection = (
    item: string | number,
    selectedItems: any[],
    setSelectedItems: (items: any[]) => void
  ) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(selected => selected !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const toggleSection = (sectionKey: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleTabChange = (tab: 'Specials' | 'Locations') => {
    setActiveTab(tab);
  };

  const handleApplyFilters = () => {
    // Clear all filters first
    clearFilters();

    console.log('selectedServiceTypes', selectedServiceTypes);
    // Apply service type filters
    selectedServiceTypes.forEach(type => {
      addFilter('serviceType', type as ServiceType);
    });

    // Apply price range filters
    selectedPriceRanges.forEach(price => {
      addFilter('priceRange', price);
    });

    // Apply experience filters
    selectedExperiences.forEach(exp => {
      addFilter('experience', exp);
    });

    // Apply cuisine filters
    selectedCuisines.forEach(cuisine => {
      addFilter('cuisine', cuisine);
    });

    // Apply taste filters
    selectedTastes.forEach(taste => {
      addFilter('taste', taste);
    });

    // Update location if changed
    if (tempSearchLocation.trim() && tempSearchLocation !== searchLocation) {
      const locationType = locationService.determineLocationType(tempSearchLocation.trim());
      setLocation(tempSearchLocation.trim(), locationType);
    }

    // Update radius if changed
    if (selectedDistance !== radiusInMiles) {
      setRadius(selectedDistance);
    }

    // Update sort by if changed
    if (selectedSortBy !== sortBy) {
      setSortBy(selectedSortBy as 'relevance' | 'distance' | 'favorites');
    }

    // Trigger search with new parameters
    searchWithCurrentParams();

    onClose();
  };

  const handleSaveFilters = () => {
    // First apply the filters, then show save modal
    handleApplyFilters();
    setShowSaveModal(true);
  };

  const handleResetFilters = () => {
    setSelectedServiceTypes(['dine-in', 'take-out', 'delivery']);
    setSelectedPriceRanges([]);
    setSelectedExperiences([]);
    setSelectedCuisines([]);
    setSelectedTastes([]);
    setSelectedDistance(10);
    setSelectedSortBy('relevance');
    setTempSearchLocation('');
  };

  const handleSingleSelection = (
    item: string | number,
    setSelectedItem: (item: any) => void
  ) => {
    setSelectedItem(item);
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Get current position - permission should already be granted
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      const { latitude, longitude } = location.coords;

      // Convert coordinates to location string
      const coordinatesString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

      // Update the search location input
      setTempSearchLocation(coordinatesString);

      // Optional: Get human-readable address using reverse geocoding
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (address) {
          const formattedAddress = [
            address.street,
            address.city,
            address.region,
            address.postalCode
          ].filter(Boolean).join(', ');

          if (formattedAddress) {
            // Show user a choice
            Alert.alert(
              'Location Found',
              `Use coordinates or address?\n\nCoordinates: ${coordinatesString}\n\nAddress: ${formattedAddress}`,
              [
                {
                  text: 'Use Coordinates',
                  onPress: () => setTempSearchLocation(coordinatesString)
                },
                {
                  text: 'Use Address',
                  onPress: () => setTempSearchLocation(formattedAddress)
                }
              ]
            );
          }
        }
      } catch (reverseGeocodeError) {
        console.log('Reverse geocoding failed, using coordinates:', reverseGeocodeError);
      }

    } catch (error: any) {
      console.error('Error getting location:', error);

      let errorMessage = 'Failed to get current location. ';

      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage += 'Please enable location services.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please check your GPS and try again.';
      }

      Alert.alert('Location Error', errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationButtonPress = () => {
    if (!isLocationEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in Settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Settings',
            onPress: () => {
              onClose(); // Close the filter modal
              router.push('/profile');
            }
          }
        ]
      );
      return;
    }

    getCurrentLocation();
  };

  const renderSingleToggleButton = (
    key: string,
    item: string | number,
    label: string,
    selectedItem: any,
    setSelectedItem: (item: any) => void,
    style?: ViewStyle,
  ) => {
    const isSelected = selectedItem === item;
    return (
      <ToggleButton
        key={key}
        item={item}
        label={label}
        isSelected={isSelected}
        onPress={() => handleSingleSelection(item, setSelectedItem)}
        theme={theme}
        style={style}
      />
    );
  };

  const renderToggleButton = (
    key: string,
    item: string | number,
    label: string,
    selectedItems: any[],
    setSelectedItems: (items: any[]) => void,
    style?: ViewStyle,
  ) => {
    const isSelected = selectedItems.includes(item);
    return (
      <ToggleButton
        key={key}
        item={item}
        label={label}
        isSelected={isSelected}
        onPress={() => toggleSelection(item, selectedItems, setSelectedItems)}
        theme={theme}
        style={style}
      />
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.background} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'Specials' && styles.activeTab
                ]}
                onPress={() => handleTabChange('Specials')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'Specials' && styles.activeTabText
                ]}>
                  Specials
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'Locations' && styles.activeTab
                ]}
                onPress={() => handleTabChange('Locations')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'Locations' && styles.activeTabText
                ]}>
                  Locations
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleSaveFilters} style={styles.saveButton}>
                <Ionicons name="bookmark-outline" size={16} color={theme.colors.background} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleApplyFilters} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Search Location */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={14}
                  color={theme.colors.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. New York, 10001, 40.7128,-74.0060"
                  placeholderTextColor={theme.colors.textLight}
                  value={tempSearchLocation}
                  onChangeText={setTempSearchLocation}
                />
              </View>

              {/* Only show Current Location button if location is enabled */}
              {isLocationEnabled && (
                <TouchableOpacity
                  style={[
                    styles.locationContainer,
                    isGettingLocation && styles.locationContainerLoading
                  ]}
                  onPress={handleLocationButtonPress}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                      style={styles.locationIcon}
                    />
                  ) : (
                    <Ionicons
                      name="location"
                      size={16}
                      color={theme.colors.textSecondary}
                      style={styles.locationIcon}
                    />
                  )}
                  <Text style={[
                    styles.locationText,
                    isGettingLocation && styles.locationTextLoading
                  ]}>
                    {isGettingLocation ? 'Getting location...' : 'Current Location'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Show message if location is disabled */}
              {!isLocationEnabled && (
                <TouchableOpacity
                  style={styles.locationDisabledContainer}
                  onPress={handleLocationButtonPress}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={theme.colors.text}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationDisabledText}>
                    Enable location in Settings to use current location
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.searchLabelWrap}>
                <Ionicons
                  name="navigate"
                  size={12}
                  color={theme.colors.background}
                  style={styles.labelIcon}
                />
                <Text style={styles.labeltext}>Search by Zipcode or City</Text>
              </View>
            </View>

            {/* Rest of your existing filter sections... */}
            {/* Refine with filters */}
            <Text style={styles.refineTitle}>Refine with filters</Text>

            {/* Service Type */}
            <View style={styles.serviceContainer}>
              {serviceTypes.map((_type) => {
                return <TouchableOpacity
                  key={`service-type-${_type.key}`}
                  style={[styles.serviceItem, (selectedServiceTypes.includes(_type.key) ? styles.serviceItemActive : {})]}
                  onPress={() => toggleSelection(_type.key, selectedServiceTypes, setSelectedServiceTypes)}
                >
                  <MaterialIcons name={_type.icon as "table-restaurant" | "takeout-dining" | "delivery-dining"} size={20} color={selectedServiceTypes.includes(_type.key) ? theme.colors.primary : "white"} />
                  <Text style={[styles.serviceText, (selectedServiceTypes.includes(_type.key) ? styles.serviceTextActive : {})]}>{_type.label}</Text>
                </TouchableOpacity>
              })}
            </View>

            {/* Price */}
            <View style={styles.sectionContainer}>
              <MaterialCommunityIcons name="cash" size={20} color="white" style={styles.sectionIcon} />
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.serviceText}>Price</Text>
                  <TouchableOpacity
                    style={styles.collapseIconButton}
                    onPress={() => toggleSection('price')}
                  >
                    <FontAwesome
                      name={collapsedSections.price ? "caret-right" : "caret-down"}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                {!collapsedSections.price && (
                  <View style={styles.toggleContainer}>
                    {priceRanges.map((price) =>
                      renderToggleButton('price' + price.value, price.value, price.label, selectedPriceRanges, setSelectedPriceRanges)
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Experience */}
            <View style={styles.sectionContainer}>
              <MaterialIcons name="style" size={20} color="white" style={styles.sectionIcon} />
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.serviceText}>Experience</Text>
                  <TouchableOpacity
                    style={styles.collapseIconButton}
                    onPress={() => toggleSection('experience')}
                  >
                    <FontAwesome
                      name={collapsedSections.experience ? "caret-right" : "caret-down"}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                {!collapsedSections.experience && (
                  <View style={styles.toggleContainer}>
                    {experiences.map(experience =>
                      renderToggleButton('experience' + experience, experience, experience, selectedExperiences, setSelectedExperiences)
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Cuisine */}
            <View style={styles.sectionContainer}>
              <MaterialIcons name="restaurant" size={20} color="white" style={styles.sectionIcon} />
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.serviceText}>Cuisine</Text>
                  <TouchableOpacity
                    style={styles.collapseIconButton}
                    onPress={() => toggleSection('cuisine')}
                  >
                    <FontAwesome
                      name={collapsedSections.cuisine ? "caret-right" : "caret-down"}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                {!collapsedSections.cuisine && (
                  <View style={styles.toggleContainer}>
                    {cuisines.map(cuisine =>
                      renderToggleButton('cuisine' + cuisine, cuisine, cuisine, selectedCuisines, setSelectedCuisines)
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Taste */}
            <View style={styles.sectionContainer}>
              <Ionicons name="pizza" size={20} color="white" style={styles.sectionIcon} />
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.serviceText}>Taste</Text>
                  <TouchableOpacity
                    style={styles.collapseIconButton}
                    onPress={() => toggleSection('taste')}
                  >
                    <FontAwesome
                      name={collapsedSections.taste ? "caret-right" : "caret-down"}
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
                {!collapsedSections.taste && (
                  <View style={styles.toggleContainer}>
                    {tastes.map(taste =>
                      renderToggleButton('taste' + taste, taste, taste, selectedTastes, setSelectedTastes)
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Distance */}
            <View style={styles.sectionContainer}>
              <Ionicons name="location" size={20} color={theme.colors.background} style={styles.sectionIcon} />
              <View style={styles.sectionWrap}>
                <View style={[styles.sectionHeader, { paddingVertical: 0 }]}>
                  <Text style={styles.serviceText}>Distance (mi)</Text>
                  <View style={[styles.toggleContainer, { paddingVertical: 0, paddingRight: theme.spacing.sm, flex: 1, justifyContent: 'flex-end', marginLeft: theme.spacing.sm }]}>
                    {distances.map(distance =>
                      renderSingleToggleButton(
                        'distance' + distance,
                        distance,
                        distance.toString(),
                        selectedDistance,
                        setSelectedDistance,
                        styles.toggleButtonSmall
                      )
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Sort by */}
            <View style={styles.sectionContainer}>
              <MaterialCommunityIcons name="sort" size={20} color={theme.colors.background} style={styles.sectionIcon} />
              <View style={styles.sectionWrap}>
                <View style={[styles.sectionHeader, { paddingVertical: 0 }]}>
                  <Text style={styles.serviceText}>Sort by</Text>
                  <View style={[styles.toggleContainer, { paddingVertical: 0, paddingRight: theme.spacing.sm, flex: 1, justifyContent: 'flex-end', marginLeft: theme.spacing.sm }]}>
                    {sortOptions.map(option =>
                      renderSingleToggleButton(
                        'sort' + option.value,
                        option.value,
                        option.label,
                        selectedSortBy,
                        setSelectedSortBy
                      )
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Reset Filters Button */}
            <TouchableOpacity onPress={handleResetFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Save Filter Modal */}
      <SaveFilterModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        theme={theme}
      />
    </>
  );
};

const createStyles = (theme: any) => {
  const { width } = Dimensions.get('window');

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary || '#1e7065',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      backgroundColor: theme.colors.primary || '#1e7065',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      marginLeft: theme.spacing.md,
    },
    backText: {
      color: theme.colors.background,
      fontSize: 14,
      fontWeight: '400',
      marginLeft: theme.spacing.xs,
    },
    tabContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tab: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.primary,
    },
    activeTab: {
      backgroundColor: theme.colors.background,
    },
    tabText: {
      fontSize: 14,
      color: theme.colors.background,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.background,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    saveButtonText: {
      color: theme.colors.background,
      fontSize: 14,
      fontWeight: '400',
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.background,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
    applyButtonText: {
      color: theme.colors.background,
      fontSize: 14,
      fontWeight: '400',
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.primary || '#1e7065',
      paddingHorizontal: 16,
    },
    searchSection: {
      marginBottom: 24,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    searchIcon: {
      marginRight: theme.spacing.xs + 1,
      marginLeft: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.text,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    locationIcon: {
      marginRight: theme.spacing.sm,
    },
    locationText: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 36,
      color: theme.colors.primary,
    },
    locationContainerLoading: {
      opacity: 0.7,
    },
    locationTextLoading: {
      color: theme.colors.textLight,
    },
    locationDisabledContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      opacity: 0.6,
    },
    locationDisabledText: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 36,
      color: theme.colors.text,
      flex: 1,
    },
    searchLabelWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    labelIcon: {
      marginRight: theme.spacing.sm + 2,
      marginLeft: 2,
    },
    labeltext: {
      color: theme.colors.background,
      fontSize: 12,
      textAlign: 'center',
    },
    refineTitle: {
      color: theme.colors.background,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    serviceContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    serviceItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.background,
      padding: theme.spacing.xs,
    },
    serviceText: {
      color: theme.colors.background,
      fontSize: 14,
    },
    serviceItemActive: {
      backgroundColor: theme.colors.background,
    },
    serviceTextActive: {
      color: theme.colors.primary,
    },
    collapseIconButton: {
      paddingHorizontal: theme.spacing.sm
    },
    sectionContainer: {
      marginBottom: theme.spacing.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    sectionIcon: {
      marginTop: 4,
    },
    sectionWrap: {
      borderBottomWidth: 1,
      borderColor: theme.colors.background,
      flex: 1,
      paddingBottom: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    toggleContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingVertical: theme.spacing.sm,
    },
    toggleButtonSmall: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      margin: 0,
    },
    resetButton: {
      alignSelf: 'center',
      marginBottom: theme.spacing.lg
    },
    resetButtonText: {
      color: theme.colors.background || '#ffffff',
      fontSize: 14,
      textDecorationLine: 'underline',
    },
  });
};

export default FilterModal;