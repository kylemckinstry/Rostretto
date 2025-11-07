// Responsive metric tiles with themed icons and colour-coded values
import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colours } from '../../theme/colours';
import { MOCK_DEMAND_FORECAST_METRICS, MOCK_PREVIOUS_WEEK_METRICS, type MetricCard } from '../../data/mock/metrics';

// SVG icon components for metric visualisation
import CoffeeIcon from '../../assets/coffee.svg';
import TrafficIcon from '../../assets/traffic.svg';
import TeamIcon from '../../assets/team.svg';
import AvailabilityIcon from '../../assets/availability.svg';

// Custom exclamation icon component for alert metrics
const ExclamationIcon = ({ width = 18, height = 18, color = colours.status.danger }: { 
  width?: number; 
  height?: number; 
  color?: string; 
}) => (
  <View style={{
    width,
    height,
    borderRadius: width / 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{ 
      fontSize: 14, 
      fontWeight: 'bold', 
      color,
      lineHeight: height 
    }}>
      !
    </Text>
  </View>
);

type MetricsRowProps = {
  title: string;
  cards?: MetricCard[];
  variant?: 'demand-forecast' | 'previous-week';
};

export default function MetricsRow({ title, cards, variant = 'demand-forecast' }: MetricsRowProps) {
  // Generate cards based on variant if not provided
  const metricsCards = cards || generateCardsForVariant(variant);

  return (
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.container}>
        <View style={s.grid}>
          {metricsCards.map((c, i) => {
            const IconComponent = iconComponentFor(c.kind);
            const iconColor = colorFor(c.kind);
            
            return (
              <View key={i} style={stylesCard.card}>
                <View style={stylesCard.iconContainer}>
                  <View style={[stylesCard.iconCircle, { 
                    backgroundColor: backgroundColorFor(c.kind),
                    borderColor: iconColor,
                    borderWidth: 2,
                  }]}>
                    <IconComponent width={16} height={16} color={iconColor} />
                  </View>
                </View>
                <Text style={stylesCard.title}>{c.title}</Text>
                <Text style={[stylesCard.value, { color: iconColor }]}>{c.value}</Text>
                {c.sub && <Text style={stylesCard.subtitle}>{c.sub}</Text>}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// Generate metric cards based on variant
function generateCardsForVariant(variant: 'demand-forecast' | 'previous-week'): MetricCard[] {
  if (variant === 'previous-week') {
    return MOCK_PREVIOUS_WEEK_METRICS;
  }
  
  return MOCK_DEMAND_FORECAST_METRICS;
}

function iconComponentFor(k: MetricCard['kind']) {
  if (k === 'alert') return ExclamationIcon;
  if (k === 'success') return TrafficIcon; // Traffic represents optimal flow and success
  if (k === 'chart') return AvailabilityIcon; // Availability icon for staffing metrics
  return CoffeeIcon; // Coffee icon for demand and neutral metrics
}

function colorFor(k: MetricCard['kind']) {
  if (k === 'alert') return colours.status.danger;
  if (k === 'success') return colours.status.success;
  if (k === 'chart') return colours.brand.primary; // Keep availability as brand primary for now
  return colours.text.secondary; // Demand colour using theme secondary
}

function backgroundColorFor(k: MetricCard['kind']) {
  // Return transparent for stroke circle design
  return 'transparent';
}

const s = StyleSheet.create({
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 10, 
    color: colours.text.primary 
  },
  container: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    ...Platform.select({
      web: {
        '@media (min-width: 1401px)': {
          width: 'calc(100vw - 32px)',
          maxWidth: 'calc(80vw - 32px)',
          marginLeft: 'calc(-12px + (100vw - 100%) / 2)',
        },
      },
    }),
  } as any,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 200px))',
    gap: 10,
    justifyContent: 'center',
  } as unknown as any,
});

const stylesCard = StyleSheet.create({
  card: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colours.border.default,
    alignItems: 'center', // Centre content horizontally
    justifyContent: 'center', // Centre content vertically
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // Enhanced drop shadow for more distinct elevation
  } as unknown as any,
  iconContainer: {
    marginBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: colours.text.secondary,
    marginBottom: 6,
    textAlign: 'center', // Centre title text
  },
  value: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 4,
    textAlign: 'center', // Centre value text
  },
  subtitle: { 
    fontSize: 12, 
    color: colours.text.muted,
    fontWeight: '400',
    textAlign: 'center', // Centre subtitle text
  },
});
