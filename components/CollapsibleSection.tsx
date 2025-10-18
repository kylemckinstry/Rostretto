import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function CollapsibleSection({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={s.wrap}>
      <Pressable style={s.header} onPress={onToggle} hitSlop={8}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open ? <View style={s.body}>{children}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EBE8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#171A1F', flex: 1 },
  chev: { fontSize: 18, color: '#5B636A' },
  body: { marginTop: 12 },
});
