import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList, TextInput, Image, Modal, RefreshControl, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useLocationStore from '@/store/locationStore';
import { locationService } from '@/services/location';
import { useDebounce } from '@/hooks/useDebounce';
import { formatSearchedLocation } from '@/utils/format';

// Components
import FilterBar from '../../components/FilterBar';
import LocationItem from '../../components/LocationItem';
import FilterModal, { serviceTypes, priceRanges, sortOptions } from '../../components/dshboard/FilterModal';
import AppliedFiltersModal from '../../components/dshboard/AppliedFiltersModal';

export const serviceTypeLabels = serviceTypes.reduce((acc, service) => {
  acc[service.key] = service.label;
  return acc;
}, {} as { [key: string]: string });

const priceRangeLabels = priceRanges.reduce((acc, price) => {
  acc[price.value] = price.label;
  return acc;
}, {} as { [key: number]: string });

export const sortByLabels = sortOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {} as { [key: string]: string });

// Filter item interface
interface FilterItem {
  type: string;
  value: string;
  displayText: string;
  originalIndex: number;
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const {
    specials,
    locations,
    isLoading,
    error,
    isCurrentLocation,
    searchLocation,
    searchedLocation,
    radiusInMiles,
    sortBy,
    activeFilters,
    activeTab,
    pagination,
    filterSettingLog,
    lastRequestUrls,
    initialize,
    searchWithCurrentParams,
    loadMore,
    setActiveTab,
    setFilters,
    addFilter,
    removeFilter: removeStoreFilter,
    clearError,
    refreshData
  } = useLocationStore();

  const [searchText, setSearchText] = useState('');
  const [displayFilters, setDisplayFilters] = useState<FilterItem[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAppliedFiltersModal, setShowAppliedFiltersModal] = useState(false);

  // Initialize location store on component mount
  useFocusEffect(
    useCallback(() => {
      initialize();
    }, [initialize])
  );

  // Initialize search text with current keywords and watch for changes
  useEffect(() => {
    // Convert keywords array to comma-separated string for display
    const keywordsString = activeFilters.keywords.join(', ');
    setSearchText(keywordsString);
  }, [activeFilters.keywords]);

  // Watch for filter changes and trigger search
  useEffect(() => {
    if (activeFilters) {
      searchWithCurrentParams();
      console.log('activeFilters', activeFilters);
    }
  }, [activeFilters, activeTab]);

  // Parse keywords from comma-separated string
  const parseKeywords = (keywordString: string): string[] => {
    if (!keywordString.trim()) return [];
    return keywordString
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
  };

  // Debounced search function for keywords
  const debouncedKeywordSearch = useDebounce((text: string) => {
    const keywords = parseKeywords(text);

    // Update filters with new keywords in one operation
    setFilters({
      keywords: keywords
    });
  }, 500);

