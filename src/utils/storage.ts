/**
 * Aura Storage Utility
 * 
 * Provides direct Firebase Storage access for AIRs without backend dependency.
 * This makes Aura fully self-contained and portable.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;

/**
 * Initialize Firebase from environment variables or config
 */
const getFirebaseConfig = () => {
    // Try to get config from environment
    const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'saga-9dd98',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'saga-9dd98.appspot.com',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    return config;
};

/**
 * Get or initialize Firebase Storage
 */
const getStorageInstance = (): FirebaseStorage | null => {
    if (storage) return storage;

    try {
        const existingApps = getApps();
        if (existingApps.length > 0) {
            app = existingApps[0];
        } else {
            const config = getFirebaseConfig();
            if (!config.projectId) {
                console.warn('[AuraStorage] Firebase project not configured');
                return null;
            }
            app = initializeApp(config);
        }
        storage = getStorage(app);
        return storage;
    } catch (err) {
        console.error('[AuraStorage] Failed to initialize Firebase:', err);
        return null;
    }
};

/**
 * Upload an image from a URL to Firebase Storage
 * Returns the permanent Firebase Storage URL
 */
export const uploadImageFromUrl = async (
    sourceUrl: string,
    projectId: string = 'default',
    windowId: string = `img-${Date.now()}`
): Promise<string> => {
    const storageInstance = getStorageInstance();

    if (!storageInstance) {
        console.warn('[AuraStorage] Storage not available, returning original URL');
        return sourceUrl;
    }

    try {
        // Fetch the image
        const response = await fetch(sourceUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        // Determine file extension from content type
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const extMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp'
        };
        const ext = extMap[contentType.split(';')[0]] || 'jpg';

        // Upload to Firebase Storage
        const path = `projects/${projectId}/images/${windowId}.${ext}`;
        const storageRef = ref(storageInstance, path);

        await uploadBytes(storageRef, blob, { contentType });

        // Get public download URL
        const downloadUrl = await getDownloadURL(storageRef);

        console.log(`[AuraStorage] Uploaded to: ${downloadUrl}`);
        return downloadUrl;

    } catch (err) {
        console.error('[AuraStorage] Upload failed:', err);
        // Fall back to original URL
        return sourceUrl;
    }
};

/**
 * Check if a URL is from Firebase Storage (already persisted)
 * Handles both production and emulator URLs
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
    return url.includes('firebasestorage.googleapis.com') ||
        url.includes('storage.googleapis.com') ||
        url.includes('firebasestorage.app') ||  // New Firebase Storage domain
        url.includes('localhost:9199') ||        // Firebase emulator
        url.includes('127.0.0.1:9199');          // Firebase emulator alternate
};
