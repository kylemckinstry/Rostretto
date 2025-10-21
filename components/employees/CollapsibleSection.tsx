import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colours } from '../../theme/colours';

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
        <View style={s.chevronBox}>
          <Text style={s.chevron}>{open ? '▲' : '▼'}</Text>
        </View>
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
  chevronBox: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colours.border.default,
    textAlign: 'center',
    lineHeight: 18,
    color: colours.text.secondary,
    backgroundColor: colours.bg.canvas,
  },
  body: { marginTop: 12 },
});
