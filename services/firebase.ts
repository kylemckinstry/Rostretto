import * as app from 'firebase/app';
import * as firestore from 'firebase/firestore';
import * as auth from 'firebase/auth';

// --- Type and Configuration Retrieval ---

declare const __firebase_config: string;
declare const __initial_auth_token: string;

let _db: firestore.Firestore | null = null;
let _auth: auth.Auth | null = null;
const APP_ID = 'rostretto-app'; // Your Firebase Project ID

/**
 * Retrieves the Firebase configuration, prioritizing the secure global environment 
 * variable over the local fallback file for security during deployment.
 */
const getFirebaseConfig = () => {
    try {
        // Attempt to use the secure, injected global configuration string
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
            // console.log("Using secure environment config.");
            return JSON.parse(__firebase_config);
        }
    } catch (e) {
        console.warn("Could not parse __firebase_config. Falling back to local file.");
    }
    
    // Fallback: Use the local firebase.json file during development
    try {
        // NOTE: Path assumes firebase.ts is in src/services and firebase.json is in project root.
        const localConfig = require('../../firebase.json');
        return localConfig;
    } catch (e) {
        console.error("Local firebase.json not found or failed to load. Ensure it exists in the project root.");
        throw new Error("Could not initialize Firebase services.");
    }
};


// --- Initialization Function ---

/**
 * Initializes Firebase services (App, Auth, Firestore) and authenticates the user.
 */
export const initializeFirebase = async () => {
    if (_db) return; // Already initialized

    const firebaseConfig = getFirebaseConfig();
    
    // Initialize Firebase App
    const firebaseApp = app.initializeApp(firebaseConfig);

    // Initialize Firestore
    _db = firestore.getFirestore(firebaseApp);
    
    // Optional: Enable debug logs in development
    // firestore.setLogLevel('debug'); 

    // Initialize Auth and sign in
    _auth = auth.getAuth(firebaseApp);
    
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        // Secure path: Sign in using the token provided by the Canvas environment
        await auth.signInWithCustomToken(_auth, __initial_auth_token);
    } else {
        // Fallback: Sign in anonymously for local testing/development
        await auth.signInAnonymously(_auth);
    }
};


// --- Exported Services and Helpers ---

/**
 * Returns the Firestore database instance. Must be called after initializeFirebase().
 */
export const db = () => {
    if (!_db) {
        throw new Error("Firestore not initialized. Call initializeFirebase() first.");
    }
    return _db;
};

/**
 * Returns the Firebase Auth instance.
 */
export const authService = () => {
    if (!_auth) {
        throw new Error("Auth service not initialized. Call initializeFirebase() first.");
    }
    return _auth;
};

/**
 * Returns the current authenticated user's ID.
 */
export const currentUserId = () => {
    return _auth?.currentUser?.uid || 'anonymous';
};


/**
 * Constructs the public Firestore path for the rosters collection.
 * Path: /artifacts/{appId}/public/data/rosters/{documentId}
 */
export const getRosterCollectionPath = () => {
    return firestore.collection(db(), 'artifacts', APP_ID, 'public', 'data', 'rosters');
};