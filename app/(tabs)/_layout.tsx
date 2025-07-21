// tabs/_layout.tsx
import React from "react";
import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
      tabBar={() => <CustomTabBar />} // Use custom tab bar
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}