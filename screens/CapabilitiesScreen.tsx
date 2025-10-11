import * as React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function CapabilitiesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Team Capabilities" />
      <Text style={styles.text}>Capabilities placeholder</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#475569' },
});
