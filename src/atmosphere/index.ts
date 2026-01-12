import { AIRManifest } from './types.js';

class Atmosphere {
    private registry: Map<string, AIRManifest> = new Map();

    /**
     * Register a new AIR Manifest.
     * @param manifest The AIR definition to register.
     */
    public register(manifest: AIRManifest): void {
        this.validate(manifest);
        if (this.registry.has(manifest.id)) {
            console.warn(`[Atmosphere] Overwriting existing AIR: ${manifest.id}`);
        }
        this.registry.set(manifest.id, manifest);
        console.debug(`[Atmosphere] Registered: ${manifest.id}`);
    }

    /**
     * Get a specific AIR Manifest by ID.
     */
    public get(id: string): AIRManifest | undefined {
        return this.registry.get(id);
    }

    /**
     * Get all registered AIRs.
     */
    public getAll(): AIRManifest[] {
        return Array.from(this.registry.values());
    }

    /**
     * Validate the manifest structure.
     */
    private validate(manifest: AIRManifest): void {
        if (!manifest.id) throw new Error('[Atmosphere] Manifest missing ID');
        if (!manifest.component) throw new Error(`[Atmosphere] Manifest ${manifest.id} missing Component`);
        if (!manifest.meta) throw new Error(`[Atmosphere] Manifest ${manifest.id} missing Meta`);
    }
}

export const atmosphere = new Atmosphere();

import { manifests } from './manifests';
manifests.forEach(m => atmosphere.register(m));

