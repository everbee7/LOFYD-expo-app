import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import * as Location from 'expo-location';

// Import components
import Tabs from '../../components/common/Tabs';
import MyInfoSection from '../../components/profile/MyInfoSection';
import SettingsSection from '../../components/profile/SettingsSection';
import useAuthStore from '@/store/authStore';
import { biometricService } from '@/services/biometric';
import { authService } from '@/services/auth';

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
  const [activeTab, setActiveTab] = useState('myInfo');
  const [loading, setLoading] = useState(false);
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
    // {
    //   id: 'notifications',
    //   title: 'Push Notifications',
    //   subtitle: 'Receive notifications about new deals and updates',
    //   type: 'toggle',
    //   value: true,
    //   icon: 'notifications-outline'
    // },
    // {
    //   id: 'email',
    //   title: 'Email Notifications',
    //   subtitle: 'Receive email updates about locations and offers',
    //   type: 'toggle',
    //   value: false,
    //   icon: 'mail-outline'
    // },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location access for better restaurant recommendations',
      type: 'toggle',
      value: true,
      icon: 'location-outline'
    },
    // {
    //   id: 'privacy',
    //   title: 'Privacy Policy',
    //   subtitle: 'View our privacy policy and terms',
    //   type: 'navigation',
    //   icon: 'shield-outline',
    //   onPress: () => handleNavigation('privacy')
    // },
    // {
    //   id: 'support',
    //   title: 'Help & Support',
    //   subtitle: 'Get help or contact customer support',
    //   type: 'navigation',
    //   icon: 'help-circle-outline',
    //   onPress: () => handleNavigation('support')
    // },
    // {
    //   id: 'about',
    //   title: 'About',
    //   subtitle: 'App version and information',
    //   type: 'navigation',
    //   icon: 'information-circle-outline',
    //   onPress: () => handleNavigation('about')
    // }
  ]);

  useEffect(() => {
    try {
      const initUserInfo = async () => {
        setLoading(true);
        const data = await authService.getUserData();
        const updatedUserInfo = {
          ...userInfo,
          ...data
        };
        console.log('data', data, updatedUserInfo);
        setUserInfo({
          ...updatedUserInfo
        });
      };

      initUserInfo();
    } catch (error) {

    } finally {
      setLoading(false);
    }
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
  useEffect(() => {
    const checkLocationStatus = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const isLocationEnabled = status === 'granted';

        // Store location permission status
        await AsyncStorage.setItem('locationPermissionGranted', JSON.stringify(isLocationEnabled));

        setSettingsData(prev =>
          prev.map(setting =>
            setting.id === 'location' ? { ...setting, value: isLocationEnabled } : setting
          )
        );
      } catch (error) {
        console.error('Error checking location status:', error);
      }
    };

    checkLocationStatus();
  }, []);

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
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          // Permission granted, update state and storage
          setSettingsData(prev =>
            prev.map(setting =>
              setting.id === 'location' ? { ...setting, value: true } : setting
            )
          );

          await AsyncStorage.setItem('locationPermissionGranted', JSON.stringify(true));

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

          await AsyncStorage.setItem('locationPermissionGranted', JSON.stringify(false));

          Alert.alert(
            'Location Permission Denied',
            'Location services are required for location-based features. You can enable them later in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Settings',
                onPress: () => {
                  // Open device settings - this might need a linking library
                  console.log('Open device settings for location');
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setSettingsData(prev =>
          prev.map(setting =>
            setting.id === 'location' ? { ...setting, value: false } : setting
          )
        );

        await AsyncStorage.setItem('locationPermissionGranted', JSON.stringify(false));
      }
    } else {
      // User is disabling location services
      setSettingsData(prev =>
        prev.map(setting =>
          setting.id === 'location' ? { ...setting, value: false } : setting
        )
      );

      await AsyncStorage.setItem('locationPermissionGranted', JSON.stringify(false));

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
          activeTab={activeTab}
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
    paddingBottom: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
  },
});