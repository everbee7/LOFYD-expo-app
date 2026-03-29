import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface RatingBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => Promise<void>;
}

export default function RatingBottomSheet({ visible, onClose, onSubmit }: RatingBottomSheetProps) {
  const { theme } = useTheme();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === null) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating);
      setSelectedRating(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRating(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Rate this location</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Is this location honoring its specials? (1 = No, 10 = Yes, definitely)
        </Text>

        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.ratingButton,
                { borderColor: theme.colors.border },
                selectedRating === n && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedRating(n)}
            >
              <Text
                style={[
                  styles.ratingText,
                  { color: theme.colors.text },
                  selectedRating === n && { color: theme.colors.background },
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            (selectedRating === null || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedRating === null || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Verification</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
