// components/TimeSlot.tsx
import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

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

// Utility to get border colour based on tone
function getColor(tone: 'good' | 'warn' | 'alert') {
  if (tone === 'alert') return '#E57373';
  if (tone === 'warn') return '#F5A623';
  return '#5CB85C';
}

const GOOD_COLOR = '#5CB85C';
const ALERT_COLOR = '#E57373';

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
          <Text style={[s.indicatorText, { color: hasMismatches ? ALERT_COLOR : '#fff' }]}>
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
    backgroundColor: '#fff',
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
    color: '#0F172A',
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
    backgroundColor: '#fff',
    borderWidth: 1.5,
  },
  goodIndicator: {
    borderColor: GOOD_COLOR,
    backgroundColor: GOOD_COLOR,
  },
  alertIndicator: { borderColor: ALERT_COLOR },
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
    backgroundColor: '#fff',
  },
  staffName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  staffRole: {
    fontSize: 13,
    color: '#475569',
    marginRight: 12,
  },
  removeButton: {
    fontSize: 20,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#94A3B8',
    lineHeight: 20,
  },
});
