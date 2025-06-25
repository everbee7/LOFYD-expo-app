import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from 'react-native';

// Toggle Button Component
interface ToggleButtonProps {
  item: string | number;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
  style?: ViewStyle;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  item,
  label,
  isSelected,
  onPress,
  theme,
  style
}) => {
  const styles = createToggleButtonStyles(theme);

  return (
    <TouchableOpacity
      key={item.toString()}
      style={[
        styles.toggleButton,
        isSelected && styles.toggleButtonSelected,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.toggleButtonText,
        isSelected && styles.toggleButtonTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const createToggleButtonStyles = (theme: any) => StyleSheet.create({
  toggleButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.background || '#ffffff',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  toggleButtonSelected: {
    backgroundColor: theme.colors.background || '#ffffff',
    borderColor: theme.colors.background || '#ffffff',
  },
  toggleButtonText: {
    color: theme.colors.background || '#ffffff',
    fontSize: 9,
  },
  toggleButtonTextSelected: {
    color: theme.colors.primary || '#1e7065',
    fontWeight: '500',
  },
});

export default ToggleButton