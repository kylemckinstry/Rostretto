import * as React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform } from 'react-native';
import { useEmployeesUI, type UIEmployee } from '../../viewmodels/employees';
import { colours, toneToColor } from '../../theme/colours';
import { TimeSlotData } from '../roster/TimeSlot';
import { TIME_OPTIONS } from '../../utils/timeGeneration';
import { ROLE_OPTIONS } from '../../constants/staffAssignment';
import { TimePickerRow } from '../shared/TimePickerRow';
import { RolePickerRow } from '../shared/RolePickerRow';
import { scoreToTone } from '../../helpers/timeUtils';

type Props = {
  selectedSlot: TimeSlotData | null;
  onAssign: (opts: { employee: UIEmployee; start: string; end: string; role?: string }) => void;
  onCancel?: () => void;
  isEmployeeAssigned: (employeeName: string, start: string, end: string) => boolean;
};

export default function AvailableStaffSidebar({ selectedSlot, onAssign, onCancel, isEmployeeAssigned }: Props) {
  const employees = useEmployeesUI();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [byIdTimes, setByIdTimes] = React.useState<Record<string, { start: string; end: string; role: string }>>(
    {}
  );

  // Clear state when switching between time slots
  React.useEffect(() => {
    if (selectedSlot) {
      setExpandedId(null);
      setByIdTimes({});
    }
  }, [selectedSlot]);

  const ensureTimes = (id: string) => {
    if (!byIdTimes[id]) {
      const defaultStart = selectedSlot?.startTime || '7:00 am';
      const defaultEnd = selectedSlot?.endTime || '7:30 am';
      const defaultRole = 'Manager'; // Default role
      setByIdTimes((x) => ({ 
        ...x, 
        [id]: { start: defaultStart, end: defaultEnd, role: defaultRole } 
      }));
    }
  };

  const handleAssign = (employee: UIEmployee) => {
    const times = byIdTimes[employee.id] || { 
      start: selectedSlot?.startTime || '7:00 am', 
      end: selectedSlot?.endTime || '7:30 am',
      role: 'Manager'
    };
    
    onAssign({ employee, start: times.start, end: times.end, role: times.role });
    setExpandedId(null);
    setByIdTimes({});
  };

  return (
    <View style={[s.container, selectedSlot && s.containerActive]}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>Available Staff</Text>
          {selectedSlot && onCancel && (
            <Pressable onPress={onCancel} style={s.cancelButton} hitSlop={8}>
              <Text style={s.cancelText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={s.columns}>
        <Text style={s.colHead}>Name</Text>
        <Text style={s.colHeadScore}>Score</Text>
      </View>

      <FlatList<UIEmployee>
        data={employees}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const name = item.name;
          const score = Math.round(item.score ?? 0);
          const tone = scoreToTone(score);
          const border = toneToColor(tone);
          const times = byIdTimes[item.id] ?? { 
            start: selectedSlot?.startTime || '7:00 am', 
            end: selectedSlot?.endTime || '7:30 am',
            role: 'Manager'
          };
          const isOpen = expandedId === item.id;
          
          // Check if employee is already assigned to the selected slot's time range
          // This happens when user clicks '+' on a timeslot
          const isAssignedToSelectedSlot = selectedSlot && isEmployeeAssigned(
            name, 
            selectedSlot.startTime, 
            selectedSlot.endTime
          );
          
          // Only check overlap when expanded to show proper button state
          const hasOverlap = isOpen && isEmployeeAssigned(name, times.start, times.end);

          const toggle = () => {
            // Don't allow expanding if already assigned to the selected slot
            if (isAssignedToSelectedSlot) return;
            
            ensureTimes(item.id);
            setExpandedId((e) => (e === item.id ? null : item.id));
          };

          return (
            <View 
              style={[
                s.card, 
                isOpen && s.cardExpanded,
                isAssignedToSelectedSlot && s.cardDisabled
              ]}
            >
              <Pressable 
                onPress={toggle} 
                style={s.employeeInfoSection}
                accessibilityRole="button"
                disabled={isAssignedToSelectedSlot}
              >
                <View style={s.row}>
                  <View style={s.left}>
                    <View style={[
                      s.initial, 
                      { borderColor: border },
                      isAssignedToSelectedSlot && s.initialDisabled
                    ]}>
                      <Text style={[
                        s.initialText, 
                        { color: border },
                        isAssignedToSelectedSlot && s.textDisabled
                      ]}>
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[
                      s.name,
                      isAssignedToSelectedSlot && s.textDisabled
                    ]}>{name}</Text>
                  </View>
                  <View style={s.right}>
                    <View style={[
                      s.scoreBox, 
                      { borderColor: border },
                      isAssignedToSelectedSlot && s.scoreBoxDisabled
                    ]}>
                      <Text style={[
                        s.scoreText, 
                        { color: border },
                        isAssignedToSelectedSlot && s.textDisabled
                      ]}>{score}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>

              {isOpen && (
                <>
                  <View style={s.divider} />
                  <View style={{ gap: 10 }}>
                    <TimePickerRow
                      label="Start"
                      value={times.start}
                      variant="web"
                      onChange={(v) => {
                        const newTimes = { ...times, start: v };
                        // Ensure end time is after start time
                        const startIndex = TIME_OPTIONS.findIndex(t => t === v);
                        const endIndex = TIME_OPTIONS.findIndex(t => t === times.end);
                        if (endIndex <= startIndex && startIndex < TIME_OPTIONS.length - 1) {
                          newTimes.end = TIME_OPTIONS[startIndex + 1];
                        }
                        setByIdTimes((x) => ({
                          ...x,
                          [item.id]: newTimes,
                        }));
                      }}
                    />
                    <TimePickerRow
                      label="End"
                      value={times.end}
                      variant="web"
                      onChange={(v) => {
                        const newTimes = { ...times, end: v };
                        // Ensure end time is after start time
                        const startIndex = TIME_OPTIONS.findIndex(t => t === times.start);
                        const endIndex = TIME_OPTIONS.findIndex(t => t === v);
                        if (endIndex <= startIndex && startIndex > 0) {
                          newTimes.start = TIME_OPTIONS[startIndex - 1];
                        }
                        setByIdTimes((x) => ({
                          ...x,
                          [item.id]: newTimes,
                        }));
                      }}
                      minTime={times.start}
                    />
                    <RolePickerRow
                      label="Role"
                      value={times.role}
                      variant="web"
                      onChange={(v) => {
                        setByIdTimes((x) => ({
                          ...x,
                          [item.id]: { ...times, role: v },
                        }));
                      }}
                    />

                    <Pressable
                      onPress={() => handleAssign(item)}
                      style={[s.assignBtn, hasOverlap && s.assignBtnDisabled]}
                      disabled={hasOverlap}
                    >
                      <Text style={[s.assignBtnText, hasOverlap && s.assignBtnTextDisabled]}>
                        {hasOverlap ? 'Already Assigned' : 'Assign Shift'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%', // Fill the available height in the staff column
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // Consistent drop shadow with other components
  } as any,
  containerActive: {
    borderColor: colours.brand.primary,
    borderWidth: 2,
    backgroundColor: colours.bg.canvas,
    boxShadow: '0 4px 12px rgba(26, 67, 49, 0.15)', // Enhanced shadow when active
  } as any,
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colours.text.primary,
    flex: 1,
  },
  cancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    backgroundColor: colours.bg.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colours.text.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 14,
  },
  activeSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colours.brand.primary,
    fontWeight: '600',
    flex: 1,
  },
  subtitleInactive: {
    fontSize: 12,
    color: colours.text.muted,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  activeIndicator: {
    backgroundColor: colours.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeIndicatorText: {
    color: colours.bg.canvas,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  columns: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colours.border.default,
    marginBottom: 12,
  },
  colHead: { 
    color: colours.text.primary, 
    fontWeight: '600',
    fontSize: 12,
  },
  colHeadScore: {
    color: colours.text.primary, 
    fontWeight: '600',
    fontSize: 12,
    marginRight: 12, // Shift left slightly to align with center of score badges
  },

  card: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    padding: 12,
  },
  cardExpanded: {
    borderColor: colours.brand.primary,
    borderWidth: 2,
  },
  employeeInfoSection: {
    // Style for the clickable employee info area - no specific styling needed
  },

  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  left: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    flex: 1,
  },
  right: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },

  initial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: { 
    fontWeight: '700',
    fontSize: 12,
  },
  name: { 
    fontWeight: '600', 
    color: colours.text.primary,
    fontSize: 14,
    flex: 1,
  },

  scoreBox: {
    borderWidth: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  scoreText: { 
    fontWeight: '700',
    fontSize: 12,
  },

  divider: { 
    height: 1, 
    backgroundColor: colours.border.default, 
    marginVertical: 12 
  },

  fieldRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  label: { 
    width: 40, 
    fontWeight: '600', 
    color: colours.text.primary,
    fontSize: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colours.border.default,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colours.bg.subtle,
    justifyContent: 'center',
  },

  assignBtn: {
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  assignBtnText: { 
    color: colours.bg.canvas, 
    fontWeight: '700', 
    fontSize: 14 
  },
  assignBtnDisabled: {
    backgroundColor: colours.bg.subtle,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  assignBtnTextDisabled: {
    color: colours.text.muted,
  },

  // Disabled state styles when employee is already assigned to the selected slot
  cardDisabled: {
    opacity: 0.5,
    backgroundColor: colours.bg.subtle,
  },
  initialDisabled: {
    borderColor: colours.border.default,
    backgroundColor: colours.bg.subtle,
  },
  textDisabled: {
    color: colours.text.muted,
  },
  scoreBoxDisabled: {
    borderColor: colours.border.default,
    backgroundColor: colours.bg.subtle,
  },
});