export interface FluxMessage {
    to: string;       // Target ID or '*' for broadcast
    type: string;     // Event type (e.g., 'INTENT_DETECTED')
    payload: any;     // Data
    from?: string;    // Sender ID (optional, added by system if missing)
}

export type FluxCallback = (message: FluxMessage) => void;
