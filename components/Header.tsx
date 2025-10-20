import * as React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, ImageSourcePropType } from 'react-native';
import { colours } from '../theme/colours';

export default function Header({ 
  title, 
  logo, 
  logoComponent 
}: { 
  title?: React.ReactNode; 
  logo?: ImageSourcePropType;
  logoComponent?: React.ComponentType<any>;
}) {
  const { width } = useWindowDimensions();
  const logoWidth = Math.round(width * 0.4);
  const logoHeight = Math.round(logoWidth * 0.28);

  return (
    <View style={styles.wrap}>
      {logoComponent ? (
        React.createElement(logoComponent, { width: logoWidth, height: logoHeight })
      ) : logo ? (
        <Image source={logo} style={{ width: logoWidth, height: logoHeight, resizeMode: 'contain' }} />
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
    borderColor: colours.border.default,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
});
