import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colours } from '../theme/colours';
import { useEmployeesUI } from '../viewmodels/employees';
import FeedbackModal from '../components/modals/feedbackModal';
import { storeFeedback, getAllFeedback } from '../data/feedback.repo';
import type { FeedbackRating, FeedbackEntry } from '../components/modals/feedbackModal';
import { X } from 'lucide-react-native';

// Types for feedback requests
interface FeedbackRequest {
  managerName: string;
  managerId: string;
  employeeId: string;
  employeeName: string;
  employeeImageUrl?: string;
  employeeRole?: string;
  skill: string;
}

const SKILLS = ['Coffee', 'Sandwich', 'Customer Service', 'Speed'];

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const employees = useEmployeesUI();

  const [selectedFeedback, setSelectedFeedback] = React.useState<FeedbackRequest | null>(null);
  const [view, setView] = React.useState<'requests' | 'previous'>('requests');
  const [completedFeedback, setCompletedFeedback] = React.useState<FeedbackEntry[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Refresh completed feedback when it changes
  React.useEffect(() => {
    setCompletedFeedback(getAllFeedback());
  }, [refreshKey]);

  // Generate feedback requests for all employees and skills, excluding completed ones
  const feedbackRequests = React.useMemo(() => {
    const requests: FeedbackRequest[] = [];
    
    // Max and Mia are the managers (first 2 employees)
    const managers = employees.slice(0, 2);
    // Other employees they can rate
    const otherEmployees = employees.slice(2);
    
    if (managers.length < 2 || otherEmployees.length === 0) {
      return requests;
    }
    
    const limitedSkills = SKILLS.slice(0, 3);
    
    // Get all completed feedback to filter out
    const completed = getAllFeedback();
    const completedKeys = new Set(
      completed.map(entry => `${entry.managerId}-${entry.employeeId}-${entry.skill}`)
    );
    
    // Create feedback requests: managers rating other employees
    managers.forEach((manager, managerIndex) => {
      const requestCount = managerIndex === 0 ? 3 : 2;
      const employeesToRate = otherEmployees.slice(0, requestCount);
      
      employeesToRate.forEach((employee, empIndex) => {
        const skill = limitedSkills[empIndex % limitedSkills.length];
        const key = `${manager.id}-${employee.id}-${skill}`;
        
        // Only add if not already completed
        if (!completedKeys.has(key)) {
          requests.push({
            managerId: manager.id,
            managerName: manager.name,
            employeeId: employee.id,
            employeeName: employee.name,
            employeeImageUrl: employee.imageUrl,
            employeeRole: employee.role || employee.primary_role,
            skill,
          });
        }
      });
    });
    
    return requests;
  }, [employees, refreshKey]);

  const handleFeedbackSubmit = (rating: FeedbackRating) => {
    if (!selectedFeedback) return;
    
    storeFeedback(
      selectedFeedback.managerId,
      selectedFeedback.managerName,
      selectedFeedback.employeeId,
      selectedFeedback.employeeName,
      selectedFeedback.skill,
      rating
    );
    
    setSelectedFeedback(null);
    // Trigger refresh to update both lists
    setRefreshKey(prev => prev + 1);
  };

  return (
    <View style={[styles.container, { flex: 1, paddingTop: Math.max(8, insets.top - 32) }]}>
      {/* Page Header with close button */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Team Feedback</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.closeButton}>
          <X size={20} color={colours.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleContainer}>
            <Pressable
              onPress={() => setView('requests')}
              style={[
                styles.toggleButton,
                view === 'requests' && styles.toggleButtonActive
              ]}
            >
              <Text style={[
                styles.toggleText,
                view === 'requests' && styles.toggleTextActive
              ]}>
                Requests
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setView('previous')}
              style={[
                styles.toggleButton,
                view === 'previous' && styles.toggleButtonActive
              ]}
            >
              <Text style={[
                styles.toggleText,
                view === 'previous' && styles.toggleTextActive
              ]}>
                Previous
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content based on view */}
        {view === 'requests' ? (
          <View style={styles.section}>
              {feedbackRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No pending feedback requests</Text>
                </View>
              ) : (
                <View style={styles.feedbackList}>
                  {feedbackRequests.map((request, index) => {
                  const employeeFirstName = request.employeeName.split(' ')[0];
                  const today = new Date().toISOString().split('T')[0];
                  const skillText = request.skill.toLowerCase() === 'coffee' || request.skill.toLowerCase() === 'sandwich'
                    ? `${request.skill.toLowerCase()} making`
                    : request.skill.toLowerCase();
                  
                  return (
                    <Pressable
                      key={`${request.employeeId}-${request.skill}-${index}`}
                      style={styles.feedbackCard}
                      onPress={() => setSelectedFeedback(request)}
                      accessibilityRole="button"
                      accessibilityLabel={`${request.managerName} provide feedback for ${request.employeeName}'s ${request.skill}`}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.cardLine1}>
                          <Text style={styles.employeeName}>{request.managerName}</Text>
                          <Text style={styles.separator}>|</Text>
                          <Text style={styles.skillLabel}>{request.skill}</Text>
                        </View>
                        <Text style={styles.questionText}>
                          How was {employeeFirstName}'s {skillText}?
                        </Text>
                        <Text style={styles.dateText}>{today}</Text>
                      </View>
                      <View style={styles.arrowContainer}>
                        <Text style={styles.arrow}>›</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {completedFeedback.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No completed feedback yet</Text>
              </View>
            ) : (
              <View style={styles.feedbackList}>
                {completedFeedback.map((entry, index) => {
                  const employeeFirstName = entry.employeeName.split(' ')[0];
                  const skillText = entry.skill.toLowerCase() === 'coffee' || entry.skill.toLowerCase() === 'sandwich'
                    ? `${entry.skill.toLowerCase()} making`
                    : entry.skill.toLowerCase();
                  const getRatingColor = (rating: FeedbackRating): string => {
                    if (rating <= 2) return colours.status.danger;
                    if (rating === 3) return colours.status.warning;
                    return colours.status.success;
                  };
                  
                  return (
                    <View key={`${entry.employeeId}-${entry.skill}-${entry.timestamp}-${index}`} style={styles.completedCard}>
                      <View style={styles.cardContent}>
                        <View style={styles.cardLine1}>
                          <Text style={styles.employeeName}>{entry.managerName}</Text>
                          <Text style={styles.separator}>|</Text>
                          <Text style={styles.skillLabel}>{entry.skill}</Text>
                        </View>
                        <Text style={styles.questionText}>
                          How was {employeeFirstName}'s {skillText}?
                        </Text>
                        <Text style={styles.dateText}>{entry.date}</Text>
                      </View>
                      <View style={styles.ratingBadge}>
                        <View style={[
                          styles.ratingChevron,
                          { borderColor: getRatingColor(entry.rating) }
                        ]}>
                          <Text style={[styles.ratingChevronText, { color: getRatingColor(entry.rating) }]}>
                            {entry.rating}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
        </ScrollView>

      {selectedFeedback && (
        <FeedbackModal
          visible={true}
          onClose={() => setSelectedFeedback(null)}
          onSubmit={handleFeedbackSubmit}
          employeeName={selectedFeedback.employeeName}
          employeeImageUrl={selectedFeedback.employeeImageUrl}
          employeeRole={selectedFeedback.employeeRole}
          skill={selectedFeedback.skill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colours.brand.accent,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colours.brand.primary,
  },
  closeButton: {
    padding: 4,
  },
  toggleRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F4F4F1',
  },
  toggleButtonActive: {
    backgroundColor: colours.brand.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.muted,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colours.text.muted,
  },
  feedbackList: {
    gap: 12,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colours.bg.subtle,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardLine1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.text.primary,
  },
  separator: {
    fontSize: 14,
    color: colours.text.muted,
  },
  skillLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colours.brand.primary,
  },
  questionText: {
    fontSize: 14,
    color: colours.text.secondary,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: colours.text.muted,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
    color: colours.text.muted,
  },
  ratingBadge: {
    marginLeft: 12,
  },
  ratingChevron: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: colours.bg.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingChevronText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
