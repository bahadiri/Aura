import React from 'react';
import styles from '../../styles/aur.module.css';
import { FlowingText } from '../../components/ui/FlowingText';
import { Message } from './model';

interface ViewProps {
    messages: Message[];
    manual: string;
    setManual: (value: string) => void;
    isTyping: boolean;
    voice: {
        isListening: boolean;
        isSpeaking: boolean;
        transcript: string;
        interimTranscript: string;
        startListening: () => void;
        stopListening: () => void;
    };
    onSend: () => void;
}

export const View: React.FC<ViewProps> = ({
    messages,
    manual,
    setManual,
    isTyping,
    voice,
    onSend
}) => {
    return (
        <div className={styles.screenContent}>
            <div className={styles.chatWindow}>
                {messages.map((msg, i) => (
                    <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.model}`}>
                        <div>{msg.content}</div>
                    </div>
                ))}
                {isTyping && <div className={styles.typing}>Thinking...</div>}
                {voice.isSpeaking && <div className={styles.speaking}>Speaking...</div>}
            </div>

            <div className={styles.inputArea}>
                <textarea
                    className={styles.manualInput}
                    placeholder="Type or speak..."
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
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
                        onClick={onSend}
                        disabled={(!voice.transcript.trim() && !manual.trim()) || isTyping}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
