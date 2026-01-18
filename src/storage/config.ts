export type StorageDriverType = 'filesystem' | 'firebase' | 'supabase';

export interface StorageEmulatorConfig {
    enabled: boolean;
    host: string;
    port: number;
}

export interface DriverConfig {
    driver: StorageDriverType;
    config?: Record<string, any>; // Credentials go here
    emulator?: StorageEmulatorConfig;
}

export interface AuraStorageConfig {
    documents: DriverConfig;
    objects: DriverConfig;
}
