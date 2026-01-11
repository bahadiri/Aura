
import { AURManifest } from './types';

// Default imports for hydration
import { BrainstormAUR } from './components/aurs/BrainstormAUR';
import { ImageAUR } from './components/aurs/ImageAUR';
import { QueryAUR } from './components/aurs/QueryAUR';
import { InfoGridAUR } from './components/aurs/InfoGridAUR';
import { PromptAUR } from './components/aurs/PromptAUR';
import { SelectionListAUR } from './components/aurs/SelectionListAUR';
import { TasksAUR } from './components/aurs/TasksAUR';
import { NoteTakerAUR } from './components/aurs/NoteTakerAUR';
import { YoutubePlayerAUR } from './components/aurs/YoutubePlayerAUR';


class Registry {
    private aurs = new Map<string, AURManifest>();

    /**
     * strict validation of AUR manifest to ensure standard compliance
     */
    private validate(manifest: AURManifest): boolean {
        if (!manifest.id) throw new Error("AUR Manifest missing 'id'");
        if (!manifest.component) throw new Error(`AUR '${manifest.id}' missing 'component'`);
        if (!manifest.meta) throw new Error(`AUR '${manifest.id}' missing 'meta' object`);
        if (!manifest.meta.title) throw new Error(`AUR '${manifest.id}' missing 'meta.title'`);
        return true;
    }

    /**
     * Registers a new AUR component to the global registry.
     */
    register(manifest: AURManifest) {
        this.validate(manifest);
        this.aurs.set(manifest.id, manifest);
        console.log(`[Aura Registry] Registered: ${manifest.id}`);
    }

    /**
     * Retrieves an AUR by its ID.
     */
    get(id: string): AURManifest | undefined {
        return this.aurs.get(id);
    }

    /**
     * Returns all registered AURs.
     */
    getAll(): AURManifest[] {
        return Array.from(this.aurs.values());
    }

    /**
     * Gets a map of component IDs to components.
     */
    getComponentMap(): Record<string, React.ComponentType<any>> {
        const map: Record<string, React.ComponentType<any>> = {};
        this.aurs.forEach((manifest, id) => {
            map[id] = manifest.component;
        });
        return map;
    }

    /**
     * Gets a map of component IDs to icons.
     */
    getIconMap(): Record<string, string> {
        const map: Record<string, string> = {};
        this.aurs.forEach((manifest, id) => {
            map[id] = manifest.meta.icon;
        });
        return map;
    }
}

export const auraRegistry = new Registry();

// --- Built-in Registry (Auto-hydration for backwards compat or default AURs) ---
// In a full implementation, these would be exported as full Manifest objects from their files.
// For now, we manually construct manifests for existing components to satisfy the new strict registry.

const registerLegacy = (id: string, component: any, icon: string, title: string) => {
    auraRegistry.register({
        id,
        component,
        meta: { title, icon, description: `Standard ${title} component` }
    });
};

registerLegacy('brainstorm', BrainstormAUR, '🧠', 'Brainstorm');
registerLegacy('image', ImageAUR, '🖼️', 'Image View');
registerLegacy('search', QueryAUR, '🔍', 'Search');
registerLegacy('info', InfoGridAUR, '👥', 'Info');
registerLegacy('summary', PromptAUR, '✅', 'Summary');
registerLegacy('list', SelectionListAUR, '📜', 'List');
registerLegacy('tasks', TasksAUR, '✔️', 'Tasks');
registerLegacy('notes', NoteTakerAUR, '📓', 'Notes');
registerLegacy('video', YoutubePlayerAUR, '📺', 'Video');
registerLegacy('master', BrainstormAUR, '🔮', 'Master');
