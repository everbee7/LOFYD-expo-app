import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface FilterItem {
  type: string;
  value: string;
  displayText: string;
  originalIndex: number;
}

interface FilterBarProps {
  filters: FilterItem[];
  onFilterPress?: () => void;
  onRemoveFilter: (filter: FilterItem, index: number) => void;
}

export default function FilterBar({ filters, onFilterPress, onRemoveFilter }: FilterBarProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderFilterTag = ({ item, index }: { item: FilterItem, index: number }) => (
    <TouchableOpacity
      style={styles.filterTag}
      onPress={() => onRemoveFilter(item, index)}
    >
      <Text style={styles.filterTagText} numberOfLines={1} ellipsizeMode="tail">
        {item.displayText}
      </Text>
      <Ionicons
        name="close"
        size={theme.dimensions?.closeIconSize || 14}
        color={theme.colors.background}
        style={styles.filterTagClose}
      />
    </TouchableOpacity>
  );

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    }
  }

  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity style={styles.filterIconButton} onPress={handleFilterPress}>
        <Ionicons
          name="options"
          size={20}
          color={theme.colors.text}
        />
        {filters.length > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {filters.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <FlatList
        data={filters}
        renderItem={renderFilterTag}
        keyExtractor={(item, index) => `${item.type}-${item.value}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  filterIconButton: {
    position: 'relative',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    width: theme.dimensions?.filterIconSize,
    height: theme.dimensions?.filterIconSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    left: -theme.spacing.sm,
    top: -theme.spacing.sm,
    width: theme.dimensions?.filterBadgeSize || 16,
    height: theme.dimensions?.filterBadgeSize || 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.primary,
  },
  filterBadgeText: {
    ...theme.typography.badgeText,
    color: theme.colors.background,
  },
  filterList: {
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTagText: {
    ...theme.typography.filterText,
    color: theme.colors.background,
    flexShrink: 1, // Allow text to shrink
  },
  filterTagClose: {
    marginLeft: theme.spacing.xs,
    flexShrink: 0, // Keep close button fixed size
  },
});