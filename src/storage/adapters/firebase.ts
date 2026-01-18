import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
    getFirestore,
    Firestore,
    connectFirestoreEmulator,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    WhereFilterOp
} from 'firebase/firestore';
import {
    getStorage,
    FirebaseStorage,
    connectStorageEmulator,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    getBlob
} from 'firebase/storage';
import { IDocumentStorage, IObjectStorage, Filter } from '../types';
import { DriverConfig } from '../config';

// Shared App Initialization Logic (Singleton for now, assuming same creds or first wins if we want to share app)
// TODO: Refactor to support multiple apps if config differs meaningfully
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

const ensureApp = (config: DriverConfig) => {
    if (!getApps().length) {
        if (!config.config) {
            throw new Error('Firebase credentials missing in config');
        }
        app = initializeApp(config.config);
    } else {
        app = getApp();
    }
};

const initFirestore = (config: DriverConfig) => {
    ensureApp(config);
    if (!db) {
        db = getFirestore(app);
        if (config.emulator?.enabled) {
            console.log(`[AuraStorage] Connecting to Firestore Emulator at ${config.emulator.host}:${config.emulator.port}`);
            connectFirestoreEmulator(db, config.emulator.host, config.emulator.port);
        }
    }
};

const initStorage = (config: DriverConfig) => {
    ensureApp(config);
    if (!storage) {
        storage = getStorage(app);
        if (config.emulator?.enabled) {
            console.log(`[AuraStorage] Connecting to Storage Emulator at ${config.emulator.host}:${config.emulator.port}`);
            connectStorageEmulator(storage, config.emulator.host, config.emulator.port);
        }
    }
};

// --- Document Adapter ---

export class FirebaseDocumentAdapter implements IDocumentStorage {

    constructor(config: DriverConfig) {
        initFirestore(config);
    }

    async get<T>(col: string, id: string): Promise<T | null> {
        const docRef = doc(db, col, id);
        const snap = await getDoc(docRef);
        return snap.exists() ? (snap.data() as T) : null;
    }

    async list<T>(col: string, filters?: Filter[]): Promise<T[]> {
        const colRef = collection(db, col);
        let q = query(colRef);

        if (filters) {
            filters.forEach(f => {
                q = query(q, where(f.field, f.op as WhereFilterOp, f.value));
            });
        }

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
    }

    async create<T>(col: string, data: T): Promise<string> {
        // @ts-ignore
        const id = data.id || doc(collection(db, col)).id;
        // @ts-ignore
        const docRef = doc(db, col, id);

        // Use setDoc to enforce the ID
        await setDoc(docRef, { ...data, id });
        return id;
    }

    async update<T>(col: string, id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, col, id);
        await updateDoc(docRef, data as any);
    }

    async delete(col: string, id: string): Promise<void> {
        const docRef = doc(db, col, id);
        await deleteDoc(docRef);
    }
}

// --- Object Adapter ---

export class FirebaseObjectAdapter implements IObjectStorage {

    constructor(config: DriverConfig) {
        initStorage(config);
    }

    async put(path: string, content: Blob | File | string): Promise<string> {
        const storageRef = ref(storage, path);

        let blob: Blob;
        if (typeof content === 'string') {
            // Basic string to blob - likely requires more robust handling (Base64 etc)
            // For now assume plain text or implement specific string handlers
            blob = new Blob([content], { type: 'text/plain' });
        } else {
            blob = content;
        }

        await uploadBytes(storageRef, blob);
        return path;
    }

    async get(path: string): Promise<Blob | null> {
        const storageRef = ref(storage, path);
        try {
            return await getBlob(storageRef);
        } catch (e) {
            return null; // Handle 404
        }
    }

    async delete(path: string): Promise<void> {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    }

    async getUrl(path: string): Promise<string> {
        const storageRef = ref(storage, path);
        return await getDownloadURL(storageRef);
    }
}
