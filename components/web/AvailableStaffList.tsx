// Responsive grid display of available staff with colour-coded status indicators
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colours } from '../../theme/colours';

// Staff member representation with visual status indication
export type StaffBubble = {
  initials: string; // Two-character initials for compact display
  name: string; // Full staff member name
  tone: 'good' | 'warn' | 'bad'; // Status indicator for border colour coding
};

export default function AvailableStaffList({ staff }: { staff: StaffBubble[] }) {
  return (
    <View style={s.grid}>
      {staff.map((s, i) => (
        // Individual staff bubble with status-based border colour
        <View key={i} style={[stylesBubble.wrap, borderFor(s.tone)]}>
          <Text style={stylesBubble.initials}>{s.initials}</Text>
          <Text style={stylesBubble.name}>{s.name}</Text>
        </View>
      ))}
    </View>
  );
}

// Determine border colour based on staff member's current status
function borderFor(t: StaffBubble['tone']) {
  if (t === 'good') return { borderColor: colours.status.success }; // Green for available/performing well
  if (t === 'warn') return { borderColor: colours.status.warning }; // Orange for caution/attention needed
  return { borderColor: colours.status.danger }; // Red for unavailable/issues
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
    fontSize: 12, // Readable but compact font size
    color: colours.text.primary, // Primary text colour from theme
  },
});
