import * as React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import Header from '../components/Header';
import { ArrowUpRight } from 'lucide-react-native';
import { colours } from '../theme/colours';

export default function FairnessScreen() {
  const handleLearnMore = () => {
    // Placeholder action – will link to concept later
  };

  return (
    <SafeAreaView style={s.safe}>
      <Header
        showNotification={false}
        title={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={s.future}>Future Implementation:</Text>
            <Text style={s.headerTitle}>Fairness Dashboard</Text>
          </View>
        }
      />
    
      <View style={s.body}>
        <View style={s.card}>
          <Text style={s.title}>Understanding Fairness</Text>
          <Text style={s.bodyText}>
            Fair shift distribution is key to team morale, retention, and compliance. 
            Our dashboard makes it easy to spot and fix imbalances, creating a healthier 
            workplace for everyone.
          </Text>

          <Pressable style={s.linkRow} onPress={handleLearnMore}>
            <ArrowUpRight width={16} height={16} color={colours.brand.primary} />
            <Text style={s.link}>Learn More</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colours.bg.canvas,
  },
  future: {
    color: colours.brand.primary,
    fontWeight: '700',
    fontSize: 24,
  },
  headerTitle: {
    color: colours.text.secondary,
    fontWeight: '700',
    fontSize: 20,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colours.brand.accent,
  },
  card: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.brand.primary,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    color: colours.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    color: colours.brand.primary,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
});

