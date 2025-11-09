// Responsive grid display of available staff with colour-coded status indicators
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colours, toneToColor, type Tone } from '../../theme/colours';

// Staff member representation with visual status indication
export type StaffBubble = {
  initials: string; // Two-character initials for compact display
  name: string; // Full staff member name
  tone: Tone | 'bad'; // Status indicator for border colour coding (bad maps to alert)
  score?: number; // Optional score to display
};

export default function AvailableStaffList({ staff }: { staff: StaffBubble[] }) {
  return (
    <View style={s.grid}>
      {staff.map((s, i) => {
        const borderColor = toneToColor(s.tone === 'bad' ? 'alert' : s.tone);
        const scoreColor = s.tone === 'good' ? colours.status.success 
                         : s.tone === 'warn' ? colours.status.warning 
                         : colours.status.danger;
        return (
          // Individual staff bubble with status-based border colour
          <View key={i} style={[stylesBubble.wrap, { borderColor }]}>
            <Text style={stylesBubble.initials}>{s.initials}</Text>
            <Text style={stylesBubble.name}>{s.name}</Text>
            {typeof s.score === 'number' && (
              <Text style={[stylesBubble.score, { color: scoreColor }]}>
                {Math.round(s.score)}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Main container styles for responsive staff grid layout
const s = StyleSheet.create({
  grid: {
    display: 'grid', // CSS Grid for responsive layout
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', // Auto-sizing columns with minimum width
    gap: 12, // Consistent spacing between staff bubbles
  } as unknown as any,
});

// Individual staff bubble styling with themed colours and compact layout
const stylesBubble = StyleSheet.create({
  wrap: {
    flexDirection: 'row', // Horizontal layout for initials and name
    alignItems: 'center', // Vertically centre content
    gap: 8, // Spacing between initials circle and name text
    backgroundColor: colours.bg.canvas, // White background from theme
    borderRadius: 12, // Rounded corners for modern appearance
    borderWidth: 1, // Border for status indication (colour set dynamically)
    paddingVertical: 6, // Compact vertical padding
    paddingHorizontal: 10, // Horizontal padding for text readability
  },
  initials: {
    width: 24, // Fixed circle dimensions for consistency
    height: 24,
    borderRadius: 999, // Fully circular shape
    textAlign: 'center', // Centre initials text horizontally
    lineHeight: 24, // Centre initials text vertically
    fontWeight: '700', // Bold font for visibility
    fontSize: 10, // Compact size for space efficiency
    backgroundColor: colours.bg.subtle, // Light grey background from theme
    color: colours.text.secondary, // Secondary text colour from theme
  },
  name: { 
    flex: 1, // Take remaining space
    fontSize: 12, // Readable but compact font size
    color: colours.text.primary, // Primary text colour from theme
  },
  score: {
    fontSize: 11, // Slightly smaller than name
    fontWeight: '600', // Semi-bold for emphasis
    paddingHorizontal: 6, // Small horizontal padding
    paddingVertical: 2, // Minimal vertical padding
    borderRadius: 6, // Rounded corners
    backgroundColor: colours.bg.subtle, // Light background
  },
});
