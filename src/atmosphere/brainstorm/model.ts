import { useState } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { flux } from '../../flux/index';

export interface Message {
    role: 'user' | 'model';
    content: string;
}

export interface UseBrainstormProps {
    initialMessages: Message[];
}

export const useBrainstorm = ({ initialMessages }: UseBrainstormProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [manual, setManual] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Using the ported hook
    const voice = useVoiceInput('en-US');

    const handleSend = () => {
        const text = manual.trim() || voice.transcript.trim();
        if (!text) return;

        // Add User Message
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);

        // Reset Inputs
        setManual('');
        voice.resetTranscript();

        // Simulate AI Processing (or dispatch to backend in future)
        setIsTyping(true);

        // Dispatch Intent to Flux (Example of AIR -> System communication)
        flux.dispatch({
            to: 'controller',
            type: 'INTENT_DETECTED',
            payload: { text, source: 'brainstorm-air' }
        });

        // Mock Response for now
        setTimeout(() => {
            const modelMsg: Message = { role: 'model', content: `I heard: "${text}". This is a mock response.` };
            setMessages(prev => [...prev, modelMsg]);
            setIsTyping(false);
        }, 1000);
    };

    return {
        messages,
        manual,
        setManual,
        isTyping,
        voice,
        handleSend
    };
};
