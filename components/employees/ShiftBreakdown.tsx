import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colours } from '../../theme/colours';

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
  data?: ShiftData;
  maxHeight?: number;
};

const WEEKDAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

export default function ShiftBreakdown({ data, maxHeight = 280 }: ShiftBreakdownProps) {
  // Default to zero shifts if no data provided
  const shiftData: ShiftData = data || {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };

  // Find max value and round up to nearest even number
  const maxDataValue = Math.max(...Object.values(shiftData), 1);
  const maxShifts = maxDataValue % 2 === 0 ? maxDataValue : maxDataValue + 1;
  
  // Generate Y-axis labels (increment by 2)
  const yAxisLabels: number[] = [];
  for (let i = maxShifts; i >= 0; i -= 2) {
    yAxisLabels.push(i);
  }

  // Calculate chart dimensions
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
                const heightPercent = maxShifts > 0 ? (value / maxShifts) * 100 : 0;
                
                // Color based on percentage similar to Skill Details
                const pct = maxShifts > 0 ? (value / maxShifts) * 100 : 0;
                const barColor = pct >= 80 ? colours.status.success : 
                                 pct >= 60 ? colours.status.warning : 
                                 colours.status.warning;

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
