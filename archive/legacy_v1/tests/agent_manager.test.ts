// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { useAgentManager } from '../agent/useAgentManager';
import { describe, it, expect, vi } from 'vitest';

// Mock useVoiceInput
vi.mock('../voice/useVoiceInput', () => ({
    useVoiceInput: () => ({
        speak: vi.fn(),
        resetTranscript: vi.fn(),
        transcript: '',
        isListening: false
    })
}));

describe('useAgentManager', () => {
    it('should initialize with optional initial message', () => {
        const { result } = renderHook(() => useAgentManager({
            onProcessMessage: async () => "Response",
            initialMessage: "Hello"
        }));

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].content).toBe("Hello");
    });

    it('should add user message and process response', async () => {
        const processMock = vi.fn().mockResolvedValue("I heard you");
        const { result } = renderHook(() => useAgentManager({
            onProcessMessage: processMock
        }));

        await act(async () => {
            await result.current.addMessage({ role: 'user', content: 'Hi' });
        });

        // Current implementation of addMessage doesn't trigger processing automatically 
        // unlike handleSend. Let's test handleSend logic if exposed or mock the hook usage pattern

        // Let's test the handleSend logic path which is exposed
        // Set manual input
        act(() => {
            result.current.setManualInput("Test Input");
        });

        await act(async () => {
            await result.current.handleSend();
        });

        expect(processMock).toHaveBeenCalledWith("Test Input", expect.anything());
        expect(result.current.messages).toHaveLength(2); // User + Model
        expect(result.current.messages[1].content).toBe("I heard you");
    });
});
