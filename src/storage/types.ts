export type FilterOp = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains';

export interface Filter {
    field: string;
    op: FilterOp;
    value: any;
}

export interface IDocumentStorage {
    get<T>(collection: string, id: string): Promise<T | null>;
    list<T>(collection: string, filters?: Filter[]): Promise<T[]>;
    create<T>(collection: string, data: T): Promise<string>;
    update<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
    delete(collection: string, id: string): Promise<void>;
}

export interface IObjectStorage {
    /**
     * Upload an object (file/blob) to the storage.
     * Returns the path or identifier.
     */
    put(path: string, content: Blob | File | string): Promise<string>;
    putFromBlob(path: string, blob: Blob, contentType?: string): Promise<string>;

    /**
     * Retrieve the object content usually as a Blob/File.
     */
    get(path: string): Promise<Blob | null>;

    /**
     * Delete the object.
     */
    delete(path: string): Promise<void>;

    /**
     * Get a public or signed URL for the object.
     */
    getUrl(path: string): Promise<string>;
}
