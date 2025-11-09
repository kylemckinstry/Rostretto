import * as React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, useWindowDimensions, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { colours, toneToColor } from '../theme/colours';
import { useEmployeesUI } from '../viewmodels/employees';
import Radar from '../components/employees/Radar';
import MetricsRow from '../components/web/MetricsRow';
import { type MetricCard } from '../data/mock/metrics';
import SearchIcon from '../assets/search.svg';
import NotificationIcon from '../assets/notification.svg';
import { scoreToTone } from '../helpers/timeUtils';

// Types
export type Role = 'Coffee' | 'Sandwich' | 'Customer Service' | 'Speed';

export type Employee = {
  id: string;
  name: string;
  imageUrl?: string;
  skills?: Partial<Record<Role | string, number>>;
  score?: number;
  fairnessColor?: 'green' | 'yellow' | 'red';
};

const KNOWN_SKILLS: Array<Role | string> = ['Coffee', 'Sandwich', 'Customer Service', 'Speed'];

const SKILL_COLOURS: Record<string, string> = {
  Coffee: colours.brand.primary,
  Sandwich: colours.status.success,
  'Customer Service': colours.status.warning,
  Speed: colours.text.primary,
};

// Helper functions
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// Values are already in 0-100 range from backend, just clamp them
const normalizePercent = (n?: number) => (typeof n === 'number' ? clamp01(n / 100) : 0);

