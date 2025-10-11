import * as React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function EmployeeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Employee" />
      <Text style={styles.text}>Employee placeholder</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#475569' },
});
