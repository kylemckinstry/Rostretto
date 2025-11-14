import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import Constants from 'expo-constants';
import { colours } from '../theme/colours';
import { api, API_BASE, USE_API } from '../api/client';

export default function DebugScreen() {
  const [testResults, setTestResults] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const expoConfig = Constants.expoConfig ?? ({} as any);
  const extra = expoConfig.extra ?? {};

  const testAPIConnection = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
    };

    try {
      // Test 1: Health endpoint

      const healthStart = Date.now();
      const health = await api.health();
      results.tests.push({
        name: 'Health Check',
        status: 'SUCCESS',
        duration: Date.now() - healthStart,
        data: health,
      });
    } catch (e: any) {
      results.tests.push({
        name: 'Health Check',
        status: 'FAILED',
        error: e?.message || String(e),
      });
    }

    try {
      // Test 2: Employees endpoint

      const empStart = Date.now();
      const employees = await api.employees();
      results.tests.push({
        name: 'Employees',
        status: 'SUCCESS',
        duration: Date.now() - empStart,
        count: employees.length,
      });
    } catch (e: any) {
      results.tests.push({
        name: 'Employees',
        status: 'FAILED',
        error: e?.message || String(e),
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const USE_API = extra?.EXPO_PUBLIC_USE_API === 'true' || extra?.EXPO_PUBLIC_USE_API === true;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Debug Information</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment Variables</Text>
        <DebugRow label="EXPO_PUBLIC_USE_API" value={String(extra.EXPO_PUBLIC_USE_API)} />
        <DebugRow label="USE_API (computed)" value={String(USE_API)} />
        <DebugRow label="EXPO_PUBLIC_API_BASE_URL" value={extra.EXPO_PUBLIC_API_BASE_URL ?? 'undefined'} />
        <DebugRow label="API_BASE (imported)" value={API_BASE} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Extra Values</Text>
        <Text style={styles.code}>{JSON.stringify(extra, null, 2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Constants Info</Text>
        <DebugRow label="App Name" value={Constants.expoConfig?.name || 'undefined'} />
        <DebugRow label="App Version" value={Constants.expoConfig?.version || 'undefined'} />
        <DebugRow label="SDK Version" value={Constants.expoConfig?.sdkVersion || 'undefined'} />
        <DebugRow label="Platform" value={Constants.platform?.android ? 'Android' : 'iOS'} />
      </View>

      <Pressable 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testAPIConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </Text>
      </Pressable>

      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <Text style={styles.code}>{JSON.stringify(testResults, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  const isGood = value !== 'undefined' && value !== 'false' && value !== '';
  
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={[styles.value, isGood ? styles.valueGood : styles.valueBad]}>
        {value || 'undefined'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.bg.canvas,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colours.brand.primary,
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.brand.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colours.border.default,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.text.secondary,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    flex: 2,
    textAlign: 'right',
  },
  valueGood: {
    color: '#059669',
  },
  valueBad: {
    color: '#DC2626',
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colours.text.secondary,
    backgroundColor: colours.bg.subtle,
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: colours.brand.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