function scorePillColors(v?: number) {
  if (typeof v !== 'number') {
    return { bg: colours.bg.subtle, border: colours.border.default, text: colours.text.primary };
  }
  
  // Use centralized scoreToTone function for consistency
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

// Search parsing
type Comparator = '>' | '>=' | '<' | '<=' | '=';

function parseQuery(q: string):
  | { kind: 'name'; needle: string }
  | { kind: 'skill'; skill: string; cmp: Comparator; value: number }
  | null {
  const trimmed = q.trim();
  if (!trimmed) return null;
  const skillRegex = /^(?:skill\s*:\s*)?([a-zA-Z][\w\s-]+)\s*(<=|>=|=|<|>)\s*(\d{1,3})$/i;
  const m = trimmed.match(skillRegex);
  if (m) {
    const skill = m[1].trim();
    const cmp = m[2] as Comparator;
    const value = Math.max(0, Math.min(100, parseInt(m[3], 10)));
    return { kind: 'skill', skill, cmp, value };
  }
  return { kind: 'name', needle: trimmed.toLowerCase() };
}

function passesSkillCmp(v: number, cmp: Comparator, target: number) {
  switch (cmp) {
    case '>': return v > target;
    case '>=': return v >= target;
    case '<': return v < target;
    case '<=': return v <= target;
    case '=': return v === target;
  }
}

// Staff Card Component
function StaffCapabilityCard({ employee, style }: { employee: Employee; style?: any }) {
  const navigation = useNavigation();
  
  const topSkills = React.useMemo(() => {
    const entries = Object.entries(employee.skills ?? {});
    const ordered = [
      ...entries.filter(([k]) => KNOWN_SKILLS.includes(k)),
      ...entries.filter(([k]) => !KNOWN_SKILLS.includes(k)),
    ];
    return ordered.slice(0, 4);
  }, [employee.skills]);

  const pill = scorePillColors(employee.score);

  const handleCardPress = () => {
    // @ts-ignore - Navigation types are complex for cross-platform
    navigation.navigate('Employee', { employeeId: employee.id });
  };

  return (
    <Pressable 
      style={[styles.staffCard, style]} 
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${employee.name}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>{initials(employee.name)}</Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
          <Text style={[styles.scorePillText, { color: pill.text }]}>
            {typeof employee.score === 'number' ? Math.round(employee.score) : '--'}
          </Text>
        </View>
      </View>

      <Text style={styles.staffName}>{employee.name}</Text>

      <View style={styles.skillsSection}>
        {topSkills.map(([skill, value]) => {
          const pct = normalizePercent(value);
          const rawValue = value ?? 0;
          // Use centralized scoreToTone function for consistency
          const tone = scoreToTone(rawValue);
          const color = toneToColor(tone);
          return (
            <View key={skill} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill}</Text>
              <View style={styles.skillBarContainer}>
                <View style={styles.skillBarTrack}>
                  <View 
                    style={[
                      styles.skillBarFill, 
                      { width: `${Math.round(pct * 100)}%`, backgroundColor: color }
                    ]} 
                  />
                </View>
                <Text style={styles.skillPercentage}>{Math.round(pct * 100)}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.gapsSection}>
        <Text style={styles.gapsTitle}>Identified Gaps</Text>
        <View style={styles.gapsChips}>
          {KNOWN_SKILLS.filter((skill) => (employee.skills?.[skill] ?? 0) < 50).map((gap) => (
            <View key={gap} style={styles.gapChip}>
              <Text style={styles.gapChipText}>{gap}</Text>
            </View>
          ))}
          {KNOWN_SKILLS.filter((skill) => (employee.skills?.[skill] ?? 0) < 50).length === 0 && (
            <View style={styles.noGapsContainer}>
              <Text style={styles.noGapsText}>✓ No gaps identified</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// Main Component
export default function CapabilitiesScreenWeb() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const employees = useEmployeesUI();
  
  // Note: Any future CollapsibleSection components should default to expanded (true) on web
  // Clean responsive breakpoints
  const isStacked = width < 650;    // Single column stacked (mobile)
  const isTwoByTwo = width >= 650 && width < 1000; // 2x2 grid (tablets)
  const isFullGrid = width >= 1000; // Full responsive grid (desktop)

  // Debug logging
  React.useEffect(() => {
    console.log(`Width: ${width}, isStacked: ${isStacked}, isTwoByTwo: ${isTwoByTwo}, isFullGrid: ${isFullGrid}`);
  }, [width, isStacked, isTwoByTwo, isFullGrid]);

  const [query, setQuery] = React.useState('');
  const filters = React.useMemo(() => parseQuery(query), [query]);

  const filtered = React.useMemo(() => {
    if (!filters) return employees;
    if (filters.kind === 'name') {
      return employees.filter((e) => {
        const [first = '', last = ''] = e.name.toLowerCase().split(' ');
        const n = filters.needle;
        return first.startsWith(n) || last.startsWith(n);
      });
    }
    const skillLc = filters.skill.toLowerCase();
    return employees.filter((e) => {
      const entry = Object.entries(e.skills ?? {}).find(([k]) => k.toLowerCase() === skillLc);
      if (!entry) return false;
      const value = entry[1] ?? 0;
      return passesSkillCmp(value, filters.cmp, filters.value);
    });
  }, [employees, filters]);

  const teamMetrics = React.useMemo(() => {
    const totalStaff = employees.length;
    const skillGaps = employees.reduce((gaps, emp) => {
      KNOWN_SKILLS.forEach(skill => {
        if ((emp.skills?.[skill] ?? 0) < 50) {
          gaps++;
        }
      });
      return gaps;
    }, 0);
    
    const avgProficiency = employees.reduce((sum, emp) => {
      const skillValues = Object.values(emp.skills ?? {}).filter((v): v is number => typeof v === 'number');
      const avgSkill = skillValues.length > 0 
        ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length 
        : 0;
      return sum + avgSkill;
    }, 0) / (employees.length || 1);

    return { totalStaff, skillGaps, avgProficiency };
  }, [employees]);

  const snapshotMetrics: MetricCard[] = [
    { kind: 'neutral', title: 'Total Staff', value: teamMetrics.totalStaff.toString() },
    { kind: 'alert', title: 'Skill Gaps', value: `${teamMetrics.skillGaps} Identified` },
    { kind: 'success', title: 'Avg. Proficiency', value: `${Math.round(teamMetrics.avgProficiency)}%` },
    { kind: 'chart', title: 'Team Status', value: 'Active' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colours.bg.muted }}>
      <Header />

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContentWrapper}>
        <View style={styles.pageContent}>
          
          <View style={styles.titleRow}>
            <Text style={[styles.pageTitle, (isStacked || isTwoByTwo) && styles.pageTitleCompact]}>
              Team Capability Overview
            </Text>
            <Pressable 
              onPress={() => navigation.navigate('Feedback' as never)}
              style={styles.notificationButton}
              accessibilityLabel="View feedback requests"
            >
              <NotificationIcon width={20} height={20} color={colours.brand.primary} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <MetricsRow title="Team Skill Snapshot" cards={snapshotMetrics} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, (isStacked || isTwoByTwo) && styles.sectionTitleCompact]}>
              Individual Staff Capabilities
            </Text>
            <View style={[styles.searchContainer, (isStacked || isTwoByTwo) && styles.searchContainerCompact]}>
              <View style={styles.searchIcon}>
                <SearchIcon width={18} height={18} fill={colours.text.muted} />
              </View>
              <TextInput
                placeholder='Search staff or skills...'
                placeholderTextColor={colours.text.muted}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {!!query && (
                <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
                  <Text style={styles.clearText}>✕</Text>
                </Pressable>
              )}
            </View>
            {isStacked ? (
              <View style={styles.staffStackedContainer}>
                {filtered.map((employee) => (
                  <StaffCapabilityCard 
                    key={employee.id} 
                    employee={employee} 
                    style={styles.staffCardStacked}
                  />
                ))}
              </View>
            ) : isTwoByTwo ? (
              <ScrollView style={styles.staffScrollContainer}>
                <View style={styles.staffTwoColumnGrid}>
                  {filtered.map((employee) => (
                    <StaffCapabilityCard 
                      key={employee.id} 
                      employee={employee} 
                      style={styles.staffCardTwoColumn}
                    />
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.staffContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={true}
                  style={styles.staffScrollContainer}
                  contentContainerStyle={styles.staffScrollContent}
                  nestedScrollEnabled={true}
                >
                  {filtered.map((employee) => (
                    <StaffCapabilityCard key={employee.id} employee={employee} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: colours.bg.muted 
  },
  pageContentWrapper: { 
    alignItems: 'center' as any,
    backgroundColor: colours.bg.muted,
    paddingBottom: 0,
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
      },
    }),
  } as any,
  pageContent: { 
    width: '100%',
    maxWidth: 1400,
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 24,
    backgroundColor: colours.bg.subtle,
    borderRadius: Platform.OS === 'web' ? 0 : 16,
    ...Platform.select({
      web: {
        minHeight: 'calc(100vh - 60px)',
      },
    }),
  } as any,
  pageTitle: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: colours.brand.primary,
    marginBottom: 0,
    textAlign: 'center' as any,
  },
  pageTitleCompact: {
    fontSize: 20,
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    marginBottom: 24,
    position: 'relative' as any,
    minHeight: 36,
  },
  notificationButton: {
    position: 'absolute' as any,
    right: 0,
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  section: {
    backgroundColor: colours.brand.accent,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: colours.text.primary,
    marginBottom: 16,
  },
  standaloneSectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleCompact: {
    fontSize: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    backgroundColor: colours.bg.canvas,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colours.border.default,
    paddingHorizontal: 16,
    height: 40,
    maxWidth: 800,
    width: '100%',
    marginHorizontal: 'auto' as any,
    marginBottom: 16,
  },
  searchContainerCompact: {
    height: 36,
    paddingHorizontal: 12,
    maxWidth: '100%',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colours.text.primary,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: 12,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 16,
    color: colours.text.muted,
  },
  staffContainer: {
    alignItems: 'center' as any,
  },
  staffStackedContainer: {
    flexDirection: 'column' as any,
    gap: 16,
    alignItems: 'center' as any,
    width: '100%',
  },
  staffTwoColumnGrid: {
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    gap: 16,
    justifyContent: 'center' as any,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  staffGrid: {
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    gap: 16,
    justifyContent: 'center' as any,
  },
  staffGridCompact: {
    gap: 12,
  },
  staffScrollContainer: {
    flex: 1,
    width: '100%',
  },
  staffScrollContent: {
    paddingHorizontal: 16,
    paddingRight: 32, // Extra space at the end
    paddingBottom: 12, // Space for horizontal scroll bar
    gap: 16,
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
  },
  staffCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 16,
    width: 280,
    minWidth: 280,
    height: 400,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colours.border.default,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    // Hover effects for web
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
      borderColor: colours.brand.primary,
    },
  } as any,
  staffCardStacked: {
    width: '100%',
    maxWidth: 500,
    minWidth: 280,
  },
  staffCardTwoColumn: {
    width: '45%',
    minWidth: 280,
    maxWidth: 320,
  },
  cardHeader: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    marginBottom: 8,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colours.bg.subtle,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  avatarText: {
    color: colours.text.primary,
    fontWeight: '700' as any,
    fontSize: 16,
  },
  scorePill: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  scorePillText: {
    fontSize: 14,
    fontWeight: '700' as any,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: colours.text.primary,
    textAlign: 'center' as any,
  },
  skillsSection: {
    gap: 8,
    marginBottom: 12,
  },
  skillItem: {
    gap: 4,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600' as any,
    color: colours.text.primary,
  },
  skillBarContainer: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: 8,
  },
  skillBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colours.border.default,
    borderRadius: 3,
    overflow: 'hidden' as any,
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillPercentage: {
    fontSize: 12,
    fontWeight: '600' as any,
    color: colours.text.secondary,
    width: 32,
    textAlign: 'right' as any,
  },
  gapsSection: {
    marginTop: 16,
  },
  gapsTitle: {
    fontSize: 14,
    fontWeight: '600' as any,
    color: colours.text.secondary,
    marginBottom: 8,
  },
  gapsChips: {
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
    gap: 6,
  },
  gapChip: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colours.status.danger,
    backgroundColor: colours.bg.canvas,
  },
  gapChipText: {
    color: colours.status.danger,
    fontSize: 12,
    fontWeight: '600' as any,
  },
  noGapsContainer: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
  },
  noGapsText: {
    color: colours.status.success,
    fontSize: 12,
    fontWeight: '600' as any,
  },
});

if (Platform.OS !== 'web') {
  console.warn('CapabilitiesScreen.web.tsx loaded on non-web platform');
}