  // Handle search text changes with debounce for keywords
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    debouncedKeywordSearch(text);
  };

  // Convert active filters from the store to display format with types (excluding keywords since they're in search input)
  useEffect(() => {
    const filterItems: FilterItem[] = [];
    let index = 0;

    // Add service type filters
    activeFilters.serviceType.forEach((serviceType) => {
      filterItems.push({
        type: 'serviceType',
        value: serviceType,
        // displayText: `Service: ${serviceTypeLabels[serviceType] || serviceType}`,
        displayText: `${serviceTypeLabels[serviceType] || serviceType}`,
        originalIndex: index++
      });
    });

    // Skip keywords since they're shown in the search input

    // Add cuisine filters
    activeFilters.cuisine.forEach((cuisine) => {
      filterItems.push({
        type: 'cuisine',
        value: cuisine,
        // displayText: `Cuisine: ${cuisine}`,
        displayText: `${cuisine}`,
        originalIndex: index++
      });
    });

    // Add experience filters
    activeFilters.experience.forEach((experience) => {
      filterItems.push({
        type: 'experience',
        value: experience,
        // displayText: `Experience: ${experience}`,
        displayText: `${experience}`,
        originalIndex: index++
      });
    });

    // Add taste filters
    activeFilters.taste.forEach((taste) => {
      filterItems.push({
        type: 'taste',
        value: taste,
        // displayText: `Taste: ${taste}`,
        displayText: `${taste}`,
        originalIndex: index++
      });
    });

    // Add price range filters
    activeFilters.priceRange.forEach((price) => {
      filterItems.push({
        type: 'priceRange',
        value: price.toString(),
        // displayText: `Price: ${priceRangeLabels[price] || '$'.repeat(price)}`,
        displayText: `${priceRangeLabels[price] || '$'.repeat(price)}`,
        originalIndex: index++
      });
    });

    setDisplayFilters(filterItems);
  }, [activeFilters]);

  const styles = createStyles(theme);

  const handleRemoveFilter = (filterItem: FilterItem, index: number) => {
    // Remove filter from store based on type
    switch (filterItem.type) {
      case 'serviceType':
        removeStoreFilter('serviceType', filterItem.value);
        break;
      case 'keywords':
        removeStoreFilter('keywords', filterItem.value);
        break;
      case 'cuisine':
        removeStoreFilter('cuisine', filterItem.value);
        break;
      case 'experience':
        removeStoreFilter('experience', filterItem.value);
        break;
      case 'taste':
        removeStoreFilter('taste', filterItem.value);
        break;
      case 'priceRange':
        removeStoreFilter('priceRange', parseInt(filterItem.value));
        break;
      default:
        // Fallback for unknown filter types
        removeStoreFilter('keywords', filterItem.value);
        break;
    }
  };

  const handleSearchSubmit = () => {
    // Apply keywords when user presses enter/search
    const keywords = parseKeywords(searchText);

    // Update filters with new keywords in one operation
    setFilters({
      keywords: keywords
    });
  };

  const handleLoadMore = () => {
    if (!isLoading && pagination.offset + pagination.limit < pagination.totalSize) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleTabChange = (tab: 'Specials' | 'Locations') => {
    setActiveTab(tab);
  };

  // Convert Special objects to format expected by LocationItem
  const convertSpecialToLocation = (special: any) => ({
    id: special.locationId,
    name: special.title,
    description: special.description,
    distance: special.distFromInMiles != null ? `${special.distFromInMiles.toFixed(1)} miles` : undefined,
    address: special.neighborhood || 'Location not specified',
    cuisine: special.cuisine || [],
    amenities: [...(special.experience || []), ...(special.taste || [])],
    image: special.images?.[0] || '',
    priceRange: special.priceRange,
    serviceType: special.serviceType || [],
    specialId: special.id
  });

  // Convert Location objects to format expected by LocationItem
  const convertLocationToLocation = (location: any) => ({
    id: location.id,
    name: location.name,
    description: location.description,
    distance: location.distFromInMiles != null ? `${location.distFromInMiles.toFixed(1)} miles` : undefined,
    address: `${location.street}, ${location.city}, ${location.state}`,
    cuisine: location.cuisine || [],
    amenities: [...(location.experience || []), ...(location.taste || [])],
    image: location.images?.[0] || '',
    priceRange: location.priceRange,
    serviceType: location.serviceType || []
  });

  const renderSpecialItem = ({ item }: { item: any }) => (
    <LocationItem location={convertSpecialToLocation(item)} isSpecial={true} />
  );

  const renderLocationItem = ({ item }: { item: any }) => (
    <LocationItem location={convertLocationToLocation(item)} />
  );

  // Get current data based on active tab
  const currentData = activeTab === 'Specials' ? specials : locations;
  const currentRenderItem = activeTab === 'Specials' ? renderSpecialItem : renderLocationItem;
  const emptyText = activeTab === 'Specials' ? 'No specials found in your area' : 'No locations found in your area';
  const loadingText = activeTab === 'Specials' ? 'Loading specials...' : 'Loading locations...';
  const resultsText = `${pagination?.totalSize || 0} ${activeTab.toLowerCase()} found`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Top Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerWrap}>
          {/* Tab Section */}
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

          {/* Filter buttons */}
          <View style={styles.filterButtonsContainer}>
            {/* Apply Saved Filters */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowAppliedFiltersModal(true)}
            >
              {/* Saved Filters Button */}
              {filterSettingLog.length > 0 && (
                <Text style={styles.savedFilterBadge}>{filterSettingLog.length}</Text>
              )}

              <Ionicons
                name="bookmark"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.filterButtonText}>Apply Saved Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={theme.dimensions?.searchIconSize || 20}
              color={theme.colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter keywords (e.g. sushi, pizza, tacos)"
              placeholderTextColor={theme.colors.textLight}
              value={searchText}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  // Clear all keyword filters in one operation
                  setFilters({
                    keywords: []
                  });
                }}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={theme.dimensions?.closeIconSize || 20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tags */}
        <FilterBar
          filters={displayFilters}
          onFilterPress={() => setShowFilterModal(true)}
          onRemoveFilter={handleRemoveFilter}
        />

        {/* Location Info Bar */}
        <View style={styles.locationInfo}>
          <View style={styles.locationHead}>
            <Ionicons
              name="location-sharp"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.locationIcon}
            />
            <Text style={styles.locationText}>
              {isCurrentLocation ? "Current Location" : formatSearchedLocation(searchedLocation) || 'Set location in filters'} • {radiusInMiles} miles • Sort: {sortByLabels[sortBy] || sortBy}
            </Text>
          </View>
          <Text style={styles.resultsText}>
            {resultsText}
          </Text>
        </View>

      {/* {(() => {
        const activeRequestUrl = activeTab === 'Specials'
          ? lastRequestUrls.specials
          : lastRequestUrls.locations;
        const label = activeTab === 'Specials' ? 'Specials' : 'Locations';

        if (!activeRequestUrl) return null;

        return (
        <View style={styles.debugInfoContainer}>
          <Text style={styles.debugLabel}>Debug Requests</Text>
          <Text style={styles.debugText}>
            {label}: {activeRequestUrl}
          </Text>
        </View>
        );
      })()} */}
      </View>

      {/* Error Display */}
      {/* {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
            <Text style={styles.errorDismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Data List */}
      <FlatList
        data={currentData}
        renderItem={currentRenderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <Text style={styles.emptyText}>{loadingText}</Text>
            ) : (
              <>
                <Text style={styles.emptyText}>{emptyText}</Text>
                <Text style={styles.emptySubtext}>Try adjusting your location or filters</Text>
              </>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          isLoading && currentData.length > 0 ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>Loading more...</Text>
            </View>
          ) : null
        )}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        theme={theme}
      />

      {/* Applied Filters Modal */}
      <AppliedFiltersModal
        visible={showAppliedFiltersModal}
        onClose={() => setShowAppliedFiltersModal(false)}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerSection: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 10,
  },
  headerWrap: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.background,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  savedFilterBadge: {
    fontSize: 10,
    lineHeight: 10,
    paddingVertical: 3,
    color: theme.colors.background,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: '600',
    position: 'absolute',
    right: -8,
    top: -8,
    width: 16,
    height: 16,
    backgroundColor: theme.colors.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius?.md || 8,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    height: '100%',
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  locationInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary || theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  debugInfoContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 2,
  },
  locationHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resultsText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
    marginLeft: 20,
  },
  debugLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  errorContainer: {
    backgroundColor: theme.colors.error || '#ff6b6b',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.background,
    flex: 1,
  },
  errorDismiss: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  errorDismissText: {
    fontSize: 14,
    color: theme.colors.background,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  loadingFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});