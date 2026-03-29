import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface VerifiedBadgeProps {
  count: number;
}

export default function VerifiedBadge({ count }: VerifiedBadgeProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.badge}>
      <Ionicons name="checkmark-circle" size={14} color="#2e7d32" />
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  text: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '600',
  },
});
