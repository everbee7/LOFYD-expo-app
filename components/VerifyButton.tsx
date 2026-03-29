import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import RatingBottomSheet from './RatingBottomSheet';
import { locationService } from '../services/location';
import { VerifyLocationResponse } from '../types/location';

interface VerifyButtonProps {
  locationId: string;
  userHasVerified: boolean;
  onVerified: (result: VerifyLocationResponse) => void;
}

export default function VerifyButton({ locationId, userHasVerified, onVerified }: VerifyButtonProps) {
  const { theme } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleSubmit = async (rating: number) => {
    try {
      const result = await locationService.verifyLocation(locationId, rating);
      onVerified(result);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to submit verification';
      Alert.alert('Verification failed', detail);
    }
  };

  if (userHasVerified) {
    return (
      <TouchableOpacity style={[styles.button, styles.verifiedButton]} disabled>
        <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
        <Text style={[styles.text, { color: '#2e7d32' }]}>Verified</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { borderColor: theme.colors.primary }]}
        onPress={() => setSheetVisible(true)}
      >
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.primary }]}>Verify</Text>
      </TouchableOpacity>

      <RatingBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  verifiedButton: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
