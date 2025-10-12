// src/services/rosteringService.ts

import { doc, setDoc } from 'firebase/firestore'; // Changed import
import { initializeFirebase, getRosterCollectionPath } from './firebase';

/**
 * Saves the current scheduling data to a public Firestore collection
 * and sets the status to 'pending_ai_review' to signal the AI backend.
 * @param currentRosterData The data structure representing the current roster state.
 * @param rosterId A unique ID for this specific roster generation run.
 * @returns True if successful, false otherwise.
 */
export const saveRosterForAI = async (currentRosterData: any, rosterId: string): Promise<boolean> => {
    try {
        // Ensures Firebase services are initialized before any DB operation
        await initializeFirebase();

        // Gets a reference to the 'rosters' collection
        const collectionRef = getRosterCollectionPath();

        // Creates a reference to the specific document using the rosterId.
        const docRef = doc(collectionRef, rosterId);

        // Saves the data to the document
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