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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEmployeesUI } from '../viewmodels/employees';
import Radar from '../components/employees/Radar';
import CollapsibleSection from '../components/employees/CollapsibleSection';
import TrainingCard from '../components/employees/TrainingCard';
import ShiftBreakdown from '../components/employees/ShiftBreakdown';
import { ChevronLeft, X } from 'lucide-react-native';
import { colours, toneToColor } from '../theme/colours';
import { scoreToTone } from '../helpers/timeUtils';
import { TRAINING_COURSES } from '../constants/training';

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
  const insets = useSafeAreaInsets();

  const employees = useEmployeesUI();
  const employee = React.useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  // Collapsible sections state (skills and shifts open by default, training closed)
  const [open, setOpen] = React.useState({ skills: true, shifts: true, training: false });

  const toggle = (k: 'skills' | 'shifts' | 'training') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((s) => ({ ...s, [k]: !s[k] }));
  };

  if (!employee) {
    return (
      <View style={[s.center, { flex: 1, backgroundColor: colours.brand.accent }]}>
        <Text style={s.header}>Individual Performance</Text>
        <Text style={s.subtle}>We couldn't find that teammate.</Text>
      </View>
    );
  }

  const skills = Object.entries(employee.skills ?? {});
  const radarLabels = skills.map(([label]) => label);
  const radarValues = skills.map(([_, v]) => Math.max(0, Math.min(100, Number(v ?? 0))));

  return (
    <View style={[s.container, { flex: 1, paddingTop: Math.max(8, insets.top - 32) }]}>
      {/* Header (RootNavigator style) */}
      <View style={s.headerRow}>
        <Text style={s.header}>Individual Performance</Text>
        <Pressable onPress={() => nav.goBack()} hitSlop={8} style={s.closeButton}>
          <X size={20} color={colours.text.primary} />
        </Pressable>
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
              <Text style={[s.pillTitle, { color: colours.brand.primary }]}>High Skills</Text>
              {employee.skillSummary.high.length > 0 ? (
                <Text style={[s.pillText, { color: colours.brand.primary }]}>
                  {employee.skillSummary.high.join(', ')}
                </Text>
              ) : (
                <Text style={[s.pillText, { color: colours.brand.primary }]}>None yet</Text>
              )}
            </View>
            <View style={[s.pill, s.bad]}>
              <Text style={[s.pillTitle, { color: colours.status.danger }]}>Skill Gaps</Text>
              {employee.skillSummary.low.length > 0 ? (
                <Text style={[s.pillText, { color: colours.status.danger }]}>
                  {employee.skillSummary.low.join(', ')}
                </Text>
              ) : (
                <Text style={[s.pillText, { color: colours.status.danger }]}>None detected</Text>
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
                  // Use centralized scoreToTone function for consistency with web
                  const tone = scoreToTone(pct);
                  const color = toneToColor(tone);
                  return (
                    <View key={label} style={s.meterRow}>
                      <Text style={s.meterLabel}>{label}</Text>
                      <View style={s.meterTrack}>
                        <View style={[s.meterFill, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={[s.meterPct, { color }]}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={s.subtle}>No skill data available.</Text>
          )}
        </CollapsibleSection>

        {/* Shift Breakdown This Month */}
        <CollapsibleSection
          title="Shift Breakdown This Month"
          open={open.shifts}
          onToggle={() => toggle('shifts')}
        >
          <ShiftBreakdown 
            employeeId={employeeId}
            minShifts={1}
            maxShifts={7}
            weekdayBias={0.6}
          />
        </CollapsibleSection>

        {/* Suggested Training */}
        <CollapsibleSection
          title="Suggested Training"
          open={open.training}
          onToggle={() => toggle('training')}
        >
          <View style={{ gap: 12 }}>
            {TRAINING_COURSES.map((t) => (
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

const s = StyleSheet.create({
  container: {
    backgroundColor: colours.brand.accent,
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.canvas,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colours.brand.primary,
  },
  card: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
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
    borderColor: colours.status.success,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: colours.status.success,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.subtle,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: colours.text.primary },
  name: { fontSize: 18, fontWeight: '700', color: colours.text.primary },
  role: { fontSize: 14, color: colours.text.muted, marginTop: 4 },

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
    backgroundColor: colours.bg.canvas,
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
  good: { borderColor: colours.brand.primary },
  bad: { borderColor: colours.status.danger },

  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meterLabel: { flex: 1, fontSize: 13, color: colours.text.primary },
  meterTrack: {
    flex: 1.2,
    height: 8,
    borderRadius: 8,
    backgroundColor: colours.border.default,
    overflow: 'hidden',
  },
  meterFill: {
    height: 8,
    borderRadius: 8,
    // backgroundColor set dynamically based on score
  },
  meterPct: { 
    width: 40, 
    textAlign: 'right', 
    fontSize: 12, 
    fontWeight: '600',
    // color set dynamically based on score
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  subtle: { color: colours.text.muted, marginTop: 6 },
  footerSpace: { height: 0 },
});
