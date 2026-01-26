import { AIRManifest } from './types.js';

/**
 * Search options for the search method
 */
export interface SearchOptions {
    limit?: number;        // Maximum number of results (default: unlimited)
    category?: string;     // Filter by category
    minPriority?: number;  // Minimum priority threshold (0-100)
}

/**
 * Atmosphere: The AIR Registry
 *
 * Enhanced with:
 * - Keyword indexing for fast semantic search
 * - Category-based filtering
 * - Priority-based ranking
 */
class Atmosphere {
    private registry: Map<string, AIRManifest> = new Map();

    // Keyword Index: Maps keywords to AIR IDs
    // Key: keyword (lowercase), Value: Set of AIR IDs
    private keywordIndex: Map<string, Set<string>> = new Map();

    /**
     * Register a new AIR Manifest.
     * Builds keyword index on registration.
     *
     * @param manifest The AIR definition to register.
     */
    public register(manifest: AIRManifest): void {
        this.validate(manifest);

        // Remove old index entries if re-registering
        if (this.registry.has(manifest.id)) {
            console.warn(`[Atmosphere] Overwriting existing AIR: ${manifest.id}`);
            this.removeFromIndex(manifest.id);
        }

        this.registry.set(manifest.id, manifest);
        this.addToIndex(manifest);

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
     * Search AIRs by query string.
     * Uses keyword matching from discovery metadata.
     *
     * @param query Search terms (space-separated)
     * @param options Search options (limit, category, minPriority)
     * @returns Array of matching AIRs, sorted by relevance
     */
    public search(query: string, options: SearchOptions = {}): AIRManifest[] {
        const { limit, category, minPriority } = options;

        // Normalize query to lowercase keywords
        const queryKeywords = query.toLowerCase().trim().split(/\s+/);
        console.debug('[Atmosphere] Search query keywords:', queryKeywords);
        console.debug('[Atmosphere] Keyword index size:', this.keywordIndex.size);
        console.debug('[Atmosphere] Registry size:', this.registry.size);

        // Score each AIR based on keyword matches
        const scores = new Map<string, number>();

        for (const keyword of queryKeywords) {
            const airIds = this.keywordIndex.get(keyword);
            console.debug(`[Atmosphere] Keyword "${keyword}" matched AIRs:`, airIds ? Array.from(airIds) : 'none');
            if (airIds) {
                for (const airId of airIds) {
                    scores.set(airId, (scores.get(airId) || 0) + 1);
                }
            }
        }

        // Get matching AIRs and sort by score
        let results = Array.from(scores.entries())
            .map(([airId, score]) => {
                const manifest = this.registry.get(airId);
                if (!manifest) return null;

                // Apply filters
                if (category && manifest.discovery?.category !== category) {
                    return null;
                }
                if (minPriority !== undefined) {
                    const priority = manifest.discovery?.priority ?? 50;
                    if (priority < minPriority) return null;
                }

                return {
                    manifest,
                    score,
                    priority: manifest.discovery?.priority ?? 50
                };
            })
            .filter(Boolean) as Array<{ manifest: AIRManifest; score: number; priority: number }>;

        // Sort by score (descending), then priority (descending)
        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.priority - a.priority;
        });

        // Apply limit
        if (limit !== undefined && limit > 0) {
            results = results.slice(0, limit);
        }

        return results.map(r => r.manifest);
    }

    /**
     * Get AIRs by category.
     *
     * @param category The category to filter by
     * @returns Array of AIRs in the specified category
     */
    public getByCategory(category: string): AIRManifest[] {
        return this.getAll().filter(m => m.discovery?.category === category);
    }

    /**
     * Get AIRs by keyword.
     *
     * @param keyword The keyword to search for
     * @returns Array of AIRs matching the keyword
     */
    public getByKeyword(keyword: string): AIRManifest[] {
        const normalizedKeyword = keyword.toLowerCase().trim();
        const airIds = this.keywordIndex.get(normalizedKeyword);

        if (!airIds) return [];

        return Array.from(airIds)
            .map(id => this.registry.get(id))
            .filter(Boolean) as AIRManifest[];
    }

    /**
     * Get all available categories.
     *
     * @returns Array of unique category names
     */
    public getCategories(): string[] {
        const categories = new Set<string>();
        for (const manifest of this.registry.values()) {
            if (manifest.discovery?.category) {
                categories.add(manifest.discovery.category);
            }
        }
        return Array.from(categories).sort();
    }

    /**
     * Add AIR to keyword index.
     * @private
     */
    private addToIndex(manifest: AIRManifest): void {
        if (!manifest.discovery?.keywords) return;

        for (const keyword of manifest.discovery.keywords) {
            const normalizedKeyword = keyword.toLowerCase().trim();
            if (!this.keywordIndex.has(normalizedKeyword)) {
                this.keywordIndex.set(normalizedKeyword, new Set());
            }
            this.keywordIndex.get(normalizedKeyword)!.add(manifest.id);
        }
    }

    /**
     * Remove AIR from keyword index.
     * @private
     */
    private removeFromIndex(airId: string): void {
        const manifest = this.registry.get(airId);
        if (!manifest?.discovery?.keywords) return;

        for (const keyword of manifest.discovery.keywords) {
            const normalizedKeyword = keyword.toLowerCase().trim();
            const airIds = this.keywordIndex.get(normalizedKeyword);
            if (airIds) {
                airIds.delete(airId);
                // Clean up empty sets
                if (airIds.size === 0) {
                    this.keywordIndex.delete(normalizedKeyword);
                }
            }
        }
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

        // Discovery metadata validation (warnings only)
        if (manifest.discovery) {
            if (!manifest.discovery.keywords || manifest.discovery.keywords.length === 0) {
                console.warn(`[Atmosphere] Warning: AIR "${manifest.id}" has empty keywords array - search may not work well`);
            }

            if (!manifest.discovery.category) {
                console.warn(`[Atmosphere] Warning: AIR "${manifest.id}" missing discovery.category - categorization will fail`);
            }

            if (manifest.discovery.priority !== undefined) {
                const priority = manifest.discovery.priority;
                if (priority < 0 || priority > 100) {
                    console.warn(`[Atmosphere] Warning: AIR "${manifest.id}" priority ${priority} out of range (0-100)`);
                }
            }
        }

        // State schema validation (info only)
        if (manifest.stateSchema) {
            if (!manifest.stateSchema.collection || !manifest.stateSchema.documentId) {
                console.warn(`[Atmosphere] Warning: AIR "${manifest.id}" has incomplete stateSchema`);
            }
        }
    }
}

export const atmosphere = new Atmosphere();

import { manifests } from './manifests';
manifests.forEach(m => atmosphere.register(m));


