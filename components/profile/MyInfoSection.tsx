import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  zipCode: string;
  frequency: string;
}

interface MyInfoSectionProps {
  userInfo: UserInfo;
  onSave: (updatedInfo: UserInfo) => Promise<void>;
  onLogout: () => void;
  loading?: boolean;
}

const MyInfoSection: React.FC<MyInfoSectionProps> = ({
  userInfo,
  onSave,
  onLogout,
  loading = false
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const [isEditing, setIsEditing] = useState(false);

  const styles = createStyles(theme);

  const handleSave = async () => {
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    setFormData(userInfo);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>
          Hey, {userInfo.firstName}!
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Email Input */}
        <Input
          label="Email Address"
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
        />

        {/* First Name Input */}
        <Input
          label="First Name"
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          autoCapitalize="words"
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
        />

        {/* Last Name Input */}
        <Input
          label="Last Name"
          placeholder="Last Name"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          autoCapitalize="words"
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
        />

        {/* Birthday Input */}
        <Input
          label="Birthday"
          placeholder="MM/DD/YYYY"
          value={formData.birthday}
          onChangeText={(text) => setFormData({ ...formData, birthday: text })}
          keyboardType="numeric"
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
          rightIcon={<Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />}
        />

        {/* Home Zipcode Input */}
        <Input
          label="Home Zipcode"
          placeholder="Home Zipcode"
          value={formData.zipCode}
          onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
          keyboardType="numeric"
          maxLength={10}
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
        />

        {/* Frequency Input */}
        <Input
          label="How often do you go out to eat?"
          placeholder="Frequency"
          value={formData.frequency}
          onChangeText={(text) => setFormData({ ...formData, frequency: text })}
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {!isEditing ? (
          <>
            <Button
              title="Edit Profile"
              onPress={() => setIsEditing(true)}
              variant="outline"
              leftIcon={<Ionicons name="create-outline" size={18} color={theme.colors.primary} />}
              style={styles.editButton}
            />

            <Button
              title="Logout"
              onPress={onLogout}
              variant="primary"
              leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.background} />}
              style={styles.logoutButton}
            />
          </>
        ) : (
          <View style={styles.editButtonsRow}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="ghost"
              style={styles.editActionButton}
            />

            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              loading={loading}
              leftIcon={<Ionicons name="checkmark-outline" size={18} color={theme.colors.background} />}
              style={styles.editActionButton}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingSection: {
    marginBottom: theme.spacing.xl,
  },
  greetingText: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    textAlign: 'left',
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  readOnlyInput: {
    backgroundColor: theme.colors.inputReadOnly,
    opacity: 0.8,
  },
  actionSection: {
    marginTop: theme.spacing.lg,
  },
  editButton: {
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    marginBottom: theme.spacing.xl,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  editActionButton: {
    flex: 1,
  }
});

export default MyInfoSection;