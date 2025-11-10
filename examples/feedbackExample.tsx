/**
 * Example usage of FeedbackModal
 * 
 * This file demonstrates how to integrate the feedback modal into your screens.
 * The modal can be triggered after shifts, on a schedule, or manually.
 */

import * as React from 'react';
import { View, Button } from 'react-native';
import FeedbackModal from '../components/modals/feedbackModal';
import { storeFeedback } from '../data/feedback.repo';

export function ExampleFeedbackUsage() {
  const [feedbackVisible, setFeedbackVisible] = React.useState(false);

  // Example: Show feedback modal for an employee
  const requestFeedback = () => {
    setFeedbackVisible(true);
  };

  const handleFeedbackSubmit = (rating: 1 | 2 | 3 | 4 | 5) => {
    // Store the feedback
    storeFeedback(
      'mgr001', // managerId
      'Current Manager', // managerName (should be from logged-in user)
      'emp123', // employeeId
      'Max Hayes', // employeeName
      'Coffee', // skill
      rating
    );
    
    // Close the modal
    setFeedbackVisible(false);
    
    // Optional: Show success message or trigger next action
    console.log('Feedback submitted successfully!');
  };

  return (
    <View>
      <Button title="Provide Feedback" onPress={requestFeedback} />
      
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        onSubmit={handleFeedbackSubmit}
        employeeName="Max Hayes"
        employeeImageUrl="https://example.com/avatar.jpg" // optional
        skill="Coffee"
      />
    </View>
  );
}

/**
 * Example: Request feedback for multiple employees after a shift
 */
export function useFeedbackQueue() {
  const [queue, setQueue] = React.useState<Array<{
    employeeId: string;
    employeeName: string;
    skill: string;
    imageUrl?: string;
  }>>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const addToQueue = (
    employeeId: string,
    employeeName: string,
    skill: string,
    imageUrl?: string
  ) => {
    setQueue(prev => [...prev, { employeeId, employeeName, skill, imageUrl }]);
  };

  const handleSubmit = (rating: 1 | 2 | 3 | 4 | 5) => {
    const current = queue[currentIndex];
    if (current) {
      storeFeedback(
        'mgr001', // managerId (should be from logged-in user)
        'Current Manager', // managerName (should be from logged-in user)
        current.employeeId,
        current.employeeName,
        current.skill,
        rating
      );
      
      // Move to next employee or close
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // All feedback collected
        setQueue([]);
        setCurrentIndex(0);
      }
    }
  };

  const currentEmployee = queue[currentIndex];
  const isVisible = queue.length > 0 && currentIndex < queue.length;

  return {
    addToQueue,
    handleSubmit,
    currentEmployee,
    isVisible,
    onClose: () => {
      setQueue([]);
      setCurrentIndex(0);
    },
  };
}
