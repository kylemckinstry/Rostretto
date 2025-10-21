/**
 * Shared RolePickerRow component for both mobile and web interfaces
 * Provides toggle-based role selection with looping navigation
 */

import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ROLE_OPTIONS, type Role } from '../../constants/staffAssignment';
import { colours } from '../../theme';

type RolePickerRowProps = {
  label: string;
  value: string;
  onChange: (role: string) => void;
  variant?: 'mobile' | 'web';
};

export function RolePickerRow({ 
  label, 
  value, 
  onChange, 
  variant = 'mobile' 
}: RolePickerRowProps) {
  const currentIndex = ROLE_OPTIONS.findIndex(role => role === value);
  
  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? ROLE_OPTIONS.length - 1 : currentIndex - 1;
    onChange(ROLE_OPTIONS[newIndex]);
  };
  
  const handleNext = () => {
    const newIndex = currentIndex === ROLE_OPTIONS.length - 1 ? 0 : currentIndex + 1;
    onChange(ROLE_OPTIONS[newIndex]);
  };

  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.label, variant === 'web' && styles.labelWeb]}>{label}</Text>
      <View style={[styles.pickerContainer, variant === 'web' && styles.pickerContainerWeb]}>
        <Pressable 
          style={[styles.arrowButton, variant === 'web' && styles.arrowButtonWeb]}
          onPress={handlePrevious}
        >
          <Text style={[styles.arrowText, variant === 'web' && styles.arrowTextWeb]}>‹</Text>
        </Pressable>
        
        <View style={[styles.pickerDisplay, variant === 'web' && styles.pickerDisplayWeb]}>
          <Text style={[styles.pickerDisplayText, variant === 'web' && styles.pickerDisplayTextWeb]}>
            {value}
          </Text>
        </View>
        
        <Pressable 
          style={[styles.arrowButton, variant === 'web' && styles.arrowButtonWeb]}
          onPress={handleNext}
        >
          <Text style={[styles.arrowText, variant === 'web' && styles.arrowTextWeb]}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Shared base styles
  fieldRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  
  // Mobile styles (default)
  label: { 
    width: 50, 
    fontWeight: '700' as const, 
    color: '#2D2D2D' 
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4ECE8',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  arrowButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderColor: '#E4ECE8',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A4331',
  },
  pickerDisplay: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDisplayText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2D2D2D',
  },

  // Web variant styles
  labelWeb: { 
    width: 40, 
    fontWeight: '600' as const, 
    color: colours.text.primary,
    fontSize: 12,
  },
  pickerContainerWeb: {
    borderColor: colours.border.default,
    borderRadius: 8,
    backgroundColor: colours.bg.canvas,
  },
  arrowButtonWeb: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colours.bg.subtle,
    borderColor: colours.border.default,
    minWidth: 32,
  },
  arrowTextWeb: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colours.brand.primary,
  },
  pickerDisplayWeb: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colours.bg.canvas,
  },
  pickerDisplayTextWeb: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colours.text.primary,
  },
});