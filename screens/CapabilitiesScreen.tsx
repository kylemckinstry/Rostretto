import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import SearchIcon from '../assets/search.svg';
import { useEmployeesUI } from '../viewmodels/employees';
import { colours, toneToColor } from '../theme/colours';
import { scoreToTone } from '../helpers/timeUtils';
import { initials, scorePillColors, clamp01, normalizePercent } from '../helpers/employeeUtils';
import { 
  KNOWN_SKILLS, 
  SKILL_COLOURS, 
  parseQuery, 
  passesSkillCmp,
  type CapabilityRole as Role,
  type CapabilityEmployee as Employee
} from '../constants/skills';

function barColor(pct: number) {
  // Use centralised scoreToTone for consistency (pct is 0-1, convert to 0-100)
  const tone = scoreToTone(pct * 100);
  return toneToColor(tone);
}

// Skill bar component
function SkillBar({ label, value }: { label: string; value: number }) {
  const pct = normalizePercent(value);
  const width = `${Math.round(pct * 100)}%`;
  const rawValue = value ?? 0;
  // Use centralised scoreToTone function for consistent colour mapping
  const tone = scoreToTone(rawValue);
  const tint = toneToColor(tone);
  const fillStyle: any = { width, backgroundColor: tint };
  return (
    <View style={s.skillRow}>
      <Text style={s.skillLabel}>{label}</Text>
      <View style={s.barTrack}>
        <View style={[s.barFill, fillStyle]} />
      </View>
      <Text style={s.skillPct}>{Math.round(pct * 100)}</Text>
    </View>
  );
}

// Employee tile component
function EmployeeTile({ employee, onPress }: { employee: Employee; onPress: () => void }) {
  const topSkills = React.useMemo(() => {
    const entries = Object.entries(employee.skills ?? {});
    const ordered = [
      ...entries.filter(([k]) => KNOWN_SKILLS.includes(k)),
      ...entries.filter(([k]) => !KNOWN_SKILLS.includes(k)),
    ];
    return ordered.slice(0, 3);
  }, [employee.skills]);

  const avatar = employee.imageUrl ? (
    <Image source={{ uri: employee.imageUrl }} style={s.avatar} />
  ) : (
    <View style={s.avatarFallback}>
      <Text style={s.avatarText}>{initials(employee.name)}</Text>
    </View>
  );

  const pill = scorePillColors(employee.score);

  return (
    <Pressable onPress={onPress} android_ripple={{ color: colours.border.default }}>
      <View style={s.card}>
        <View style={s.cardHeader}>
          {avatar}
          <View style={{ flex: 1 }}>
            <Text style={s.empName}>{employee.name}</Text>
          </View>
          <View style={[s.scorePill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
            <Text style={[s.scorePillText, { color: pill.text }]}>
              {typeof employee.score === 'number' ? Math.round(employee.score) : '--'}
            </Text>
          </View>
        </View>

        <View style={s.skillsBlock}>
          {topSkills.length === 0 ? (
            <Text style={s.noSkills}>No skills yet</Text>
          ) : (
            topSkills.map(([k, v]) => <SkillBar key={k} label={k} value={v ?? 0} />)
          )}
        </View>

        <View style={s.gapsBlock}>
          <Text style={s.gapsTitle}>Identified Gaps</Text>
          <View style={s.gapsChips}>
            {KNOWN_SKILLS.filter((k) => (employee.skills?.[k] ?? 0) < 50).map((gap) => (
              <View key={gap} style={s.gapChipOutline}>
                <Text style={s.gapChipOutlineText}>{gap}</Text>
              </View>
            ))}
            {KNOWN_SKILLS.filter((k) => (employee.skills?.[k] ?? 0) < 50).length === 0 && (
              <Text style={s.noGapsText}>✓ No gaps identified</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Main screen
export default function CapabilitiesScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const employees = useEmployeesUI(); // live state from store

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

  return (
    <View style={[s.page, { paddingTop: Math.max(8, insets.top - 32) }]}>
      <Text style={s.title}>Team Capability Overview</Text>

      <View style={s.searchWrap}>
        <View style={{ marginRight: 8 }}>
          <SearchIcon width={18} height={18} fill={colours.text.muted} />
        </View>
        <TextInput
          placeholder='Search name or "Coffee > 70"'
          placeholderTextColor={colours.text.muted}
          value={query}
          onChangeText={setQuery}
          style={s.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')}>
            <Text style={s.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <EmployeeTile
            employee={item}
            onPress={() =>
              (nav as any).navigate('Employee' as never, { employeeId: item.id } as never)
            }
          />
        )}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Styles
const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colours.brand.accent,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colours.brand.primary,
    marginBottom: 14,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colours.text.primary,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  clearBtn: {
    fontSize: 16,
    paddingHorizontal: 6,
    color: colours.text.muted,
  },
  card: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colours.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: colours.text.primary, fontWeight: '700' },
  empName: { fontSize: 16, fontWeight: '700', color: colours.text.primary },
  scorePill: {
    minWidth: 42,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EEF7F4',
    borderWidth: 1,
    borderColor: '#CDE7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePillText: { fontSize: 14, fontWeight: '700', color: colours.brand.primary },
  skillsBlock: { marginTop: 4 },
  noSkills: { color: colours.text.muted, fontStyle: 'italic' },
  skillRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  skillLabel: { width: 96, color: colours.text.primary, fontSize: 14 },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colours.border.default,
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: { height: '100%', borderRadius: 999 },
  skillPct: { width: 42, textAlign: 'right', color: colours.text.primary, fontSize: 14, fontWeight: '700' },
  gapsBlock: { marginTop: 12 },
  gapsTitle: { fontWeight: '700', color: colours.text.secondary, marginBottom: 6 },
  gapsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gapChipOutline: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colours.status.danger,
    backgroundColor: colours.bg.canvas,
  },
  gapChipOutlineText: { color: colours.status.danger, fontSize: 12, fontWeight: '600' },
  noGapsText: { 
    color: colours.status.success, 
    fontSize: 12, 
    fontWeight: '600',
    fontStyle: 'italic',
  },
});


