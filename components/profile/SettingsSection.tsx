import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  icon?: string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingsSectionProps {
  settings: SettingsItem[];
  onUpdateSetting: (id: string, value: any) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  onUpdateSetting
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderSettingItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      >
        {/* Left Content */}
        <View style={styles.leftContent}>
          {item.icon && (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={item.icon as any} 
                size={20} 
                color={theme.colors.primary} 
              />
            </View>
          )}
          
          <View style={styles.textContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>

        {/* Right Content */}
        <View style={styles.rightContent}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value || false}
              onValueChange={(value) => {
                if (item.onToggle) {
                  item.onToggle(value);
                }
                onUpdateSetting(item.id, value);
              }}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryLight,
              }}
              thumbColor={item.value ? theme.colors.primary : theme.colors.surface}
              ios_backgroundColor={theme.colors.border}
            />
          )}
          
          {(item.type === 'navigation' || item.type === 'action') && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    // You can add grouping logic here if needed
    // For now, we'll just have one group
    if (!acc['general']) {
      acc['general'] = [];
    }
    acc['general'].push(setting);
    return acc;
  }, {} as Record<string, SettingsItem[]>);

  return (
    <View style={styles.container}>
      {Object.entries(groupedSettings).map(([groupKey, groupSettings]) => (
        <View key={groupKey} style={styles.settingsGroup}>
          <View style={styles.settingsCard}>
            {groupSettings.map((setting, index) => (
              <View key={setting.id}>
                {renderSettingItem(setting)}
                {index < groupSettings.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsGroup: {
    marginBottom: theme.spacing.lg,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 60,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContent: {
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.lg + 32 + theme.spacing.md, // Align with text
  },
});

export default SettingsSection;