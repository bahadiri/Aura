export * from './config';
import { AuraStorageConfig } from './config';
import { IDocumentStorage, IObjectStorage } from './types';
import { FileSystemDocumentAdapter, FileSystemObjectAdapter } from './adapters/filesystem';
import { FirebaseDocumentAdapter, FirebaseObjectAdapter } from './adapters/firebase';

// Singleton instance
let storageInstance: { documents: IDocumentStorage; objects: IObjectStorage } | null = null;

export const createStorage = (config: AuraStorageConfig) => {
    if (storageInstance) return storageInstance;

    console.log('[AuraStorage] Initializing with config:', config);

    let docStorage: IDocumentStorage;
    let objStorage: IObjectStorage;

    // Initialize Document Driver
    switch (config.documents.driver) {
        case 'firebase':
            docStorage = new FirebaseDocumentAdapter(config.documents);
            break;
        case 'filesystem':
        default:
            docStorage = new FileSystemDocumentAdapter();
            break;
    }

    // Initialize Object Driver
    switch (config.objects.driver) {
        case 'firebase':
            objStorage = new FirebaseObjectAdapter(config.objects);
            break;
        case 'filesystem':
        default:
            objStorage = new FileSystemObjectAdapter();
            break;
    }

    storageInstance = {
        documents: docStorage,
        objects: objStorage
    };

    return storageInstance;
};

export const getStorage = () => {
    if (!storageInstance) {
        throw new Error('Storage not initialized. Call createStorage(config) first.');
    }
    return storageInstance;
};
