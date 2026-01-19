/**
 * Aura Core Prompts
 * 
 * Shared prompt utilities and common fragments used across multiple AIRs.
 * 
 * Each AIR should have its own prompts.ts for AIR-specific prompts.
 * This file is for truly shared/global prompt patterns.
 */

/**
 * Wraps content in a JSON code fence for cleaner LLM output parsing.
 * Useful when asking the LLM to return structured JSON.
 * 
 * @param instruction - The instruction that requests JSON output
 * @returns Instruction with formatting hint
 */
export const requestJsonOutput = (instruction: string): string =>
    `${instruction}\n\nRespond with valid JSON only, no markdown code fences.`;

/**
 * Common instruction fragments that can be appended to prompts.
 */
export const PROMPT_FRAGMENTS = {
    /** Instructs the LLM to output only the result, no explanations */
    OUTPUT_ONLY: "Output ONLY the result, no explanations or surrounding text.",

    /** Instructs the LLM to maintain the original tone */
    MAINTAIN_TONE: "Maintain the original tone and style.",

    /** Instructs the LLM to be concise */
    BE_CONCISE: "Be concise and direct.",
} as const;
