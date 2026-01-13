import React from 'react';
import { useBrainstorm, Message } from './model';
import { View } from './view';

export interface BrainstormAIRProps {
    initialMessages?: Message[];
    onReflect?: (message: string) => Promise<any[]>;
    windows?: any[];
}

export const BrainstormAIR: React.FC<BrainstormAIRProps> = ({
    initialMessages = [],
    onReflect,
    windows = []
}) => {
    const {
        messages,
        manual,
        setManual,
        isTyping,
        voice,
        handleSend,
        isSpeakingEnabled,
        setIsSpeakingEnabled
    } = useBrainstorm({ initialMessages, onReflect, windows });

    return (
        <View
            messages={messages}
            manual={manual}
            setManual={setManual}
            isTyping={isTyping}
            voice={voice}
            onSend={handleSend}
            isSpeakingEnabled={isSpeakingEnabled}
            setIsSpeakingEnabled={setIsSpeakingEnabled}
        />
    );
};
