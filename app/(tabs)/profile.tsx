import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

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
  birthday: string;
  postalCode: string;
  frequency: string;
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
  const { logout, user } = useAuthStore();

  // Sample user data
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    postalCode: '',
    frequency: ''
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
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive notifications about new deals and updates',
      type: 'toggle',
      value: true,
      icon: 'notifications-outline'
    },
    {
      id: 'email',
      title: 'Email Notifications',
      subtitle: 'Receive email updates about restaurants and offers',
      type: 'toggle',
      value: false,
      icon: 'mail-outline'
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Allow location access for better restaurant recommendations',
      type: 'toggle',
      value: true,
      icon: 'location-outline'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy and terms',
      type: 'navigation',
      icon: 'shield-outline',
      onPress: () => handleNavigation('privacy')
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'Get help or contact customer support',
      type: 'navigation',
      icon: 'help-circle-outline',
      onPress: () => handleNavigation('support')
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      type: 'navigation',
      icon: 'information-circle-outline',
      onPress: () => handleNavigation('about')
    }
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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
  },
  header: {
    paddingTop: theme.spacing.lg,
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
    fontSize: 16,
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