import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

// In standalone builds, EXPO_PUBLIC_ environment variables from eas.json are in extra
// For development, they're in the app.json extra field
const app = initializeApp({
  apiKey: extra.EXPO_PUBLIC_FIREBASE_API_KEY || extra.apiKey || 'AIzaSyAWrrG5k4T6xcrRok7pSSCpttLTMcWZBIg',
  authDomain: extra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.authDomain || 'rostretto-fb.firebaseapp.com',
  projectId: extra.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.projectId || 'rostretto-fb',
  storageBucket: extra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extra.storageBucket || 'rostretto-fb.firebasestorage.app',
  messagingSenderId: extra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extra.messagingSenderId || '127031505005',
  appId: extra.EXPO_PUBLIC_FIREBASE_APP_ID || extra.appId || '1:127031505005:web:035ce3b46e3459062dcf64',
});

export const db = getFirestore(app);