import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { initializeAuth, Auth, signInAnonymously } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Module-level variables to hold service instances
let _db: Firestore | null = null;
let _auth: Auth | null = null;

// Configuration and Initialization

const APP_ID = Constants.expoConfig?.extra?.projectId as string;

// Initializes Firebase services if they haven't been already.

export const initializeFirebase = async () => {
  if (_db) return; // Already initialized

  const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.apiKey,
    authDomain: Constants.expoConfig?.extra?.authDomain,
    projectId: Constants.expoConfig?.extra?.projectId,
    storageBucket: Constants.expoConfig?.extra?.storageBucket,
    messagingSenderId: Constants.expoConfig?.extra?.messagingSenderId,
    appId: Constants.expoConfig?.extra?.appId,
  };

  if (!firebaseConfig.apiKey || !APP_ID) {
    throw new Error("Firebase config not found in app.json. Ensure it's under the 'extra' key.");
  }

  try {
    const firebaseApp = initializeApp(firebaseConfig);
    _db = getFirestore(firebaseApp);

    // Initialize Auth with react-native AsyncStorage persistence when available.
    // Use an indirect/dynamic require (via Function) so Metro's static resolver
    // doesn't try to bundle 'firebase/auth/react-native' in environments where
    // it's not available.
    let persistence: any | undefined;
    try {
      const rq: any = Function('return require')();
      const rn = rq('firebase/auth/react-native');
      persistence = rn.getReactNativePersistence(ReactNativeAsyncStorage);
    } catch (e) {
      // module not available or require blocked — fall back to undefined
      persistence = undefined;
    }

    _auth = persistence ? initializeAuth(firebaseApp, { persistence }) : initializeAuth(firebaseApp);

  } catch (error) {
    console.error("Firebase app initialization failed:", error);
    throw new Error("Could not initialize Firebase services.");
  }

  try {
    await signInAnonymously(_auth);
    console.log("Firebase initialized and user signed in anonymously.");
  } catch (error) {
    console.error("Firebase anonymous sign-in failed:", error);
    throw new Error("Could not authenticate with Firebase.");
  }
};

// Exported Service Accessors

export const db = (): Firestore => {
  if (!_db) throw new Error("Firestore not initialized. Call initializeFirebase() first.");
  return _db;
};

export const authService = (): Auth => {
  if (!_auth) throw new Error("Auth service not initialized. Call initializeFirebase() first.");
  return _auth;
};

export const currentUserId = (): string => {
  return authService().currentUser?.uid || 'anonymous';
};

export const getRosterCollectionPath = (): CollectionReference<DocumentData> => {
  return collection(db(), 'artifacts', APP_ID, 'public', 'data', 'rosters');
};