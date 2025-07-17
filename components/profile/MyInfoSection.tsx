import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';
import LoadingOverlay from '../common/LoadingOverlay';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  postalCode: string;
  eatOutFrequency: string;
}

interface MyInfoSectionProps {
  userInfo: UserInfo;
  onSave: (updatedInfo: UserInfo) => Promise<void>;
  onLogout: () => void;
  loading?: boolean;
  loadingText?: string;
}

// Frequency options
const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: '2-3 times per week', value: '2-3-week' },
  { label: 'Once a week', value: 'weekly' },
  { label: '2-3 times per month', value: '2-3-month' },
  { label: 'Once a month', value: 'monthly' },
  { label: 'Rarely', value: 'rarely' },
  { label: 'Never', value: 'never' },
];

const MyInfoSection: React.FC<MyInfoSectionProps> = ({
  userInfo,
  onSave,
  onLogout,
  loading = false,
  loadingText = "Getting the info..."
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper function to create a safe date
  const createSafeDate = (dateString: string): Date => {
    if (!dateString) return new Date(1990, 0, 1); // Default fallback
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2030) {
      return date;
    }
    return new Date(1990, 0, 1); // Fallback to safe date
  };

  useEffect(() => {
    setFormData(userInfo);
    
    // Initialize date with better validation
    try {
      const safeDate = createSafeDate(userInfo.birthDate);
      setSelectedDate(safeDate);
    } catch (error) {
      console.error('Date initialization error:', error);
      setSelectedDate(new Date(1990, 0, 1));
    }
  }, [userInfo]);

  const styles = createStyles(theme);

  const handleSave = async () => {
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(userInfo);
    setIsEditing(false);
    
    // Reset date picker
    try {
      const safeDate = createSafeDate(userInfo.birthDate);
      setSelectedDate(safeDate);
    } catch (error) {
      console.error('Date reset error:', error);
      setSelectedDate(new Date(1990, 0, 1));
    }
  };

  const handleFrequencySelect = (value: string) => {
    setFormData({ ...formData, eatOutFrequency: value });
    setShowFrequencyDropdown(false);
  };

  const toggleFrequencyDropdown = () => {
    if (isEditing) {
      setShowFrequencyDropdown(true);
    }
  };

  const handleDateConfirm = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    const formattedDate = date.toLocaleDateString('en-US');
    setFormData({ ...formData, birthDate: formattedDate });
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const getFrequencyLabel = (value: string) => {
    const option = FREQUENCY_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const BirthdayDatePicker = () => {
    try {
      return (
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerLabel}>Birthday</Text>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              !isEditing && styles.datePickerButtonDisabled
            ]}
            onPress={() => isEditing && setShowDatePicker(true)}
            disabled={!isEditing}
          >
            <Text style={[
              styles.datePickerButtonText,
              !formData.birthDate && styles.datePickerPlaceholder
            ]}>
              {formData.birthDate || 'Select birthday'}
            </Text>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={isEditing ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* react-native-date-picker */}
          <DatePicker
            modal
            open={showDatePicker}
            date={selectedDate}
            mode="date"
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onConfirm={handleDateConfirm}
            onCancel={handleDateCancel}
            title="Select Birthday"
            confirmText="Done"
            cancelText="Cancel"
            theme={'light'}
          />
        </View>
      );
    } catch (error) {
      console.error('DatePicker render error:', error);
      return (
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerLabel}>Birthday</Text>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              styles.datePickerButtonDisabled
            ]}
            disabled={true}
          >
            <Text style={styles.datePickerPlaceholder}>
              Date picker temporarily unavailable
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const FrequencyDropdown = () => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>How often do you go out to eat?</Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          !isEditing && styles.dropdownButtonDisabled
        ]}
        onPress={toggleFrequencyDropdown}
        disabled={!isEditing}
      >
        <Text style={[
          styles.dropdownButtonText,
          !formData.eatOutFrequency && styles.dropdownPlaceholder
        ]}>
          {formData.eatOutFrequency ? getFrequencyLabel(formData.eatOutFrequency) : 'Select frequency'}
        </Text>
        <Ionicons 
          name="chevron-down"
          size={20} 
          color={isEditing ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {/* Bottom Sheet Modal */}
      <Modal
        visible={showFrequencyDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFrequencyDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFrequencyDropdown(false)}
          />
          <View style={styles.bottomSheet}>
            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>How often do you go out to eat?</Text>
              <TouchableOpacity 
                onPress={() => setShowFrequencyDropdown(false)}
                style={styles.bottomSheetClose}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Options */}
            <ScrollView style={styles.bottomSheetContent}>
              {FREQUENCY_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.bottomSheetOption,
                    index === FREQUENCY_OPTIONS.length - 1 && styles.bottomSheetOptionLast
                  ]}
                  onPress={() => handleFrequencySelect(option.value)}
                >
                  <Text style={[
                    styles.bottomSheetOptionText,
                    formData.eatOutFrequency === option.value && styles.bottomSheetOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {formData.eatOutFrequency === option.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

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

        {/* Birthday DatePicker */}
        <BirthdayDatePicker />

        {/* Home Zipcode Input */}
        <Input
          label="Home Zipcode"
          placeholder="Home Zipcode"
          value={formData.postalCode}
          onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
          keyboardType="numeric"
          maxLength={10}
          editable={isEditing}
          style={isEditing ? {} : styles.readOnlyInput}
        />

        {/* Frequency Dropdown */}
        <FrequencyDropdown />
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

      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={loading}
        text={loadingText}
      />
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
  },
  
  // DatePicker styles
  datePickerContainer: {
    marginBottom: theme.spacing.md,
  },
  datePickerLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    minHeight: 48,
  },
  datePickerButtonDisabled: {
    backgroundColor: theme.colors.inputReadOnly,
    opacity: 0.8,
  },
  datePickerButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  datePickerPlaceholder: {
    color: theme.colors.textSecondary,
  },
  
  // Dropdown styles
  dropdownContainer: {
    marginBottom: theme.spacing.md,
  },
  dropdownLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    minHeight: 48,
  },
  dropdownButtonDisabled: {
    backgroundColor: theme.colors.inputReadOnly,
    opacity: 0.8,
  },
  dropdownButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: theme.colors.textSecondary,
  },

  // Bottom Sheet Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl || 20,
    borderTopRightRadius: theme.borderRadius.xl || 20,
    maxHeight: '70%',
    paddingBottom: 34, // Safe area bottom padding
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    position: 'relative',
  },
  bottomSheetHandle: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 2,
  },
  bottomSheetTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  bottomSheetClose: {
    padding: theme.spacing.xs,
  },
  bottomSheetContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bottomSheetOptionLast: {
    borderBottomWidth: 0,
  },
  bottomSheetOptionText: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  bottomSheetOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default MyInfoSection;