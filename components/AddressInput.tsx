import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AddressInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit: () => void;
  onSelectAddress: (address: string) => void;
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  addresses: Array<{
    id: string;
    address: string;
  }>;
}

export default function AddressInput({
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  onSelectAddress,
  showSuggestions,
  onShowSuggestionsChange,
  addresses
}: AddressInputProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderAddressSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.addressSuggestion}
      onPress={() => onSelectAddress(item.address)}
    >
      <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
      <Text style={styles.addressText}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Current Location"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={searchText}
          onChangeText={onSearchTextChange}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          onFocus={() => {
            if (searchText.trim() !== '') {
              onShowSuggestionsChange(true);
            }
          }}
        />
        <TouchableOpacity onPress={onSearchSubmit}>
          <Ionicons 
            name="search" 
            size={theme.dimensions?.searchIconSize || 20} 
            color={theme.colors.textLight} 
            style={styles.searchIcon} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Address Suggestions */}
      {showSuggestions && (
        <View style={styles.addressSuggestionsContainer}>
          <FlatList
            data={addresses}
            renderItem={renderAddressSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.addressSuggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  searchIcon: {
    right: 0,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  addressSuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopWidth: 0,
    maxHeight: 200,
    zIndex: 100,
  },
  addressSuggestionsList: {
    maxHeight: 200,
  },
  addressSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addressText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});