import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList, TextInput, Image, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useLocationStore from '@/store/locationStore';

// Components
import FilterBar from '../../components/FilterBar';
import RestaurantItem from '../../components/RestaurantItem';

// Filter item interface
interface FilterItem {
  type: string;
  value: string;
  displayText: string;
  originalIndex: number;
}

// Mock saved filter sets
const savedFilterSets = [
  {
    id: '1',
    name: 'My Favorites',
    filters: ['Mexican', 'Bar', 'Night Life']
  },
  {
    id: '2',
    name: 'Casual Dining',
    filters: ['Bar', 'Seafood', 'Family Friendly']
  },
  {
    id: '3',
    name: 'Date Night',
    filters: ['Fine Dining', 'Romantic', 'Wine Bar']
  }
];

export default function DashboardScreen() {
  const { theme } = useTheme();
  const {
    specials,
    isLoading,
    error,
    currentLocation,
    radiusInMiles,
    sortBy,
    activeFilters,
    pagination,
    initialize,
    searchWithCurrentParams,
    loadMore,
    setLocation,
    setRadius,
    setSortBy,
    addFilter,
    removeFilter: removeStoreFilter,
    clearFilters,
    clearError,
    refreshSpecials
  } = useLocationStore();

  const [activeTab, setActiveTab] = useState('Specials');
  const [searchText, setSearchText] = useState('');
  const [displayFilters, setDisplayFilters] = useState<FilterItem[]>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Initialize location store on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Convert active filters from the store to display format with types
  useEffect(() => {
    const filterItems: FilterItem[] = [];
    let index = 0;

    // Add service type filters
    activeFilters.serviceType.forEach((serviceType) => {
      filterItems.push({
        type: 'serviceType',
        value: serviceType,
        displayText: `Service: ${serviceType}`,
        originalIndex: index++
      });
    });

    // Add keyword filters
    activeFilters.keywords.forEach((keyword) => {
      filterItems.push({
        type: 'keywords',
        value: keyword,
        displayText: `Keyword: ${keyword}`,
        originalIndex: index++
      });
    });

    // Add cuisine filters
    activeFilters.cuisine.forEach((cuisine) => {
      filterItems.push({
        type: 'cuisine',
        value: cuisine,
        displayText: `Cuisine: ${cuisine}`,
        originalIndex: index++
      });
    });

    // Add experience filters
    activeFilters.experience.forEach((experience) => {
      filterItems.push({
        type: 'experience',
        value: experience,
        displayText: `Experience: ${experience}`,
        originalIndex: index++
      });
    });

    // Add taste filters
    activeFilters.taste.forEach((taste) => {
      filterItems.push({
        type: 'taste',
        value: taste,
        displayText: `Taste: ${taste}`,
        originalIndex: index++
      });
    });

    // Add price range filters
    activeFilters.priceRange.forEach((price) => {
      filterItems.push({
        type: 'priceRange',
        value: price.toString(),
        displayText: `Price: $${price}`,
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

  const addNewFilter = (newFilter: any) => {
    const trimmedFilter = newFilter.trim();
    if (trimmedFilter) {
      // Check if filter already exists (checking all filter types)
      const filterExists = displayFilters.some(filter => 
        filter.value.toLowerCase() === trimmedFilter.toLowerCase()
      );
      
      if (!filterExists) {
        // Add as keyword filter by default
        addFilter('keywords', trimmedFilter);
      }
    }
  };

  const applySavedFilterSet = (filterSet: any) => {
    clearFilters();
    filterSet.filters.forEach((filter: any) => {
      addFilter('keywords', filter);
    });
    setShowSavedFilters(false);
    searchWithCurrentParams();
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      setLocation(searchText.trim(), 'locale');
      searchWithCurrentParams();
    }
  };

  const handleSearchTextChange = (text: any) => {
    setSearchText(text);
  };

  const handleLoadMore = () => {
    if (!isLoading && pagination.offset + pagination.limit < pagination.totalSize) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    refreshSpecials();
  };

  // Convert Special objects to format expected by RestaurantItem
  const convertSpecialToRestaurant = (special: any) => ({
    id: special.id,
    name: special.title,
    description: special.description,
    distance: `${special.distFromInMiles?.toFixed(1)} miles`,
    address: special.neighborhood || 'Location not specified',
    cuisine: special.cuisine || [],
    amenities: [...(special.experience || []), ...(special.taste || [])],
    image: special.images?.[0] || '',
    priceRange: special.priceRange,
    serviceType: special.serviceType || []
  });

  const renderSpecialItem = ({ item }: { item: any }) => (
    <RestaurantItem restaurant={convertSpecialToRestaurant(item)} />
  );

  const renderSavedFilterSet = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.savedFilterItem}
      onPress={() => applySavedFilterSet(item)}
    >
      <Text style={styles.savedFilterName}>{item.name}</Text>
      <Text style={styles.savedFilterPreview}>{item.filters.join(', ')}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
              onPress={() => setActiveTab('Specials')}
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
              onPress={() => setActiveTab('Locations')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'Locations' && styles.activeTabText
              ]}>
                Locations
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSavedFilters(true)}
          >
            <Text style={styles.filterButtonText}>Apply Saved Filters</Text>
            <Ionicons
              name="chevron-down"
              size={theme.dimensions?.chevronIconSize || 16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
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
              placeholder="Enter location (city, postal code, coordinates)"
              placeholderTextColor={theme.colors.textLight}
              value={searchText}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
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
          onRemoveFilter={handleRemoveFilter}
        />

        {/* Location Info Bar */}
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 {currentLocation} • {radiusInMiles} miles • Sort: {sortBy}
          </Text>
          <Text style={styles.resultsText}>
            {pagination.totalSize} specials found
          </Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
            <Text style={styles.errorDismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Specials List */}
      <FlatList
        data={specials}
        renderItem={renderSpecialItem}
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
              <Text style={styles.emptyText}>Loading specials...</Text>
            ) : (
              <>
                <Text style={styles.emptyText}>No specials found in your area</Text>
                <Text style={styles.emptySubtext}>Try adjusting your location or filters</Text>
              </>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          isLoading && specials.length > 0 ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>Loading more...</Text>
            </View>
          ) : null
        )}
      />

      {/* Saved Filters Modal */}
      <Modal
        visible={showSavedFilters}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSavedFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSavedFilters(false)}
        >
          <View style={styles.savedFiltersModal}>
            <Text style={styles.modalTitle}>Saved Filter Sets</Text>
            <FlatList
              data={savedFilterSets}
              renderItem={renderSavedFilterSet}
              keyExtractor={(item) => item.id}
              style={styles.savedFiltersList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
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
    ...theme.typography.tabText,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.background,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
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
    ...theme.typography.body,
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
  locationText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  resultsText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: 2,
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
    ...theme.typography.bodySmall,
    color: theme.colors.background,
    flex: 1,
  },
  errorDismiss: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  errorDismissText: {
    ...theme.typography.bodySmall,
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
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedFiltersModal: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '60%',
    minWidth: '80%',
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  savedFiltersList: {
    maxHeight: 300,
  },
  savedFilterItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  savedFilterName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  savedFilterPreview: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});