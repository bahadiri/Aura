import { AIRManifest } from '../atmosphere/types';
import { getStorage } from '../storage';

/**
 * Fetches state from AIRs for Data-First observation
 *
 * Reads raw persistence data using stateSchema metadata
 * and formats it for LLM context injection.
 */
export class StateFetcher {
    /**
     * Fetch state for a single AIR
     *
     * @param manifest AIR manifest with stateSchema
     * @param sessionId Current session ID for template substitution
     * @returns State data or null if unavailable
     */
    public async fetchAIRState(
        manifest: AIRManifest,
        sessionId: string
    ): Promise<any | null> {
        // Check if AIR has state schema
        if (!manifest.stateSchema) {
            console.debug(`[StateFetcher] ${manifest.id} has no stateSchema`);
            return null;
        }

        const { collection, documentId } = manifest.stateSchema;

        // Substitute {sessionId} template
        const resolvedCollection = collection.replace('{sessionId}', sessionId);
        const resolvedDocId = documentId.replace('{sessionId}', sessionId);

        console.debug(`[StateFetcher] Fetching state for ${manifest.id}:`, {
            collection: resolvedCollection,
            documentId: resolvedDocId
        });

        try {
            const doc = await getStorage().documents.get(resolvedCollection, resolvedDocId);

            if (!doc) {
                console.debug(`[StateFetcher] No state found for ${manifest.id}`);
                return null;
            }

            console.log(`[StateFetcher] Retrieved state for ${manifest.id}:`, doc);
            return doc;

        } catch (error) {
            console.warn(`[StateFetcher] Error fetching state for ${manifest.id}:`, error);
            return null;
        }
    }

    /**
     * Fetch state for multiple AIRs
     *
     * @param manifests Array of AIR manifests
     * @param sessionId Current session ID
     * @returns Object mapping AIR IDs to their state
     */
    public async fetchMultipleStates(
        manifests: AIRManifest[],
        sessionId: string
    ): Promise<Record<string, any>> {
        const statePromises = manifests.map(async (manifest) => {
            const state = await this.fetchAIRState(manifest, sessionId);
            return { airId: manifest.id, state };
        });

        const results = await Promise.all(statePromises);

        // Build state map (exclude null states)
        const stateMap: Record<string, any> = {};
        for (const { airId, state } of results) {
            if (state !== null) {
                stateMap[airId] = state;
            }
        }

        console.log(`[StateFetcher] Fetched states for ${Object.keys(stateMap).length} AIRs`);
        return stateMap;
    }

    /**
     * Format state for LLM context injection
     *
     * @param stateMap State map from fetchMultipleStates
     * @param manifests AIR manifests for metadata
     * @returns Formatted context string
     */
    public formatStateContext(
        stateMap: Record<string, any>,
        manifests: AIRManifest[]
    ): string {
        if (Object.keys(stateMap).length === 0) {
            return '';
        }

        const lines: string[] = ['[AIR State Context]'];

        for (const manifest of manifests) {
            const state = stateMap[manifest.id];
            if (!state) continue;

            const title = typeof manifest.meta.title === 'string'
                ? manifest.meta.title
                : manifest.meta.title('en');

            lines.push(`\n${title} (${manifest.id}):`);

            // Use description if available
            if (manifest.stateSchema?.description) {
                lines.push(`  Description: ${manifest.stateSchema.description}`);
            }

            // Format state data
            lines.push(`  Current State: ${JSON.stringify(state, null, 2)}`);
        }

        return lines.join('\n');
    }
}

/**
 * Global state fetcher instance
 */
export const stateFetcher = new StateFetcher();
