import { useState, useCallback, useRef } from 'react';
import { useVoiceInput } from '../voice/useVoiceInput';

export interface Message {
    role: 'user' | 'model';
    content: string;
}

export interface AgentConfig {
    language?: string;
    onProcessMessage: (message: string, history: Message[]) => Promise<string>;
    initialMessage?: string;
}

export const useAgentManager = ({ language = 'en-US', onProcessMessage, initialMessage }: AgentConfig) => {
    const voice = useVoiceInput(language);
    const [messages, setMessages] = useState<Message[]>(initialMessage ? [{ role: 'model', content: initialMessage }] : []);
    const [isProcessing, setIsProcessing] = useState(false);

    // Manual typing state
    const [manualInput, setManualInput] = useState('');
    const [isTypingManual, setIsTypingManual] = useState(false);

    const processUserMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);

        try {
            const responseText = await onProcessMessage(text, [...messages, userMsg]);

            const modelMsg: Message = { role: 'model', content: responseText };
            setMessages(prev => [...prev, modelMsg]);

            // Auto-speak response
            voice.speak(responseText);
        } catch (error) {
            console.error("Agent processing error:", error);
            // Optional: add error message to chat
        } finally {
            setIsProcessing(false);
        }
    }, [messages, onProcessMessage, voice]);

    const handleSend = useCallback(async () => {
        const text = manualInput || voice.transcript;
        if (!text) return;

        setManualInput('');
        voice.resetTranscript();

        await processUserMessage(text);
    }, [manualInput, voice.transcript, voice.resetTranscript, processUserMessage]);

    return {
        messages,
        isProcessing,
        voice,
        manualInput,
        setManualInput,
        isTypingManual,
        setIsTypingManual,
        handleSend,
        addMessage: (msg: Message) => setMessages(prev => [...prev, msg])
    };
};
