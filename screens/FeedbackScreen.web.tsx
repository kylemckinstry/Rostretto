import * as React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { colours } from '../theme/colours';
import { useEmployeesUI } from '../viewmodels/employees';
import FeedbackModal from '../components/modals/feedbackModal';
import { storeFeedback, getAllFeedback } from '../data/feedback.repo';
import type { FeedbackRating, FeedbackEntry } from '../components/modals/feedbackModal';

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

export default function FeedbackScreenWeb() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
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
    // Max gets 3 requests, Mia gets 2 requests (5 total)
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

  // Responsive breakpoints
  const isCompact = width < 900;

  return (
    <View style={{ flex: 1, backgroundColor: colours.bg.muted }}>
      <Header />

      <ScrollView style={styles.page} contentContainerStyle={styles.pageContentWrapper}>
        <View style={styles.pageContent}>
          
          {/* Header with title and toggle */}
          <View style={styles.headerRow}>
            <Text style={[styles.pageTitle, isCompact && styles.pageTitleCompact]}>
              Team Feedback
            </Text>
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

          {/* Pending Feedback Section */}
          {view === 'requests' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Feedback Requests</Text>
              <View style={styles.feedbackList}>
                {feedbackRequests.map((request, index) => (
                  <FeedbackRequestCard
                    key={`${request.employeeId}-${request.skill}-${index}`}
                    request={request}
                    onPress={() => setSelectedFeedback(request)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Completed Feedback Section */}
          {view === 'previous' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Past Feedback ({completedFeedback.length})
              </Text>
              {completedFeedback.length > 0 ? (
                <View style={styles.feedbackList}>
                  {completedFeedback.map((entry, index) => (
                    <CompletedFeedbackCard
                      key={`${entry.employeeId}-${entry.skill}-${entry.timestamp}-${index}`}
                      entry={entry}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No feedback history yet</Text>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {selectedFeedback && (
        <FeedbackModal
          visible={!!selectedFeedback}
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

// Feedback Request Card Component
function FeedbackRequestCard({ 
  request, 
  onPress,
}: { 
  request: FeedbackRequest; 
  onPress: () => void;
}) {
  const employeeFirstName = request.employeeName.split(' ')[0];
  const today = new Date().toISOString().split('T')[0];
  const skillText = request.skill.toLowerCase() === 'coffee' || request.skill.toLowerCase() === 'sandwich'
    ? `${request.skill.toLowerCase()} making`
    : request.skill.toLowerCase();

  return (
    <Pressable 
      style={styles.feedbackCard} 
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${request.managerName} provide feedback for ${request.employeeName}'s ${request.skill}`}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardContentRow}>
          <Text style={styles.employeeName}>{request.managerName}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.skillLabel}>{request.skill}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.questionPreview}>
            How was {employeeFirstName}'s {skillText}?
          </Text>
        </View>
        <Text style={styles.dateText}>{today}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </Pressable>
  );
}

// Completed Feedback Card Component
function CompletedFeedbackCard({ 
  entry,
}: { 
  entry: FeedbackEntry;
}) {
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
    <View style={styles.completedCard}>
      <View style={styles.cardContent}>
        <View style={styles.cardContentRow}>
          <Text style={styles.employeeName}>{entry.managerName}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.skillLabel}>{entry.skill}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.questionPreview}>
            How was {employeeFirstName}'s {skillText}?
          </Text>
        </View>
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
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: colours.bg.muted 
  },
  pageContentWrapper: { 
    alignItems: 'center' as any,
    backgroundColor: colours.bg.muted,
    paddingBottom: 32,
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
      },
    }),
  } as any,
  pageContent: { 
    width: '100%',
    maxWidth: 1400,
    paddingHorizontal: 16, 
    paddingTop: 12, 
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: colours.brand.primary,
    marginBottom: 0,
  },
  pageTitleCompact: {
    fontSize: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colours.border.default,
    backgroundColor: 'transparent',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colours.bg.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  toggleButtonActive: {
    backgroundColor: colours.brand.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colours.text.muted,
  },
  toggleTextActive: {
    color: colours.bg.canvas,
  },
  section: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colours.text.primary, 
    marginBottom: 12 
  },
  emptyText: {
    fontSize: 14,
    color: colours.text.muted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackList: {
    gap: 12,
  },
  feedbackCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
          backgroundColor: colours.bg.subtle,
        },
      },
    }),
  },
  completedCard: {
    backgroundColor: colours.bg.subtle,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colours.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  cardContentCentered: {
    flex: 1,
    alignItems: 'center',
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colours.text.primary,
  },
  skillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colours.brand.primary,
  },
  questionPreview: {
    fontSize: 12,
    color: colours.text.muted,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 11,
    color: colours.text.muted,
  },
  separator: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 8,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 24,
    color: colours.text.muted,
    fontWeight: '300',
  },
  ratingBadge: {
    marginLeft: 12,
  },
  ratingCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.bg.canvas,
  },
  ratingChevron: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg.canvas,
  },
  ratingChevronText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
