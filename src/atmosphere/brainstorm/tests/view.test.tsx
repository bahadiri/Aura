/// <reference types="vitest/globals" />
import { render } from '@testing-library/react';
import { View } from '../view';


describe('BrainstormAIR View', () => {
    const mockVoice = {
        isListening: false,
        isSpeaking: false,
        transcript: '',
        interimTranscript: '',
        startListening: vi.fn(),
        stopListening: vi.fn(),
        resetTranscript: vi.fn()
    };

    it('renders chat window and input area', () => {
        const { getByPlaceholderText, getByText } = render(
            <View
                messages={[]}
                manual=""
                setManual={() => { }}
                isTyping={false}
                voice={mockVoice}
                onSend={() => { }}
                isSpeakingEnabled={true}
                setIsSpeakingEnabled={() => { }}
            />
        );

        expect(getByPlaceholderText(/Type or speak/i)).toBeInTheDocument();
        expect(getByText(/Send/i)).toBeInTheDocument();
    });
});
