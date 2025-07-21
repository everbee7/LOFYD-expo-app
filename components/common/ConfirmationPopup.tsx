import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';

interface ConfirmationPopupProps {
  visible: boolean;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: any;
  confirmButtonColor?: 'primary' | 'danger' | 'success';
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  visible,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  onConfirm,
  onCancel,
  theme,
  confirmButtonColor = 'primary'
}) => {
  const styles = createStyles(theme, confirmButtonColor);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, confirmButtonColor: 'primary' | 'danger' | 'success') => {
  const getConfirmButtonColor = () => {
    switch (confirmButtonColor) {
      case 'danger':
        return theme.colors.error || '#ff6b6b';
      case 'success':
        return theme.colors.success || '#51cf66';
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing?.xl || 24,
    },
    container: {
      backgroundColor: theme.colors.surface || theme.colors.background,
      borderRadius: theme.borderRadius?.lg || 12,
      padding: theme.spacing?.xl || 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing?.md || 16,
    },
    message: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing?.xl || 24,
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: 'column',
      gap: theme.spacing?.md || 16,
    },
    button: {
      paddingVertical: theme.spacing?.md || 16,
      paddingHorizontal: theme.spacing?.lg || 20,
      borderRadius: theme.borderRadius?.md || 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    confirmButton: {
      backgroundColor: getConfirmButtonColor(),
    },
    cancelButtonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    confirmButtonText: {
      fontSize: 14,
      color: theme.colors.background || '#ffffff',
      fontWeight: '600',
    },
  });
};

export default ConfirmationPopup;