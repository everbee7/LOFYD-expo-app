import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

// Import components
import Tabs from '../../components/common/Tabs';
import MyInfoSection from '../../components/profile/MyInfoSection';
import SettingsSection from '../../components/profile/SettingsSection';
import useAuthStore from '@/store/authStore';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  zipCode: string;
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
  const { logout } = useAuthStore();

  // Sample user data
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: 'Michael',
    lastName: 'Jackson',
    email: 'myemail@gmail.com',
    birthday: '01/01/1980',
    zipCode: '75265',
    frequency: '1-2 Weekly'
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
      // Here you would implement biometric authentication setup
      // For example, using expo-local-authentication or react-native-biometrics
      console.log('Enabling biometric authentication...');
      
      // Example implementation:
      // try {
      //   const biometricRecords = await LocalAuthentication.isEnrolledAsync();
      //   if (biometricRecords) {
      //     const result = await LocalAuthentication.authenticateAsync({
      //       promptMessage: 'Authenticate to enable biometric login',
      //       fallbackLabel: 'Use password instead'
      //     });
      //     
      //     if (result.success) {
      //       // Store biometric preference
      //       await AsyncStorage.setItem('biometricEnabled', 'true');
      //       console.log('Biometric authentication enabled');
      //     } else {
      //       // Reset toggle if authentication failed
      //       setSettingsData(prev => 
      //         prev.map(setting => 
      //           setting.id === 'biometric' ? { ...setting, value: false } : setting
      //         )
      //       );
      //     }
      //   } else {
      //     Alert.alert('No Biometric Records', 'Please set up biometric authentication in your device settings first.');
      //     // Reset toggle
      //     setSettingsData(prev => 
      //       prev.map(setting => 
      //         setting.id === 'biometric' ? { ...setting, value: false } : setting
      //       )
      //     );
      //   }
      // } catch (error) {
      //   console.error('Biometric setup error:', error);
      //   // Reset toggle on error
      //   setSettingsData(prev => 
      //     prev.map(setting => 
      //       setting.id === 'biometric' ? { ...setting, value: false } : setting
      //     )
      //   );
      // }
    } else {
      // Disable biometric authentication
      console.log('Disabling biometric authentication...');
      // await AsyncStorage.removeItem('biometricEnabled');
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