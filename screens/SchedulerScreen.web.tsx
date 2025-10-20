// Web-optimised scheduler screen with responsive design and forecast metrics
import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { addDays, addWeeks, startOfWeek } from '../utils/date';
import Header from '../components/Header'; // Automatically loads Header.web.tsx on web platform
import { colours } from '../theme/colours';
import { DayIndicators } from '../state/types';

// Web-specific components with responsive grid layouts
import WeekForecastGrid, { WeekForecastDay } from '../components/web/WeekForecastGrid';
import AvailableStaffList, { StaffBubble } from '../components/web/AvailableStaffList';
import MetricsRow, { MetricCard } from '../components/web/MetricsRow';
import { MOCK_EMPLOYEES } from '../data/mock/employees';

// Shared mobile components with platform-specific overrides
import DateSwitch from '../components/roster/DateSwitch';
import DateNavigator from '../components/calendar/DateNavigator';

export default function SchedulerScreenWeb() {
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [isStaffExpanded, setIsStaffExpanded] = React.useState(true);
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints matching Header.web.tsx for consistent layout behaviour
  const isCompact = width < 900;
  const isSmall = width < 640;

  // Mock weekly data structure to demonstrate forecast functionality
  const weekStart = startOfWeek(anchorDate);
  const mkKey = (d: Date) => d.toISOString().slice(0, 10);
  const weekIndicators: Record<string, DayIndicators> = {
    [mkKey(addDays(weekStart, 0))]: { mismatches: 3, demand: 'Coffee', traffic: 'medium' },
    [mkKey(addDays(weekStart, 1))]: { mismatches: 0, demand: 'Mixed', traffic: 'low' },
    [mkKey(addDays(weekStart, 2))]: { mismatches: 1, demand: 'Sandwich', traffic: 'medium' },
    [mkKey(addDays(weekStart, 3))]: { mismatches: 2, demand: 'Coffee', traffic: 'high' },
    [mkKey(addDays(weekStart, 4))]: { mismatches: 0, demand: 'Mixed', traffic: 'medium' },
    [mkKey(addDays(weekStart, 5))]: { mismatches: 1, demand: 'Coffee', traffic: 'high' },
    [mkKey(addDays(weekStart, 6))]: { mismatches: 0, demand: 'Mixed', traffic: 'low' },
  };

  // Transform data structure for web forecast grid component compatibility
  const weekDays: WeekForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const key = mkKey(d);
    const indicators = weekIndicators[key] || { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
    
    // Map mobile enum types to web component string expectations
    const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
    const demandMapping = { Coffee: 'Coffee', Sandwich: 'Sandwiches', Mixed: 'Mixed' } as const;
    
    return {
      date: d,
      mismatches: indicators.mismatches,
      demand: demandMapping[indicators.demand] || 'Mixed',
      traffic: trafficMapping[indicators.traffic] || 'Medium',
    };
  });



  // Transform mock employee data for staff bubble display
  const staff: StaffBubble[] = MOCK_EMPLOYEES.map(emp => {
    // Extract initials from first and last name
    const initials = `${emp.first_name.charAt(0)}${emp.last_name.charAt(0)}`.toUpperCase();
    
    // Map fairness colour to visual tone for border styling
    const toneMapping = { 
      'green': 'good' as const, 
      'yellow': 'warn' as const, 
      'red': 'bad' as const 
    };
    
    return {
      initials,
      name: emp.name,
      tone: toneMapping[emp.fairnessColor],
    };
  });

  // Performance metrics for current week forecast
  const demandMetrics: MetricCard[] = [
    { kind: 'alert', title: 'Skill Mismatches', value: '12' },
    { kind: 'neutral', title: 'Highest Average Demand', value: 'Coffee' },
    { kind: 'success', title: 'Expected Average Traffic', value: 'Low' },
    { kind: 'chart', title: 'Average Availability', value: 'High' },
  ];





  return (
    <View style={{ flex: 1, backgroundColor: colours.bg.subtle }}>
      <Header />

      <ScrollView style={s.page} contentContainerStyle={s.pageContentWrapper}>
        <View style={s.pageContent}>
        {/* Navigation bar with toggle and date controls */}
        <View style={[s.topBar, isCompact && s.topBarCompact]}>
          {isCompact ? (
            // Compact layout: stack vertically
            <View style={s.compactNavLayout}>
              <View style={s.compactDateNav}>
                <DateNavigator
                  label={formatWeekRange(weekStart)}
                  onPrev={() => setAnchorDate(d => addWeeks(d, -1))}
                  onNext={() => setAnchorDate(d => addWeeks(d, 1))}
                />
              </View>
              <View style={s.compactToggle}>
                <DateSwitch granularity="weekly" onGranularityChange={() => {}} />
              </View>
            </View>
          ) : (
            // Desktop layout: horizontal sections
            <>
              <View style={s.leftSection}>
                <DateSwitch granularity="weekly" onGranularityChange={() => {}} fluid />
              </View>
              <View style={s.centerSection}>
                <DateNavigator
                  label={formatWeekRange(weekStart)}
                  onPrev={() => setAnchorDate(d => addWeeks(d, -1))}
                  onNext={() => setAnchorDate(d => addWeeks(d, 1))}
                />
              </View>
              <View style={s.rightSection} />
            </>
          )}
        </View>

        {/* Main weekly forecast display */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Weekly Forecast</Text>
          <WeekForecastGrid days={weekDays} />
        </View>

        {/* Quick action button for automatic shift generation */}
        <Pressable style={s.autoShiftBtn} onPress={() => { /* modal placeholder */ }}>
          <Text style={s.autoShiftText}>+  Auto Shift</Text>
        </Pressable>

        {/* Analytics overview - full width layout for testing */}
        {/* Current week analytics */}
        <View style={s.section}>
          <MetricsRow title="Demand Forecast" cards={demandMetrics} />
        </View>

        {/* Historical performance data */}
        <View style={s.section}>
          <MetricsRow title="Previous Week Overview" variant="previous-week" />
        </View>

        {/* Staff availability overview */}
        <View style={s.section}>
          <Pressable 
            style={s.sectionHeaderRow} 
            onPress={() => setIsStaffExpanded(!isStaffExpanded)}
          >
            <Text style={s.sectionTitle}>Available Staff</Text>
            <View style={s.chevronBox}>
              <Text style={s.chevron}>
                {isStaffExpanded ? 'v' : '>'}
              </Text>
            </View>
          </Pressable>
          {isStaffExpanded && <AvailableStaffList staff={staff} />}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Format date range for week navigation display
function formatWeekRange(weekStart: Date) {
  const end = addDays(weekStart, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#E5E7EB' },
  pageContentWrapper: { 
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingBottom: 0,
    ...Platform.select({
      web: {
        minHeight: '100vh',
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    position: 'relative',
    minHeight: 40,
  },
  topBarCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 4,
    minHeight: 80,
  },
  compactNavLayout: {
    width: '100%',
    alignItems: 'center',
  },
  compactDateNav: {
    width: '100%',
    marginBottom: 8,
  },
  compactToggle: {
    alignItems: 'center',
  },
  leftSection: {
    zIndex: 1,
  },
  centerSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
  },
  section: {
    backgroundColor: colours.brand.accent,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  sectionBottom: { marginBottom: 48 },
  metricsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricsContainerCompact: {
    flexDirection: 'column',
    gap: 0,
  },
  metricsSection: {
    flex: 1,
    marginBottom: 0,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colours.text.primary },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronBox: { 
    padding: 6, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    textAlign: 'center',
    lineHeight: 22,
    color: colours.text.primary,
    backgroundColor: colours.bg.canvas,
  },
  dropdownHint: { fontSize: 16, opacity: 0.7, color: colours.text.muted },
  autoShiftBtn: {
    alignSelf: 'center',
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 16,
    width: '70%',
    maxWidth: '50%',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // Enhanced drop shadow matching tile elevation
  } as any,
  autoShiftText: { 
    color: colours.bg.canvas, 
    fontWeight: '600', 
    fontSize: 14,
  },
});

if (Platform.OS !== 'web') {
  console.warn('SchedulerScreen.web.tsx loaded on non-web platform');
}

