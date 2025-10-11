import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SegmentTabs from '../components/SegmentTabs';
import DateSwitch from '../components/DateSwitch';
import IndicatorPills from '../components/IndicatorPills';
import PlaceholderCalendar from '../components/PlaceholderCalendar';
import AutoShiftBar from '../components/AutoShiftBar';
import EmployeeListModal from '../components/EmployeeListModal';

export default function SchedulerScreen() {
  const [mode, setMode] = React.useState<'schedule' | 'team' | 'fairness'>('schedule');
  const [granularity, setGranularity] = React.useState<'weekly' | 'daily'>('daily');
  const [showModal, setShowModal] = React.useState(false);
  const insets = useSafeAreaInsets();

  return (
  <SafeAreaView style={[s.safe, { paddingTop: insets.top }]}> 
      <View style={s.headerSection}>
        <Header title="Roster"/>
      </View>

      <View style={s.section}>
        <SegmentTabs
          tabs={[
            { key: 'schedule', label: 'Schedule' },
            { key: 'team', label: 'Team' },
            { key: 'fairness', label: 'Fairness' },
          ]}
          value={mode}
          onChange={(k) => setMode(k as any)}
        />
      </View>

      <View style={s.section}>
        <DateSwitch
          dateLabel="Oct 6"
          granularity={granularity}
          onGranularityChange={setGranularity}
          onPrev={() => {}}
          onNext={() => {}}
        />
      </View>

      <View style={s.section}>
        <IndicatorPills
          items={[
            { label: 'Coffee', value: '0', tone: 'good' },
            { label: 'Skill', value: '3', tone: 'warn' },
            { label: 'Traffic', value: 'High', tone: 'alert' },
          ]}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <PlaceholderCalendar onOpenEmployees={() => setShowModal(true)} />
      </ScrollView>

      <AutoShiftBar onPress={() => setShowModal(true)} />
      <EmployeeListModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  section: { paddingTop: 10, paddingBottom: 10 },
  headerSection: { paddingBottom: 8 },
});
