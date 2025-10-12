import * as firestore from 'firebase/firestore'; // Import Firestore utilities via namespace
import { db, initializeFirebase, getRosterCollectionPath } from './firebase'; 

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
        
        const collectionRef = getRosterCollectionPath(); 
        
        // Get the Firestore instance using the exported function
        const dbInstance = db(); 
        
        const docRef = firestore.doc(dbInstance, collectionRef.path, rosterId);

        // Saves the data, including the status signal for the Python component
        await firestore.setDoc(docRef, {
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
