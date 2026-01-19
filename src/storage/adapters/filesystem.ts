import { get, set, del, keys } from 'idb-keyval';
import { IDocumentStorage, IObjectStorage, Filter } from '../types';

// --- Document Adapter ---

export class FileSystemDocumentAdapter implements IDocumentStorage {

    // Helper: generate simple ID
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    private getCollectionKey(collection: string): string {
        return `aura_docs_${collection}`;
    }

    async get<T>(collection: string, id: string): Promise<T | null> {
        const all = await this.list<any>(collection);
        return all.find((item: any) => item.id === id) || null;
    }

    async list<T>(collection: string, filters?: Filter[]): Promise<T[]> {
        const key = this.getCollectionKey(collection);
        let all: T[] = (await get(key)) || [];

        if (filters && filters.length > 0) {
            all = all.filter((item: any) => {
                return filters.every(filter => {
                    const val = item[filter.field];
                    switch (filter.op) {
                        case '==': return val == filter.value;
                        case '!=': return val != filter.value;
                        case '<': return val < filter.value;
                        case '<=': return val <= filter.value;
                        case '>': return val > filter.value;
                        case '>=': return val >= filter.value;
                        case 'array-contains': return Array.isArray(val) && val.includes(filter.value);
                        default: return true;
                    }
                });
            });
        }
        return all;
    }

    async create<T>(collection: string, data: T): Promise<string> {
        // @ts-ignore - assume data is object
        const id = data.id || this.generateId();
        // @ts-ignore
        const newItem = { ...data, id };

        const key = this.getCollectionKey(collection);
        const all = (await get(key)) || [];
        all.push(newItem);
        await set(key, all);

        return id;
    }

    async update<T>(collection: string, id: string, data: Partial<T>): Promise<void> {
        const key = this.getCollectionKey(collection);
        const all: any[] = (await get(key)) || [];
        const index = all.findIndex(item => item.id === id);

        if (index !== -1) {
            all[index] = { ...all[index], ...data };
            await set(key, all);
        }
    }

    async delete(collection: string, id: string): Promise<void> {
        const key = this.getCollectionKey(collection);
        let all: any[] = (await get(key)) || [];
        all = all.filter(item => item.id !== id);
        await set(key, all);
    }
}

// --- Object Adapter ---

export class FileSystemObjectAdapter implements IObjectStorage {

    private getObjectKey(path: string): string {
        return `aura_obj_${path}`;
    }

    async put(path: string, content: Blob | File | string): Promise<string> {
        const key = this.getObjectKey(path);
        // If it's a string, convert to Blob? Or just store. For now, assume Blob/File preferred.
        await set(key, content);
        return path;
    }

    async putFromBlob(path: string, blob: Blob, contentType?: string): Promise<string> {
        return this.put(path, blob);
    }

    async get(path: string): Promise<Blob | null> {
        const key = this.getObjectKey(path);
        const val = await get(key);
        return val instanceof Blob ? val : null;
    }

    async delete(path: string): Promise<void> {
        const key = this.getObjectKey(path);
        await del(key);
    }

    async getUrl(path: string): Promise<string> {
        const blob = await this.get(path);
        if (!blob) return '';
        return URL.createObjectURL(blob);
    }
}
