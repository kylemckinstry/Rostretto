import * as React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

export default function AutoShiftBar({ onPress }: { onPress: () => void }) {
  return (
    <View style={s.wrap}>
      <Pressable onPress={onPress} style={s.btn}>
        <Text style={s.text}>Auto Shift</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16 },
  btn: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  text: { color: '#fff', fontWeight: '700' },
});
