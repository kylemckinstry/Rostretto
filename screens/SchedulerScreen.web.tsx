import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { addDays, addWeeks, startOfWeek } from '../utils/date';
import Header from '../components/Header'; // Automatically resolves to web-specific header component
import { colours } from '../theme/colours';
import { DayIndicators } from '../state/types';
import { TimeSlotData } from '../components/web/TimeSlot.web';
import { scoreToTone } from '../helpers/timeUtils';
import { generateTimeSlots, generateTimeOptions } from '../helpers/schedulerIO';

// Web-optimised components with responsive breakpoints
import WeekForecastGrid, { WeekForecastDay } from '../components/web/WeekForecastGrid';
import AvailableStaffList, { StaffBubble } from '../components/web/AvailableStaffList';
import MetricsRow, { MetricCard } from '../components/web/MetricsRow';
import AvailableStaffSidebar from '../components/web/AvailableStaffSidebar';
import AvailableEmployeesModal from '../components/modals/AvailableEmployeesModal';
import RemoveStaffConfirmModal from '../components/modals/RemoveStaffConfirmModal';
import { MOCK_EMPLOYEES } from '../data/mock/employees';

// Cross-platform components compatible with web
import DateSwitch from '../components/roster/DateSwitch';
import DateNavigator from '../components/calendar/DateNavigator';
import TimeSlotWeb from '../components/web/TimeSlot.web';
import type { UIEmployee } from '../viewmodels/employees';

const TIME_OPTIONS = generateTimeOptions();

