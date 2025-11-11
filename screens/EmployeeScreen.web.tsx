import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useEmployeesUI } from '../viewmodels/employees';
import Radar from '../components/employees/Radar';
import ShiftBreakdown from '../components/employees/ShiftBreakdown';
import CollapsibleSection from '../components/employees/CollapsibleSection';
import TrainingCard from '../components/employees/TrainingCard';
import { X } from 'lucide-react-native';
import { colours, toneToColor } from '../theme/colours';
import { scoreToTone } from '../helpers/timeUtils';
import Header from '../components/Header';

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

function scorePillColors(v?: number) {
  if (typeof v !== 'number') {
    return { bg: colours.bg.subtle, border: colours.border.default, text: colours.text.primary };
  }
  
  const tone = scoreToTone(v);
  const borderColor = toneToColor(tone);
  
  if (tone === 'good') {
    return { bg: colours.brand.accent, border: borderColor, text: colours.brand.primary };
  }
  if (tone === 'warn') {
    return { bg: colours.status.warningBg, border: colours.status.warningBorder, text: colours.status.warningText };
  }
  // alert
  return { bg: colours.status.dangerBg, border: colours.status.dangerBorder, text: colours.status.dangerText };
}

export default function EmployeeScreenWeb() {
  const route = useRoute<EmployeeRoute>();
  const { employeeId } = route.params;
  const nav = useNavigation();

  const employees = useEmployeesUI();
  const employee = React.useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  // Collapsible sections state (default open for better web UX)
  const [open, setOpen] = React.useState({ 
    skillBreakdown: true, 
    skillDetails: true, 
    shifts: true, 
    training: true 
  });

  const toggle = (k: 'skillBreakdown' | 'skillDetails' | 'shifts' | 'training') => {
    setOpen((s) => ({ ...s, [k]: !s[k] }));
  };

  if (!employee) {
    return (
      <View style={styles.outerContainer}>
        <Header />
        <ScrollView style={styles.scrollView}>
          <View style={[styles.container, styles.center]}>
            <View style={styles.errorCard}>
              <Text style={styles.header}>Individual Performance</Text>
              <Text style={styles.errorText}>We couldn't find that teammate.</Text>
              <Pressable onPress={() => nav.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back to Team</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
    <View style={styles.outerContainer}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              <Text style={styles.header}>Individual Performance</Text>
              <Pressable onPress={() => nav.goBack()} hitSlop={8} style={styles.closeButton}>
                <X size={16} color={colours.text.primary} />
              </Pressable>
            </View>
            <Text style={styles.subtitle}>Detailed view of {employee.name}'s capabilities and development</Text>
          </View>

          <View style={styles.contentLayout}>
            {/* Left Column - Employee Info & Skills */}
            <View style={styles.leftColumn}>
              {/* Identity Card */}
              <View style={styles.card}>
            <View style={styles.employeeHeader}>
              <View style={styles.employeeMainInfo}>
                {employee.imageUrl ? (
                  <Image source={{ uri: employee.imageUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{initials(employee.name)}</Text>
                  </View>
                )}
                <View style={styles.employeeInfo}>
                  <Text style={styles.name}>{employee.name}</Text>
                  {employee.role && <Text style={styles.role}>{employee.role}</Text>}
                </View>
              </View>
              <View style={styles.scoreSection}>
                <Text style={styles.scoreLabel}>Overall Score</Text>
                <View style={[
                  styles.scoreBadge,
                  {
                    backgroundColor: scorePillColors(employee.score).bg,
                    borderColor: scorePillColors(employee.score).border
                  }
                ]}>
                  <Text style={[styles.scoreValue, { color: scorePillColors(employee.score).text }]}>
                    {typeof employee.score === 'number' ? Math.round(employee.score) : '--'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Skill Highlights */}
          {employee.skillSummary && (
            <View style={styles.skillHighlights}>
              <View style={[styles.skillPill, styles.goodSkills]}>
                <Text style={[styles.pillTitle, { color: colours.brand.primary }]}>Strong Skills</Text>
                {employee.skillSummary.high.length > 0 ? (
                  <Text style={[styles.pillText, { color: colours.brand.primary }]}>
                    {employee.skillSummary.high.join(', ')}
                  </Text>
                ) : (
                  <Text style={[styles.pillText, { color: colours.brand.primary }]}>None yet</Text>
                )}
              </View>
              <View style={[styles.skillPill, styles.gapSkills]}>
                <Text style={[styles.pillTitle, { color: colours.status.danger }]}>Development Areas</Text>
                {employee.skillSummary.low.length > 0 ? (
                  <Text style={[styles.pillText, { color: colours.status.danger }]}>
                    {employee.skillSummary.low.join(', ')}
                  </Text>
                ) : (
                  <Text style={[styles.pillText, { color: colours.status.danger }]}>None detected</Text>
                )}
              </View>
            </View>
          )}

          {/* Skills Charts */}
          <View style={styles.chartsRow}>
            {/* Radar Chart */}
            <View style={styles.chartCardWrapper}>
              <CollapsibleSection
                title="Skill Breakdown"
                open={open.skillBreakdown}
                onToggle={() => toggle('skillBreakdown')}
              >
                <View style={styles.chartCardContent}>
                  <Radar
                    size={240}
                    labels={radarLabels}
                    values={radarValues}
                    gridSteps={5}
                  />
                </View>
              </CollapsibleSection>
            </View>

            {/* Skill Details */}
            <View style={styles.chartCardWrapper}>
              <CollapsibleSection
                title="Skill Details"
                open={open.skillDetails}
                onToggle={() => toggle('skillDetails')}
              >
                <View style={styles.chartCardContent}>
                  {skills.length > 0 ? (
                    <View style={styles.skillMeters}>
                      {skills.map(([label, val]) => {
                        const pct = Math.round(Number(val ?? 0));
                        // Use centralized scoreToTone function for consistency
                        const tone = scoreToTone(pct);
                        const color = toneToColor(tone);
                        return (
                          <View key={label} style={styles.meterRow}>
                            <Text style={styles.meterLabel}>{label}</Text>
                            <View style={styles.meterTrack}>
                              <View 
                                style={[styles.meterFill, { width: `${pct}%`, backgroundColor: color }]} 
                              />
                            </View>
                            <Text style={[styles.meterPct, { color }]}>{pct}%</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.noDataText}>No skill data available.</Text>
                  )}
                </View>
              </CollapsibleSection>
            </View>
          </View>

          {/* Shift Breakdown */}
          <View style={styles.shiftBreakdownSection}>
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
          </View>
            </View>

            {/* Right Column - Training & Development */}
            <View style={styles.rightColumn}>
              <View style={styles.suggestedTrainingSection}>
                <CollapsibleSection
                  title="Suggested Training"
                  open={open.training}
                  onToggle={() => toggle('training')}
                >
                  <View style={styles.trainingGrid}>
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
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colours.bg.muted,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colours.brand.accent,
    padding: 24,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  } as any,
  center: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colours.brand.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colours.text.muted,
    fontWeight: '500',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colours.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.canvas,
  },

  // Error State
  errorCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colours.border.default,
    maxWidth: 400,
  },
  errorText: { 
    color: colours.text.muted, 
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colours.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: colours.bg.canvas,
    fontWeight: '600',
    fontSize: 14,
  },

  // Layout
  contentLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    flex: 1,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 2,
    minWidth: 320,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    minWidth: 320,
    gap: 20,
  },
  suggestedTrainingSection: {
    marginTop: -12,
  },

  // Cards
  card: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  } as any,

  // Employee Info
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
  },
  employeeMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colours.status.success,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colours.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.subtle,
  },
  avatarText: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: colours.text.primary 
  },
  employeeInfo: {
    flex: 1,
  },
  name: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: colours.text.primary,
    marginBottom: 4,
  },
  role: { 
    fontSize: 16, 
    color: colours.text.muted, 
    marginBottom: 16 
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.text.muted,
  },
  scoreBadge: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontWeight: '700',
    fontSize: 14,
  },

  // Skill Highlights
  skillHighlights: {
    flexDirection: 'row',
    gap: 16,
  },
  skillPill: {
    flex: 1,
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  } as any,
  goodSkills: { 
    borderColor: colours.brand.primary 
  },
  gapSkills: { 
    borderColor: colours.status.danger 
  },
  pillTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Skills Content
  skillsContent: {
    gap: 24,
  },
  chartsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  chartCardWrapper: {
    flex: 1,
    minWidth: 320,
  },
  chartCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'visible',
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 16,
  },
  chartCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 340,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 16,
  },
  radarContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  shiftBreakdownSection: {
    marginTop: -12,
  },
  skillMeters: {
    gap: 16,
    width: '100%',
    paddingVertical: 8,
  },
  meterRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  meterLabel: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '600',
    color: colours.text.primary 
  },
  meterTrack: {
    flex: 2,
    height: 10,
    borderRadius: 5,
    backgroundColor: colours.border.default,
    overflow: 'hidden',
  },
  meterFill: {
    height: 10,
    borderRadius: 5,
  },
  meterPct: { 
    width: 50, 
    textAlign: 'right', 
    fontSize: 14, 
    fontWeight: '600',
  },

  // Training
  trainingGrid: {
    gap: 16,
  },

  // Insights Card
  insightsCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
    padding: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  } as any,
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: colours.text.primary,
    lineHeight: 20,
  },

  noDataText: { 
    color: colours.text.muted, 
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 24,
  },
});
