import * as React from 'react';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function SchedulerScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Staff Scheduler" />
      <View style={styles.container}>
        <Text>Scheduler screen placeholder</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
