import * as React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useEmployeesUI, type UIEmployee } from '../../viewmodels/employees';
import { colours, toneToColor } from '../../theme';
import { TIME_OPTIONS } from '../../utils/timeGeneration';
import { ROLE_OPTIONS } from '../../constants/staffAssignment';
import { TimePickerRow } from '../shared/TimePickerRow';
import { RolePickerRow } from '../shared/RolePickerRow';
import { scoreToTone } from '../../helpers/timeUtils';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  visible: boolean;
  onClose: () => void;
  slotStart: string;
  slotEnd: string;
  onAssign: (opts: { employee: UIEmployee; start: string; end: string; role?: string }) => void;
  isEmployeeAssigned?: (employeeName: string, start: string, end: string) => boolean;
};

export default function AvailableEmployeesModal({
  visible,
  onClose,
  slotStart,
  slotEnd,
  onAssign,
  isEmployeeAssigned,
}: Props) {
  const employees = useEmployeesUI(); // UIEmployee[]
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [byIdTimes, setByIdTimes] = React.useState<Record<string, { start: string; end: string; role: string }>>(
    {}
  );

  React.useEffect(() => {
    if (!visible) {
      setExpandedId(null);
      setByIdTimes({});
    }
  }, [visible]);

  const ensureTimes = (id: string) => {
    if (!byIdTimes[id]) {
      setByIdTimes((x) => ({ ...x, [id]: { start: slotStart, end: slotEnd, role: 'Mixed' } }));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.header}>
        <View style={{ width: 24 }} />
        <Text style={s.title}>Available Staff</Text>
        <Pressable onPress={onClose} style={s.closeButton} hitSlop={8}>
          <Text style={s.closeText}>×</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={s.columns}>
          <Text style={s.colHead}>Name</Text>
          <Text style={s.colHead}>Score</Text>
        </View>

        <FlatList<UIEmployee>
          data={employees}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const name = item.name;
            const score = Math.round(item.score ?? 0); // UIEmployee already 0..100
            const tone = scoreToTone(score);
            const border = toneToColor(tone);
            const times = byIdTimes[item.id] ?? { start: slotStart, end: slotEnd, role: 'Mixed' };
            const isOpen = expandedId === item.id;

            // Check if employee is already assigned to the selected slot's time range
            const isAssignedToSelectedSlot = isEmployeeAssigned 
              ? isEmployeeAssigned(name, slotStart, slotEnd)
              : false;
            
            // Only check overlap when expanded to show proper button state
            const hasOverlap = isOpen && isEmployeeAssigned 
              ? isEmployeeAssigned(name, times.start, times.end)
              : false;

            const toggle = () => {
              // Don't allow expanding if already assigned to the selected slot
              if (isAssignedToSelectedSlot) return;
              
              ensureTimes(item.id);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpandedId((e) => (e === item.id ? null : item.id));
            };

            return (
              <Pressable 
                onPress={toggle} 
                style={[
                  s.card, 
                  isOpen && s.cardExpanded,
                  isAssignedToSelectedSlot && s.cardDisabled
                ]} 
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

                {isOpen && (
                  <>
                    <View style={s.divider} />
                    <View style={{ gap: 10 }}>
                      <TimePickerRow
                        label="Start"
                        value={times.start}
                        variant="mobile"
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
                        variant="mobile"
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
                        variant="mobile"
                        onChange={(v) => {
                          setByIdTimes((x) => ({
                            ...x,
                            [item.id]: { ...times, role: v },
                          }));
                        }}
                      />

                      <Pressable
                        onPress={() =>
                          onAssign({
                            employee: item,
                            start: times.start,
                            end: times.end,
                            role: times.role,
                          })
                        }
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
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}



const s = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1A4331' },
  columns: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colHead: { color: '#2D2D2D', fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4ECE8',
    padding: 12,
  },
  cardExpanded: {
    borderColor: '#E4ECE8',
    borderWidth: 2.5,
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  initial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: { fontWeight: '800' },
  name: { fontWeight: '700', color: '#2D2D2D' },

  scoreBox: {
    borderWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  scoreText: { fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#E4ECE8', marginVertical: 12 },

  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { width: 50, fontWeight: '700', color: '#2D2D2D' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E4ECE8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  assignBtn: {
    backgroundColor: '#1A4331',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  assignBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
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

  // Close button styles (matching web version)
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    backgroundColor: colours.bg.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colours.text.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 14,
  },


});