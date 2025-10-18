// --- Rostering service for AI integration ---

import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase, getRosterCollectionPath } from './firebase';

// Save roster data to Firestore for AI processing
export const saveRosterForAI = async (currentRosterData: any, rosterId: string): Promise<boolean> => {
    try {
        // Ensure Firebase services are initialised before any DB operation
        await initializeFirebase();

        // Get reference to the 'rosters' collection
        const collectionRef = getRosterCollectionPath();

        // Create reference to the specific document using the rosterId
        const docRef = doc(collectionRef, rosterId);

        // Save the data to the document
        await setDoc(docRef, {
            ...currentRosterData,
            status: 'pending_ai_review', // Trigger status for the AI component
            timestamp: new Date().toISOString(),
        });

        console.log(`Roster sent for AI processing: ${rosterId}`);
        return true;

    } catch (error) {
        console.error("Error saving roster to Firestore:", error);
        return false;
    }
};