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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
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
    color: theme.colors.text,
  },
});

export default Tabs;