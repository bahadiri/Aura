import { ComponentType } from 'react';

/**
 * Enhanced AIRManifest Schema
 *
 * Supports:
 * - Hierarchical Selection: Semantic search via discovery metadata
 * - Data-First Observation: State schema definitions for context injection
 * - Scalability: Efficient discovery for 1000+ AIRs
 *
 * @see ops/tasks/current/34_action_protocol/outputs/T34_1/02_enhanced_schema_specification.md
 */
export interface AIRManifest {
    // ========================================
    // CORE IDENTITY (Required)
    // ========================================

    id: string;
    // Unique identifier (e.g., 'tasks-air', 'weather-air')
    // Pattern: kebab-case, suffix with '-air'

    component: ComponentType<any>;
    // The React Component to render

    // ========================================
    // UI METADATA (Required)
    // ========================================

    meta: {
        title: string | ((lang: string) => string);
        // Display name (supports i18n via function)

        icon: string;
        // Emoji or icon identifier

        description: string;
        // Short description for 'Add Window' menu and discovery
        // Should be action-oriented

        width?: number;
        height?: number;
        // Preferred startup dimensions

        startPosition?: 'center' | 'cascade' | { x: number, y: number };
        // Initial spawn position
    };

    // ========================================
    // DISCOVERY & SEARCH (New - Phase 1)
    // ========================================

    discovery?: {
        keywords: string[];
        // Semantic search terms (lowercase)
        // Used by Selector Engine for Stage 1 retrieval

        category: string;
        // Primary domain classification
        // Examples: "productivity", "media", "communication", "development"

        subcategory?: string;
        // Fine-grained classification

        priority?: number;
        // Default relevance score (0-100)
        // Higher = more likely to be in Active Set
        // Defaults to 50 if not specified

        tags?: string[];
        // Additional categorization tags
    };

    // ========================================
    // STATE OBSERVATION (New - Phase 1)
    // ========================================

    stateSchema?: {
        collection: string;
        // Storage collection name pattern
        // Use template: "collection_{sessionId}"

        documentId: string;
        // Document ID or pattern

        schema: object;
        // JSON Schema definition of state structure
        // Used by Controller for type-safe state injection

        description?: string;
        // Human-readable explanation of state structure
    };

    // ========================================
    // MCP TOOLS (Existing - MCP Compliant)
    // ========================================

    tools?: Tool[];
    // Array of MCP tool definitions

    // ========================================
    // IMPLEMENTATION (Existing)
    // ========================================

    logic?: {
        handleRequest?: (tool: string, args: any) => Promise<any>;
        // The "Kitchen" - handles MCP tool invocations

        [key: string]: Function | undefined;
        // Additional headless functions
    };

    // ========================================
    // LEGACY PATTERNS (Existing - To Be Migrated)
    // ========================================

    instructions?: {
        system?: string;
        // System prompt for AI agent (legacy)

        tasks?: Record<string, string>;
        // Legacy action documentation (pre-MCP)
        // Migrate to `tools` array
    };

    // ========================================
    // RESOURCES (Existing)
    // ========================================

    resources?: Record<string, any>;
    // API Keys, secrets, prompts, etc.
}

/**
 * MCP-Compliant Tool Definition
 */
export interface Tool {
    name: string;
    // Tool identifier (snake_case)

    description: string;
    // What this tool does (used by LLM for selection)

    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
}
