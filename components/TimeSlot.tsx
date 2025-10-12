import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type StaffAssignment = {
  name: string;
  role: string;
  tone: 'good' | 'warn' | 'alert';
};

type TimeSlotData = {
  id: string;
  startTime: string;
  endTime: string;
  assignedStaff: StaffAssignment[];
  demand: string | null;
  mismatches: number;
};

// Utility to get border/indicator color based on tone
function getColor(tone: 'good' | 'warn' | 'alert') {
  if (tone === 'alert') return '#EF4444'; // Red
  if (tone === 'warn') return '#F59E0B'; // Orange
  return '#00B392'; // Green
}

// Color constants for status indicator fill/outline
const GOOD_COLOR = '#00B392';
const ALERT_COLOR = '#EF4444';


export default function TimeSlot({ slot, onAddStaff }: { slot: TimeSlotData, onAddStaff: () => void }) {
  const hasStaff = slot.assignedStaff.length > 0;
  const hasMismatches = slot.mismatches > 0;
  
  const indicatorStyle = hasMismatches ? s.alertIndicator : s.goodIndicator;
  const indicatorSymbol = hasMismatches ? '!' : '✓';
  
  const demandTextColor = hasMismatches ? ALERT_COLOR : '#475569';

  const DemandRow = (
      <View style={s.demandRow}>
          <Text style={[s.demandText, { color: demandTextColor }]}>
              Demand: {slot.demand || '—'}
          </Text>
          {/* Status Indicator (Right side) */}
          <View style={[s.indicatorInline, indicatorStyle]}> 
              {/* Text color must be the status color, not white */}
              <Text style={[s.indicatorText, { color: hasMismatches ? ALERT_COLOR : GOOD_COLOR }]}>{indicatorSymbol}</Text>
          </View>
      </View>
  );

  return (
    <View style={s.wrap}>
      {/* Time Label */}
      <Text style={s.timeText}>{slot.startTime} - {slot.endTime}</Text>

      {/* Time Slot Content Box */}
      <View style={[s.slotBox, hasStaff ? s.filledSlot : s.emptySlot]}>
        
        {/* Always render the demand line at the top of the box */}
        <View style={s.demandRowWrap}>
            {DemandRow}
        </View>

        {hasStaff && (
          // --- Assigned Staff Blocks ---
          <View style={s.staffTilesContainer}>
              {slot.assignedStaff.map((staff, index) => (
                  <View key={index} style={[s.staffRow, { borderColor: getColor(staff.tone) }]}>
                      <Text style={s.staffName}>{staff.name}</Text>
                      <Text style={s.staffRole}>{staff.role}</Text>
                      <Pressable><Text style={s.removeButton}>x</Text></Pressable>
                  </View>
              ))}
          </View>
        )}

        {/* Add Button */}
        <Pressable onPress={onAddStaff} style={s.addButton}>
          <Text style={s.addButtonText}>+</Text>
        </Pressable>
        
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 16 },
  timeText: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 4 },
  
  slotBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filledSlot: { 
    backgroundColor: '#fff',
    borderColor: '#E2E8F0',
    paddingBottom: 4, 
  },
  emptySlot: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },

  // Demand Row Styles
  demandRowWrap: {
    marginBottom: 8, 
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demandText: { 
    fontSize: 14, 
    fontWeight: '500',
  },
  
  // UPDATED: INLINE STATUS INDICATOR (Outline Style)
  indicatorInline: {
    width: 20, 
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Set background to white/no fill
    borderWidth: 1.5, // Add the outline border
  },
  // FIX: Change background to borderColor
  goodIndicator: { borderColor: GOOD_COLOR }, 
  alertIndicator: { borderColor: ALERT_COLOR },
  
  // Text color is set dynamically in the render method to match the border color
  indicatorText: { 
    fontSize: 12, 
    fontWeight: '700' 
  }, 
  
  // Staff Rows
  staffTilesContainer: {
    marginBottom: 8, 
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  staffName: { fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1 },
  staffRole: { fontSize: 12, color: '#475569', marginRight: 10 },
  removeButton: { 
    fontSize: 16, 
    color: '#94A3B8',
    paddingLeft: 10,
  },
  
  // Add Button
  addButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: { fontSize: 20, color: '#94A3B3', lineHeight: 20 },
});