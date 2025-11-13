import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Radar from './Radar';
import { colours } from '../../theme/colours';
import { KNOWN_SKILLS } from '../../constants/skills';
import { type CapabilityEmployee as Employee } from '../../constants/skills';

type TeamSkillBreakdownProps = {
  employees: Employee[];
  isStacked?: boolean;
};

export default function TeamSkillBreakdown({ employees, isStacked }: TeamSkillBreakdownProps) {
  const teamSkills = React.useMemo(() => {
    // Calculate team average for each skill
    return KNOWN_SKILLS.reduce((acc, skill) => {
      const skillValues = employees
        .map(emp => emp.skills?.[skill] ?? 0)
        .filter(v => v > 0);
      const avg = skillValues.length > 0
        ? skillValues.reduce((sum, v) => sum + v, 0) / skillValues.length
        : 0;
      acc[skill] = avg;
      return acc;
    }, {} as Record<string, number>);
  }, [employees]);

  const radarLabels = Object.keys(teamSkills);
  const radarValues = Object.values(teamSkills);

  return (
    <View style={[styles.teamAnalyticsCard, isStacked && styles.teamAnalyticsCardStacked]}>
      <Text style={styles.sectionTitle}>Team Skill Breakdown</Text>
      <View style={styles.radarBackground}>
        <View style={styles.teamRadarContainer}>
          <Radar
            size={400}
            labels={radarLabels}
            values={radarValues}
            gridSteps={5}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  teamAnalyticsCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 24,
    flex: 1,
    minWidth: 480,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  } as any,
  teamAnalyticsCardStacked: {
    minWidth: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 12,
  },
  radarBackground: {
    backgroundColor: colours.bg.subtle,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  teamRadarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
