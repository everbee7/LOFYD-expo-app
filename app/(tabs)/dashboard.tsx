import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList, TextInput, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Components
import AddressInput from '../../components/AddressInput';
import FilterBar from '../../components/FilterBar';
import RestaurantItem from '../../components/RestaurantItem';

// Mock data for restaurants with more details for filtering
const mockRestaurants = [
  {
    id: '1',
    name: "TJ's Seafood Market & Grill",
    description: "It's hard to beat a lobster from TJ's.",
    distance: '1 miles',
    address: '123 Main St, New York, NY',
    cuisine: ['Seafood', 'American'],
    amenities: ['Bar', 'Outdoor Seating'],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    name: "Casa Miguel Mexican Restaurant",
    description: "Authentic Mexican cuisine with fresh ingredients.",
    distance: '2 miles',
    address: '456 Broadway, New York, NY',
    cuisine: ['Mexican', 'Latin'],
    amenities: ['Bar', 'Night Life', 'Margarita'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    name: "The Night Owl Bar & Grill",
    description: "Late night dining with live music.",
    distance: '3 miles',
    address: '789 5th Ave, New York, NY',
    cuisine: ['American', 'Bar Food'],
    amenities: ['Bar', 'Night Life', 'Live Music'],
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop'
  },
  {
    id: '4',
    name: "La Cantina Mexican Grill",
    description: "Family-owned Mexican restaurant.",
    distance: '1.5 miles',
    address: '321 Park Ave, New York, NY',
    cuisine: ['Mexican', 'Tex-Mex'],
    amenities: ['Mexican', 'Margarita', 'Family Friendly'],
    image: 'https://images.unsplash.com/photo-1529417305485-480f906ac1db?w=300&h=200&fit=crop'
  },
  {
    id: '5',
    name: "Downtown Sports Bar",
    description: "Watch the game while enjoying great food.",
    distance: '2.5 miles',
    address: '654 Madison Ave, New York, NY',
    cuisine: ['American', 'Bar Food'],
    amenities: ['Bar', 'Sports', 'Night Life'],
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=200&fit=crop'
  },
  {
    id: '6',
    name: "Sunset Seafood House",
    description: "Fresh seafood with ocean views.",
    distance: '4 miles',
    address: '987 Ocean Blvd, Brooklyn, NY',
    cuisine: ['Seafood', 'Fine Dining'],
    amenities: ['Ocean View', 'Romantic'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop'
  },
  {
    id: '7',
    name: "Tequila Sunrise Mexican Cantina",
    description: "Vibrant atmosphere with authentic Mexican flavors.",
    distance: '3.5 miles',
    address: '147 Houston St, New York, NY',
    cuisine: ['Mexican', 'Cantina'],
    amenities: ['Mexican', 'Bar', 'Margarita', 'Night Life'],
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=300&h=200&fit=crop'
  }
];

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

// Mock address suggestions
const mockAddresses = [
  { id: '1', address: '123 Main St, New York, NY 10001' },
  { id: '2', address: '456 Broadway, New York, NY 10013' },
  { id: '3', address: '789 5th Ave, New York, NY 10022' },
  { id: '4', address: '321 Park Ave, New York, NY 10010' },
  { id: '5', address: '654 Madison Ave, New York, NY 10065' },
];

export default function DashboardScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Specials');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<string[]>(['Mexican', 'Bar', 'Night Life', 'Margarita']);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState(mockAddresses);
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurants);

  useEffect(() => {
    // Filter addresses based on search text
    if (searchText.trim() === '') {
      setFilteredAddresses(mockAddresses);
      setShowAddressSuggestions(false);
    } else {
      const filtered = mockAddresses.filter(addr => 
        addr.address.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAddresses(filtered);
      setShowAddressSuggestions(true);
    }
  }, [searchText]);

  // Filter restaurants based on active filters
  useEffect(() => {
    if (filters.length === 0) {
      setFilteredRestaurants(mockRestaurants);
    } else {
      const filtered = mockRestaurants.filter(restaurant => {
        return filters.some(filter => {
          // Check if filter matches cuisine
          if (restaurant.cuisine.some(cuisine => 
            cuisine.toLowerCase().includes(filter.toLowerCase())
          )) {
            return true;
          }
          
          // Check if filter matches amenities
          if (restaurant.amenities.some(amenity => 
            amenity.toLowerCase().includes(filter.toLowerCase())
          )) {
            return true;
          }
          
          // Check if filter matches address/location
          if (restaurant.address.toLowerCase().includes(filter.toLowerCase())) {
            return true;
          }
          
          return false;
        });
      });
      setFilteredRestaurants(filtered);
    }
  }, [filters]);

  const styles = createStyles(theme);

  const removeFilter = (filterToRemove: string, index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const addFilter = (newFilter: string) => {
    const trimmedFilter = newFilter.trim();
    if (trimmedFilter && !filters.includes(trimmedFilter)) {
      setFilters(prev => [...prev, trimmedFilter]);
    }
  };

  const applySavedFilterSet = (filterSet: any) => {
    setFilters(filterSet.filters);
    setShowSavedFilters(false);
  };

  const selectAddress = (address: string) => {
    setSearchText(address);
    setShowAddressSuggestions(false);
    // Add address as a location filter
    const locationName = address.split(',')[0].trim(); // Get first part of address
    addFilter(`Location: ${locationName}`);
  };

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      // Add search text as a filter
      addFilter(searchText.trim());
      setSearchText('');
      setShowAddressSuggestions(false);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <RestaurantItem restaurant={item} />
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
        <AddressInput
          searchText={searchText}
          onSearchTextChange={handleSearchTextChange}
          onSearchSubmit={handleSearchSubmit}
          onSelectAddress={selectAddress}
          showSuggestions={showAddressSuggestions}
          onShowSuggestionsChange={setShowAddressSuggestions}
          addresses={filteredAddresses}
        />

        {/* Filter Tags */}
        <FilterBar
          filters={filters}
          onRemoveFilter={removeFilter}
        />
      </View>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        style={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No restaurants found matching your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
          </View>
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
  listContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
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