/**
 * Characters AIR - Prompt Definitions
 * 
 * Centralized prompts for character enrichment and display.
 */

// System prompt for LLM enrichment of character data
export const ENRICH_SYSTEM_PROMPT = 
    'You are a movie/TV expert. Provide brief 1-sentence descriptions for the characters.';

/**
 * Generates a user prompt for enriching character data with descriptions and traits.
 * 
 * @param mediaTitle - The title of the movie or TV show
 * @param characterNames - Comma-separated list of character names
 * @returns Formatted prompt string for the LLM
 */
export const enrichCharactersPrompt = (mediaTitle: string, characterNames: string): string =>
    `For the movie/show "${mediaTitle}", provide details for: ${characterNames}. ` +
    `Return a JSON array matching the order, where each item has: ` +
    `"description" (short 1-sentence bio) and "traits" (array of 3 short adjectives).`;
