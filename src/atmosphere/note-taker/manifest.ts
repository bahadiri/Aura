import { AIRManifest } from '../types';

export const NoteTakerManifest: Omit<AIRManifest, 'component'> = {
    id: 'note-taker-air',
    meta: {
        title: 'Notes',
        icon: '📝',
        description: 'A workspace for persisting information. You MUST use actions to save information here. Do NOT keep internal notes or "memories". If the user asks to "take a note", "extract", or "save", you MUST use `append_note` or `replace_note`.',
        width: 600,
        height: 700,
        startPosition: 'center'
    },
    instructions: {
        tasks: {
            'append_note': 'Add text to the bottom of the notes. Payload: `{ content: string }`. Use this for "add", "extract", or "new note" requests.',
            'replace_note': 'Replace the ENTIRE content of the notes. Payload: `{ content: string }`. Use ONLY if the user explicitly asks to "clear" or "overwrite".',
            'polish_note': 'Trigger the AI to polish/format the current notes. Payload: `{}` (empty).'
        }
    }
};
