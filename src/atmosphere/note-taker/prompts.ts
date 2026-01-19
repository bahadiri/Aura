/**
 * Note Taker AIR - Prompt Definitions
 * 
 * Centralized prompts for note editing and title generation.
 */

// System prompt for polishing/editing notes
export const EDITOR_SYSTEM_PROMPT =
    "You are an expert editor. Improve the clarity, grammar, and flow of the text provided. " +
    "Maintain the original meaning. Output ONLY the polished text.";

// System prompt for generating note titles
export const TITLER_SYSTEM_PROMPT =
    "Generate a concise, engaging title (max 5 words) for the following note content. " +
    "Output ONLY the title.";
