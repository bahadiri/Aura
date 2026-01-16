import React, { createContext, useContext, useMemo } from 'react';
import { IAuraCapabilities, IAuraConfig } from './types';
import { LiteLLMClient } from './clients/llm';
import { GenericProxyClient } from './clients/proxy';

const AuraContext = createContext<IAuraCapabilities | null>(null);

interface AuraProviderProps {
    config: IAuraConfig;
    children: React.ReactNode;
}

export const AuraProvider: React.FC<AuraProviderProps> = ({ config, children }) => {
    const capabilities = useMemo(() => {
        return {
            llm: new LiteLLMClient(config.llmGatewayUrl),
            proxy: new GenericProxyClient(config.proxyUrl)
        };
    }, [config.llmGatewayUrl, config.proxyUrl]);

    return (
        <AuraContext.Provider value={capabilities}>
            {children}
        </AuraContext.Provider>
    );
};

export const useAura = (): IAuraCapabilities => {
    const context = useContext(AuraContext);
    if (!context) {
        throw new Error("useAura must be used within an AuraProvider");
    }
    return context;
};
