/**
 * Plot AIR - Prompt Definitions
 * 
 * Centralized prompts for plot expansion and storytelling.
 */

// System prompt for the storyteller LLM
export const STORYTELLER_SYSTEM_PROMPT =
    "You are an expert storyteller. Expand, explain, or modify the text based on user query. " +
    "Maintain tone. output ONLY new text.";

/**
 * Generates a user prompt for expanding plot content.
 * 
 * @param currentText - The current plot text to expand
 * @param userInstruction - The user's instruction for how to expand
 * @returns Formatted prompt string for the LLM
 */
export const expandPlotPrompt = (currentText: string, userInstruction: string): string =>
    `Current Text: "${currentText}"\nInstruction: ${userInstruction}`;
