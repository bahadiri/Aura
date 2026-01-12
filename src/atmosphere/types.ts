import { ComponentType } from 'react';

export interface AIRManifest {
    id: string; // Unique identifier (e.g., 'weather-air')
    component: ComponentType<any>; // The React Component to render
    meta: {
        title: string | ((lang: string) => string); // Display name (dynamic or static)
        icon: string; // Emoji or Icon URL
        description: string; // For the 'Add Window' menu
        width?: number; // Preferred startup width
        height?: number; // Preferred startup height
        startPosition?: 'center' | 'cascade' | { x: number, y: number };
    };
    instructions?: {
        system?: string; // System prompt for the AI agent
        tasks?: Record<string, string>; // Specific sub-tasks
    };
    logic?: Record<string, Function>; // Headless functions
}
