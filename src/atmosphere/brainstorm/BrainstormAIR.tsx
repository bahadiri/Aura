import React from 'react';
import { useBrainstorm, Message } from './model';
import { View } from './view';

export interface BrainstormAIRProps {
    initialMessages?: Message[];
}

export const BrainstormAIR: React.FC<BrainstormAIRProps> = ({ initialMessages = [] }) => {
    const {
        messages,
        manual,
        setManual,
        isTyping,
        voice,
        handleSend
    } = useBrainstorm({ initialMessages });

    return (
        <View
            messages={messages}
            manual={manual}
            setManual={setManual}
            isTyping={isTyping}
            voice={voice}
            onSend={handleSend}
        />
    );
};
