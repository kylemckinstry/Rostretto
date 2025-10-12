import { doc, setDoc } from 'firebase/firestore';
import { db, initializeFirebase, getRosterCollectionPath } from './firebase'; 

// Global variable check for the App ID, used for mandatory Firestore pathing.
declare const __app_id: string;

/**
 * Saves the current scheduling data to a public Firestore collection 
 * and sets the status to 'pending_ai_review' to signal the AI backend.
 * * @param currentRosterData The data structure representing the current roster state.
 * @param rosterId A unique ID for this specific roster generation run.
 * @returns True if successful, false otherwise.
 */
export const saveRosterForAI = async (currentRosterData: any, rosterId: string) => {
    try {
        // Ensure Firebase services are initialized before accessing DB
        await initializeFirebase();
        
        // Use the mandatory Canvas Global Variable for App ID, falling back to the project name
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'rostretto-app';

        // Get the collection path based on the mandatory public artifact structure
        const collectionPath = getRosterCollectionPath(appId);
        // Get the Firestore instance using the exported function
        const dbInstance = db(); 
        
        const docRef = doc(dbInstance, collectionPath, rosterId);

        // Save the data, including the status signal for the Python component
        await setDoc(docRef, {
            ...currentRosterData,
            status: 'pending_ai_review', // The trigger status for the AI component
            timestamp: new Date().toISOString(),
        });

        console.log(`Roster sent for AI processing: ${rosterId}`);
        return true;
        
    } catch (error) {
        console.error("Error saving roster to Firestore:", error);
        return false;
    }
};