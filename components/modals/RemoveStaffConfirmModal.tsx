import * as React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colours } from '../../theme/colours';

type Props = {
  visible: boolean;
  staffName: string;
  onRemoveAll: () => void;
  onRemoveOne: () => void;
  onCancel: () => void;
};

export default function RemoveStaffConfirmModal({
  visible,
  staffName,
  onRemoveAll,
  onRemoveOne,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>
            Remove {staffName} from today's timeslots?
          </Text>

          <View style={styles.buttonGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonDestructive,
                pressed && styles.buttonPressed
              ]}
              onPress={onRemoveAll}
            >
              <Text style={[styles.buttonText, styles.buttonTextDestructive]}>
                All Timeslots
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonSecondary,
                pressed && styles.buttonPressed
              ]}
              onPress={onRemoveOne}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                Just This One
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonCancel,
                pressed && styles.buttonPressed
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.buttonTextMuted]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colours.border.default,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  } as any,
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
          opacity: 0.9,
          transform: 'translateY(-1px)',
        },
      },
    }),
  } as any,
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDestructive: {
    backgroundColor: colours.status.danger,
    borderColor: colours.status.danger,
  },
  buttonSecondary: {
    backgroundColor: colours.brand.primary,
    borderColor: colours.brand.primary,
  },
  buttonCancel: {
    backgroundColor: colours.bg.canvas,
    borderColor: colours.border.default,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonTextDestructive: {
    color: colours.bg.canvas,
  },
  buttonTextSecondary: {
    color: colours.bg.canvas,
  },
  buttonTextMuted: {
    color: colours.text.secondary,
  },
});
