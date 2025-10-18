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
import { useEmployeesUI } from '../state/employees';

// --- Types from store (UI-facing version) ---
export type Role = 'Coffee' | 'Sandwich' | 'Cashier' | 'Closer';

export type Employee = {
  id: string;
  name: string;
  imageUrl?: string;
  skills?: Partial<Record<Role | string, number>>;
  score?: number;
  fairnessColor?: 'green' | 'yellow' | 'red';
};

// Export roles elsewhere if needed, reuse that.
const KNOWN_SKILLS: Array<Role | string> = ['Coffee', 'Sandwich', 'Cashier', 'Closer'];

// Colour system - will move to a central file later
const COLOURS = {
  brandDark: '#1B4D3E',
  green: '#00B392',
  greenDeep: '#0B5D4A',
  amber: '#F59E0B',
  red: '#EF4444',
  gray900_80: 'rgba(23,26,31,0.8)',
  gray700: '#6B7280',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  cardBg: '#FFFFFF',
  pageBg: '#E6F0EC',
  chipBg: '#F3F4F6',
};

// Consistent colours per skill
const SKILL_COLOURS: Record<string, string> = {
  Coffee: '#0B5D4A',
  Sandwich: '#00B392',
  Cashier: '#FF7D00',
  Closer: '#2B2B2B',
};

// --- Helpers ---
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const normalizePercent = (n?: number) => (typeof n === 'number' ? clamp01(n / 100) : 0);

function barColor(pct: number) {
  if (pct >= 0.8) return COLOURS.greenDeep;
  if (pct >= 0.6) return COLOURS.green;
  if (pct >= 0.4) return COLOURS.amber;
  return COLOURS.red;
}

function scorePillColors(v?: number) {
  if (typeof v !== 'number') {
    return { bg: '#EEF2F7', border: '#E5E7EB', text: '#2B2B2B' };
  }
  if (v >= 80) return { bg: '#EEF7F4', border: '#CDE7DE', text: COLOURS.greenDeep };
  if (v >= 60) return { bg: '#FFF7E8', border: '#FAD7A0', text: '#B45309' };
  return { bg: '#FDECEC', border: '#F5B4B4', text: '#B91C1C' };
}

// --- Search parsing ---
type Comparator = '>' | '>=' | '<' | '<=' | '=';
function parseQuery(q: string):
  | { kind: 'name'; needle: string }
  | { kind: 'skill'; skill: string; cmp: Comparator; value: number }
  | null {
  const trimmed = q.trim();
  if (!trimmed) return null;
  const skillRegex =
    /^(?:skill\s*:\s*)?([a-zA-Z][\w\s-]+)\s*(<=|>=|=|<|>)\s*(\d{1,3})$/i;
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

// --- SkillBar ---
function SkillBar({ label, value }: { label: string; value: number }) {
  const pct = normalizePercent(value);
  const width = `${Math.round(pct * 100)}%`;
  const tint = SKILL_COLOURS[label] ?? barColor(pct);
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

// --- EmployeeTile ---
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
    <Pressable onPress={onPress} android_ripple={{ color: COLOURS.gray200 }}>
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
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// --- Main Screen ---
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
    <View style={[s.page, { paddingTop: Math.max(0, insets.top - 18) }]}>
      <Text style={s.title}>Team Capability Overview</Text>

      <View style={s.searchWrap}>
        <View style={{ marginRight: 8 }}>
          <SearchIcon width={18} height={18} fill={COLOURS.gray700} />
        </View>
        <TextInput
          placeholder='Search name or "Coffee > 70"'
          placeholderTextColor={COLOURS.gray700}
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

// --- Styles ---
const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLOURS.pageBg,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLOURS.brandDark,
    marginBottom: 14,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOURS.gray200,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  clearBtn: {
    fontSize: 16,
    paddingHorizontal: 6,
    color: COLOURS.gray700,
  },
  card: {
    backgroundColor: COLOURS.cardBg,
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
    backgroundColor: COLOURS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#111827', fontWeight: '700' },
  empName: { fontSize: 16, fontWeight: '700', color: '#111827' },
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
  scorePillText: { fontSize: 14, fontWeight: '700', color: COLOURS.greenDeep },
  skillsBlock: { marginTop: 4 },
  noSkills: { color: COLOURS.gray700, fontStyle: 'italic' },
  skillRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  skillLabel: { width: 96, color: '#111827', fontSize: 14 },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLOURS.gray200,
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: { height: '100%', borderRadius: 999 },
  skillPct: { width: 42, textAlign: 'right', color: '#111827', fontSize: 14, fontWeight: '700' },
  gapsBlock: { marginTop: 12 },
  gapsTitle: { fontWeight: '700', color: '#2B2B2B', marginBottom: 6 },
  gapsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gapChipOutline: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#FFFFFF',
  },
  gapChipOutlineText: { color: '#2B2B2B', fontSize: 12, fontWeight: '600' },
});


