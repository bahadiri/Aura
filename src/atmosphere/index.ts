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
     * Only throws errors for critical missing fields (id).
     * Uses warnings for non-critical issues to support plug-and-play flexibility.
     */
    private validate(manifest: AIRManifest): void {
        // ID is required - can't register without it
        if (!manifest.id) {
            console.error('[Atmosphere] CRITICAL: Manifest missing ID - cannot register');
            throw new Error('[Atmosphere] Manifest missing ID');
        }

        // Component is highly recommended but not enforced to allow partial manifests
        if (!manifest.component) {
            console.warn(`[Atmosphere] Warning: AIR "${manifest.id}" missing Component - this AIR may not render`);
        }

        // Meta is highly recommended but not enforced
        if (!manifest.meta) {
            console.warn(`[Atmosphere] Warning: AIR "${manifest.id}" missing Meta - using defaults`);
        }
    }
}

export const atmosphere = new Atmosphere();

import { manifests } from './manifests';
manifests.forEach(m => atmosphere.register(m));


