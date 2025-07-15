import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';

// Import your custom components
import Input from '../common/Input';
import Button from '../common/Button';

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
  loading = false
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setFormData(userInfo);
    // Initialize date from birthDate string
    if (userInfo.birthDate) {
      const date = new Date(userInfo.birthDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, [userInfo]);

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
    // Reset date picker
    if (userInfo.birthDate) {
      const date = new Date(userInfo.birthDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  };

  const handleFrequencySelect = (eatOutFrequency: string) => {
    setFormData({ ...formData, eatOutFrequency });
    setShowFrequencyModal(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Format date as MM/DD/YYYY
      const formattedDate = selectedDate.toLocaleDateString('en-US');
      setFormData({ ...formData, birthDate: formattedDate });
    }
  };

  const getFrequencyLabel = (value: string) => {
    const option = FREQUENCY_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const BirthdayDatePicker = () => (
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
      
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );

  const FrequencyDropdown = () => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>How often do you go out to eat?</Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          !isEditing && styles.dropdownButtonDisabled
        ]}
        onPress={() => isEditing && setShowFrequencyModal(true)}
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
    </View>
  );

  const FrequencyModal = () => (
    <Modal
      visible={showFrequencyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFrequencyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How often do you go out to eat?</Text>
            <TouchableOpacity 
              onPress={() => setShowFrequencyModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={FREQUENCY_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  formData.eatOutFrequency === item.value && styles.modalOptionSelected
                ]}
                onPress={() => handleFrequencySelect(item.value)}
              >
                <Text style={[
                  styles.modalOptionText,
                  formData.eatOutFrequency === item.value && styles.modalOptionTextSelected
                ]}>
                  {item.label}
                </Text>
                {formData.eatOutFrequency === item.value && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
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

        {/* Birthday DateTimePicker */}
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

      {/* Frequency Modal */}
      <FrequencyModal />
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
  
  // DateTimePicker styles
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalList: {
    paddingHorizontal: theme.spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionSelected: {
    // backgroundColor: theme.colors.primaryLight || theme.colors.primary + '10',
  },
  modalOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default MyInfoSection;