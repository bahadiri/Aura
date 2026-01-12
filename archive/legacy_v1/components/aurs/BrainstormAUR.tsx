import React, { useState } from 'react';
import styles from './AURs.module.css';
import { FlowingText } from '../FlowingText';

export interface BrainstormAURProps {
    messages: { role: 'user' | 'model'; content: string }[];
    onSend: (text: string) => void;
    isTyping?: boolean;
    voice: {
        transcript: string;
        interimTranscript: string;
        isListening: boolean;
        isSpeaking: boolean;
        startListening: () => void;
        stopListening: () => void;
    };
    placeholder?: string;
    labels?: {
        thinking?: string;
        speaking?: string;
        send?: string;
    };
}

export const BrainstormAUR: React.FC<BrainstormAURProps> = ({
    messages,
    onSend,
    isTyping,
    voice,
    placeholder = "Type or speak...",
    labels = { thinking: "Thinking...", speaking: "Speaking...", send: "Send" }
}) => {
    const [manual, setManual] = useState('');

    const handleSend = () => {
        const text = manual.trim() || voice.transcript.trim();
        if (text) {
            onSend(text);
            setManual('');
        }
    };

    return (
        <div className={styles.screenContent}>
            <div className={styles.chatWindow}>
                {messages.map((msg, i) => (
                    <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.model}`}>
                        <div className={styles.messageContent}>{msg.content}</div>
                    </div>
                ))}
                {isTyping && <div className={styles.typing}>{labels.thinking}</div>}
                {voice.isSpeaking && <div className={styles.speaking}>{labels.speaking}</div>}
            </div>

            <div className={styles.inputArea}>
                <textarea
                    className={styles.manualInput}
                    placeholder={placeholder}
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />

                <div className={styles.controls}>
                    <div className={styles.micContainer}>
                        <button
                            className={`${styles.micButton} ${voice.isListening ? styles.active : ''}`}
                            onClick={voice.isListening ? voice.stopListening : voice.startListening}
                        >
                            {voice.isListening ? '⬤' : '🎙️'}
                        </button>
                    </div>

                    <div style={{ flex: 1 }}>
                        <FlowingText
                            transcript={voice.transcript}
                            interimTranscript={voice.interimTranscript}
                            isListening={voice.isListening}
                        />
                    </div>

                    <button
                        className={styles.sendButton}
                        onClick={handleSend}
                        disabled={(!voice.transcript.trim() && !manual.trim()) || isTyping}
                    >
                        {labels.send}
                    </button>
                </div>
            </div>
        </div>
    );
};
