import { IDocumentStorage, IObjectStorage, Filter } from '../types';

export class RemoteDocumentAdapter implements IDocumentStorage {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/storage/documents') {
        this.baseUrl = baseUrl;
    }

    async get<T>(collection: string, id: string): Promise<T | null> {
        try {
            const res = await fetch(`${this.baseUrl}/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection, id })
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error('[RemoteStorage] get failed', err);
            return null;
        }
    }

    async list<T>(collection: string, filters?: Filter[]): Promise<T[]> {
        try {
            const res = await fetch(`${this.baseUrl}/list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection, filters })
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error('[RemoteStorage] list failed', err);
            return [];
        }
    }

    async create<T>(collection: string, data: T): Promise<string> {
        try {
            const res = await fetch(`${this.baseUrl}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection, data })
            });
            const result = await res.json();
            return result.id;
        } catch (err) {
            console.error('[RemoteStorage] create failed', err);
            throw err;
        }
    }

    async update<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection, id, data })
            });
        } catch (err) {
            console.error('[RemoteStorage] update failed', err);
            throw err;
        }
    }

    async delete(collection: string, id: string): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection, id })
            });
        } catch (err) {
            console.error('[RemoteStorage] delete failed', err);
            throw err;
        }
    }
}

export class RemoteObjectAdapter implements IObjectStorage {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/storage/objects') {
        this.baseUrl = baseUrl;
    }

    async put(path: string, content: Blob | File | string): Promise<string> {
        try {
            const res = await fetch(`${this.baseUrl}?path=${encodeURIComponent(path)}`, {
                method: 'POST',
                body: content
            });
            if (!res.ok) throw new Error('Object put failed');
            return path;
        } catch (err) {
            console.error('[RemoteStorage] object put failed', err);
            throw err;
        }
    }

    async putFromBlob(path: string, blob: Blob, contentType?: string): Promise<string> {
        return this.put(path, blob);
    }

    async get(path: string): Promise<Blob | null> {
        try {
            const res = await fetch(`${this.baseUrl}?path=${encodeURIComponent(path)}`);
            if (!res.ok) return null;
            return await res.blob();
        } catch (err) {
            console.error('[RemoteStorage] object get failed', err);
            return null;
        }
    }

    async delete(path: string): Promise<void> {
        try {
            await fetch(`${this.baseUrl}?path=${encodeURIComponent(path)}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error('[RemoteStorage] object delete failed', err);
            throw err;
        }
    }

    async getUrl(path: string): Promise<string> {
        return `${this.baseUrl}?path=${encodeURIComponent(path)}`;
    }
}
