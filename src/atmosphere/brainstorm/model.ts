import { useState, useEffect } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { flux } from '../../flux/index';

export interface Message {
    role: 'user' | 'model';
    content: string;
}

export interface UseBrainstormProps {
    initialMessages: Message[];
    onReflect?: (message: string) => Promise<any[]>;
    windows: any[];
}

export const useBrainstorm = ({ initialMessages, onReflect, windows }: UseBrainstormProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [manual, setManual] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);

    // Using the ported hook
    const voice = useVoiceInput('en-US');

    // Verification check
    const isAirOpen = (airId: string) => windows.some(w => w.manifestId === airId);

    // Unify dictation into the manual input box
    useEffect(() => {
        if (voice.isListening && (voice.transcript || voice.interimTranscript)) {
            setManual(voice.transcript + voice.interimTranscript);
        }
    }, [voice.transcript, voice.interimTranscript, voice.isListening]);

    const handleSend = async () => {
        const text = manual.trim();
        if (!text) return;

        // Add User Message
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);

        // Reset Inputs
        setManual('');
        voice.resetTranscript();
        if (voice.isListening) voice.stopListening();

        setIsTyping(true);

        try {
            // Step 1: Pre-process with Controller Reflection
            let preTriggered: any[] = [];
            if (onReflect) {
                preTriggered = await onReflect(text);
                console.debug("[Brainstorm] Pre-triggered actions:", preTriggered);

                // CRITICAL: Internal Validation Cycle for Reflection
                // Wait a tick for state to settle, then check
                await new Promise(r => setTimeout(r, 100));
                preTriggered.forEach(action => {
                    const success = windows.some(w => w.manifestId === action.id);
                    if (!success) console.warn(`[Brainstorm] Reflection Action failed to spawn: ${action.id}`);
                });
            }

            // Step 2: Main Conversational Response
            const openAirIds = Array.from(new Set(windows.map(w => w.manifestId)));
            const port = import.meta.env.VITE_SAGA_BACKEND_PORT || '8000';

            const baseUrl = import.meta.env.VITE_SAGA_API_URL || `http://localhost:${port}`;
            const response = await fetch(`${baseUrl}/api/chat/reflection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    show_name: "Brainstorm",
                    messages: [...messages, userMsg],
                    pre_triggered_actions: preTriggered, // Tell Aura what we already opened
                    open_airs: openAirIds
                })
            });

            const data = await response.json();
            if (data.content) {
                let content = data.content;

                // Parse Actions: [[ACTION: air-id, { props }]]
                const betterActionRegex = /\[\[ACTION:\s*([a-zA-Z0-9-]+),\s*([\s\S]*?)\s*\]\]/g;
                const matchesToRemove: string[] = [];
                const actionVerificationResults: string[] = [];

                // Collect all matches first
                const potentialMatches = Array.from(content.matchAll(betterActionRegex));

                for (const m of potentialMatches as RegExpMatchArray[]) {
                    const fullMatch = m[0];
                    const airId = m[1].trim();
                    const propsString = m[2];

                    try {
                        // Cautious clean up for JSON
                        let cleanJson = propsString.trim();
                        if (!cleanJson.startsWith('{')) cleanJson = '{' + cleanJson + '}';

                        let props;
                        try {
                            props = JSON.parse(cleanJson);
                        } catch (e) {
                            const fixedJson = cleanJson
                                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
                                .replace(/:\s*'([^']*)'/g, ': "$1"');
                            props = JSON.parse(fixedJson);
                        }

                        // Dispatch Spawn to Controller
                        flux.dispatch({
                            to: 'controller',
                            type: 'SPAWN_AIR',
                            payload: { id: airId, props }
                        });

                        matchesToRemove.push(fullMatch);

                        // Action Verification Loop (Internal Check)
                        // Note: State won't update synchronously, but we can log intent vs reality
                        actionVerificationResults.push(airId);

                    } catch (e) {
                        console.error("Failed to parse AIR action props:", e, propsString);
                    }
                }

                // Clean content for display
                let cleanContent = content;
                matchesToRemove.forEach(m => {
                    cleanContent = cleanContent.replace(m, '');
                });
                cleanContent = cleanContent.trim();

                if (cleanContent) {
                    const modelMsg: Message = { role: 'model', content: cleanContent };
                    setMessages(prev => [...prev, modelMsg]);

                    if (isSpeakingEnabled) {
                        voice.speak(cleanContent);
                    }
                }
            } else if (data.error) {
                setMessages(prev => [...prev, { role: 'model', content: `Error: ${data.error}` }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Failed to connect to Aura. Is the backend running?" }]);
        } finally {
            setIsTyping(false);
        }

        // Dispatch Intent to Flux (Example of AIR -> System communication)
        flux.dispatch({
            to: 'controller',
            type: 'INTENT_DETECTED',
            payload: { text, source: 'brainstorm-air' }
        });
    };

    return {
        messages,
        manual,
        setManual,
        isTyping,
        voice,
        handleSend,
        isSpeakingEnabled,
        setIsSpeakingEnabled
    };
};
