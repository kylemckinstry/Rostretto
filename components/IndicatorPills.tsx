import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colours } from '../theme/colours';

type Tone = 'good' | 'warn' | 'alert' | 'neutral';
type IconComp = React.ComponentType<{ width?: number; height?: number; color?: string }>;

export type Item = {
  label: string;
  tone: Tone;
  variant?: 'value' | 'icon' | 'text';
  icon?: IconComp;
  value?: string;
  // Optional icon colour to override the tone colour for specific icons
  iconColor?: string;
};

const TONE: Record<Tone, { fg: string; border?: string }> = {
  good: { fg: colours.status.success },
  warn: { fg: colours.status.warning },
  alert: { fg: colours.status.danger },
  neutral: { fg: colours.text.secondary, border: '#D1D5DB' }, // Lighter grey border to match chevrons
};

export default function IndicatorPills({ items }: { items: Item[] }) {
  return (
    <View style={s.row}>
      {items.map((it, idx) => {
        const c = TONE[it.tone].fg;
        const borderColor = TONE[it.tone].border ?? c; // Use custom border or default to fg color
        const variant = it.variant ?? 'text';

        return (
          <View
            key={`${it.label}-${idx}`}
            style={[s.pill, { borderColor }]}
          >
            {/* Number in a circle */}
            {variant === 'value' && (
              <>
                <View style={[s.valueCircle, { backgroundColor: c }]}>
                  <Text style={s.valueCircleText}>
                    {it.value}
                  </Text>
                </View>
                <Text style={[s.label, { color: c, marginTop: 6 }]}>{it.label}</Text>
              </>
            )}

            {/* SVG icon variant */}
            {variant === 'icon' && !!it.icon && (
              <>
                <it.icon width={22} height={22} color={it.iconColor ?? c} />
                <Text style={[s.label, { color: c, marginTop: 6 }]}>{it.label}</Text>
              </>
            )}

            {/* Fallback (text only) */}
            {variant === 'text' && (
              <Text style={[s.label, { color: c }]}>{it.label}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.canvas,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  valueCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueCircleText: {
    color: colours.bg.canvas,
    fontWeight: 'bold',
    fontSize: 14,
  },
});