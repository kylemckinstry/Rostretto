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
import CustomTimePicker from './TimePicker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  visible: boolean;
  onClose: () => void;
  slotStart: string;
  slotEnd: string;
  onAssign: (opts: { employee: UIEmployee; start: string; end: string }) => void;
};

export default function AvailableEmployeesModal({
  visible,
  onClose,
  slotStart,
  slotEnd,
  onAssign,
}: Props) {
  const employees = useEmployeesUI(); // UIEmployee[]
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [byIdTimes, setByIdTimes] = React.useState<Record<string, { start: string; end: string }>>(
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
      setByIdTimes((x) => ({ ...x, [id]: { start: slotStart, end: slotEnd } }));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.header}>
        <View style={{ width: 24 }} />
        <Text style={s.title}>Available Employees</Text>
        <Pressable onPress={onClose}>
          <Text style={{ fontSize: 18 }}>✕</Text>
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
            const tone = score >= 80 ? 'good' : score >= 56 ? 'warn' : 'alert';
            const border = tone === 'good' ? '#5CB85C' : tone === 'warn' ? '#F5A623' : '#E57373';
            const times = byIdTimes[item.id] ?? { start: slotStart, end: slotEnd };
            const isOpen = expandedId === item.id;

            const toggle = () => {
              ensureTimes(item.id);
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpandedId((e) => (e === item.id ? null : item.id));
            };

            return (
              <Pressable onPress={toggle} style={[s.card, isOpen && s.cardExpanded]} accessibilityRole="button">
                <View style={s.row}>
                  <View style={s.left}>
                    <View style={[s.initial, { borderColor: border }]}>
                      <Text style={[s.initialText, { color: border }]}>
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.name}>{name}</Text>
                  </View>
                  <View style={s.right}>
                    <View style={[s.scoreBox, { borderColor: border }]}>
                      <Text style={[s.scoreText, { color: border }]}>{score}</Text>
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
                        onChange={(v) =>
                          setByIdTimes((x) => ({
                            ...x,
                            [item.id]: { ...times, start: v },
                          }))
                        }
                      />
                      <TimePickerRow
                        label="End"
                        value={times.end}
                        onChange={(v) =>
                          setByIdTimes((x) => ({
                            ...x,
                            [item.id]: { ...times, end: v },
                          }))
                        }
                      />

                      <Pressable
                        onPress={() =>
                          onAssign({
                            employee: item,
                            start: times.start,
                            end: times.end,
                          })
                        }
                        style={s.assignBtn}
                      >
                        <Text style={s.assignBtnText}>Assign Shift</Text>
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

// Inline time row using your CustomTimePicker
function TimePickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (formatted: string) => void;
}) {
  const [isVisible, setVisible] = React.useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const handleConfirm = (date: Date) => {
    onChange(formatTime(date));
    setVisible(false);
  };

  return (
    <View style={s.fieldRow}>
      <Text style={s.label}>{label}</Text>
      <Pressable onPress={() => setVisible(true)} style={[s.input, { justifyContent: 'center' }]}>
        <Text style={{ color: '#2D2D2D', fontSize: 16 }}>{value}</Text>
      </Pressable>

      <CustomTimePicker
        isVisible={isVisible}
        onClose={() => setVisible(false)}
        onConfirm={handleConfirm}
        initialValue={value}
      />
    </View>
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
});