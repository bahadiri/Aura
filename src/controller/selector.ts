import { atmosphere } from '../atmosphere';
import { AIRManifest } from '../atmosphere/types';

/**
 * Options for AIR selection
 */
export interface SelectOptions {
    limit?: number;           // Max AIRs to return (default: 3)
    activeSet?: string[];     // Currently active AIR IDs (boost priority)
    category?: string;        // Filter by category
    minPriority?: number;     // Minimum priority threshold
}

/**
 * Active Set Manager
 * Tracks recently used AIRs and boosts their priority
 */
class ActiveSetManager {
    private activeSet: Set<string> = new Set();
    private maxSize: number = 5;

    /**
     * Add an AIR to the Active Set
     */
    public add(airId: string): void {
        this.activeSet.add(airId);

        // Evict oldest if over limit (FIFO)
        if (this.activeSet.size > this.maxSize) {
            const first = this.activeSet.values().next().value;
            if (first) {
                this.activeSet.delete(first);
            }
        }
    }

    /**
     * Get all AIRs in Active Set
     */
    public getAll(): string[] {
        return Array.from(this.activeSet);
    }

    /**
     * Check if AIR is in Active Set
     */
    public has(airId: string): boolean {
        return this.activeSet.has(airId);
    }

    /**
     * Clear the Active Set
     */
    public clear(): void {
        this.activeSet.clear();
    }
}

/**
 * AIR Selector Engine
 *
 * Implements Hierarchical Selection:
 * - Stage 1: Semantic search using keywords
 * - Stage 2: Active Set boosting
 * - Stage 3: Priority-based ranking
 */
export class AIRSelector {
    private activeSetManager: ActiveSetManager;

    constructor() {
        this.activeSetManager = new ActiveSetManager();
    }

    /**
     * Select AIRs for a given user query
     *
     * @param query User's message
     * @param options Selection options
     * @returns Array of selected AIR manifests
     */
    public selectAIRs(query: string, options: SelectOptions = {}): AIRManifest[] {
        const {
            limit = 3,
            activeSet = this.activeSetManager.getAll(),
            category,
            minPriority
        } = options;

        console.debug(`[Selector] Query: "${query}"`);
        console.debug(`[Selector] Active Set:`, activeSet);

        // Stage 1: Semantic search using atmosphere.search()
        const searchResults = atmosphere.search(query, {
            category,
            minPriority
        });

        console.debug(`[Selector] Search results:`, searchResults.length);

        // Stage 2: Apply Active Set boosting
        const scored = searchResults.map(manifest => {
            let score = manifest.discovery?.priority ?? 50;

            // Boost if in Active Set (+30 points)
            if (activeSet.includes(manifest.id)) {
                score += 30;
                console.debug(`[Selector] Boosting ${manifest.id} (Active Set): ${score}`);
            }

            return { manifest, score };
        });

        // Stage 3: Sort by score (descending)
        scored.sort((a, b) => b.score - a.score);

        // Apply limit
        const selected = scored.slice(0, limit).map(s => s.manifest);

        console.log(`[Selector] Selected AIRs:`, selected.map(m => m.id));

        return selected;
    }

    /**
     * Mark an AIR as used (add to Active Set)
     */
    public markAsUsed(airId: string): void {
        this.activeSetManager.add(airId);
        console.debug(`[Selector] Added to Active Set: ${airId}`);
    }

    /**
     * Get current Active Set
     */
    public getActiveSet(): string[] {
        return this.activeSetManager.getAll();
    }

    /**
     * Clear Active Set
     */
    public clearActiveSet(): void {
        this.activeSetManager.clear();
    }
}

/**
 * Global selector instance
 */
export const airSelector = new AIRSelector();
