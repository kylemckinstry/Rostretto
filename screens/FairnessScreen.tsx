import * as React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function FairnessScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Fairness" />
      <Text style={styles.text}>Fairness placeholder</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#475569' },
});
