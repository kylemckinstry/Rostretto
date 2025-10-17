import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Tone = 'good' | 'warn' | 'alert';
type IconComp = React.ComponentType<{ width?: number; height?: number; color?: string }>;

export type Item = {
  label: string;
  tone: Tone;
  variant?: 'value' | 'icon' | 'text';
  icon?: IconComp;
  value?: string;
  // Optional iconColor to override the tone color for specific icons.
  iconColor?: string;
};

const TONE: Record<Tone, { fg: string }> = {
  good: { fg: '#5CB85C' },
  warn: { fg: '#F5A623' },
  alert: { fg: '#E57373' },
};

export default function IndicatorPills({ items }: { items: Item[] }) {
  return (
    <View style={s.row}>
      {items.map((it, idx) => {
        const c = TONE[it.tone].fg;
        const variant = it.variant ?? 'text';

        return (
          <View
            key={`${it.label}-${idx}`}
            style={[s.pill, { borderColor: c }]}
          >
            {/* Number in a circle (or checkmark) */}
            {variant === 'value' && (
              <>
                <View style={[s.valueCircle, { backgroundColor: c }]}>
                  <Text style={s.valueCircleText}>
                    {it.value === '0' ? '✓' : it.value}
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

            {/* fallback (text only) */}
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
    backgroundColor: '#fff',
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});