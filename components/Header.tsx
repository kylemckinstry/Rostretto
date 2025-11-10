import * as React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions, ImageSourcePropType, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colours } from '../theme/colours';
import NotificationIcon from '../assets/notification.svg';

export default function Header({ 
  title, 
  logo, 
  logoComponent,
  showNotification = true,
}: { 
  title?: React.ReactNode; 
  logo?: ImageSourcePropType;
  logoComponent?: React.ComponentType<any>;
  showNotification?: boolean;
}) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const logoWidth = Math.round(width * 0.4);
  const logoHeight = Math.round(logoWidth * 0.28);

  const handleFeedbackPress = () => {
    // Navigate to Team tab, then to Feedback screen within that tab's navigator
    (navigation as any).navigate('Root', {
      screen: 'Team',
      params: {
        screen: 'Feedback',
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.centerContent}>
        {logoComponent ? (
          React.createElement(logoComponent, { width: logoWidth, height: logoHeight })
        ) : logo ? (
          <Image source={logo} style={{ width: logoWidth, height: logoHeight, resizeMode: 'contain' }} />
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
      </View>
      {showNotification && (
        <Pressable 
          style={styles.notificationButton}
          onPress={handleFeedbackPress}
          accessibilityLabel="View pending feedback"
          accessibilityRole="button"
          hitSlop={8}
        >
          <NotificationIcon width={20} height={20} color={colours.brand.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colours.border.default,
    position: 'relative',
  },
  centerContent: {
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
  notificationButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    borderRadius: 8,
  },
});
