import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

// Import components
import Tabs from '../../components/common/Tabs';
import MyInfoSection from '../../components/profile/MyInfoSection';
import SettingsSection from '../../components/profile/SettingsSection';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth';
import { biometricService } from '@/services/biometric';
import { locationService } from '@/services/location';
import { useFocusEffect } from '@react-navigation/native';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  postalCode: string;
  eatOutFrequency: string;
}

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

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(params.activeTab ?? 'myInfo');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const { logout, user, updateUserData } = useAuthStore();

  // Sample user data
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    postalCode: '',
    eatOutFrequency: ''
  });

  // Sample settings data
  const [settingsData, setSettingsData] = useState<SettingsItem[]>([
    {
      id: 'biometric',
      title: 'Enable Biometric',
      subtitle: 'Use fingerprint or face recognition to unlock the app',
      type: 'toggle',
      value: false,
      icon: 'finger-print-outline'
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location access for better restaurant recommendations',
      type: 'toggle',
      value: false,
      icon: 'location-outline'
    }
  ]);

  useEffect(() => {
    const initUserInfo = async () => {
      try {
        setLoading(true);
        setLoadingText("Getting the info...");
        const data = await authService.getUserData();
        const updatedUserInfo = {
          ...userInfo,
          ...data
        };
        setUserInfo({
          ...updatedUserInfo
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    initUserInfo();
  }, []);

  // Check biometric status when component loads
  useEffect(() => {
    const checkBiometricStatus = async () => {
      try {
        const isBiometricEnabled = await biometricService.isBiometricEnabled();
        setSettingsData(prev =>
          prev.map(setting =>
            setting.id === 'biometric' ? { ...setting, value: isBiometricEnabled } : setting
          )
        );
      } catch (error) {
        console.error('Error checking biometric status:', error);
      }
    };

    checkBiometricStatus();
  }, []);

  // Check location permission status when component loads
  useFocusEffect((
    useCallback(() => {
      const syncLocationSetting = async () => {
        try {
          console.log('syncLocationSetting');
          const status = await locationService.getStoredPermissionStatus();
          const isLocationEnabled = status === 'granted';
  
          // Update settings state to reflect actual status
          setSettingsData(prev =>
            prev.map(setting =>
              setting.id === 'location' ? { ...setting, value: isLocationEnabled } : setting
            )
          );
        } catch (error) {
          console.error('Error checking location permission:', error);
          // Default to false if there's an error
          setSettingsData(prev =>
            prev.map(setting =>
              setting.id === 'location' ? { ...setting, value: false } : setting
            )
          );
        }
      };
      syncLocationSetting();
    }, [])
  ));

  const styles = createStyles(theme);

  const tabs = [
    { key: 'myInfo', title: 'My Info' },
    { key: 'settings', title: 'Settings' }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSaveUserInfo = async (updatedInfo: UserInfo) => {
    setLoading(true);
    setLoadingText("Saving...");
    try {
      console.log('Saving user info:', updatedInfo);
      await updateUserData({
        ...updatedInfo,
        id: user?.userId || ''
      });
      setUserInfo(updatedInfo);
      console.log('User info saved successfully');
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
  };

  const handleUpdateSetting = (id: string, value: any) => {
    // Handle location setting specifically
    if (id === 'location') {
      handleLocationToggle(value);
      return;
    }

    setSettingsData(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    );

    // Handle biometric setting specifically
    if (id === 'biometric') {
      handleBiometricToggle(value);
    } else {
      console.log(`Setting ${id} updated to:`, value);
    }
  };

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        // Use the comprehensive permission flow
        const granted = await locationService.handleLocationPermissionFlow();

        if (granted) {
          // Permission granted, update state
          setSettingsData(prev =>
            prev.map(setting =>
              setting.id === 'location' ? { ...setting, value: true } : setting
            )
          );

          Alert.alert(
            'Location Enabled',
            'You can now use current location features in the app.',
            [{ text: 'OK' }]
          );
        } else {
          // Permission denied, keep toggle off
          setSettingsData(prev =>
            prev.map(setting =>
              setting.id === 'location' ? { ...setting, value: false } : setting
            )
          );
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setSettingsData(prev =>
          prev.map(setting =>
            setting.id === 'location' ? { ...setting, value: false } : setting
          )
        );

        Alert.alert(
          'Error',
          'Unable to request location permission. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // User is disabling location services
      setSettingsData(prev =>
        prev.map(setting =>
          setting.id === 'location' ? { ...setting, value: false } : setting
        )
      );

      await locationService.setStoredPermissionStatus('denied');

      Alert.alert(
        'Location Disabled',
        'Location-based features will not be available. You can re-enable this in settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // Get current user token for biometric setup
      const idToken = await AsyncStorage.getItem('idToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!idToken || !refreshToken || !userId) {
        console.error('No user token found for biometric setup');
        setSettingsData(prev =>
          prev.map(setting =>
            setting.id === 'biometric' ? { ...setting, value: false } : setting
          )
        );
        return;
      }

      // Enable biometric authentication
      const success = await biometricService.enableBiometric(userId, idToken, refreshToken);

      if (!success) {
        // Reset toggle if enabling failed
        setSettingsData(prev =>
          prev.map(setting =>
            setting.id === 'biometric' ? { ...setting, value: false } : setting
          )
        );
      }
    } else {
      // Disable biometric authentication
      await biometricService.disableBiometric();
      console.log('Biometric authentication disabled');
    }
  };

  function handleNavigation(screen: string) {
    console.log(`Navigate to ${screen}`);
    // Handle navigation to different screens
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'myInfo':
        return (
          <MyInfoSection
            userInfo={userInfo}
            onSave={handleSaveUserInfo}
            onLogout={handleLogout}
            loading={loading}
            loadingText={loadingText}
          />
        );
      case 'settings':
        return (
          <SettingsSection
            settings={settingsData}
            onUpdateSetting={handleUpdateSetting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab as string}
          onTabPress={setActiveTab}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: theme.spacing.xs,
  },
  tabsContainer: {
    paddingHorizontal: theme.spacing.xxxl,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl * 2,
  },
});