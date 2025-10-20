// Web-specific DateNavigator with responsive behavior
import * as React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { colours } from '../../theme/colours';

export default function DateNavigatorWeb({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints matching Header.web.tsx
  const isCompact = width < 900;
  const isSmall = width < 640;

  return (
    <View style={[s.wrap, isCompact && s.wrapCompact]}>
      <Pressable onPress={onPrev} style={[s.chevronBox, isCompact && s.chevronBoxCompact]}>
        <Text style={[s.chev, isCompact && s.chevCompact]}>{'<'}</Text>
      </Pressable>

      <Text style={[s.title, isCompact && s.titleCompact, isSmall && s.titleSmall]}>
        {isSmall ? formatLabelShort(label) : label}
      </Text>

      <Pressable onPress={onNext} style={[s.chevronBox, isCompact && s.chevronBoxCompact]}>
        <Text style={[s.chev, isCompact && s.chevCompact]}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

// Shorten label for very small screens
function formatLabelShort(label: string): string {
  // Convert "January 1, 2025 - January 7, 2025" to "Jan 1 - Jan 7, 2025"
  const parts = label.split(' - ');
  if (parts.length !== 2) return label;
  
  const [start, end] = parts;
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return label;
  
  const startMonth = startDate.toLocaleDateString(undefined, { month: 'short' });
  const startDay = startDate.getDate();
  const endMonth = endDate.toLocaleDateString(undefined, { month: 'short' });
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();
  
  // Same month: "Jan 1 - 7, 2025"
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  
  // Different months: "Jan 1 - Feb 7, 2025"
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 8,
  },
  wrapCompact: {
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: colours.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  titleCompact: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  titleSmall: { 
    fontSize: 14,
  },
  chevronBox: { 
    padding: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  chevronBoxCompact: {
    padding: 12,
  },
  chev: {
    fontSize: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colours.border.default,
    textAlign: 'center',
    lineHeight: 26,
    color: colours.text.primary,
    backgroundColor: colours.bg.canvas,
  },
  chevCompact: {
    fontSize: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    lineHeight: 22,
  },
});