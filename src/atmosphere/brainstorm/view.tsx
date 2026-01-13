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
    isSpeakingEnabled: boolean;
    setIsSpeakingEnabled: (val: boolean) => void;
}

export const View: React.FC<ViewProps> = ({
    messages,
    manual,
    setManual,
    isTyping,
    voice,
    onSend,
    isSpeakingEnabled,
    setIsSpeakingEnabled
}) => {
    return (
        <div className={styles.screenContent} style={{ paddingTop: 0 }}>
            {/* Header with Aura Voice Toggle */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '12px 0px',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
                marginBottom: 10
            }}>
                <button
                    onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                    title={isSpeakingEnabled ? "Aura Voice On" : "Aura Voice Off"}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                        color: isSpeakingEnabled ? '#646cff' : 'rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                    {isSpeakingEnabled ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 9c.5.5.5 1.5 0 2" />
                            <path d="M19 6.3a5 5 0 0 1 0 7.4" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="17" y1="8" x2="22" y2="13" />
                            <line x1="22" y1="8" x2="17" y2="13" />
                        </svg>
                    )}
                </button>
            </div>

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
                <div style={{ position: 'relative', marginBottom: 0 }}>
                    <textarea
                        className={styles.manualInput}
                        placeholder="Type or speak..."
                        value={manual}
                        onChange={(e) => {
                            setManual(e.target.value);
                            if (voice.isListening) voice.stopListening();
                        }}
                        style={{ paddingRight: 80, marginBottom: 0 }} // More padding for two buttons
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                    />
                    <div className={styles.micContainer} style={{
                        position: 'absolute',
                        right: 8,
                        bottom: 8,
                        width: 'auto',
                        height: 'auto',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center'
                    }}>
                        {/* Mic Button */}
                        <button
                            className={`${styles.micButton} ${voice.isListening ? styles.active : ''}`}
                            onClick={voice.isListening ? voice.stopListening : voice.startListening}
                            style={{ width: 32, height: 32, fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            title="Dictate"
                        >
                            {voice.isListening ? '🔴' : '🎙️'}
                        </button>

                        {/* Send Button (Arrow) */}
                        <button
                            onClick={onSend}
                            disabled={!manual.trim() || isTyping}
                            style={{
                                width: 32,
                                height: 32,
                                fontSize: '1.2rem',
                                background: 'none',
                                border: 'none',
                                cursor: !manual.trim() || isTyping ? 'default' : 'pointer',
                                padding: 0,
                                opacity: !manual.trim() || isTyping ? 0.3 : 1,
                                color: '#4cc9f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Send"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
