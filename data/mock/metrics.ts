export type MetricKind = 'alert' | 'success' | 'neutral' | 'chart';

export type MetricCard = {
  kind: MetricKind;
  title: string;
  value: string;
  sub?: string;
};

/**
 * Mock metrics for demand forecast view
 */
export const MOCK_DEMAND_FORECAST_METRICS: MetricCard[] = [
  { kind: 'alert', title: 'Skill Mismatches', value: '12' },
  { kind: 'neutral', title: 'Highest Average Demand', value: 'Coffee' },
  { kind: 'success', title: 'Expected Average Traffic', value: 'Low' },
  { kind: 'chart', title: 'Average Availability', value: 'High' },
];

/**
 * Mock metrics for previous week summary
 */
export const MOCK_PREVIOUS_WEEK_METRICS: MetricCard[] = [
  { kind: 'alert', title: 'Skill Mismatches', value: '7' },
  { kind: 'neutral', title: 'Highest Demand', value: 'Coffee' },
  { kind: 'alert', title: 'Understaffed Shifts', value: '5' },
  { kind: 'neutral', title: 'Overstaffed Shifts', value: '4' },
];
