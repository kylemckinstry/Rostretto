// components/DateNavigator.tsx
import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colours } from '../../theme/colours';

function DateNavigator({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.wrap}>
      <Pressable onPress={onPrev} style={s.chevronBox}>
        <Text style={s.chev}>{'<'}</Text>
      </Pressable>

      <Text style={s.title}>{label}</Text>

      <Pressable onPress={onNext} style={s.chevronBox}>
        <Text style={s.chev}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

export default React.memo(DateNavigator);

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // parent owns tint
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  chevronBox: { padding: 8, alignItems: 'center', justifyContent: 'center' },
  chev: {
    fontSize: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 26,
    color: '#0F172A',
    backgroundColor: '#F4F4F1',
  },
});
