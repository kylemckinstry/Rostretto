import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { colours } from '../../theme/colours';

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackEntry {
  managerId: string;
  managerName: string;
  employeeId: string;
  employeeName: string;
  skill: string;
  rating: FeedbackRating;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number; // Unix timestamp for sorting
}

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: FeedbackRating) => void;
  employeeName: string;
  employeeImageUrl?: string;
  employeeRole?: string;
  skill: string;
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

export default function FeedbackModal({
  visible,
  onClose,
  onSubmit,
  employeeName,
  employeeImageUrl,
  employeeRole,
  skill,
}: FeedbackModalProps) {
  const [selectedRating, setSelectedRating] = React.useState<FeedbackRating | null>(null);

  const handleRatingSelect = (rating: FeedbackRating) => {
    setSelectedRating(rating);
    // Auto-submit after brief delay for visual feedback
    setTimeout(() => {
      onSubmit(rating);
      setSelectedRating(null);
    }, 200);
  };

  const getRatingColor = (rating: FeedbackRating): string => {
    if (rating <= 2) return colours.status.danger;
    if (rating === 3) return colours.status.warning;
    return colours.status.success;
  };

  const firstName = employeeName.split(' ')[0];
  const skillText = skill.toLowerCase() === 'coffee' || skill.toLowerCase() === 'sandwich'
    ? `${skill.toLowerCase()} making`
    : skill.toLowerCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Employee Avatar */}
          <View style={styles.avatarContainer}>
            {employeeImageUrl ? (
              <Image source={{ uri: employeeImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials(employeeName)}</Text>
              </View>
            )}
          </View>

          {/* Employee Name */}
          <Text style={styles.employeeName}>{employeeName}</Text>
          <Text style={styles.role}>{employeeRole || 'Staff'}</Text>

          {/* Question */}
          <Text style={styles.question}>
            How was {firstName}'s {skillText} today?
          </Text>

          {/* Rating Buttons */}
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Pressable
                key={rating}
                style={[
                  styles.ratingButton,
                  {
                    borderColor: getRatingColor(rating as FeedbackRating),
                    backgroundColor: selectedRating === rating
                      ? getRatingColor(rating as FeedbackRating)
                      : 'transparent',
                  },
                ]}
                onPress={() => handleRatingSelect(rating as FeedbackRating)}
              >
                <Text
                  style={[
                    styles.ratingText,
                    {
                      color: selectedRating === rating
                        ? colours.bg.canvas
                        : getRatingColor(rating as FeedbackRating),
                    },
                  ]}
                >
                  {rating}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 32,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colours.bg.subtle,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colours.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colours.brand.primary,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colours.text.muted,
    marginBottom: 24,
  },
  question: {
    fontSize: 14,
    color: colours.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
