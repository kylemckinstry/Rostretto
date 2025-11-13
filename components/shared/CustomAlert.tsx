import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { colours } from '../../theme/colours';

type AlertConfig = {
  message: string;
  onClose: () => void;
};

let showAlertFn: ((config: AlertConfig) => void) | null = null;

export function showAlert(message: string) {
  if (showAlertFn) {
    showAlertFn({ message, onClose: () => {} });
  } else {
    // Fallback to native alert if provider not available
    alert(message);
  }
}

export function CustomAlertProvider({ children }: { children: React.ReactNode }) {
  const [alertConfig, setAlertConfig] = React.useState<AlertConfig | null>(null);

  React.useEffect(() => {
    showAlertFn = (config) => setAlertConfig(config);
    return () => {
      showAlertFn = null;
    };
  }, []);

  const handleClose = () => {
    alertConfig?.onClose();
    setAlertConfig(null);
  };

  return (
    <>
      {children}
      <Modal
        visible={!!alertConfig}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Rostretto</Text>
            <Text style={styles.message}>{alertConfig?.message}</Text>
            <Pressable style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  message: {
    fontSize: 15,
    color: colours.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colours.brand.primary,
    borderWidth: 1,
    borderColor: colours.brand.primary,
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
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.bg.canvas,
    letterSpacing: 0.2,
  },
});
