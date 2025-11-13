import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TrainingCard from './TrainingCard';
import { colours } from '../../theme/colours';
import { TRAINING_COURSES } from '../../constants/training';

type TeamSuggestedTrainingProps = {
  isStacked?: boolean;
};

export default function TeamSuggestedTraining({ isStacked }: TeamSuggestedTrainingProps) {
  return (
    <View style={[styles.teamAnalyticsCard, isStacked && styles.teamAnalyticsCardStacked]}>
      <Text style={styles.sectionTitle}>Team Suggested Training</Text>
      <View style={styles.trainingList}>
        {TRAINING_COURSES.map((training) => (
          <TrainingCard
            key={training.id}
            title={training.title}
            tag={training.tag}
            duration={training.duration}
            blurb={training.blurb}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  teamAnalyticsCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 24,
    flex: 1,
    minWidth: 480,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  } as any,
  teamAnalyticsCardStacked: {
    minWidth: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 12,
  },
  trainingList: {
    flexDirection: 'column',
    gap: 16,
  },
});
