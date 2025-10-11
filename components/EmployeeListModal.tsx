import * as React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, FlatList } from 'react-native';

type Employee = { id: string; name: string; score: number };

const MOCK: Employee[] = [
  { id: '1', name: 'Kyle McKinstry', score: 88 },
  { id: '2', name: 'Mat Blackwood', score: 68 },
  { id: '3', name: 'Emil Avanesov', score: 72 },
  { id: '4', name: 'Jason Yay', score: 91 },
];

function scoreColor(score?: number) {
  if (score == null) return { bg: '#D1D5DB', text: '#000' };
  if (score > 75) return { bg: '#00B392', text: '#fff' };
  if (score >= 56) return { bg: '#F59E0B', text: '#fff' };
  return { bg: '#EF4444', text: '#fff' };
}

export default function EmployeeListModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.header}>
        <View style={{ width: 24 }} />
        <Text style={s.title}>Available Employees</Text>
        <Pressable onPress={onClose}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
      </View>

      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.left}>
              <View style={s.avatar} />
              <Text style={s.name}>{item.name}</Text>
            </View>
            <View style={s.right}>
              {(() => {
                const sc = scoreColor(item.score);
                return (
                  <View style={[s.score, { backgroundColor: sc.bg }]}>
                    <Text style={[s.scoreText, { color: sc.text }]}>{item.score}</Text>
                  </View>
                );
              })()}
              <Pressable style={s.add}><Text style={{ color: '#059669', fontSize: 18 }}>＋</Text></Pressable>
            </View>
          </View>
        )}
      />
    </Modal>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700' },
  card: { padding: 12, borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0' },
  name: { fontWeight: '600', color: '#0F172A' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  score: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  scoreText: { fontWeight: '700' },
  add: { backgroundColor: '#ECFDF5', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
});
