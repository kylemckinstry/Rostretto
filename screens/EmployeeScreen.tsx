import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
} from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useEmployeesUI } from '../state/employees';
import Radar from '../components/Radar';
import CollapsibleSection from '../components/CollapsibleSection';
import TrainingCard from '../components/TrainingCard';
import { ChevronLeft } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RootStackParamList = {
  Employee: { employeeId: string };
};
type EmployeeRoute = RouteProp<RootStackParamList, 'Employee'>;

const initials = (name: string) =>
  name
    ?.split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || '';

export default function EmployeeScreen() {
  const route = useRoute<EmployeeRoute>();
  const { employeeId } = route.params;
  const nav = useNavigation();

  const employees = useEmployeesUI();
  const employee = React.useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  // Collapsible sections state (default closed)
  const [open, setOpen] = React.useState({ skills: false, training: false });

  const toggle = (k: 'skills' | 'training') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((s) => ({ ...s, [k]: !s[k] }));
  };

  if (!employee) {
    return (
      <View style={[s.center, { flex: 1, backgroundColor: BG }]}>
        <Text style={s.header}>Individual Performance</Text>
        <Text style={s.subtle}>We couldn’t find that teammate.</Text>
      </View>
    );
  }

  const skills = Object.entries(employee.skills ?? {});
  const radarLabels = skills.map(([label]) => label);
  const radarValues = skills.map(([_, v]) => Math.max(0, Math.min(100, Number(v ?? 0))));

  const training = [
    {
      id: 't1',
      title: 'Advanced Coffee Making',
      tag: 'Coffee',
      duration: '3 hours',
      blurb: 'Learn how to make coffees that are not terrible.',
    },
    {
      id: 't2',
      title: 'Effective Conflict Resolution',
      tag: 'Soft Skills',
      duration: '2.5 hours',
      blurb: 'Strategies for mediating disputes and fostering positive team dynamics.',
    },
    {
      id: 't3',
      title: 'Cash Register Training',
      tag: 'Tech',
      duration: '4 hours',
      blurb: 'Open the till, count coins, stay calm during rushes.',
    },
  ];

  return (
    <View style={[s.container, { flex: 1 }]}>
      {/* Header (RootNavigator style) */}
      <View style={s.headerRow}>
        <Pressable onPress={() => nav.goBack()} hitSlop={8} style={s.backCircle}>
          <ChevronLeft size={20} color={TEXT_DARK} />
        </Pressable>
        <Text style={s.header}>Individual Performance</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <View style={s.card}>
          {employee.imageUrl ? (
            <Image source={{ uri: employee.imageUrl }} style={s.avatar} />
          ) : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarText}>{initials(employee.name)}</Text>
            </View>
          )}
          <Text style={s.name}>{employee.name}</Text>
          {employee.role ? <Text style={s.role}>{employee.role}</Text> : null}
        </View>

        {/* Skill highlights */}
        {employee.skillSummary && (
          <View style={s.pillRow}>
            <View style={[s.pill, s.good]}>
              <Text style={[s.pillTitle, { color: '#0B5D4A' }]}>High Skills</Text>
              {employee.skillSummary.high.length > 0 ? (
                <Text style={[s.pillText, { color: '#0B5D4A' }]}>
                  {employee.skillSummary.high.join(', ')}
                </Text>
              ) : (
                <Text style={[s.pillText, { color: '#0B5D4A' }]}>None yet</Text>
              )}
            </View>
            <View style={[s.pill, s.bad]}>
              <Text style={[s.pillTitle, { color: '#B91C1C' }]}>Skill Gaps</Text>
              {employee.skillSummary.low.length > 0 ? (
                <Text style={[s.pillText, { color: '#B91C1C' }]}>
                  {employee.skillSummary.low.join(', ')}
                </Text>
              ) : (
                <Text style={[s.pillText, { color: '#B91C1C' }]}>None detected</Text>
              )}
            </View>
          </View>
        )}

        {/* Skill Breakdown */}
        <CollapsibleSection
          title="Skill Breakdown"
          open={open.skills}
          onToggle={() => toggle('skills')}
        >
          {skills.length > 0 ? (
            <>
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Radar
                  size={260}
                  labels={radarLabels}
                  values={radarValues}
                  gridSteps={5}
                />
              </View>

              <View style={{ gap: 12, marginTop: 4 }}>
                {skills.map(([label, val]) => {
                  const pct = Math.round(Number(val ?? 0));
                  return (
                    <View key={label} style={s.meterRow}>
                      <Text style={s.meterLabel}>{label}</Text>
                      <View style={s.meterTrack}>
                        <View style={[s.meterFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={s.meterPct}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={s.subtle}>No skill data available.</Text>
          )}
        </CollapsibleSection>

        {/* Suggested Training */}
        <CollapsibleSection
          title="Suggested Training"
          open={open.training}
          onToggle={() => toggle('training')}
        >
          <View style={{ gap: 12 }}>
            {training.map((t) => (
              <TrainingCard
                key={t.id}
                title={t.title}
                tag={t.tag}
                duration={t.duration}
                blurb={t.blurb}
              />
            ))}
          </View>
        </CollapsibleSection>
      </ScrollView>

      {/* Footer placeholder for RootNavigator */}
      <View style={s.footerSpace} />
    </View>
  );
}

const GREEN = '#00B392';
const BG = '#F0F5F2';
const CARD = '#FFFFFF';
const BORDER = '#E5EBE8';
const TEXT_DARK = '#171A1F';
const TEXT_SUBTLE = '#5B636A';

const s = StyleSheet.create({
  container: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  backCircle: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: GREEN,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: GREEN,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1D5DB',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: TEXT_DARK },
  name: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  role: { fontSize: 14, color: TEXT_SUBTLE, marginTop: 4 },

  pillRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  pillTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  good: { borderColor: '#0B5D4A' },
  bad: { borderColor: '#B91C1C' },

  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meterLabel: { flex: 1, fontSize: 13, color: TEXT_DARK },
  meterTrack: {
    flex: 1.2,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#E6E8EA',
    overflow: 'hidden',
  },
  meterFill: {
    height: 8,
    borderRadius: 8,
    backgroundColor: TEXT_DARK,
    opacity: 0.8,
  },
  meterPct: { width: 40, textAlign: 'right', fontSize: 12, color: TEXT_SUBTLE },
  center: { alignItems: 'center', justifyContent: 'center' },
  subtle: { color: TEXT_SUBTLE, marginTop: 6 },
  footerSpace: { height: 0 },
});
