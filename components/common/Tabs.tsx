import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Tab {
  key: string;
  title: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  style?: any;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.tabsWrapper}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tabText,
                isActive ? styles.activeTabText : styles.inactiveTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  tab: {
    width: 120,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactiveTab: {
    backgroundColor: '#f3f3f3',
    borderColor: theme.colors.border,
  },
  tabText: {
    ...theme.typography.button,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.background,
  },
  inactiveTabText: {
    color: theme.colors.textSecondary,
  },
});

export default Tabs;