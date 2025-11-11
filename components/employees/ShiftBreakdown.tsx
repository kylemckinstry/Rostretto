import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colours, toneToColor } from '../../theme/colours';
import { scoreToTone } from '../../helpers/timeUtils';

type ShiftData = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
};

type ShiftBreakdownProps = {
  employeeId?: string;  // If provided, generates data deterministically
  data?: ShiftData;     // If provided, uses this data directly
  maxHeight?: number;
  minShifts?: number;
  maxShifts?: number;
  weekdayBias?: number;
};

// Hash function to generate a seed from employee ID

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator (deterministic)

function seededRandom(seed: number): () => number {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

// Generates shift data for an employee based on their ID
 
function generateShiftData(
  employeeId: string,
  minShifts: number = 1,
  maxShifts: number = 7,
  weekdayBias: number = 0.6
): ShiftData {
  const seed = hashCode(employeeId);
  const random = seededRandom(seed);

  // Generates base values
  const generateShift = (isWeekday: boolean) => {
    const baseRandom = random();
    const biasedRandom = isWeekday 
      ? baseRandom + (weekdayBias * (1 - baseRandom)) // Boost weekdays
      : baseRandom * (1 - weekdayBias * 0.5); // Reduce weekends slightly
    
    const range = maxShifts - minShifts;
    return Math.round(minShifts + (biasedRandom * range));
  };

  return {
    monday: generateShift(true),
    tuesday: generateShift(true),
    wednesday: generateShift(true),
    thursday: generateShift(true),
    friday: generateShift(true),
    saturday: generateShift(false),
    sunday: generateShift(false),
  };
}

const WEEKDAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

export default function ShiftBreakdown({ 
  employeeId,
  data, 
  maxHeight = 280,
  minShifts = 1,
  maxShifts = 7,
  weekdayBias = 0.6,
}: ShiftBreakdownProps) {
  // Generates data from employeeId if provided, otherwise use provided data or defaults
  const shiftData: ShiftData = React.useMemo(() => {
    if (data) {
      return data;
    }
    if (employeeId) {
      return generateShiftData(employeeId, minShifts, maxShifts, weekdayBias);
    }
    // Default to zero shifts
    return {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };
  }, [employeeId, data, minShifts, maxShifts, weekdayBias]);

  // Finds max value and round up to nearest even number for chart scaling
  const maxDataValue = Math.max(...Object.values(shiftData), 1);
  const chartMaxShifts = maxDataValue % 2 === 0 ? maxDataValue : maxDataValue + 1;
  
  // Generates Y-axis labels (increment by 2)
  const yAxisLabels: number[] = [];
  for (let i = chartMaxShifts; i >= 0; i -= 2) {
    yAxisLabels.push(i);
  }

  // Calculates chart dimensions
  const chartHeight = maxHeight - 60; // Reserve space for labels

  return (
    <View style={styles.container}>
      <View style={styles.chartArea}>
        {/* Y-axis labels */}
        <View style={[styles.yAxis, { height: chartHeight }]}>
          {yAxisLabels.map((value, idx) => (
            <Text key={idx} style={styles.yAxisLabel}>
              {value}
            </Text>
          ))}
        </View>

        {/* Chart content wrapper */}
        <View style={styles.chartContent}>
          {/* Bars container */}
          <View style={[styles.barsContainer, { height: chartHeight }]}>
            {/* Grid lines */}
            {yAxisLabels.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.gridLine, 
                  { top: `${(idx / (yAxisLabels.length - 1)) * 100}%` }
                ]} 
              />
            ))}

            {/* Bars */}
            <View style={styles.bars}>
              {WEEKDAYS.map(({ key, label }, idx) => {
                const value = shiftData[key];
                const heightPercent = chartMaxShifts > 0 ? (value / chartMaxShifts) * 100 : 0;
                
                // Use centralized scoreToTone for consistency
                const pct = chartMaxShifts > 0 ? (value / chartMaxShifts) * 100 : 0;
                const tone = scoreToTone(pct);
                const barColor = toneToColor(tone);

                return (
                  <View key={key} style={styles.barColumn}>
                    <View style={[styles.bar, { 
                      height: `${heightPercent}%`,
                      backgroundColor: barColor,
                    }]}>
                      {value > 0 && <Text style={styles.barValue}>{value}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          
          {/* X-axis labels below bars */}
          <View style={styles.xAxisLabels}>
            {WEEKDAYS.map(({ key, label }) => (
              <Text key={key} style={styles.xAxisLabel}>{label}</Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
    overflow: 'hidden',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 500,
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingVertical: 4,
  },
  yAxisLabel: {
    fontSize: 12,
    color: colours.text.muted,
    fontWeight: '600',
  },
  chartContent: {
    flex: 1,
  },
  barsContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colours.border.default,
    opacity: 0.4,
  } as any,
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    gap: 8,
    paddingHorizontal: 16,
    height: '100%',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    maxWidth: 60,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    minHeight: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    overflow: 'hidden',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colours.bg.canvas,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colours.text.primary,
    flex: 1,
    textAlign: 'center',
  },
});
