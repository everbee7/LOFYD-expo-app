import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useLocationStore from '@/store/locationStore';
import { FilterSetting } from '@/types/location';
import { sortByLabels } from '@/app/(tabs)/dashboard';

interface AppliedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

const AppliedFiltersModal: React.FC<AppliedFiltersModalProps> = ({
  visible,
  onClose,
  theme
}) => {
  const {
    filterSettingLog,
    applySavedFilterSetting,
    deleteFilterSetting,
    clearFilterSettingLog
  } = useLocationStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilterSummary = (setting: FilterSetting) => {
    const parts = [];

    if (setting.activeFilters.serviceType.length > 0) {
      parts.push(`${setting.activeFilters.serviceType.length} service types`);
    }
    if (setting.activeFilters.cuisine.length > 0) {
      parts.push(`${setting.activeFilters.cuisine.length} cuisines`);
    }
    if (setting.activeFilters.experience.length > 0) {
      parts.push(`${setting.activeFilters.experience.length} experiences`);
    }
    if (setting.activeFilters.priceRange.length > 0) {
      parts.push(`${setting.activeFilters.priceRange.length} price ranges`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No specific filters';
  };

  const getLocationDisplay = (setting: FilterSetting) => {
    if (setting.isCurrentLocation) {
      return {
        icon: '📍',
        text: 'Current Location',
      };
    } else {
      return {
        icon: '📍',
        text: setting.searchLocation || 'Unknown Location',
      };
    }
  };

  const handleApplyFilter = (settingId: string) => {
    applySavedFilterSetting(settingId);
    onClose();
  };

  const handleDeleteFilter = (settingId: string, filterName: string) => {
    Alert.alert(
      'Delete Filter Setting',
      `Are you sure you want to delete "${filterName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFilterSetting(settingId)
        }
      ]
    );
  };

  const handleClearAll = () => {
    if (filterSettingLog.length === 0) return;

    Alert.alert(
      'Clear All Filter Settings',
      'Are you sure you want to delete all saved filter settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearFilterSettingLog
        }
      ]
    );
  };

  const renderFilterItem = ({ item }: { item: FilterSetting }) => {
    const locationDisplay = getLocationDisplay(item);

    return (
      <View style={styles.filterItem}>
        <TouchableOpacity
          style={styles.filterContent}
          onPress={() => handleApplyFilter(item.id)}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterName}>{item.name}</Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{item.activeTab}</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.filterLocation}>
              {locationDisplay.icon} {locationDisplay.text}
            </Text>
          </View>

          <Text style={styles.filterDetails}>
            {item.radiusInMiles} miles • Sort: {sortByLabels[item.sortBy] || item.sortBy}
          </Text>

          <Text style={styles.filterSummary}>
            {getFilterSummary(item)}
          </Text>

          <Text style={styles.filterDate}>
            {formatDate(item.timestamp)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFilter(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error || '#ff6b6b'} />
        </TouchableOpacity>
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Saved Filters</Text>

          {filterSettingLog.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          {filterSettingLog.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="filter-outline"
                size={64}
                color={theme.colors.textLight}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Saved Filters</Text>
              <Text style={styles.emptySubtitle}>
                Apply filters and save them to quickly access your favorite search settings
              </Text>
            </View>
          ) : (
            <FlatList
              data={filterSettingLog}
              renderItem={renderFilterItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: theme.spacing.xs,
  },
  title: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 2,
    textAlign: 'center',
  },
  clearButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  clearButtonText: {
    fontSize: 14,
    color: theme.colors.error || '#ff6b6b',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  filterItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  filterContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  filterName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
  },
  filterBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius?.sm || 6,
    marginLeft: theme.spacing.sm,
  },
  filterBadgeText: {
    fontSize: 12,
    color: theme.colors.background,
    fontWeight: '500',
  },
  locationContainer: {
    marginBottom: theme.spacing.xs,
  },
  filterLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  locationSubtitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
    marginLeft: 16, // Indent to align with text after emoji
  },
  filterDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  filterSummary: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  filterDate: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AppliedFiltersModal;