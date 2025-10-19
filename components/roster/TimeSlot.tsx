// components/TimeSlot.tsx
import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colours } from '../../theme/colours';

export type StaffAssignment = {
  name: string;
  role: string;
  tone: 'good' | 'warn' | 'alert';
};

export type TimeSlotData = {
  id: string;
  startTime: string; // "9:00 am"
  endTime: string;   // "3:00 pm"
  assignedStaff: StaffAssignment[];
  demand: string | null;
  mismatches: number;
};

type Props = {
  slot: TimeSlotData;

  // Open the AvailableEmployeesModal with this slot preselected
  onAddStaff: (slot: TimeSlotData) => void;

  // Optional: remove a staff member from this slot
  onRemoveStaff?: (slotId: string, staffIndex: number) => void;
};

// Border colour based on tone
function getColor(tone: 'good' | 'warn' | 'alert') {
  if (tone === 'alert') return colours.status.danger;
  if (tone === 'warn') return colours.status.warning;
  return colours.status.success;
}

export default function TimeSlot({ slot, onAddStaff, onRemoveStaff }: Props) {
  const hasMismatches = slot.mismatches > 0;

  const indicatorStyle = hasMismatches ? s.alertIndicator : s.goodIndicator;
  const indicatorSymbol = hasMismatches ? '!' : '✓';

  return (
    <View style={s.wrap}>
      {/* Top row with time and status indicator */}
      <View style={s.topRow}>
        <Text style={s.timeText}>
          {slot.startTime} - {slot.endTime}
        </Text>
        <View style={[s.indicator, indicatorStyle]}>
          <Text style={[s.indicatorText, { color: hasMismatches ? colours.status.danger : colours.bg.canvas }]}>
            {indicatorSymbol}
          </Text>
        </View>
      </View>

      {/* Staff list + Add */}
      <View style={s.contentWrap}>
        {slot.assignedStaff.map((staff, index) => (
          <View
            key={`${slot.id}-${staff.name}-${index}`}
            style={[s.staffRow, { borderColor: getColor(staff.tone) }]}
          >
            <Text style={s.staffName}>{staff.name}</Text>
            <Text style={s.staffRole}>{staff.role}</Text>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${staff.name}`}
              onPress={() => onRemoveStaff?.(slot.id, index)}
            >
              <Text style={s.removeButton}>×</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => onAddStaff(slot)}
          style={s.addButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add staff to this time slot"
        >
          <Text style={s.addButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colours.text.primary,
  },
  contentWrap: {
    gap: 8,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.canvas,
    borderWidth: 1.5,
  },
  goodIndicator: {
    borderColor: colours.status.success,
    backgroundColor: colours.status.success,
  },
  alertIndicator: { borderColor: colours.status.danger },
  indicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: colours.bg.canvas,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '600',
    color: colours.text.primary,
    flex: 1,
  },
  staffRole: {
    fontSize: 13,
    color: colours.text.muted,
    marginRight: 12,
  },
  removeButton: {
    fontSize: 20,
    color: colours.text.muted,
    paddingHorizontal: 4,
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: colours.border.default,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: colours.text.muted,
    lineHeight: 20,
  },
});