export default function SchedulerScreenWeb() {
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [isStaffExpanded, setIsStaffExpanded] = React.useState(false);
  const [granularity, setGranularity] = React.useState<'weekly' | 'daily'>('daily');
  const { width } = useWindowDimensions();
  
  // Daily scheduling state management
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlotData | null>(null);
  const [timeSlots, setTimeSlots] = React.useState<TimeSlotData[]>(generateTimeSlots());
  
  // Remove staff confirmation modal state
  const [removeConfirm, setRemoveConfirm] = React.useState<{
    slotId: string;
    staffIndex: number;
    staffName: string;
  } | null>(null);
  
  // Responsive breakpoints for adaptive layout behaviour
  const isCompact = width < 900;
  const isSmall = width < 640;

  // Sample weekly data for the forecast
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

  // Transform week data for forecast grid component
  const weekDays: WeekForecastDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const key = mkKey(d);
    const indicators = weekIndicators[key] || { mismatches: 0, demand: 'Mixed', traffic: 'medium' };
    
    // Map internal status types to display strings
    const trafficMapping = { low: 'Low', medium: 'Medium', high: 'High' } as const;
    const demandMapping = { Coffee: 'Coffee', Sandwich: 'Sandwiches', Mixed: 'Mixed' } as const;
    
    return {
      date: d,
      mismatches: indicators.mismatches,
      demand: demandMapping[indicators.demand] || 'Mixed',
      traffic: trafficMapping[indicators.traffic] || 'Medium',
    };
  });

  // Process employee data for staff availability display
  const staff: StaffBubble[] = MOCK_EMPLOYEES.map(emp => {
    // Get first letters of first and last name
    const initials = `${emp.first_name.charAt(0)}${emp.last_name.charAt(0)}`.toUpperCase();
    
    // Convert fairness colour to simple border colour
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

  // Functions for daily view interactions
  const handleAddStaff = (slot: TimeSlotData) => {
    // Click same slot to deselect it
    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleCancelAssignment = () => {
    setSelectedSlot(null);
  };

  const handleRemoveStaff = (slotId: string, staffIndex: number, staffName: string) => {
    // Show confirmation modal
    setRemoveConfirm({ slotId, staffIndex, staffName });
  };

  const handleRemoveAll = () => {
    if (!removeConfirm) return;
    
    // Remove from all slots
    setTimeSlots(slots => 
      slots.map(slot => ({
        ...slot,
        assignedStaff: slot.assignedStaff.filter(staff => staff.name !== removeConfirm.staffName),
      }))
    );
    
    setRemoveConfirm(null);
  };

  const handleRemoveOne = () => {
    if (!removeConfirm) return;
    
    // Remove from just this slot
    setTimeSlots(slots => 
      slots.map(slot => {
        if (slot.id === removeConfirm.slotId) {
          const newStaff = [...slot.assignedStaff];
          newStaff.splice(removeConfirm.staffIndex, 1);
          return { ...slot, assignedStaff: newStaff };
        }
        return slot;
      })
    );
    
    setRemoveConfirm(null);
  };

  const handleAssignStaff = ({ employee, start, end, role }: { employee: UIEmployee; start: string; end: string; role?: string }) => {
    const newStaffMember = {
      name: employee.name,
      role: role || 'Mixed', // Use provided role or default to Mixed
      tone: scoreToTone(employee.score),
    };

    // Find all slots that fall within the start and end time range
    const startIndex = TIME_OPTIONS.findIndex(time => time === start);
    const endIndex = TIME_OPTIONS.findIndex(time => time === end);
    
    setTimeSlots(slots => 
      slots.map(slot => {
        const slotStartIndex = TIME_OPTIONS.findIndex(time => time === slot.startTime);
        
        // Assign to all slots that overlap with the time range
        if (slotStartIndex >= startIndex && slotStartIndex < endIndex) {
          return {
            ...slot,
            assignedStaff: [...slot.assignedStaff, newStaffMember],
          };
        }
        return slot;
      })
    );
    
    // Clear selection after assigning staff
    setSelectedSlot(null);
  };

  // Daily metrics based on current day data
  const dailyMetrics: MetricCard[] = [
    { kind: 'alert', title: 'Skill Mismatches', value: String(timeSlots.reduce((sum, slot) => sum + slot.mismatches, 0)) },
    { kind: 'neutral', title: 'Primary Demand', value: 'Mixed' },
    { kind: 'success', title: 'Expected Traffic', value: 'Medium' },
    { kind: 'chart', title: 'Availability', value: 'High' },
  ];

  // Format current day date for navigation
  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Performance metrics for current week forecast
  const demandMetrics: MetricCard[] = [
    { kind: 'alert', title: 'Skill Mismatches', value: '12' },
    { kind: 'neutral', title: 'Highest Average Demand', value: 'Coffee' },
    { kind: 'success', title: 'Expected Average Traffic', value: 'Low' },
    { kind: 'chart', title: 'Average Availability', value: 'High' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colours.bg.muted }}>
      <Header />
      <ScrollView style={styles.page}>
        <View style={styles.pageContent}>
          {/* Navigation bar with toggle and date controls */}
          <View style={[styles.topBar, isCompact && styles.topBarCompact]}>
            {isCompact ? (
              <View style={styles.compactNavLayout}>
                <View style={styles.compactDateNav}>
                  <DateNavigator
                    label={granularity === 'weekly' ? formatWeekRange(weekStart) : formatDayDate(anchorDate)}
                    onPrev={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, -1) : addDays(d, -1))}
                    onNext={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, 1) : addDays(d, 1))}
                  />
                </View>
                <View style={styles.compactToggle}>
                  <DateSwitch granularity={granularity} onGranularityChange={setGranularity} />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.leftSection}>
                  <DateSwitch granularity={granularity} onGranularityChange={setGranularity} fluid />
                </View>
                <View style={styles.centerSection}>
                  <DateNavigator
                    label={granularity === 'weekly' ? formatWeekRange(weekStart) : formatDayDate(anchorDate)}
                    onPrev={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, -1) : addDays(d, -1))}
                    onNext={() => setAnchorDate(d => granularity === 'weekly' ? addWeeks(d, 1) : addDays(d, 1))}
                  />
                </View>
                <View style={styles.rightSection} />
              </>
            )}
          </View>

          {/* Main content area - conditional based on granularity */}
          {granularity === 'weekly' ? (
            <>
              {/* Weekly forecast display */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Forecast</Text>
                <WeekForecastGrid
                  days={weekDays}
                  onDayPress={(date) => {
                    setAnchorDate(date);
                    setGranularity('daily');
                  }}
                />
              </View>

              {/* Quick action button for automatic shift generation */}
              <Pressable style={styles.autoShiftBtn} onPress={() => { /* modal placeholder */ }}>
                <Text style={styles.autoShiftText}>+  Auto Shift</Text>
              </Pressable>

              {/* Current week analytics */}
              <View style={styles.section}>
                <MetricsRow title="Demand Forecast" cards={demandMetrics} />
              </View>

              {/* Historical performance data */}
              <View style={styles.section}>
                <MetricsRow title="Previous Week Overview" variant="previous-week" />
              </View>

              {/* Staff availability overview - only show in weekly view */}
              <View style={styles.section}>
                <Pressable
                  style={styles.sectionHeaderRow}
                  onPress={() => setIsStaffExpanded(!isStaffExpanded)}
                >
                  <Text style={styles.sectionTitle}>Available Staff</Text>
                  <View style={styles.chevronBox}>
                    <Text style={styles.chevron}>{isStaffExpanded ? '▲' : '▼'}</Text>
                  </View>
                </Pressable>
                {isStaffExpanded && (
                  <View style={styles.staffListContainer}>
                    <AvailableStaffList staff={staff} />
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* Daily view metrics */}
              <View style={styles.section}>
                <MetricsRow title="Today's Forecast" cards={dailyMetrics} />
              </View>

              {/* Daily schedule view with split layout */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Schedule</Text>
                <View style={[styles.splitContainer, isCompact && styles.splitContainerCompact]}>
                  {/* Left side: Time slots */}
                  <View style={[styles.timeSlotsColumn, isCompact && styles.timeSlotsColumnCompact, selectedSlot && styles.timeSlotsColumnWithOverlay]}>
                    <View style={[styles.timeSlotListContainer, selectedSlot && styles.contentAboveOverlay]}>
                      {/* Dark overlay when a time slot is selected - clickable to deselect */}
                      {selectedSlot && (
                        <Pressable
                          style={styles.timeSlotsOverlay}
                          onPress={handleCancelAssignment}
                          accessible={false}
                        />
                      )}
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                        style={selectedSlot && styles.contentAboveOverlay}
                      >
                        {timeSlots.map(slot => (
                          <TimeSlotWeb
                            key={slot.id}
                            slot={slot}
                            onAddStaff={handleAddStaff}
                            onRemoveStaff={handleRemoveStaff}
                            isSelected={selectedSlot?.id === slot.id}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  {/* Right side: Available staff sidebar with Auto Shift button - only on desktop */}
                  {!isCompact && (
                    <View style={[styles.staffColumn, isCompact && styles.staffColumnCompact]}>
                      <View style={styles.stickyStaffContainer}>
                        {/* Quick action button for automatic shift generation */}
                        <Pressable style={styles.autoShiftBtnStaff} onPress={() => { /* modal placeholder */ }}>
                          <Text style={styles.autoShiftText}>+  Auto Shift</Text>
                        </Pressable>
                        <AvailableStaffSidebar
                          selectedSlot={selectedSlot}
                          onAssign={handleAssignStaff}
                          onCancel={handleCancelAssignment}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Available Staff Modal - only on mobile/compact screens */}
              {isCompact && selectedSlot && (
                <AvailableEmployeesModal
                  visible={true}
                  onClose={handleCancelAssignment}
                  slotStart={selectedSlot.startTime}
                  slotEnd={selectedSlot.endTime}
                  onAssign={handleAssignStaff}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Remove Staff Confirmation Modal */}
      <RemoveStaffConfirmModal
        visible={!!removeConfirm}
        staffName={removeConfirm?.staffName ?? ''}
        onRemoveAll={handleRemoveAll}
        onRemoveOne={handleRemoveOne}
        onCancel={() => setRemoveConfirm(null)}
      />
    </View>
  );
}

// Helper for week range label
function formatWeekRange(weekStart: Date) {
  const end = addDays(weekStart, 6);
  return `${weekStart.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colours.bg.muted,
  },
  pageContent: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colours.bg.subtle,
    borderRadius: Platform.OS === 'web' ? 0 : 16,
    width: '100%',
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
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 8, 
    color: colours.text.primary 
  },
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
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colours.border.default,
    textAlign: 'center',
    lineHeight: 18,
    color: colours.text.secondary,
    backgroundColor: colours.bg.canvas,
  },
  staffListContainer: {
    marginTop: 16,
  },
  dropdownHint: { 
    fontSize: 16, 
    opacity: 0.7, 
    color: colours.text.muted 
  },
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
  } as any,
  autoShiftText: {
    color: colours.bg.canvas,
    fontWeight: '600',
    fontSize: 14,
  },
  autoShiftBtnDaily: {
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
    width: '80%',
    maxWidth: '50%',
    alignSelf: 'center',
    alignItems: 'center',
  } as any,
  autoShiftBtnStaff: {
    backgroundColor: colours.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  } as any,
  dayViewContainer: {
    backgroundColor: colours.bg.subtle,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  splitContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    minHeight: 600,
  },
  splitContainerCompact: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
  timeSlotsColumn: {
    flex: 2,
  },
  timeSlotsColumnCompact: {
    flex: 1,
  },
  staffColumn: {
    flex: 1,
    minWidth: 280,
    maxWidth: 320,
  },
  staffColumnCompact: {
    minWidth: 'auto',
    maxWidth: '100%',
    flex: 1,
  },
  stickyStaffContainer: {
    position: 'sticky',
    top: 12,
  } as any,
  timeSlotListContainer: {
    flex: 1,
    backgroundColor: colours.bg.muted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 16,
    position: 'relative',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  timeSlotsColumnWithOverlay: {
    position: 'relative',
  } as any,
  timeSlotsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    zIndex: 100,
  } as any,
  contentAboveOverlay: {
    position: 'relative',
    zIndex: 20,
  } as any,
});

if (Platform.OS !== 'web') {
  console.warn('SchedulerScreen.web.tsx loaded on non-web platform');
}