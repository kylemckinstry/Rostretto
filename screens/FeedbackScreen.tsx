import { Platform } from 'react-native';

// Platform-specific screen resolution
const FeedbackScreen = Platform.select({
  web: () => require('./FeedbackScreen.web').default,
  default: () => require('./FeedbackScreen.web').default, // For now, use web version for all platforms
})();

export default FeedbackScreen;
