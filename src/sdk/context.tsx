import React, { createContext, useContext, useMemo } from 'react';
import { IAuraCapabilities, IAuraConfig } from './types';
import { LiteLLMClient } from './clients/llm';
import { GenericProxyClient } from './clients/proxy';

const AuraContext = createContext<IAuraCapabilities | null>(null);

interface AuraProviderProps {
    config: IAuraConfig;
    ambience?: any[]; // Local AIRs stored locally for the project
    children: React.ReactNode;
}

import { createStorage } from '../storage';

export const AuraProvider: React.FC<AuraProviderProps> = ({ config, ambience, children }) => {
    // Initialize storage singleton (Required)
    useMemo(() => {
        createStorage(config.storage);
    }, [config.storage]);

    const capabilities = useMemo(() => {
        // TODO: Pass resources to clients if needed
        return {
            llm: new LiteLLMClient(config.llm.gatewayUrl), // Updated path
            proxy: new GenericProxyClient(config.llm.proxyUrl), // Updated path
            apiUrl: config.apiUrl,
            ambience: ambience
        };
    }, [config]);

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
