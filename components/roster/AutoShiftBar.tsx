import * as React from 'react';
import { View, Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';

type Props = {
  onPress: () => void;
  floating?: boolean;  // if true, position absolutely
  bottom?: number; // dynamic bottom offset
};

export default function AutoShiftBar({ onPress, floating, bottom }: Props) {
  const wrapStyle: StyleProp<ViewStyle> = floating
    ? [styles.wrap, styles.floating, bottom != null ? { bottom } : null]
    : styles.wrap;

  const handlePress = () => {
    console.log('[AutoShiftBar] Button pressed!');
    onPress();
  };

  return (
    <View style={wrapStyle} pointerEvents="box-none">
      <Pressable 
        onPress={handlePress} 
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed
        ]}
      >
        <Text style={styles.text}>Auto Shift</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 0 },
  floating: {
    position: 'absolute',
    left: 16,
    right: 16,
    // 'bottom' set dynamically via prop
    zIndex: 10,
  },
  btn: {
    backgroundColor: '#1A4331',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressed: {
    backgroundColor: '#2a5a47',
    opacity: 0.8,
  },
  text: { color: '#fff', fontWeight: '700' },
});

