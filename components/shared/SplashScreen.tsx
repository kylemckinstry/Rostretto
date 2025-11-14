import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { colours } from '../../theme/colours';
import RostrettoLogo from '../../assets/Rostretto-logo-white.svg';

const { width, height } = Dimensions.get('window');

// Web needs smaller circles so they don't cover the entire background
const circleScale = Platform.OS === 'web' ? 1.4 : 2;

export default function SplashScreen() {
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade in and scale animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous wave animations with different speeds
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const wave1TranslateY = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const wave2TranslateY = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  return (
    <View style={styles.container}>
      {/* Animated wave layers */}
      <Animated.View
        style={[
          styles.wave,
          styles.wave1,
          {
            transform: [{ translateY: wave1TranslateY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.wave2,
          {
            transform: [{ translateY: wave2TranslateY }],
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <RostrettoLogo width={280} height={280} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.brand.primary, // Rostretto green
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: width * circleScale,
    height: width * circleScale, // Make it square for circular shape
    borderRadius: width * circleScale, // Full border radius for circle
    opacity: 0.1,
  },
  wave1: {
    backgroundColor: '#FFFFFF',
    bottom: -width * 0.8 * circleScale, // Position to show top curve
    left: -width * 0.5 * circleScale,
  },
  wave2: {
    backgroundColor: '#FFFFFF',
    bottom: -width * 0.85 * circleScale, // Slightly different position
    left: -width * 0.3 * circleScale,
    opacity: 0.15,
  },
  logoContainer: {
    zIndex: 10,
  },
});
