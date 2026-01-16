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
}

export interface IAuraConfig {
    llmGatewayUrl: string;
    proxyUrl: string;
}
