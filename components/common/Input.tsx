// components/common/Input.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';

type BaseInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'>;

interface InputProps extends BaseInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  type?: 'text' | 'password' | 'date' | 'time';
  value?: string | Date;
  onChangeText?: (text: string) => void;
  onDateTimeChange?: (date: Date) => void;
  style?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  required = false,
  type = 'text',
  value,
  onDateTimeChange,
  style,
  onChangeText,
  ...props
}) => {
  const { theme } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const styles = createStyles(theme);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleDateTimePress = () => {
    if (type === 'date' || type === 'time') {
      setShowDatePicker(true);
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && onDateTimeChange) {
      onDateTimeChange(selectedDate);
    }
  };

  const formatDateValue = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (type === 'date') {
      return dateObj.toLocaleDateString();
    } else if (type === 'time') {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };

  const getDisplayValue = () => {
    if (type === 'date' || type === 'time') {
      return value ? formatDateValue(value as Date) : '';
    }
    return value as string;
  };

  const getDateTimeIcon = () => {
    if (type === 'date') {
      return <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />;
    } else if (type === 'time') {
      return <Ionicons name="time-outline" size={20} color={theme.colors.primary} />;
    }
    return null;
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry && type !== 'password') return null;

    return (
      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
        <Ionicons
          name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    );
  };

  const renderInput = () => {
    if (type === 'date' || type === 'time') {
      return (
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            style
          ]}
          onPress={handleDateTimePress}
        >
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}

          <View style={styles.dateTimeTextContainer}>
            <Text style={[
              styles.dateTimeText,
              !value && styles.placeholderText
            ]}>
              {getDisplayValue() || props.placeholder}
            </Text>
          </View>

          <View style={styles.rightIconContainer}>
            {getDateTimeIcon()}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[
        styles.inputContainer,
        props.multiline && styles.inputContainerMultiline,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        style
      ]}>
        {leftIcon && !props.multiline && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            props.multiline && styles.inputMultiline,
            leftIcon && !props.multiline && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry || type === 'password') && !props.multiline && styles.inputWithRightIcon,
          ]}
          secureTextEntry={(secureTextEntry || type === 'password') && !isPasswordVisible}
          placeholderTextColor={theme.colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={getDisplayValue()}
          onChangeText={onChangeText}
          {...props}
        />

        {rightIcon && !props.multiline && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}

        {!props.multiline && renderPasswordToggle()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      {renderInput()}

      {(type === 'date' || type === 'time') && showDatePicker && (
        <DateTimePicker
          value={value ? (typeof value === 'string' ? new Date(value) : value) : new Date()}
          mode={type === 'date' ? 'date' : 'time'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateTimeChange}
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelContainer: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '500',
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  inputContainerFocused: {
    borderColor: theme.colors.inputFocusBorder,
    borderWidth: 1,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    minHeight: 80,
  },
  inputWithLeftIcon: {
    marginLeft: theme.spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: theme.spacing.sm,
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
  },
  iconButton: {
    marginLeft: theme.spacing.sm,
  },
  dateTimeTextContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  dateTimeText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.inputPlaceholder,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
});

export default Input;