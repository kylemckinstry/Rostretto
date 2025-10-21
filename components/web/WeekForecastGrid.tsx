import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, Pressable } from 'react-native';
import { colours } from '../../theme/colours';

// Icons for displaying demand and traffic levels
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

interface WeekForecastGridProps {
  days: WeekForecastDay[];
  onDayPress?: (date: Date) => void;
}

export default function WeekForecastGrid({ days, onDayPress }: WeekForecastGridProps) {
  const [screenWidth, setScreenWidth] = React.useState(() => Dimensions.get('window').width);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const prevWeekRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Animate week transitions with slide and fade effect
  React.useEffect(() => {
    if (days.length > 0) {
      const currentWeekKey = days[0]?.date.toISOString().slice(0, 10);
      if (prevWeekRef.current && prevWeekRef.current !== currentWeekKey) {
        // Subtle slide with dimming provides clear visual feedback for week changes
        slideAnim.setValue(-8);
        opacityAnim.setValue(0.3);
        
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 290,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 290,
            useNativeDriver: true,
          }),
        ]).start();
      }
      prevWeekRef.current = currentWeekKey;
    }
  }, [days, slideAnim, opacityAnim]);

  // Determine layout: horizontal scroll for narrow screens, grid for wider displays
  const minCardWidth = 140;
  const gap = 12;
  const horizontalPadding = 32;
  const totalMinWidth = (minCardWidth * 7) + (gap * 6) + horizontalPadding;
  const useHorizontalScroll = screenWidth < totalMinWidth;

  // Icons corresponding to demand types
  const demandIcons: Record<WeekForecastDay['demand'], React.FC<any>> = {
    Coffee: CoffeeIcon,
    Sandwiches: SandwichIcon,
    Mixed: MixedIcon,
  };

  // Render individual day cards with optional press interaction
  const renderDayCard = (day: WeekForecastDay, index: number, style: any) => {
    const DemandIcon = demandIcons[day.demand];
    const mismatchColor = getMismatchColor(day.mismatches);
    const trafficIconColor = trafficColor(day.traffic);

    const cardContent = (
      <>
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
            <DemandIcon width={18} height={18} color={colours.text.secondary} />
          </View>
          <Text style={s.label}>Demand: {day.demand}</Text>
        </View>

        <View style={s.row}>
          <View style={s.iconContainer}>
            <TrafficIcon width={18} height={18} color={trafficIconColor} />
          </View>
          <Text style={[s.label, { color: trafficIconColor, fontWeight: '600' }]}>
            {day.traffic} Traffic
          </Text>
        </View>
      </>
    );

    if (onDayPress) {
      return (
        <Pressable 
          key={index} 
          style={({ pressed }) => [
            style,
            pressed && s.cardPressed
          ]}
          onPress={() => onDayPress(day.date)}
        >
          {cardContent}
        </Pressable>
      );
    }

    return (
      <View key={index} style={style}>
        {cardContent}
      </View>
    );
  };

  if (useHorizontalScroll) {
    // Horizontal scrolling layout for compact displays
    return (
      <Animated.View style={{ 
        transform: [{ translateX: slideAnim }],
        opacity: opacityAnim 
      }}>
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
      </Animated.View>
    );
  }

  // Responsive grid layout for wider screens
  return (
    <Animated.View style={[s.wrapFull, { 
      transform: [{ translateX: slideAnim }],
      opacity: opacityAnim 
    }]}>
      {days.map((day, index) => renderDayCard(day, index, s.cardFlex))}
    </Animated.View>
  );
}

// Colour coding for mismatch severity and traffic levels
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
  // Flexible grid container for wide displays
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
  
  // Horizontal scroll containers for compact layouts
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
  
  // Typography and layout styles for day cards
  dayTitle: { fontSize: 14, fontWeight: '700', color: colours.text.primary },
  daySub: { fontSize: 14, opacity: 0.7, marginTop: 2, color: '#2b2b2b' },
  hr: { height: 1, backgroundColor: colours.border.default, marginVertical: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  label: { fontSize: 14, color: colours.text.secondary },
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
    width: 20, // Icon size
    height: 20, // Icon size
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  } as any,

});
