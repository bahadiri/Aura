import React, { createContext, useContext, ReactNode } from 'react';
import { useControllerLogic } from './useControllerLogic';

type ControllerType = ReturnType<typeof useControllerLogic>;

const ContextDebugId = Math.random().toString(36).substring(7);
console.log(`[ControllerContext] Module Loaded: ${ContextDebugId}`);

const ControllerContext = createContext<ControllerType | null>(null);

export const ControllerProvider: React.FC<{ children: ReactNode, initialState?: any }> = ({ children, initialState }) => {
    const controller = useControllerLogic(initialState);
    // Log on mount
    React.useEffect(() => {
        console.log(`[ControllerProvider] Mounted (Module: ${ContextDebugId})`);
    }, []);
    return (
        <ControllerContext.Provider value={controller}>
            {children}
        </ControllerContext.Provider>
    );
};

export const useSharedController = () => {
    const context = useContext(ControllerContext);
    if (!context) {
        throw new Error("useSharedController must be used within a ControllerProvider");
    }
    return context;
};
