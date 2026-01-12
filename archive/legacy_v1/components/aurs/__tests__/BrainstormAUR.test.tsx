import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrainstormAUR } from '../BrainstormAUR';
import React from 'react';

describe('BrainstormAUR', () => {
    const mockVoice = {
        transcript: '',
        interimTranscript: '',
        isListening: false,
        isSpeaking: false,
        startListening: vi.fn(),
        stopListening: vi.fn()
    };

    it('renders chat messages', () => {
        const messages = [
            { role: 'user' as const, content: 'Hello' },
            { role: 'model' as const, content: 'Hi there!' }
        ];
        render(<BrainstormAUR messages={messages} onSend={vi.fn()} voice={mockVoice} />);

        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('calls onSend when send button is clicked with manual input', () => {
        const onSend = vi.fn();
        render(<BrainstormAUR messages={[]} onSend={onSend} voice={mockVoice} />);

        const input = screen.getByPlaceholderText('Type or speak...');
        fireEvent.change(input, { target: { value: 'New message' } });

        const sendBtn = screen.getByText('Send');
        fireEvent.click(sendBtn);

        expect(onSend).toHaveBeenCalledWith('New message');
    });

    it('shows typing indicator when isTyping is true', () => {
        render(<BrainstormAUR messages={[]} onSend={vi.fn()} voice={mockVoice} isTyping={true} />);
        expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });
});
