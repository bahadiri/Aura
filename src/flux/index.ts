import { FluxMessage, FluxCallback } from './types.js';

class FluxBus {
    private listeners: FluxCallback[] = [];

    /**
     * Dispatch a message to the Flux.
     * @param message The message to send.
     */
    public dispatch(message: FluxMessage): void {
        console.debug('[Flux] Dispatch:', message);
        this.listeners.forEach(listener => listener(message));
    }

    /**
     * Subscribe to all Flux messages.
     * @param callback Function to handle incoming messages.
     * @returns Unsubscribe function.
     */
    public subscribe(callback: FluxCallback): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
}

export const flux = new FluxBus();
