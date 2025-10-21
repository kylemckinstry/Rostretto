/**
 * Shared TimePickerRow component for both mobile and web interfaces
 * Provides toggle-based time selection with validation
 */

import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TIME_OPTIONS } from '../../utils/timeGeneration';
import { colours } from '../../theme';

type TimePickerRowProps = {
  label: string;
  value: string;
  onChange: (formatted: string) => void;
  minTime?: string;
  variant?: 'mobile' | 'web';
};

export function TimePickerRow({ 
  label, 
  value, 
  onChange, 
  minTime, 
  variant = 'mobile' 
}: TimePickerRowProps) {
  const currentIndex = TIME_OPTIONS.findIndex(time => time === value);
  const minIndex = minTime ? TIME_OPTIONS.findIndex(time => time === minTime) : -1;
  const effectiveMinIndex = minTime ? Math.max(0, minIndex + 1) : 0; // End time must be after start time
  
  const handlePrevious = () => {
    const targetIndex = currentIndex - 1;
    if (targetIndex >= effectiveMinIndex) {
      onChange(TIME_OPTIONS[targetIndex]);
    }
    // Don't do anything if out of bounds - prevents event bubbling
  };
  
  const handleNext = () => {
    if (currentIndex < TIME_OPTIONS.length - 1) {
      onChange(TIME_OPTIONS[currentIndex + 1]);
    }
    // Don't do anything if out of bounds - prevents event bubbling
  };

  const isAtMinimum = currentIndex <= effectiveMinIndex;
  const isAtMaximum = currentIndex === TIME_OPTIONS.length - 1;

  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.label, variant === 'web' && styles.labelWeb]}>{label}</Text>
      <View style={[styles.pickerContainer, variant === 'web' && styles.pickerContainerWeb]}>
        <Pressable 
          style={[
            styles.arrowButton,
            variant === 'web' && styles.arrowButtonWeb,
            isAtMinimum && (variant === 'web' ? styles.arrowButtonDisabledWeb : styles.arrowButtonDisabled)
          ]}
          onPress={handlePrevious}
        >
          <Text style={[
            styles.arrowText,
            variant === 'web' && styles.arrowTextWeb,
            isAtMinimum && (variant === 'web' ? styles.arrowTextDisabledWeb : styles.arrowTextDisabled)
          ]}>‹</Text>
        </Pressable>
        
        <View style={[styles.pickerDisplay, variant === 'web' && styles.pickerDisplayWeb]}>
          <Text style={[styles.pickerDisplayText, variant === 'web' && styles.pickerDisplayTextWeb]}>
            {value}
          </Text>
        </View>
        
        <Pressable 
          style={[
            styles.arrowButton,
            variant === 'web' && styles.arrowButtonWeb,
            isAtMaximum && (variant === 'web' ? styles.arrowButtonDisabledWeb : styles.arrowButtonDisabled)
          ]}
          onPress={handleNext}
        >
          <Text style={[
            styles.arrowText,
            variant === 'web' && styles.arrowTextWeb,
            isAtMaximum && (variant === 'web' ? styles.arrowTextDisabledWeb : styles.arrowTextDisabled)
          ]}>›</Text>
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
  arrowButtonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A4331',
  },
  arrowTextDisabled: {
    color: '#999999',
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
  arrowButtonDisabledWeb: {
    backgroundColor: colours.bg.subtle,
    opacity: 0.5,
  },
  arrowTextWeb: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colours.brand.primary,
  },
  arrowTextDisabledWeb: {
    color: colours.text.muted,
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