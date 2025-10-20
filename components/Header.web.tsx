import * as React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colours } from '../theme/colours';
import RostrettoLogo from '../assets/Rostretto-logo.svg';
import CalendarIcon from '../assets/calendar.svg';
import TeamIcon from '../assets/team.svg';
import FairnessIcon from '../assets/fairness.svg';

export default function Header() {
  const nav = useNavigation();
  const route = useRoute();
  const activeRoute = route.name;
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints
  const isCompact = width < 900;
  const isSmall = width < 640;

  const tabs = [
    { key: 'Roster', label: 'Roster', icon: CalendarIcon },
    { key: 'Team', label: 'Team Capability', icon: TeamIcon },
    { key: 'Fairness', label: 'Fairness Dashboard', icon: FairnessIcon },
  ];

  const handlePress = (key: string) => {
    // If tab already active, ignore
    if (key === activeRoute) return;
    nav.navigate(key as never);
  };

  return (
    <View style={[s.wrap, isCompact && s.wrapCompact]}>
      {isCompact ? (
        // Compact layout: vertical stack
        <View style={s.compactLayout}>
          {/* Logo row */}
          <View style={s.logoRow}>
            <RostrettoLogo width={width * 0.3} height={(width * 0.3) * 0.2} />
          </View>
          
          {/* Tabs row */}
          <View style={s.tabsRow}>
            {tabs.map((t) => {
              const active = activeRoute === t.key;
              const iconColor = active ? colours.brand.primary : colours.text.muted;
              const IconComponent = t.icon;
              
              return (
                <Pressable
                  key={t.key}
                  onPress={() => handlePress(t.key)}
                  role="button"
                  style={[
                    s.tab,
                    s.tabCompact,
                    active && s.tabActive,
                  ]}
                >
                  <View style={s.tabContent}>
                    <IconComponent 
                      width={isSmall ? 20 : 16} 
                      height={isSmall ? 20 : 16} 
                      fill={iconColor} 
                      stroke={iconColor} 
                      strokeWidth={active ? 0.5 : 0} 
                    />
                    {!isSmall && (
                      <Text style={[s.tabText, s.tabTextCompact, active && s.tabTextActive]}>
                        {t.label}
                      </Text>
                    )}
                  </View>
                  <View style={[s.underline, active && s.underlineActive]} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        // Desktop layout: horizontal
        <>
          {/* Left: logo */}
          <View style={s.left}>
            <RostrettoLogo width={160} height={32} />
          </View>

          {/* Center: tabs */}
          <View style={s.center}>
            {tabs.map((t) => {
              const active = activeRoute === t.key;
              const iconColor = active ? colours.brand.primary : colours.text.muted;
              const IconComponent = t.icon;
              
              return (
                <Pressable
                  key={t.key}
                  onPress={() => handlePress(t.key)}
                  role="button"
                  style={[
                    s.tab,
                    active && s.tabActive,
                  ]}
                >
                  <View style={s.tabContent}>
                    <IconComponent 
                      width={20} 
                      height={20} 
                      fill={iconColor} 
                      stroke={iconColor} 
                      strokeWidth={active ? 0.5 : 0} 
                    />
                    <Text style={[s.tabText, active && s.tabTextActive]}>
                      {t.label}
                    </Text>
                  </View>
                  <View style={[s.underline, active && s.underlineActive]} />
                </Pressable>
              );
            })}
          </View>

          {/* Right spacer (future: profile, etc.) */}
          <View style={s.right} />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: colours.border.default,
    backgroundColor: colours.bg.canvas,
  },
  wrapCompact: {
    flexDirection: 'column',
    height: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compactLayout: {
    width: '100%',
    alignItems: 'center',
  },
  logoRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  left: { width: 240, justifyContent: 'center' },
  center: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  right: { width: 240 },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
          backgroundColor: '#E9F0EC',
        },
      },
    }),
  },
  tabCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 44, // Ensure touch target size
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabActive: { backgroundColor: '#E4ECE8' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#2B2B2B' },
  tabTextCompact: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#1C3B33' },
  underline: { height: 2, width: 0, backgroundColor: 'transparent', marginTop: 4 },
  underlineActive: { width: '100%', backgroundColor: '#1C3B33' },
});
