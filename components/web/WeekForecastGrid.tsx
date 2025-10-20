import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colours } from '../../theme/colours';

// SVG icons for demand and traffic visualisation
import TrafficIcon from '../../assets/traffic.svg';
import CoffeeIcon from '../../assets/coffee.svg';
import SandwichIcon from '../../assets/sandwich.svg';
import MixedIcon from '../../assets/mixed.svg';

export type WeekForecastDay = {
  date: Date;
  mismatches: number;
  demand: 'Coffee' | 'Sandwiches' | 'Mixed';
  traffic: 'Low' | 'Medium' | 'High';
};

export default function WeekForecastGrid({ days }: { days: WeekForecastDay[] }) {
  const [screenWidth, setScreenWidth] = React.useState(() => Dimensions.get('window').width);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Calculate optimal layout mode based on available screen width
  const minCardWidth = 140;
  const gap = 12;
  const horizontalPadding = 32;
  const totalMinWidth = (minCardWidth * 7) + (gap * 6) + horizontalPadding;
  const useHorizontalScroll = screenWidth < totalMinWidth;

  // Icon mapping for demand type visualisation
  const demandIcons: Record<WeekForecastDay['demand'], React.FC<any>> = {
    Coffee: CoffeeIcon,
    Sandwiches: SandwichIcon,
    Mixed: MixedIcon,
  };

  // Render day card content (shared between scroll and grid layouts)
  const renderDayCard = (day: WeekForecastDay, index: number, style: any) => {
    const DemandIcon = demandIcons[day.demand];
    const mismatchColor = getMismatchColor(day.mismatches);
    const trafficIconColor = trafficColor(day.traffic);

    return (
      <View key={index} style={style}>
        <Text style={s.dayTitle}>
          {day.date.toLocaleDateString(undefined, { weekday: 'long' })}
        </Text>
        <Text style={s.daySub}>
          {day.date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>

        <View style={s.hr} />

        <View style={s.row}>
          <View style={[s.statusCircle, { backgroundColor: mismatchColor }]}>
            <Text style={s.statusText}>
              {day.mismatches === 0 ? '✓' : day.mismatches}
            </Text>
          </View>
          <Text style={s.label}>
            {day.mismatches} Skill mismatch{day.mismatches !== 1 ? 'es' : ''}
          </Text>
        </View>

        <View style={s.row}>
          <View style={s.iconContainer}>
            <DemandIcon width={16} height={16} color={colours.text.secondary} />
          </View>
          <Text style={s.label}>Demand: {day.demand}</Text>
        </View>

        <View style={s.row}>
          <View style={s.iconContainer}>
            <TrafficIcon width={16} height={16} color={trafficIconColor} />
          </View>
          <Text style={[s.label, { color: trafficIconColor, fontWeight: '600' }]}>
            {day.traffic} Traffic
          </Text>
        </View>
      </View>
    );
  };

  if (useHorizontalScroll) {
    // Horizontal scroll layout for constrained screen widths
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={s.scrollContent}
        style={s.scrollContainer}
      >
        <View style={s.wrapScroll}>
          {days.map((day, index) => renderDayCard(day, index, s.cardFixed))}
        </View>
      </ScrollView>
    );
  }

  // Flexible grid layout for wider screens
  return (
    <View style={s.wrapFull}>
      {days.map((day, index) => renderDayCard(day, index, s.cardFlex))}
    </View>
  );
}

// Colour logic matching mobile DayTile component behaviour
export function getMismatchColor(mismatches: number) {
  if (mismatches <= 1) return colours.status.success;
  if (mismatches === 2) return colours.status.warning;
  return colours.status.danger;
}

export function trafficColor(t: 'Low' | 'Medium' | 'High') {
  if (t === 'High') return colours.status.danger;
  if (t === 'Medium') return colours.status.warning;
  return colours.status.success;
}





const s = StyleSheet.create({
  // Desktop layout: cards expand to fill available width
  wrapFull: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  cardFlex: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    flex: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  } as unknown as any,
  
  // Mobile layout: horizontal scroll with fixed-width cards
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  wrapScroll: {
    flexDirection: 'row',
    gap: 12,
    minWidth: 7 * 150,
  },
  cardFixed: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colours.border.default,
    width: 140,
    minWidth: 140,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  } as unknown as any,
  
  // Common styles for both layouts
  dayTitle: { fontSize: 14, fontWeight: '700', color: colours.text.primary },
  daySub: { fontSize: 12, opacity: 0.7, marginTop: 2, color: colours.text.muted },
  hr: { height: 1, backgroundColor: colours.border.default, marginVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  label: { fontSize: 12, color: colours.text.secondary },
  statusCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: colours.bg.canvas,
    fontWeight: 'bold',
    fontSize: 10,
  },
  iconContainer: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
