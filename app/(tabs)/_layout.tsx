import React from "react";
import { Tabs } from 'expo-router';
import { FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

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

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 20,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          display: 'none',
        },
        headerStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          ...theme.shadows.sm,
        },
        headerTitleStyle: {
          ...theme.typography.h3,
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="home" 
              color={color} 
              focused={focused} 
              library="Ionicons" 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="heart" 
              color={color} 
              focused={focused} 
              library="Ionicons" 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile1",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="person" 
              color={color} 
              focused={focused} 
              library="Ionicons" 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});