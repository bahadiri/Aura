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

    // Check if valid URL
    if (!sourceUrl) return '';
    if (isFirebaseStorageUrl(sourceUrl)) return sourceUrl;

    try {
        const apiUrl = import.meta.env.VITE_SAGA_API_URL || 'http://localhost:8001';
        const proxyEndpoint = `${apiUrl}/api/storage/upload-from-url`;

        console.log(`[AuraStorage] Proxying upload via: ${proxyEndpoint}`);

        const response = await fetch(proxyEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_url: sourceUrl,
                project_id: projectId,
                window_id: windowId
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Backend upload failed (${response.status}): ${errText}`);
        }

        const data = await response.json();

        if (!data.url) {
            throw new Error("Backend returned no URL");
        }

        console.log(`[AuraStorage] Uploaded to: ${data.url}`);
        return data.url;

    } catch (err) {
        console.error('[AuraStorage] Upload failed:', err);
        // Fall back to original URL so the UI can at least try to display it
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
