import * as React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, ImageSourcePropType } from 'react-native';

export default function Header({ title, logo }: { title?: React.ReactNode; logo?: ImageSourcePropType }) {
  const { width } = useWindowDimensions();
  const logoWidth = Math.round(width * 0.4);

  return (
    <View style={styles.wrap}>
      {logo ? (
        <Image source={logo} style={{ width: logoWidth, height: Math.round(logoWidth * 0.28), resizeMode: 'contain' }} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
});
