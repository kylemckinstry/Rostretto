import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, Auth, signInAnonymously } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let _db: Firestore | null = null;
let _auth: Auth | null = null;

const APP_ID = Constants.expoConfig?.extra?.projectId as string;

export const initializeFirebase = async () => {
  if (_db) return;

  const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.apiKey,
    authDomain: Constants.expoConfig?.extra?.authDomain,
    projectId: Constants.expoConfig?.extra?.projectId,
    storageBucket: Constants.expoConfig?.extra?.storageBucket,
    messagingSenderId: Constants.expoConfig?.extra?.messagingSenderId,
    appId: Constants.expoConfig?.extra?.appId,
  };

  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config not found in app.json.");
  }

  try {
    const firebaseApp = initializeApp(firebaseConfig);
    _db = getFirestore(firebaseApp);

    _auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

    await signInAnonymously(_auth);
    console.log("Firebase initialised with persistent anonymous auth.");

  } catch (error) {
    console.error("Firebase initialisation or auth failed:", error);
    throw new Error("Could not connect to Firebase.");
  }
};

export const db = (): Firestore => {
  if (!_db) throw new Error("Firestore not initialized.");
  return _db;
};

export const authService = (): Auth => {
  if (!_auth) throw new Error("Auth service not initialized.");
  return _auth;
};

export const getRosterCollectionPath = (): CollectionReference<DocumentData> => {
  if (!APP_ID) {
    throw new Error("Project ID is missing from app.json, cannot create collection path.");
  }
  return collection(db(), 'artifacts', APP_ID, 'public', 'data', 'rosters');
};