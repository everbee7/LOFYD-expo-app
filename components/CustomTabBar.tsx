// components/CustomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

const TabIcon = ({
  name,
  color,
  focused,
  library = 'FontAwesome5'
}: {
  name: any,
  color: string,
  focused: boolean,
  library?: 'FontAwesome5' | 'Ionicons' | 'AntDesign'
}) => {
  const { theme } = useTheme();

  const renderIcon = () => {
    const iconColor = focused ? theme.colors.primary : color;
    const iconSize = 24;

    switch (library) {
      case 'Ionicons':
        return <Ionicons name={name} size={iconSize} color={iconColor} />;
      case 'AntDesign':
        return <AntDesign name={name} size={iconSize} color={iconColor} />;
      case 'FontAwesome5':
      default:
        return <FontAwesome5 name={name} size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={[
      styles.iconContainer,
      {
        backgroundColor: focused ? theme.colors.inputBackground : 'transparent',
      }
    ]}>
      {renderIcon()}
    </View>
  );
};

interface TabItem {
  key: string;
  title: string;
  iconName: string;
  library: 'FontAwesome5' | 'Ionicons' | 'AntDesign';
  route: string;
}

const tabs: TabItem[] = [
  {
    key: 'dashboard',
    title: 'Home',
    iconName: 'home',
    library: 'Ionicons',
    route: '/dashboard'
  },
  {
    key: 'profile',
    title: 'Manage',
    iconName: 'person',
    library: 'Ionicons',
    route: '/profile'
  }
];

export default function CustomTabBar() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isTabActive = (route: string) => {
    // Check if current path starts with the tab route
    return pathname.startsWith(route.replace('/tabs', ''));
  };

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[
      styles.tabBar,
      {
        backgroundColor: theme.colors.tabBarBackground,
        borderTopColor: theme.colors.border,
      }
    ]}>
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.route);
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <TabIcon
              name={tab.iconName}
              color={theme.colors.textLight}
              focused={isActive}
              library={tab.library}
            />
            <Text style={[
              styles.tabLabel,
              {
                color: isActive ? theme.colors.primary : theme.colors.textLight,
              }
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 80 + (Platform.OS === 'ios' ? 10 : 0),
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});