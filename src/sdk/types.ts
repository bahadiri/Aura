export interface IResourceConfig {
    url?: string;
    method?: string;
    auth?: string;
    [key: string]: any;
}

export interface ILlmResourceConfig {
    mode: "chat" | "completion";
    model: string;
    systemPrompt?: string;
}

export interface IChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ILlmRequest {
    messages: IChatMessage[];
    temperature?: number;
    max_tokens?: number;
}

export interface ILlmResponse {
    content: string;
    raw?: any;
}

export interface IProxyRequest {
    params?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
}

// THE CONTRACTS
export interface ILlmClient {
    invoke(resource: ILlmResourceConfig, request: ILlmRequest): Promise<ILlmResponse>;
}

export interface IProxyClient {
    fetch<T = any>(resource: IResourceConfig, request?: IProxyRequest): Promise<T>;
}

export interface IAuraCapabilities {
    llm: ILlmClient;
    proxy: IProxyClient;
    apiUrl?: string;
    sessionId?: string; // Added for TasksAI context
    ambience?: IAmbienceEntry[];
}

export interface IAuraConfig {
    llm: import('../storage/config').ILLMConfig;
    storage: import('../storage/config').AuraStorageConfig;
    apiUrl?: string;
    sessionId?: string; // Added for config
    resources?: Record<string, any>;
}

export interface AuraProject {
    id: string;
    name: string;
    state: any;
    user_id: string;
    is_public?: boolean;
    is_pinned?: boolean;
    created_at: string;
    updated_at: string;
}

export interface IAmbienceEntry {
    id: string;
    name: string;
    description?: string;
    symbol: string;
    component: React.ComponentType<any> | string;
    manifest?: any;
    [key: string]: any;
}

export interface ContextHandler {
    /**
     * Returns the current context/state of the AIR.
     * This is used by the Intent Planner to understand what the user is looking at.
     */
    getContext(): Promise<any>;

    /**
     * List of capabilities this AIR supports.
     * e.g. ['text-editing', 'video-playback', 'market-data']
     */
    capabilities: string[];
}
