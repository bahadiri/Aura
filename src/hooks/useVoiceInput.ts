import { useState, useEffect, useCallback, useRef } from 'react';

// Polyfill types for SpeechRecognition
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

// Simple type aliases to satisfy the compiler
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;

export interface VoiceState {
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
}

export const useVoiceInput = (language: string = 'en-US') => {
    const [state, setState] = useState<VoiceState>({
        isListening: false,
        isSpeaking: false,
        transcript: '',
        interimTranscript: '',
        error: null,
    });

    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initial voices fetch
    useEffect(() => {
        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log("[Voice] Available voices:", voices.length);
            setAvailableVoices(voices);
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);


    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setState(prev => ({ ...prev, error: 'Speech recognition not supported in this browser.' }));
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
            console.log("[Voice] Listening started");
            setState(prev => ({ ...prev, isListening: true, error: null }));
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            console.log(`[Voice] Result: Final="${finalTranscript}", Interim="${interimTranscript}"`);

            setState(prev => ({
                ...prev,
                transcript: prev.transcript + finalTranscript,
                interimTranscript: interimTranscript,
            }));
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[Voice] Error:', event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setState(prev => ({ ...prev, error: 'PERMISSION_DENIED', isListening: false }));
            } else {
                setState(prev => ({ ...prev, error: event.error, isListening: false }));
            }
        };

        recognition.onend = () => {
            console.log("[Voice] Listening stopped");
            setState(prev => ({ ...prev, isListening: false }));
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            console.error("SpeechRecognition not initialized");
            return;
        }

        // Stop speaking if Aura is talking
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        if (!state.isListening) {
            try {
                recognitionRef.current.start();
            } catch (e: any) {
                console.error("Error starting recognition:", e);
                if (e.name === 'InvalidStateError') {
                    // Already started? Let's try to reset
                    try {
                        recognitionRef.current.stop();
                    } catch { }
                }
                setState(prev => ({ ...prev, error: `Speech error: ${e.message || 'Could not start'}` }));
            }
        }
    }, [state.isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Abort if stop fails
                recognitionRef.current.abort();
            }
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
    }, []);

    const speak = useCallback((text: string, voiceURI?: string) => {
        if (!('speechSynthesis' in window)) return;

        // Stop listening while speaking to avoid feedback
        if (recognitionRef.current && state.isListening) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Error stopping recognition for speech:", e);
            }
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Find selected voice
        const selectedVoice = availableVoices.find(v => v.voiceURI === voiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            utterance.lang = language;
        }

        // Optional: add some personality/aura specific settings
        utterance.pitch = 1.0;
        utterance.rate = 1.0;

        utterance.onstart = () => setState(prev => ({ ...prev, isSpeaking: true }));
        utterance.onend = () => setState(prev => ({ ...prev, isSpeaking: false }));
        utterance.onerror = () => setState(prev => ({ ...prev, isSpeaking: false }));

        window.speechSynthesis.speak(utterance);
    }, [language, state.isListening, availableVoices]);


    return {
        ...state,
        availableVoices,
        startListening,
        stopListening,
        resetTranscript,
        speak,
    };
};
