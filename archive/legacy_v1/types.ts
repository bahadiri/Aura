
import React from 'react';

/**
 * Standard manifest definition for an Adaptive User Representative (AUR).
 * All AURs must export an object adhering to this interface.
 */
export interface AURManifest {
    id: string;
    component: React.ComponentType<any>;
    meta: {
        title: string;
        icon: string; // Emoji or SVG string
        description: string;
    };
    /**
     * Library of prompts and instructions used by this AUR's AI agents.
     */
    instructions?: {
        system?: string;
        planner?: string;
        tasks?: Record<string, string>;
    };
    /**
     * Static helper functions or logic that can be executed without rendering the UI.
     * Useful for background tasks or agentic operations.
     */
    logic?: Record<string, Function>;
}

/**
 * Registry interface for validating and storing AURs.
 */
export interface AURRegistry {
    register: (manifest: AURManifest) => void;
    get: (id: string) => AURManifest | undefined;
    getAll: () => AURManifest[];
}
